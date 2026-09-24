#include <DHT11.h>

#define DHTPIN 4             // DHT11 Data pin
#define LED_PIN 2            // Onboard Blue LED
#define RAIN_ANALOG_PIN 34   // Rain Sensor AO
#define HALL_SENSOR_PIN 15   // Hall Effect Sensor DO pin (D15)

// Anemometer configuration
const float ANEMOMETER_RADIUS_CM = 15.0; // Radius from center axis to magnet in cm
const float PI_VAL = 3.14159;

// Thresholds for rain levels (Dry is ~4000-4095)
#define DRIZZLE_THRESHOLD 3500  // Below 3500 = Drizzling
#define RAIN_THRESHOLD    2500  // Below 2500 = Raining

DHT11 dht11(DHTPIN);

// Interrupt variables for Hall Effect Sensor
volatile unsigned long rotationCount = 0;
unsigned long lastLogTime = 0;

// Interrupt Service Routine (ISR) triggered when magnet passes
void IRAM_ATTR countRotation() {
  rotationCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000); // Allow Serial port to initialize cleanly
  Serial.println();

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Setup Hall Effect sensor pin with internal pullup
  pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
  // Trigger interrupt when magnet passes (pin goes LOW)
  attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), countRotation, FALLING);

  lastLogTime = millis();
}

void loop() {
  delay(5000); // Read every 5 seconds

  // Flash onboard LED while logging
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);

  // 1. Calculate Wind Speed
  unsigned long currentTime = millis();
  float timeElapsedSec = (currentTime - lastLogTime) / 1000.0;
  
  // Safely read and reset rotation count
  noInterrupts();
  unsigned long rotations = rotationCount;
  rotationCount = 0;
  interrupts();
  
  lastLogTime = currentTime;

  // Calculate circumference in meters
  float radiusMeters = ANEMOMETER_RADIUS_CM / 100.0;
  float circumferenceMeters = 2.0 * PI_VAL * radiusMeters;
  
  // Calculate speed in km/h
  float windSpeedKmh = 0.0;
  if (timeElapsedSec > 0) {
    float rotationsPerSec = (float)rotations / timeElapsedSec;
    windSpeedKmh = rotationsPerSec * circumferenceMeters * 3.6; // Convert m/s to km/h
  }

  // 2. Read Temperature and Humidity
  int temp = 0;
  int hum = 0;
  int result = dht11.readTemperatureHumidity(temp, hum);

  // 3. Read Rain Sensor
  int rainAnalog = analogRead(RAIN_ANALOG_PIN);

  // Print Formatted Output (Each reading on a new line)
  Serial.println(F("------"));

  // Temperature & Humidity
  if (result == 0) {
    Serial.print(F("temp: "));
    Serial.print(temp);
    Serial.println(F("°C"));

    Serial.print(F("hum: "));
    Serial.print(hum);
    Serial.println(F("%"));
  } else {
    Serial.println(F("temp: ERR"));
    Serial.println(F("hum: ERR"));
  }

  // Precipitation State
  Serial.print(F("precipitation ("));
  Serial.print(rainAnalog);
  Serial.print(F("): "));
  if (rainAnalog < RAIN_THRESHOLD) {
    Serial.println(F("Raining"));
  } else if (rainAnalog < DRIZZLE_THRESHOLD) {
    Serial.println(F("Drizzling"));
  } else {
    Serial.println(F("Dry"));
  }

  // Wind Speed
  Serial.print(F("w-speed: "));
  Serial.print(windSpeedKmh, 2);
  Serial.println(F(" km/h"));

  Serial.println(); // Blank line between logs
}