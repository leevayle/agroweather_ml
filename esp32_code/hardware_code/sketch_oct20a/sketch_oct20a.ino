#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT11.h>
#include <Wire.h>
#include "secrets.h"

// ============================================================
// PINS
// ============================================================
#define DHTPIN              4
#define LED_PIN             2
#define RAIN_ANALOG_PIN     34
#define RAIN_DIGITAL_PIN    35
#define HALL_SENSOR_PIN     15
#define RAIN_TIP_PIN        16
#define LDR_PIN             32
#define AS5600_SDA          21
#define AS5600_SCL          22

// ============================================================
// SETTINGS
// ============================================================
const float ANEMOMETER_RADIUS_CM = 15.0;
const float PI_VAL = 3.14159265;

#define RAIN_THRESHOLD      2500
#define DRIZZLE_THRESHOLD   3500
#define LDR_DAY_THRESHOLD   2000

const float MM_PER_TIP = 0.2;
const unsigned long TIP_DEBOUNCE_MS = 50;
#define AS5600_ADDR 0x36

const unsigned long LOG_INTERVAL = 5000;          // read + publish every 5s
const unsigned long WIFI_RETRY_INTERVAL = 30000;  // retry WiFi every 30s
const unsigned long CONNECT_WAIT_MS = 10000;      // max wait before continuing offline

// ============================================================
// OBJECTS & VARIABLES
// ============================================================
DHT11 dht11(DHTPIN);
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

volatile unsigned long rotationCount = 0;
unsigned long lastWindMeasurement = 0;

volatile unsigned long tipCount = 0;
volatile unsigned long tipsSincePublish = 0;
volatile unsigned long lastTipMs = 0;

unsigned long lastLogTime = 0;
unsigned long lastWifiRetry = 0;

// ============================================================
// INTERRUPTS
// ============================================================
void IRAM_ATTR countRotation() {
  rotationCount++;
}

void IRAM_ATTR countTip() {
  unsigned long now = millis();
  if (now - lastTipMs >= TIP_DEBOUNCE_MS) {
    lastTipMs = now;
    tipCount++;
    tipsSincePublish++;
  }
}

// ============================================================
// SENSOR PRESENCE CHECKS
// ============================================================
bool checkDHT11() {
  int t = 0, h = 0;
  return dht11.readTemperatureHumidity(t, h) == 0;
}

bool checkRainSensor() {
  int v = analogRead(RAIN_ANALOG_PIN);
  // floating/unconnected pins often sit at extremes or noise;
  // treat a readable ADC range as present
  return v >= 0 && v <= 4095;
}

bool checkLDR() {
  int v = analogRead(LDR_PIN);
  return v >= 0 && v <= 4095;
}

bool checkAS5600() {
  Wire.beginTransmission(AS5600_ADDR);
  return Wire.endTransmission() == 0;
}

bool checkHallSensor() {
  // hall is interrupt-driven; pin mode valid counts as wired-ready
  pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
  return true;
}

void reportSensors() {
  Serial.println("--- Sensors ---");
  Serial.print("dht11  - ");
  Serial.println(checkDHT11() ? "online" : "offline");

  Serial.print("rain   - ");
  Serial.println(checkRainSensor() ? "online" : "offline");

  Serial.print("ldr    - ");
  Serial.println(checkLDR() ? "online" : "offline");

  Serial.print("as5600 - ");
  Serial.println(checkAS5600() ? "online" : "offline");

  Serial.print("hall   - ");
  Serial.println(checkHallSensor() ? "online" : "offline");
  Serial.println();
}

// ============================================================
// CONNECTIVITY
// ============================================================
bool tryConnectWiFi(unsigned long timeoutMs) {
  if (WiFi.status() == WL_CONNECTED) return true;

  Serial.println("Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi OK | IP ");
    Serial.println(WiFi.localIP());
    return true;
  }

  Serial.println("Wi-Fi unavailable (will keep retrying)");
  return false;
}

