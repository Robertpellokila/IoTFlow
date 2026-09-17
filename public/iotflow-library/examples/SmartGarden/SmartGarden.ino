/*
 * IoTFlow Example: Smart Garden with LED Control
 *
 * This example shows how to:
 * 1. Send sensor data (temperature, humidity, soil moisture) to IoTFlow
 * 2. Receive commands from the dashboard (turn LED/pump on/off)
 *
 * Hardware:
 * - ESP32 board
 * - DHT22 temperature & humidity sensor (pin 4)
 * - Soil moisture sensor on analog pin (A0)
 * - LED or relay on pin 26 (for pump control)
 *
 * Setup:
 * 1. Create a device in IoTFlow dashboard
 * 2. Copy your Device ID and Device Token
 * 3. Paste them below
 * 4. Flash this code to your ESP32
 * 5. Add widgets in the IoTFlow dashboard
 */

#include <IoTFlow.h>

// --- WiFi Settings ---
const char* WIFI_SSID = "your_wifi_name";
const char* WIFI_PASS = "your_wifi_password";

// --- IoTFlow Device Credentials ---
// Get these from IoTFlow > My Devices > Add Device
const char* DEVICE_ID = "ESP32-XXXXXX";
const char* DEVICE_TOKEN = "your_token_here";

// --- Pin Definitions ---
#define DHT_PIN 4
#define SOIL_PIN A0
#define LED_PIN 26

// --- Create IoTFlow instance ---
IoTFlow iot(DEVICE_ID, DEVICE_TOKEN);

void setup() {
  Serial.begin(115200);

  // Set up pins
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Connect to WiFi and IoTFlow
  iot.begin(WIFI_SSID, WIFI_PASS);

  // Register command handlers
  // When dashboard sends "led" command, this function runs
  iot.onCommand("led", [](String value) {
    if (value == "true") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED turned ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED turned OFF");
    }
  });

  // You can register multiple commands
  iot.onCommand("pump", [](String value) {
    if (value == "true") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("Pump ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("Pump OFF");
    }
  });

  Serial.println("IoTFlow Smart Garden Ready!");
}

void loop() {
  // Always call iot.loop() first - this checks for commands from dashboard
  iot.loop();

  // Send sensor data every 5 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) {
    lastSend = millis();

    // Read sensors (replace with your actual sensor readings)
    float temperature = 28.5;  // Read from DHT22
    float humidity = 73.0;     // Read from DHT22
    float soilMoisture = 42.0; // Read from soil sensor

    // Send each sensor value to IoTFlow
    iot.sendData("temperature", temperature);
    iot.sendData("humidity", humidity);
    iot.sendData("soil_moisture", soilMoisture);

    // Or send all at once:
    // iot.sendDataJson("{\"temperature\":28.5,\"humidity\":73,\"soil_moisture\":42}");

    Serial.println("Data sent to IoTFlow");
  }

  delay(100);
}
