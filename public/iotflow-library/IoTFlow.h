/*
 * IoTFlow.h - Arduino library for IoTFlow platform
 * Connect your ESP32/ESP8266 to IoTFlow dashboard
 * Similar to Blynk library - simple and easy to use
 *
 * Usage:
 *   #include <IoTFlow.h>
 *
 *   IoTFlow iot("DEVICE_ID", "DEVICE_TOKEN");
 *
 *   void setup() {
 *     iot.begin("WIFI_SSID", "WIFI_PASSWORD");
 *   }
 *
 *   void loop() {
 *     iot.loop();
 *
 *     // Send sensor data
 *     iot.sendData("temperature", 28.5);
 *     iot.sendData("humidity", 73);
 *
 *     // Receive commands from dashboard
 *     iot.onCommand("led", [](String value) {
 *       digitalWrite(LED_PIN, value == "true" ? HIGH : LOW);
 *     });
 *   }
 */

#ifndef IoTFlow_h
#define IoTFlow_h

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define IOTFLOW_SERVER "http://your-app.com"  // Change to your IoTFlow server URL
#define IOTFLOW_POLL_INTERVAL 2000           // Poll for commands every 2 seconds

typedef void (*CommandCallback)(String value);

struct CommandHandler {
  String command;
  CommandCallback callback;
};

class IoTFlow {
private:
  String _deviceId;
  String _deviceToken;
  String _serverUrl;
  String _wifiSsid;
  String _wifiPass;
  unsigned long _lastPoll;
  unsigned long _lastSend;
  int _sendInterval;
  CommandHandler _handlers[20];
  int _handlerCount;
  bool _connected;

  bool ensureWifi() {
    if (WiFi.status() == WL_CONNECTED) return true;
    WiFi.disconnect(true);
    delay(100);
    WiFi.begin(_wifiSsid.c_str(), _wifiPass.c_str());
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
      delay(500);
      attempts++;
    }
    _connected = (WiFi.status() == WL_CONNECTED);
    return _connected;
  }

public:
  IoTFlow(String deviceId, String deviceToken) {
    _deviceId = deviceId;
    _deviceToken = deviceToken;
    _serverUrl = String(IOTFLOW_SERVER);
    _lastPoll = 0;
    _lastSend = 0;
    _sendInterval = 5000;  // Default: send data every 5 seconds
    _handlerCount = 0;
    _connected = false;
  }

  void setServer(String url) {
    _serverUrl = url;
  }

  void setSendInterval(int intervalMs) {
    _sendInterval = intervalMs;
  }

  void begin(String ssid, String password) {
    _wifiSsid = ssid;
    _wifiPass = password;
    ensureWifi();
  }

  bool isConnected() {
    return _connected && WiFi.status() == WL_CONNECTED;
  }

  // Send a single sensor value
  bool sendData(String key, float value) {
    if (!ensureWifi()) return false;

    HTTPClient http;
    String url = _serverUrl + "/api/iot/data";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    StaticJsonDocument<256> doc;
    doc["device_id"] = _deviceId;
    doc["token"] = _deviceToken;
    JsonObject data = doc.createNestedObject("data");
    data[key] = value;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    http.end();

    if (code > 0) {
      _lastSend = millis();
      return true;
    }
    return false;
  }

  // Send multiple sensor values at once
  bool sendDataJson(String json) {
    if (!ensureWifi()) return false;

    HTTPClient http;
    String url = _serverUrl + "/api/iot/data";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    StaticJsonDocument<512> doc;
    doc["device_id"] = _deviceId;
    doc["token"] = _deviceToken;

    // Parse the incoming JSON and add to data
    StaticJsonDocument<256> sensorData;
    deserializeJson(sensorData, json);
    doc["data"] = sensorData;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    http.end();
    return code > 0;
  }

  // Register a command handler - called when dashboard sends a command
  void onCommand(String command, CommandCallback callback) {
    if (_handlerCount < 20) {
      _handlers[_handlerCount].command = command;
      _handlers[_handlerCount].callback = callback;
      _handlerCount++;
    }
  }

  // Poll for commands - call this in loop()
  void pollCommands() {
    if (!ensureWifi()) return;
    if (millis() - _lastPoll < IOTFLOW_POLL_INTERVAL) return;
    _lastPoll = millis();

    HTTPClient http;
    String url = _serverUrl + "/api/iot/commands/" + _deviceId + "?token=" + _deviceToken;
    http.begin(url);
    http.setTimeout(5000);

    int code = http.GET();
    if (code == 200) {
      String response = http.getString();
      http.end();

      StaticJsonDocument<1024> doc;
      DeserializationError err = deserializeJson(doc, response);
      if (err) return;

      JsonArray commands = doc["commands"];
      for (JsonObject cmd : commands) {
        String cmdName = cmd["command"].as<String>();
        String cmdId = cmd["id"].as<String>();
        String cmdValue;
        JsonVariant val = cmd["value"];

        if (val.is<bool>()) {
          cmdValue = val.as<bool>() ? "true" : "false";
        } else if (val.is<int>()) {
          cmdValue = String(val.as<int>());
        } else if (val.is<float>()) {
          cmdValue = String(val.as<float>());
        } else {
          cmdValue = val.as<String>();
        }

        // Find matching handler
        for (int i = 0; i < _handlerCount; i++) {
          if (_handlers[i].command == cmdName) {
            _handlers[i].callback(cmdValue);
            break;
          }
        }

        // Mark command as executed
        markExecuted(cmdId);
      }
    } else {
      http.end();
    }
  }

  // Mark a command as executed
  void markExecuted(String commandId) {
    if (!ensureWifi()) return;

    HTTPClient http;
    String url = _serverUrl + "/api/iot/command-status";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000);

    StaticJsonDocument<256> doc;
    doc["device_id"] = _deviceId;
    doc["token"] = _deviceToken;
    doc["command_id"] = commandId;
    doc["status"] = "executed";

    String body;
    serializeJson(doc, body);
    http.POST(body);
    http.end();
  }

  // Main loop - call this in your Arduino loop()
  void loop() {
    if (!ensureWifi()) {
      delay(1000);
      return;
    }
    pollCommands();
  }
};

#endif