bool tryConnectMQTT(unsigned long timeoutMs) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("MQTT skipped: no Wi-Fi");
    return false;
  }

  if (mqttClient.connected()) return true;

  Serial.println("Connecting to MQTT...");
  String clientId = "agroweather-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

  unsigned long start = millis();
  while ((millis() - start) < timeoutMs) {
    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("MQTT connected");
      return true;
    }
    delay(500);
  }

  Serial.print("MQTT unavailable, state ");
  Serial.println(mqttClient.state());
  return false;
}

void maintainConnections() {
  unsigned long now = millis();

  // Retry WiFi every 30s if down
  if (WiFi.status() != WL_CONNECTED) {
    if (now - lastWifiRetry >= WIFI_RETRY_INTERVAL) {
      lastWifiRetry = now;
      tryConnectWiFi(CONNECT_WAIT_MS);
    }
    return;
  }

  // WiFi is up — keep MQTT up
  if (!mqttClient.connected()) {
    tryConnectMQTT(3000);
  }
}

// ============================================================
// SENSORS
// ============================================================
float readWindSpeed() {
  unsigned long now = millis();
  float elapsed = (now - lastWindMeasurement) / 1000.0;

  noInterrupts();
  unsigned long rotations = rotationCount;
  rotationCount = 0;
  interrupts();

  lastWindMeasurement = now;
  if (elapsed <= 0) return 0.0;

  float rps = (float)rotations / elapsed;
  float radiusM = ANEMOMETER_RADIUS_CM / 100.0;
  float mps = rps * (2.0 * PI_VAL * radiusM);
  return mps * 3.6;
}

float readRainfallMmAndReset() {
  noInterrupts();
  unsigned long tips = tipsSincePublish;
  tipsSincePublish = 0;
  interrupts();
  return tips * MM_PER_TIP;
}

float readWindDirectionDeg() {
  Wire.beginTransmission(AS5600_ADDR);
  Wire.write(0x0C);
  if (Wire.endTransmission(false) != 0) return -1.0;
  if (Wire.requestFrom((uint8_t)AS5600_ADDR, (uint8_t)2) != 2) return -1.0;

  uint16_t raw = ((uint16_t)Wire.read() << 8) | Wire.read();
  raw &= 0x0FFF;
  return (raw * 360.0) / 4096.0;
}

// ============================================================
// LOG READINGS (always)
// ============================================================
void logReadings(
  int dhtResult,
  int temperature,
  int humidity,
  int rainAnalog,
  int ldrValue,
  float windSpeed,
  float rainfallMm,
  float windDirection
) {
  Serial.print("[READ] ");

  if (dhtResult == 0) {
    Serial.print(temperature);
    Serial.print("°C ");
    Serial.print(humidity);
    Serial.print("%");
  } else {
    Serial.print("DHT ERR");
  }

  Serial.print(" | wind ");
  Serial.print(windSpeed, 2);
  Serial.print(" km/h");

  Serial.print(" | rain ");
  if (rainAnalog < RAIN_THRESHOLD) {
    Serial.print("rain");
  } else if (rainAnalog < DRIZZLE_THRESHOLD) {
    Serial.print("drizzle");
  } else {
    Serial.print("dry");
  }

  Serial.print(" ");
  Serial.print(rainfallMm, 2);
  Serial.print("mm");

  Serial.print(" | ldr ");
  Serial.print(ldrValue);

  Serial.print(" | dir ");
  if (windDirection >= 0.0) {
    Serial.print(windDirection, 1);
    Serial.print("°");
  } else {
    Serial.print("n/a");
  }

  Serial.println();
}

