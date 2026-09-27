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


// Rain thresholds.
// These are temporary starting values.
// We will calibrate the actual sensor later.

#define RAIN_THRESHOLD 2500
#define DRIZZLE_THRESHOLD 3500


// LDR threshold.
// Temporary starting value.
// We will calibrate this later.

#define LDR_DAY_THRESHOLD 2000


// ============================================================
// DHT11
// ============================================================

DHT11 dht11(DHTPIN);


// ============================================================
// NETWORK
// ============================================================

WiFiClientSecure secureClient;

PubSubClient mqttClient(secureClient);


// ============================================================
// WIND
// ============================================================

volatile unsigned long rotationCount = 0;

unsigned long lastWindMeasurement = 0;


// ============================================================
// TIMING
// ============================================================

unsigned long lastPublish = 0;

const unsigned long PUBLISH_INTERVAL = 10000;


// ============================================================
// INTERRUPT
// ============================================================

void IRAM_ATTR countRotation()
{
    rotationCount++;
}


// ============================================================
// WIFI
// ============================================================

void connectWiFi()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        return;
    }

    Serial.println();
    Serial.println("================================");
    Serial.println("CONNECTING TO WI-FI");
    Serial.println("================================");

    WiFi.mode(WIFI_STA);

    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);

        Serial.print(".");
    }

    Serial.println();
    Serial.println("Wi-Fi connected.");

    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}


// ============================================================
// MQTT CONNECTION
// ============================================================

bool connectMQTT()
{
    if (mqttClient.connected())
    {
        return true;
    }

    Serial.println();
    Serial.println("================================");
    Serial.println("CONNECTING TO MQTT");
    Serial.println("================================");

    Serial.print("Host: ");
    Serial.println(MQTT_HOST);

    Serial.print("Port: ");
    Serial.println(MQTT_PORT);

    String clientId =
        "agroweather-esp32-" +
        String((uint32_t)ESP.getEfuseMac(), HEX);

    Serial.print("Client ID: ");
    Serial.println(clientId);

    bool connected =
        mqttClient.connect(
            clientId.c_str(),
            MQTT_USERNAME,
            MQTT_PASSWORD
        );

    if (connected)
    {
        Serial.println();
        Serial.println("MQTT CONNECTED SUCCESSFULLY.");

        Serial.print("MQTT state: ");
        Serial.println(mqttClient.state());

        return true;
    }

    Serial.println();
    Serial.println("MQTT CONNECTION FAILED.");

    Serial.print("MQTT state code: ");
    Serial.println(mqttClient.state());

    return false;
}


// ============================================================
// WIND SPEED
// ============================================================

float readWindSpeed()
{
    unsigned long now = millis();

    float elapsedSeconds =
        (now - lastWindMeasurement) / 1000.0;

    noInterrupts();

    unsigned long rotations =
        rotationCount;

    rotationCount = 0;

    interrupts();

    lastWindMeasurement = now;

    if (elapsedSeconds <= 0)
    {
        return 0.0;
    }

    float rotationsPerSecond =
        rotations / elapsedSeconds;

    float radiusMeters =
        ANEMOMETER_RADIUS_CM / 100.0;

    float circumferenceMeters =
        2.0 *
        PI_VAL *
        radiusMeters;

    float metersPerSecond =
        rotationsPerSecond *
        circumferenceMeters;

    float kilometersPerHour =
        metersPerSecond *
        3.6;

    return kilometersPerHour;
}


// ============================================================
// RAIN STATUS
// ============================================================

String getRainStatus(
    int rainValue
)
{
    if (rainValue < RAIN_THRESHOLD)
    {
        return "rain";
    }

    if (rainValue < DRIZZLE_THRESHOLD)
    {
        return "drizzle";
    }

    return "dry";
}


// ============================================================
// DAY / NIGHT
// ============================================================

String getDayNight(
    int ldrValue
)
{
    if (ldrValue >= LDR_DAY_THRESHOLD)
    {
        return "day";
    }

    return "night";
}


// ============================================================
// PUBLISH WEATHER
// ============================================================

