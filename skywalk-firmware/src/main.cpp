

#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "credentials.h" 


#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "HX711_ADC.h" 


FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;


Adafruit_MPU6050 mpu;
DHT dht(4, DHT22); 
HX711_ADC LoadCell(26, 25); 

const int trigPin = 19;
const int echoPin = 18;


void setup() {
  Serial.begin(115200);


  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());


  config.api_key = FIREBASE_API_KEY;
  auth.user.email = FIREBASE_USER_EMAIL;
  auth.user.password = FIREBASE_USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  dht.begin();
  if (!mpu.begin()) {
    Serial.println("Critical Error: Failed to find MPU6050 chip. Halting.");
    while (1) { delay(10); } 
  }
  Serial.println("MPU6050 Initialized.");

  LoadCell.begin();
  LoadCell.start(2000, true); 
  LoadCell.setCalFactor(420.0);
  Serial.println("Load Cell Initialized.");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("All sensors initialized. Starting main loop...");
}


void loop() {
 
  if (Firebase.ready()) {
    Serial.println("--------------------");
    Serial.println("Reading sensor data...");

   
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
   
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error: Failed to read from DHT sensor!");
      delay(2000); 
      return; 
    }

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    float vibration = a.acceleration.x; 

    LoadCell.update();
    float load = LoadCell.getData();

    
    digitalWrite(trigPin, LOW);
    delayMicroseconds(5);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duration = pulseIn(echoPin, HIGH, 30000); 
    int distance = duration * 0.034 / 2;
    
    int crowd_count = (distance > 0 && distance < 100) ? 1 : 0;

    
    Serial.printf("Temp: %.2f C, Hum: %.2f %%\n", temperature, humidity);
    Serial.printf("Vibration: %.2f g, Load: %.2f kg\n", vibration, load);
    Serial.printf("Crowd Distance: %d cm, Count: %d\n", distance, crowd_count);

    
    FirebaseJson json;
    json.set("temperature", String(temperature, 2));
    json.set("humidity", String(humidity, 2));
    json.set("vibration", String(vibration, 2));
    json.set("load", String(load, 2));
    json.set("count", crowd_count);
    json.set("status", "Operational");

    
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

  
  delay(10000);
}