// ============================================================
// PUBLISH
// ============================================================
void publishWeather(
  int dhtResult,
  int temperature,
  int humidity,
  int rainAnalog,
  int ldrValue,
  float windSpeed,
  float rainfallMm,
  float windDirection
) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[PUB] skipped: no Wi-Fi");
    return;
  }

  if (!mqttClient.connected()) {
    Serial.println("[PUB] skipped: MQTT not connected");
    return;
  }

  StaticJsonDocument<512> document;

  document["station_id"] = "station_01";

  if (dhtResult == 0) {
    document["temperature_c"] = temperature;
    document["humidity_percent"] = humidity;
  } else {
    document["temperature_c"] = nullptr;
    document["humidity_percent"] = nullptr;
  }

  document["day_night"] = (ldrValue > LDR_DAY_THRESHOLD) ? "night" : "day";
  document["rain_sensor"] = rainAnalog;

  const char* rainStatus;
  if (rainAnalog < RAIN_THRESHOLD) {
    rainStatus = "rain";
  } else if (rainAnalog < DRIZZLE_THRESHOLD) {
    rainStatus = "drizzle";
  } else {
    rainStatus = "dry";
  }
  document["rain_status"] = rainStatus;

  document["rainfall_mm"] = rainfallMm;
  document["wind_speed_kmh"] = windSpeed;

  if (windDirection >= 0.0) {
    document["wind_direction_deg"] = windDirection;
  } else {
    document["wind_direction_deg"] = nullptr;
  }

  document["pressure_hpa"] = nullptr;
  document["ldr_value"] = ldrValue;

  char payload[512];
  size_t n = serializeJson(document, payload, sizeof(payload));
  if (n == 0) {
    Serial.println("[PUB] FAIL: JSON serialize");
    return;
  }

  mqttClient.loop();
  bool ok = mqttClient.publish(MQTT_TOPIC, payload, false);

  if (ok) {
    Serial.println("[PUB] ok");
  } else {
    Serial.print("[PUB] FAIL | state ");
    Serial.println(mqttClient.state());
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("AgroWeather station starting...");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  pinMode(DHTPIN, INPUT_PULLUP);
  pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
  pinMode(RAIN_TIP_PIN, INPUT_PULLUP);
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(RAIN_DIGITAL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), countRotation, FALLING);
  attachInterrupt(digitalPinToInterrupt(RAIN_TIP_PIN), countTip, FALLING);

  Wire.begin(AS5600_SDA, AS5600_SCL);
  Wire.setClock(100000);

  // 1) Sensor check
  reportSensors();

  // 2) Wi-Fi (wait up to 10s, then continue offline)
  lastWifiRetry = millis();
  tryConnectWiFi(CONNECT_WAIT_MS);

  // 3) MQTT (only if Wi-Fi is up; wait up to 10s)
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setBufferSize(512);

  if (WiFi.status() == WL_CONNECTED) {
    tryConnectMQTT(CONNECT_WAIT_MS);
  }

  lastWindMeasurement = millis();
  lastLogTime = millis();

  Serial.println("Entering read/publish loop...");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  // Keep trying connections in background
  maintainConnections();
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastLogTime >= LOG_INTERVAL) {
    lastLogTime = now;

    digitalWrite(LED_PIN, HIGH);
    delay(50);
    digitalWrite(LED_PIN, LOW);

    int temp = 0, hum = 0;
    int dhtResult = dht11.readTemperatureHumidity(temp, hum);
    int rainAnalog = analogRead(RAIN_ANALOG_PIN);
    int ldrValue = analogRead(LDR_PIN);
    float windSpeed = readWindSpeed();
    float rainfallMm = readRainfallMmAndReset();
    float windDir = readWindDirectionDeg();

    // Always read + display
    logReadings(
      dhtResult,
      temp,
      hum,
      rainAnalog,
      ldrValue,
      windSpeed,
      rainfallMm,
      windDir
    );

    // Then publish if online
    publishWeather(
      dhtResult,
      temp,
      hum,
      rainAnalog,
      ldrValue,
      windSpeed,
      rainfallMm,
      windDir
    );
  }
}