void publishWeather()
{
    // --------------------------------------------------------
    // Check MQTT connection BEFORE publishing
    // --------------------------------------------------------

    Serial.println();
    Serial.println("Checking MQTT connection...");

    Serial.print("MQTT connected: ");

    if (mqttClient.connected())
    {
        Serial.println("YES");
    }
    else
    {
        Serial.println("NO");
    }


    if (!mqttClient.connected())
    {
        Serial.println();
        Serial.println(
            "MQTT connection is not active."
        );

        Serial.print(
            "MQTT state code: "
        );

        Serial.println(
            mqttClient.state()
        );

        Serial.println(
            "Attempting MQTT reconnect..."
        );

        if (!connectMQTT())
        {
            Serial.println(
                "MQTT reconnect failed."
            );

            return;
        }
    }


    // --------------------------------------------------------
    // Read sensors
    // --------------------------------------------------------

    int temperature = 0;

    int humidity = 0;

    int dhtResult =
        dht11.readTemperatureHumidity(
            temperature,
            humidity
        );


    int rainValue =
        analogRead(
            RAIN_ANALOG_PIN
        );


    int ldrValue =
        analogRead(
            LDR_PIN
        );


    float windSpeed =
        readWindSpeed();


    String rainStatus =
        getRainStatus(
            rainValue
        );


    String dayNight =
        getDayNight(
            ldrValue
        );


    // --------------------------------------------------------
    // Create JSON
    // --------------------------------------------------------

    JsonDocument document;


    document["station_id"] =
        "station_01";


    if (dhtResult == 0)
    {
        document["temperature_c"] =
            temperature;

        document["humidity_percent"] =
            humidity;
    }
    else
    {
        document["temperature_c"] =
            nullptr;

        document["humidity_percent"] =
            nullptr;
    }


    document["day_night"] =
        dayNight;


    document["rain_sensor"] =
        rainValue;


    document["rain_status"] =
        rainStatus;


    document["rainfall_mm"] =
        nullptr;


    document["wind_speed_kmh"] =
        windSpeed;


    document["wind_direction_deg"] =
        nullptr;


    document["pressure_hpa"] =
        nullptr;


    document["ldr_value"] =
        ldrValue;


    String payload;

    serializeJson(
        document,
        payload
    );


    // --------------------------------------------------------
    // Debug information
    // --------------------------------------------------------

    Serial.println();
    Serial.println(
        "================================"
    );

    Serial.println(
        "PUBLISHING WEATHER"
    );

    Serial.println(
        "================================"
    );

    Serial.print(
        "Topic: "
    );

    Serial.println(
        MQTT_TOPIC
    );

    Serial.print(
        "Payload size: "
    );

    Serial.println(
        payload.length()
    );

    Serial.print(
        "Payload: "
    );

    Serial.println(
        payload
    );


    // --------------------------------------------------------
    // Publish
    // --------------------------------------------------------

    bool published =
        mqttClient.publish(
            MQTT_TOPIC,
            payload.c_str(),
            false
        );


    if (published)
    {
        Serial.println();
        Serial.println(
            "================================"
        );

        Serial.println(
            "WEATHER PUBLISHED SUCCESSFULLY"
        );

        Serial.println(
            "================================"
        );
    }
    else
    {
        Serial.println();
        Serial.println(
            "================================"
        );

        Serial.println(
            "WEATHER PUBLISH FAILED"
        );

        Serial.println(
            "================================"
        );

        Serial.print(
            "MQTT connected: "
        );

        Serial.println(
            mqttClient.connected()
            ? "YES"
            : "NO"
        );

        Serial.print(
            "MQTT state code: "
        );

        Serial.println(
            mqttClient.state()
        );
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
    Serial.println(
        "================================"
    );

    Serial.println(
        "AGROWEATHER ESP32"
    );

    Serial.println(
        "================================"
    );


    // --------------------------------------------------------
    // Pins
    // --------------------------------------------------------

    pinMode(
        LED_PIN,
        OUTPUT
    );

    digitalWrite(
        LED_PIN,
        LOW
    );


    pinMode(
        HALL_SENSOR_PIN,
        INPUT_PULLUP
    );


    pinMode(
        RAIN_ANALOG_PIN,
        INPUT
    );


    pinMode(
        LDR_PIN,
        INPUT
    );


    attachInterrupt(
        digitalPinToInterrupt(
            HALL_SENSOR_PIN
        ),
        countRotation,
        FALLING
    );


    // --------------------------------------------------------
    // Wi-Fi
    // --------------------------------------------------------

    connectWiFi();


    // --------------------------------------------------------
    // MQTT TLS
    // --------------------------------------------------------

    /*
       TEMPORARY DEVELOPMENT MODE.

       This disables TLS certificate verification.

       We will enable proper certificate verification
       before production deployment.
    */

    secureClient.setInsecure();


    // --------------------------------------------------------
    // MQTT configuration
    // --------------------------------------------------------

    mqttClient.setServer(
        MQTT_HOST,
        MQTT_PORT
    );


    /*
       Increase PubSubClient packet buffer.

       This prevents larger JSON messages from being
       rejected because of the default packet size.
    */

    mqttClient.setBufferSize(
        1024
    );


    // --------------------------------------------------------
    // Wind timing
    // --------------------------------------------------------

    lastWindMeasurement =
        millis();


    // --------------------------------------------------------
    // MQTT
    // --------------------------------------------------------

    connectMQTT();


    Serial.println();
    Serial.println(
        "================================"
    );

    Serial.println(
        "STATION READY"
    );

    Serial.println(
        "================================"
    );
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
    // --------------------------------------------------------
    // Wi-Fi
    // --------------------------------------------------------

    connectWiFi();


    // --------------------------------------------------------
    // MQTT
    // --------------------------------------------------------

    if (!mqttClient.connected())
    {
        connectMQTT();
    }


    mqttClient.loop();


    // --------------------------------------------------------
    // Publish every 10 seconds
    // --------------------------------------------------------

    unsigned long now =
        millis();


    if (
        now - lastPublish >=
        PUBLISH_INTERVAL
    )
    {
        lastPublish = now;


        digitalWrite(
            LED_PIN,
            HIGH
        );

        delay(100);

        digitalWrite(
            LED_PIN,
            LOW
        );


        publishWeather();
    }
}