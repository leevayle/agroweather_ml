#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT11.h>

// ============================================================
// WIFI CONFIGURATION
// ============================================================

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";


// ============================================================
// MQTT CONFIGURATION
// ============================================================

// IP address of the computer running your MQTT broker
const char* MQTT_BROKER = "192.168.1.105";

const int MQTT_PORT = 1883;

// MQTT topic for this weather station
const char* MQTT_TOPIC = "agroweather/station/01/weather";

// Unique MQTT client name
const char* MQTT_CLIENT_ID = "agroweather_station_01";


// ============================================================
// SENSOR PINS
// ============================================================

#define DHTPIN 4
#define LED_PIN 2
#define RAIN_ANALOG_PIN 34
#define HALL_SENSOR_PIN 15


// ============================================================
// RAIN THRESHOLDS
// ============================================================

#define DRIZZLE_THRESHOLD 3500
#define RAIN_THRESHOLD 2500


// ============================================================
// ANEMOMETER
// ============================================================

const float ANEMOMETER_RADIUS_CM = 15.0;
const float PI_VAL = 3.14159;


// ============================================================
// OBJECTS
// ============================================================

DHT11 dht11(DHTPIN);

WiFiClient espClient;
PubSubClient mqttClient(espClient);


// ============================================================
// WIND INTERRUPT VARIABLES
// ============================================================

volatile unsigned long rotationCount = 0;

volatile unsigned long lastPulseMicros = 0;

// Ignore extremely fast repeated pulses.
// This helps reduce electrical/mechanical noise.
const unsigned long MIN_PULSE_INTERVAL_US = 20000;


// ============================================================
// TIMERS
// ============================================================

unsigned long lastReadingTime = 0;

const unsigned long READING_INTERVAL = 5000;


// ============================================================
// INTERRUPT
// ============================================================

void IRAM_ATTR countRotation() {

  unsigned long now = micros();

  if (now - lastPulseMicros >= MIN_PULSE_INTERVAL_US) {

    rotationCount++;

    lastPulseMicros = now;
  }
}


// ============================================================
// CONNECT TO WIFI
// ============================================================

void connectWiFi() {

  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println("WiFi connected!");

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}


// ============================================================
// CONNECT TO MQTT
// ============================================================

void connectMQTT() {

  while (!mqttClient.connected()) {

    Serial.print("Connecting to MQTT broker... ");

    if (
      mqttClient.connect(
        MQTT_CLIENT_ID
      )
    ) {

      Serial.println("CONNECTED");

      Serial.print("MQTT topic: ");
      Serial.println(MQTT_TOPIC);

    } else {

      Serial.print("FAILED, rc=");
      Serial.println(mqttClient.state());

      Serial.println("Retrying in 5 seconds...");

      delay(5000);
    }
  }
}


// ============================================================
// SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("       AGROWEATHER ESP32");
  Serial.println("================================");


  // LED

  pinMode(
    LED_PIN,
    OUTPUT
  );

  digitalWrite(
    LED_PIN,
    LOW
  );


  // Rain sensor

  pinMode(
    RAIN_ANALOG_PIN,
    INPUT
  );


  // Hall sensor

  pinMode(
    HALL_SENSOR_PIN,
    INPUT_PULLUP
  );

  attachInterrupt(
    digitalPinToInterrupt(HALL_SENSOR_PIN),
    countRotation,
    FALLING
  );


  // WiFi

  connectWiFi();


  // MQTT

  mqttClient.setServer(
    MQTT_BROKER,
    MQTT_PORT
  );


  connectMQTT();


  lastReadingTime = millis();

  Serial.println();
  Serial.println("AgroWeather station ready.");
}


// ============================================================
// READ AND PUBLISH WEATHER
// ============================================================

