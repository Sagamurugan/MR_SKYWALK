#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "credentials.h" // Your secret credentials
#include <HTTPClient.h>      // Library for sending email alerts

// Sensor Libraries
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// --- Firebase Objects ---
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- Sensor Objects & Pins ---
DHT dht(4, DHT11); // DHT sensor is connected to pin D4
Adafruit_MPU6050 mpu; // MPU-6050 sensor object

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
  Serial.println("DHT11 Initialized.");

  if (!mpu.begin()) {
    Serial.println("Critical Error: Failed to find MPU6050 chip. Halting.");
    while (1) { delay(10); } 
  }
  Serial.println("MPU6050 Initialized.");
  
  Serial.println("All sensors initialized. Starting main loop...");
}

void loop() {
  if (Firebase.ready()) {
    Serial.println("--------------------");
    Serial.println("Reading sensor data...");

    // --- Read REAL DHT11 sensor data ---
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error: Failed to read from DHT sensor!");
      delay(2000);
      return;
    }

    // --- Read REAL MPU-6050 sensor data ---
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    float vibration = a.acceleration.x; // Using the X-axis acceleration as our vibration metric

    // --- Placeholder data for sensors you don't have ---
    float load = 0.00;
    int crowd_count = 0;

    // --- Print values to Serial Monitor for debugging ---
    Serial.printf("Temp: %.2f C, Hum: %.2f %%\n", temperature, humidity);
    Serial.printf("Vibration: %.2f g\n", vibration);

    // --- Check for Critical Conditions and Send Email Alert ---
    float criticalVibration = 4.0; // Set your critical vibration threshold
    if (vibration > criticalVibration) {
      Serial.println("CRITICAL VIBRATION DETECTED! Sending FormSubmit email alert...");
      HTTPClient http;
      // REPLACE with your actual email address below
      http.begin("https://formsubmit.co/your-email@example.com"); 
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      String alertMessage = "message=A critical vibration of " + String(vibration) + "g was detected on the skywalk. Please check the dashboard immediately.";
      int httpResponseCode = http.POST(alertMessage);

      if (httpResponseCode > 0) {
        Serial.printf("FormSubmit alert trigger sent, response code: %d\n", httpResponseCode);
      } else {
        Serial.printf("Error sending FormSubmit alert trigger: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }
    
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
    
    if (Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), json.raw(), "temperature,humidity,vibration,load,count,status")) {
      Serial.printf("Success: %s\n", fbdo.payload().c_str());
    } else {
      Serial.printf("Failed: %s\n", fbdo.errorReason().c_str());
    }

  } else {
    Serial.println("Firebase not ready. Retrying...");
  }
  
  // Wait 10 seconds before the next reading cycle
  delay(10000); 
}





