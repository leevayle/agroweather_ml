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
#define DHTPIN              4    // D4 --ch
#define LED_PIN             2    // D2 (Onboard LED)        --ch

#define RAIN_ANALOG_PIN     34   // D34 (Rain AO)           --ch
#define RAIN_DIGITAL_PIN    35   // D35 (Rain DO)           --ch

#define HALL_SENSOR_PIN     15   // D15 (Hall speed)        --
#define RAIN_TIP_PIN        16   // D16 (Tipping bucket)    --ch
#define LDR_PIN             32   // D32 (LDR)               --noch(x)

#define AS5600_SDA          21   // D21 (Wind vane SDA)     --ch
#define AS5600_SCL          22   // D22 (Wind vane SCL)     --ch

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
const unsigned long LOG_INTERVAL = 5000; // Read every 5 seconds

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
// CONNECTIVITY
// ============================================================
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("\nConnecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

bool connectMQTT() {
  if (mqttClient.connected()) return true;

  Serial.println("Connecting to MQTT...");
  String clientId = "agroweather-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

  if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.println("MQTT Connected Successfully!\n");
    return true;
  }
  Serial.print("MQTT Connection Failed, state: ");
  Serial.println(mqttClient.state());
  return false;
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

  return mps * 3.6; // km/h
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
  if (!mqttClient.connected()) {
    Serial.println("MQTT publish skipped: not connected.");
    return;
  }

  JsonDocument document;
  document["station_id"] = "station_01";

  if (dhtResult == 0) {
    document["temperature_c"] = temperature;
    document["humidity_percent"] = humidity;
  } else {
    document["temperature_c"] = nullptr;
    document["humidity_percent"] = nullptr;
  }

  document["day_night"] =
    ldrValue > LDR_DAY_THRESHOLD ? "night" : "day";
  document["rain_sensor"] = rainAnalog;
  document["rain_status"] =
    rainAnalog < RAIN_THRESHOLD
      ? "rain"
      : rainAnalog < DRIZZLE_THRESHOLD ? "drizzle" : "dry";
  document["rainfall_mm"] = rainfallMm;
  document["wind_speed_kmh"] = windSpeed;
  if (windDirection >= 0.0) {
    document["wind_direction_deg"] = windDirection;
  } else {
    document["wind_direction_deg"] = nullptr;
  }
  document["pressure_hpa"] = nullptr;
  document["ldr_value"] = ldrValue;

  String payload;
  serializeJson(document, payload);

  Serial.print("Publishing weather to ");
  Serial.println(MQTT_TOPIC);
  Serial.println(payload);

  if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {
    Serial.println("MQTT weather publish succeeded.");
  } else {
    Serial.println("MQTT weather publish FAILED.");
    Serial.print("MQTT state: ");
    Serial.println(mqttClient.state());
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("   AGROWEATHER DEBUG MONITOR     ");
  Serial.println("=================================");

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

  connectWiFi();
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

  lastWindMeasurement = millis();
  connectMQTT();
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  connectWiFi();
  if (!mqttClient.connected()) connectMQTT();
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastLogTime >= LOG_INTERVAL) {
    lastLogTime = now;

    // Flash LED on reading
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);

    // Read Sensors
    int temp = 0, hum = 0;
    int dhtResult = dht11.readTemperatureHumidity(temp, hum);
    int rainAnalog = analogRead(RAIN_ANALOG_PIN);
    int ldrValue = analogRead(LDR_PIN);
    float windSpeed = readWindSpeed();
    float rainfallMm = readRainfallMmAndReset();
    float windDir = readWindDirectionDeg();

    // Print Formatted Header & Values
    Serial.println("--- WEATHER SENSOR READINGS ---");

    if (dhtResult == 0) {
      Serial.print("Temperature:      "); Serial.print(temp); Serial.println(" °C");
      Serial.print("Humidity:         "); Serial.print(hum); Serial.println(" %");
    } else {
      Serial.println("Temperature:      ERR (Timeout)");
      Serial.println("Humidity:         ERR (Timeout)");
    }

    Serial.print("Light Level (LDR): "); Serial.print(ldrValue);
    Serial.println(ldrValue > LDR_DAY_THRESHOLD ? " (Night)" : " (Day)");

    Serial.print("Rain Surface AO:  "); Serial.print(rainAnalog);
    if (rainAnalog < RAIN_THRESHOLD) Serial.println(" (Rain)");
    else if (rainAnalog < DRIZZLE_THRESHOLD) Serial.println(" (Drizzle)");
    else Serial.println(" (Dry)");

    Serial.print("Rainfall:         "); Serial.print(rainfallMm, 2); Serial.println(" mm");
    Serial.print("Total Tips:       "); Serial.println(tipCount);

    Serial.print("Wind Speed:       "); Serial.print(windSpeed, 2); Serial.println(" km/h");

    if (windDir >= 0.0) {
      Serial.print("Wind Direction:   "); Serial.print(windDir, 1); Serial.println(" °");
    } else {
      Serial.println("Wind Direction:   ERR (AS5600 Offline)");
    }

    Serial.println(); // Extra blank line between cycles

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