void publishWeather() {

  // ----------------------------------------------------------
  // FLASH LED
  // ----------------------------------------------------------

  digitalWrite(
    LED_PIN,
    HIGH
  );

  delay(100);

  digitalWrite(
    LED_PIN,
    LOW
  );


  // ----------------------------------------------------------
  // WIND SPEED
  // ----------------------------------------------------------

  unsigned long currentTime = millis();

  float elapsedSeconds =
    (currentTime - lastReadingTime) / 1000.0;

  noInterrupts();

  unsigned long rotations =
    rotationCount;

  rotationCount = 0;

  interrupts();


  lastReadingTime = currentTime;


  float radiusMeters =
    ANEMOMETER_RADIUS_CM / 100.0;

  float circumferenceMeters =
    2.0 *
    PI_VAL *
    radiusMeters;


  float windSpeedKmh = 0.0;


  if (elapsedSeconds > 0) {

    float rotationsPerSecond =
      rotations / elapsedSeconds;

    float windSpeedMs =
      rotationsPerSecond *
      circumferenceMeters;

    windSpeedKmh =
      windSpeedMs * 3.6;
  }


  // ----------------------------------------------------------
  // TEMPERATURE + HUMIDITY
  // ----------------------------------------------------------

  int temperature = 0;
  int humidity = 0;

  int dhtResult =
    dht11.readTemperatureHumidity(
      temperature,
      humidity
    );


  bool sensorError =
    dhtResult != 0;


  // ----------------------------------------------------------
  // RAIN SENSOR
  // ----------------------------------------------------------

  int rainAnalog =
    analogRead(RAIN_ANALOG_PIN);


  const char* rainStatus;


  if (rainAnalog < RAIN_THRESHOLD) {

    rainStatus = "Raining";

  }
  else if (rainAnalog < DRIZZLE_THRESHOLD) {

    rainStatus = "Drizzling";

  }
  else {

    rainStatus = "Dry";
  }


  // ----------------------------------------------------------
  // PRINT TO SERIAL
  // ----------------------------------------------------------

  Serial.println();
  Serial.println("================================");
  Serial.println("        WEATHER READING");
  Serial.println("================================");


  if (!sensorError) {

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" C");

    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

  }
  else {

    Serial.print("DHT11 ERROR: ");
    Serial.println(dhtResult);
  }


  Serial.print("Rain sensor: ");
  Serial.println(rainAnalog);

  Serial.print("Rain status: ");
  Serial.println(rainStatus);


  Serial.print("Wind speed: ");
  Serial.print(windSpeedKmh, 2);
  Serial.println(" km/h");


  // ----------------------------------------------------------
  // CREATE JSON
  // ----------------------------------------------------------

  char payload[400];


  if (!sensorError) {

    snprintf(
      payload,
      sizeof(payload),

      "{"
        "\"station_id\":\"station_01\","
        "\"temperature_c\":%d,"
        "\"humidity_percent\":%d,"
        "\"rain_sensor\":%d,"
        "\"rain_status\":\"%s\","
        "\"wind_speed_kmh\":%.2f,"
        "\"timestamp_ms\":%lu"
      "}",

      temperature,
      humidity,
      rainAnalog,
      rainStatus,
      windSpeedKmh,
      millis()
    );

  }

  else {

    snprintf(
      payload,
      sizeof(payload),

      "{"
        "\"station_id\":\"station_01\","
        "\"temperature_c\":null,"
        "\"humidity_percent\":null,"
        "\"rain_sensor\":%d,"
        "\"rain_status\":\"%s\","
        "\"wind_speed_kmh\":%.2f,"
        "\"timestamp_ms\":%lu"
      "}",

      rainAnalog,
      rainStatus,
      windSpeedKmh,
      millis()
    );
  }


  // ----------------------------------------------------------
  // PUBLISH MQTT
  // ----------------------------------------------------------

  Serial.println();
  Serial.println("MQTT payload:");

  Serial.println(payload);


  bool published =
    mqttClient.publish(
      MQTT_TOPIC,
      payload
    );


  if (published) {

    Serial.println(
      "MQTT: Published successfully"
    );

  }
  else {

    Serial.println(
      "MQTT: Publish FAILED"
    );
  }
}


// ============================================================
// MAIN LOOP
// ============================================================

void loop() {

  // ----------------------------------------------------------
  // WIFI CHECK
  // ----------------------------------------------------------

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected. Reconnecting..."
    );

    connectWiFi();
  }


  // ----------------------------------------------------------
  // MQTT CHECK
  // ----------------------------------------------------------

  if (
    !mqttClient.connected()
  ) {

    connectMQTT();
  }


  // Required by PubSubClient
  mqttClient.loop();


  // ----------------------------------------------------------
  // SEND READING EVERY 5 SECONDS
  // ----------------------------------------------------------

  unsigned long now =
    millis();


  if (
    now - lastReadingTime >=
    READING_INTERVAL
  ) {

    publishWeather();
  }
}