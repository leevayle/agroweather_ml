#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT11.h>

#include "secrets.h"


// ============================================================
// PINS
// ============================================================

#define DHTPIN 4
#define LED_PIN 2

#define RAIN_ANALOG_PIN 34
#define HALL_SENSOR_PIN 15
#define LDR_PIN 35


// ============================================================
// SENSOR SETTINGS
// ============================================================

const float ANEMOMETER_RADIUS_CM = 15.0;
const float PI_VAL = 3.14159265;

// Rain thresholds (calibrate later)
#define DRIZZLE_THRESHOLD 3500
#define RAIN_THRESHOLD 2500

// LDR threshold (calibrate later)
#define LDR_DAY_THRESHOLD 2000


// ============================================================
// DHT11
// ============================================================

DHT11 dht11(DHTPIN);


// ============================================================
// WIFI / MQTT
// ============================================================

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);


// ============================================================
// WIND SENSOR
// ============================================================

volatile unsigned long rotationCount = 0;
unsigned long lastWindMeasurement = 0;


// ============================================================
// TIMING
// ============================================================

unsigned long lastPublish = 0;
const unsigned long PUBLISH_INTERVAL = 10000;   // 10 seconds


// ============================================================
// INTERRUPT
// ============================================================

void IRAM_ATTR countRotation()
{
  rotationCount++;
}


// ============================================================
// WIFI CONNECTION (with fast blink)
// ============================================================

void connectWiFi()
{
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println();
  Serial.println("Connecting to Wi-Fi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Fast blink while connecting
  while (WiFi.status() != WL_CONNECTED)
  {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);

    Serial.print(".");
  }

  // Turn LED off after successful connection
  digitalWrite(LED_PIN, LOW);

  Serial.println();
  Serial.println("Wi-Fi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}


// ============================================================
// MQTT CONNECTION
// ============================================================

void connectMQTT()
{
  while (!mqttClient.connected())
  {
    Serial.println();
    Serial.println("Connecting to MQTT...");

    String clientId = "agroweather-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD))
    {
      Serial.println("MQTT connected successfully.");
    }
    else
    {
      Serial.print("MQTT connection failed. State: ");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}


// ============================================================
// WIND SPEED
// ============================================================

float readWindSpeed()
{
  unsigned long now = millis();
  float elapsedSeconds = (now - lastWindMeasurement) / 1000.0;

  noInterrupts();
  unsigned long rotations = rotationCount;
  rotationCount = 0;
  interrupts();

  lastWindMeasurement = now;

  if (elapsedSeconds <= 0) return 0.0;

  float rotationsPerSecond = rotations / elapsedSeconds;
  float radiusMeters = ANEMOMETER_RADIUS_CM / 100.0;
  float circumferenceMeters = 2.0 * PI_VAL * radiusMeters;
  float metersPerSecond = rotationsPerSecond * circumferenceMeters;
  float kilometersPerHour = metersPerSecond * 3.6;

  return kilometersPerHour;
}


// ============================================================
// RAIN STATUS
// ============================================================

String getRainStatus(int rainValue)
{
  if (rainValue < RAIN_THRESHOLD) return "rain";
  if (rainValue < DRIZZLE_THRESHOLD) return "drizzle";
  return "dry";
}


// ============================================================
// DAY / NIGHT
// ============================================================

String getDayNight(int ldrValue)
{
  if (ldrValue >= LDR_DAY_THRESHOLD) return "day";
  return "night";
}


// ============================================================
// PUBLISH WEATHER
// ============================================================

void publishWeather()
{
  int temperature = 0;
  int humidity = 0;

  int dhtResult = dht11.readTemperatureHumidity(temperature, humidity);

  int rainValue = analogRead(RAIN_ANALOG_PIN);
  int ldrValue  = analogRead(LDR_PIN);
  float windSpeed = readWindSpeed();

  String rainStatus = getRainStatus(rainValue);
  String dayNight   = getDayNight(ldrValue);

  // JSON
  DynamicJsonDocument document(1024);

  document["station_id"] = "station_01";

  if (dhtResult == 0)
  {
    document["temperature_c"]    = temperature;
    document["humidity_percent"] = humidity;
  }
  else
  {
    document["temperature_c"]    = nullptr;
    document["humidity_percent"] = nullptr;
  }

  document["day_night"]          = dayNight;
  document["rain_sensor"]        = rainValue;
  document["rain_status"]        = rainStatus;
  document["rainfall_mm"]        = nullptr;
  document["wind_speed_kmh"]     = windSpeed;
  document["wind_direction_deg"] = nullptr;
  document["pressure_hpa"]       = nullptr;
  document["ldr_value"]          = ldrValue;

  String payload;
  serializeJson(document, payload);

  Serial.println();
  Serial.println("Publishing weather:");
  Serial.println(payload);

  bool published = mqttClient.publish(MQTT_TOPIC, payload.c_str(), false);

  if (published)
  {
    Serial.println("Weather published successfully.");
  }
  else
  {
    Serial.println("Weather publish FAILED.");
  }
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("AGROWEATHER ESP32");
  Serial.println("================================");

  pinMode(LED_PIN, OUTPUT);
  pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), countRotation, FALLING);

  // Connect to Wi-Fi (will fast blink while connecting)
  connectWiFi();

  secureClient.setInsecure();          // for testing only
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

  lastWindMeasurement = millis();
  connectMQTT();

  Serial.println();
  Serial.println("ESP32 AgroWeather station ready.");
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
  connectWiFi();      // if Wi-Fi drops, it will fast blink again while reconnecting
  connectMQTT();
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastPublish >= PUBLISH_INTERVAL)
  {
    lastPublish = now;

    // Blink once when publishing
    digitalWrite(LED_PIN, HIGH);
    publishWeather();
    delay(150);
    digitalWrite(LED_PIN, LOW);
  }
}