#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "credentials.h" // Your secret credentials
#include <HTTPClient.h>      // Library for sending email alerts

// Sensor Libraries
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "HX711_ADC.h"

// --- Firebase Objects ---
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- Sensor Objects & Pins ---
Adafruit_MPU6050 mpu;
DHT dht(4, DHT22);           // DHT sensor is connected to pin D4
HX711_ADC LoadCell(26, 25); // HX711 DT pin is 26, SCK pin is 25

const int trigPin = 19;
const int echoPin = 18;

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
    while (1) { delay(10); }
  }
  Serial.println("MPU6050 Initialized.");

  LoadCell.begin();
  LoadCell.start(2000, true); // Tare the scale on startup
  LoadCell.setCalFactor(420.0); // This value needs to be calibrated
  Serial.println("Load Cell Initialized.");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("All sensors initialized. Starting main loop...");
}

void loop() {
  if (Firebase.ready()) {
    Serial.println("--------------------");
    Serial.println("Reading sensor data...");

    // --- Read all sensors ---
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    // Check if DHT read failed
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error: Failed to read from DHT sensor!");
      delay(2000); // Wait before retrying
      return; // Skip the rest of the loop
    }

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    float vibration = a.acceleration.x;

    LoadCell.update();
    float load = LoadCell.getData();

    // Read crowd sensor (ultrasonic)
    digitalWrite(trigPin, LOW);
    delayMicroseconds(5);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
    int distance = duration * 0.034 / 2;
    
    int crowd_count = (distance > 0 && distance < 100) ? 1 : 0;

    // --- Print values to Serial Monitor for debugging ---
    Serial.printf("Temp: %.2f C, Hum: %.2f %%\n", temperature, humidity);
    Serial.printf("Vibration: %.2f g, Load: %.2f kg\n", vibration, load);
    Serial.printf("Crowd Distance: %d cm, Count: %d\n", distance, crowd_count);

    // --- CORRECTED PLACEMENT for Email Alert ---
    // This now checks the vibration value from the CURRENT reading.
    float criticalVibration = 4.0;
    if (vibration > criticalVibration) {
      Serial.println("CRITICAL VIBRATION DETECTED! Sending FormSubmit email alert...");

      HTTPClient http;
      // Replace with your actual email address
      http.begin("https://formsubmit.co/sagamurugan7@gmail.com"); 
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      String alertMessage = "message=A critical vibration of " + String(vibration) + "g was detected on the skywalk. Please check the dashboard immediately.";
      int httpResponseCode = http.POST(alertMessage);

      if (httpResponseCode > 0) {
        Serial.printf("FormSubmit alert trigger sent, response code: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println(response);
      } else {
        Serial.printf("Error sending FormSubmit alert trigger: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }
    // --- End of Email Alert Block ---


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



