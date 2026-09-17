/*
 * IoTFlow Example: LED Control Only
 *
 * Simplest example - just control an LED from the dashboard.
 * No sensors, just receive commands.
 *
 * 1. Create device in IoTFlow
 * 2. Add a Switch widget, set command name to "led"
 * 3. Flash this code
 */

#include <IoTFlow.h>

const char* WIFI_SSID = "your_wifi";
const char* WIFI_PASS = "your_password";
const char* DEVICE_ID = "ESP32-XXXXXX";
const char* DEVICE_TOKEN = "your_token";

#define LED_PIN 2  // ESP32 built-in LED

IoTFlow iot(DEVICE_ID, DEVICE_TOKEN);

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  iot.begin(WIFI_SSID, WIFI_PASS);

  // When dashboard toggle switch sends "led" command
  iot.onCommand("led", [](String value) {
    if (value == "true") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    }
  });

  Serial.println("Ready! Toggle the switch in your dashboard.");
}

void loop() {
  iot.loop();
  delay(100);
}
