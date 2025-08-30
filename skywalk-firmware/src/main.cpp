// src/main.cpp

#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "credentials.h" // Your secret credentials

// Sensor Libraries
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "HX711_ADC.h" // <-- CORRECTED THIS LINE

// --- Firebase Objects ---
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- Sensor Objects & Pins ---
Adafruit_MPU6050 mpu;
DHT dht(4, DHT22); // DHT sensor is connected to pin D4
HX711_ADC LoadCell(26, 25); // HX711 DT pin is 26, SCK pin is 25

const int trigPin = 19;
const int echoPin = 18;

// --- Setup Function (runs once at startup) ---
void setup() {
  Serial.begin(115200);

  // --- Connect to Wi-Fi ---
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // --- Initialize Firebase ---
  config.api_key = FIREBASE_API_KEY;
  auth.user.email = FIREBASE_USER_EMAIL;
  auth.user.password = FIREBASE_USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // --- Initialize Sensors ---
  dht.begin();
  if (!mpu.begin()) {
    Serial.println("Critical Error: Failed to find MPU6050 chip. Halting.");
    while (1) { delay(10); } // Stop forever if sensor is not found
  }
  Serial.println("MPU6050 Initialized.");

  LoadCell.begin();
  LoadCell.start(2000, true); // Start load cell with tare (zeroing it out)
  // This calibration factor needs to be adjusted with your physical hardware to get accurate readings.
  LoadCell.setCalFactor(420.0);
  Serial.println("Load Cell Initialized.");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("All sensors initialized. Starting main loop...");
}

// --- Main Loop (runs over and over again) ---
void loop() {
  // Wait for Firebase to be ready before doing anything
  if (Firebase.ready()) {
    Serial.println("--------------------");
    Serial.println("Reading sensor data...");

    // --- Read all sensors with validation ---
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    // Check if DHT readings are valid (not NaN - Not a Number)
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error: Failed to read from DHT sensor!");
      delay(2000); // Wait before retrying
      return; // Skip the rest of this loop iteration
    }

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    float vibration = a.acceleration.x; // Using X-axis acceleration as our vibration metric

    LoadCell.update();
    float load = LoadCell.getData();

    // Read crowd sensor (ultrasonic)
    digitalWrite(trigPin, LOW);
    delayMicroseconds(5);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duration = pulseIn(echoPin, HIGH, 30000); // Add a timeout to prevent getting stuck
    int distance = duration * 0.034 / 2;
    // Simple logic: if something is closer than 100cm, count it as 1 person passing
    int crowd_count = (distance > 0 && distance < 100) ? 1 : 0;

    // --- Print values to Serial Monitor for debugging ---
    Serial.printf("Temp: %.2f C, Hum: %.2f %%\n", temperature, humidity);
    Serial.printf("Vibration: %.2f g, Load: %.2f kg\n", vibration, load);
    Serial.printf("Crowd Distance: %d cm, Count: %d\n", distance, crowd_count);

    // --- Create a JSON object to send to Firebase ---
    FirebaseJson json;
    json.set("temperature", String(temperature, 2));
    json.set("humidity", String(humidity, 2));
    json.set("vibration", String(vibration, 2));
    json.set("load", String(load, 2));
    json.set("count", crowd_count);
    json.set("status", "Operational");

    // --- Send data to Firestore ---
    String documentPath = "live-data/latest";
    Serial.printf("Sending data to Firestore: %s\n", documentPath.c_str());

    // Use patchDocument to update the fields in the 'latest' document
    if (Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), json.raw(), "temperature,humidity,vibration,load,count,status")) {
      Serial.printf("Success: %s\n", fbdo.payload().c_str());
    } else {
      Serial.printf("Failed: %s\n", fbdo.errorReason().c_str());
    }

  } else {
    Serial.println("Firebase not ready. Retrying...");
  }

  // Wait 10 seconds before the next reading
  delay(10000);
}

