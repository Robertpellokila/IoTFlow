<template>
  <div class="space-y-6 max-w-4xl">
    <div>
      <h1 class="text-2xl font-bold text-white">Setup Guide</h1>
      <p class="text-slate-400 text-sm mt-1">Connect your ESP32 to IoTFlow and start sending data</p>
    </div>

    <!-- Step 1: Create Device -->
    <div class="card p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold text-sm">1</div>
        <h2 class="text-lg font-semibold text-white">Create a Device</h2>
      </div>
      <p class="text-sm text-slate-400 mb-3">
        Go to <NuxtLink to="/devices" class="text-primary-400 hover:text-primary-300">My Devices</NuxtLink> and click "Add Device".
        Enter a name, select your board type, and you'll get a <strong class="text-slate-300">Device ID</strong> and <strong class="text-slate-300">Device Token</strong>.
      </p>
      <div class="p-3 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-2">
        <ShieldAlert class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        <p class="text-xs text-slate-400">Keep your Device Token private — anyone with it can send data to your device.</p>
      </div>
    </div>

    <!-- Step 2: Install Library -->
    <div class="card p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold text-sm">2</div>
        <h2 class="text-lg font-semibold text-white">Install the IoTFlow Library</h2>
      </div>
      <p class="text-sm text-slate-400 mb-3">Two options — use the library (recommended) or write raw HTTP.</p>

      <div class="space-y-4">
        <!-- Option A: Library -->
        <div class="p-4 rounded-xl bg-background-elevated border border-border">
          <h3 class="text-sm font-semibold text-white mb-2">Option A: IoTFlow Library (Recommended)</h3>
          <p class="text-xs text-slate-400 mb-3">Download the library and install it in Arduino IDE:</p>
          <ol class="text-xs text-slate-400 space-y-1 mb-3 list-decimal list-inside">
            <li>Download <code class="text-primary-400">IoTFlow.h</code> from the link below</li>
            <li>In Arduino IDE: Sketch → Include Library → Add .ZIP Library (or place in your libraries folder)</li>
            <li>Include it in your sketch: <code class="text-primary-400">#include &lt;IoTFlow.h&gt;</code></li>
          </ol>
          <div class="flex gap-2">
            <a href="/iotflow-library/IoTFlow.h" download class="btn-primary text-xs">
              <Download class="w-3.5 h-3.5" />
              Download IoTFlow.h
            </a>
            <a href="/iotflow-library/examples/SmartGarden/SmartGarden.ino" download class="btn-secondary text-xs">
              <Download class="w-3.5 h-3.5" />
              Example Sketch
            </a>
          </div>
        </div>

        <!-- Option B: Raw HTTP -->
        <div class="p-4 rounded-xl bg-background-elevated border border-border">
          <h3 class="text-sm font-semibold text-white mb-2">Option B: Raw HTTP (No Library)</h3>
          <p class="text-xs text-slate-400 mb-2">Use WiFi.h and HTTPClient.h directly. Copy the code from the device creation screen.</p>
          <p class="text-xs text-slate-500">You'll need to manually build JSON and handle HTTP requests.</p>
        </div>
      </div>
    </div>

    <!-- Step 3: Write Code -->
    <div class="card p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold text-sm">3</div>
        <h2 class="text-lg font-semibold text-white">Write Your Arduino Code</h2>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-4 border-b border-border">
        <button
          v-for="tab in codeTabs"
          :key="tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id ? 'text-primary-400 border-primary-500' : 'text-slate-400 border-transparent hover:text-slate-200'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Library example -->
      <div v-if="activeTab === 'library'" class="space-y-3">
        <p class="text-sm text-slate-400">Using the IoTFlow library — clean and simple, just like Blynk:</p>
        <CodeBlock :code="libraryCode" />
      </div>

      <!-- Raw HTTP example -->
      <div v-if="activeTab === 'raw'" class="space-y-3">
        <p class="text-sm text-slate-400">Using raw HTTP — no library needed, more control:</p>
        <CodeBlock :code="rawCode" />
      </div>

      <!-- Command handling -->
      <div v-if="activeTab === 'commands'" class="space-y-3">
        <p class="text-sm text-slate-400">How to receive commands from the dashboard (LED, pump, etc.):</p>
        <CodeBlock :code="commandCode" />
      </div>

      <!-- Multi Sensor -->
      <div v-if="activeTab === 'multi'" class="space-y-3">
        <p class="text-sm text-slate-400">Kirim banyak sensor sekaligus dalam satu JSON menggunakan <code class="text-primary-400">sendDataJson()</code>:</p>
        <CodeBlock :code="multiCode" />
      </div>

      <!-- Arduino Libraries -->
      <div v-if="activeTab === 'advanced'" class="space-y-3">
        <p class="text-sm text-slate-400">Contoh kode lengkap dengan semua library (DHT, GPS, Servo, NeoPixel):</p>
        <CodeBlock :code="advancedCode" />
      </div>
    </div>

    <!-- Step 4: Add Widgets -->
    <div class="card p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold text-sm">4</div>
        <h2 class="text-lg font-semibold text-white">Add Widgets to Your Dashboard</h2>
      </div>
      <div class="space-y-3 text-sm text-slate-400">
        <div class="flex items-start gap-2">
          <ChevronRight class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <p>Go to <NuxtLink to="/dashboards" class="text-primary-400">Dashboards</NuxtLink> and create a dashboard for your device</p>
        </div>
        <div class="flex items-start gap-2">
          <ChevronRight class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <p>Click "Add Widget" and choose a type (Value, Gauge, Switch, Chart, etc.)</p>
        </div>
        <div class="flex items-start gap-2">
          <ChevronRight class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <p>Set the <strong class="text-slate-300">Data Source</strong> to match the key you send from ESP32 (e.g. "temperature")</p>
        </div>
        <div class="flex items-start gap-2">
          <ChevronRight class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <p>For control widgets (Switch, Button), set the <strong class="text-slate-300">Command Name</strong> to match what your ESP32 listens for (e.g. "led")</p>
        </div>
        <div class="flex items-start gap-2">
          <ChevronRight class="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <p>Save — data will appear in realtime as your ESP32 sends it</p>
        </div>
      </div>
    </div>

    <!-- Arduino Libraries Section -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-white mb-2">Library Arduino IDE yang Diperlukan</h2>
      <p class="text-sm text-slate-400 mb-4">Install library berikut melalui Arduino IDE → Tools → Manage Libraries:</p>
      <div class="space-y-3">
        <div v-for="lib in arduinoLibraries" :key="lib.name" class="p-4 rounded-xl bg-background-elevated border border-border">
          <div class="flex items-start justify-between gap-2 mb-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-white text-sm">{{ lib.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="lib.required ? 'bg-error/20 text-error' : 'bg-slate-700 text-slate-400'">{{ lib.required ? 'Wajib' : 'Opsional' }}</span>
            </div>
            <span class="text-xs text-slate-500 font-mono">v{{ lib.version }}</span>
          </div>
          <p class="text-xs text-slate-400 mb-1">{{ lib.desc }}</p>
          <p class="text-xs text-slate-500">📦 {{ lib.install }}</p>
        </div>
      </div>
    </div>

    <!-- API Reference -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-white mb-4">API Reference</h2>
      <div class="space-y-4">
        <div v-for="endpoint in apiEndpoints" :key="endpoint.path" class="p-3 rounded-xl bg-background-elevated border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge text-xs font-mono" :class="endpoint.method === 'POST' ? 'badge-success' : 'badge-info'">{{ endpoint.method }}</span>
            <code class="text-sm text-slate-300 font-mono">{{ endpoint.path }}</code>
          </div>
          <p class="text-xs text-slate-400 mb-2">{{ endpoint.desc }}</p>
          <div v-if="endpoint.body" class="text-xs">
            <pre class="font-mono text-slate-300 p-2 rounded-lg bg-background overflow-x-auto scrollbar-thin">{{ endpoint.body }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Command Mapping -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Widget Command Mapping</h2>
      <p class="text-sm text-slate-400 mb-4">How dashboard widgets map to ESP32 commands:</p>
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="py-2 pr-4 text-slate-400 font-medium">Widget</th>
              <th class="py-2 pr-4 text-slate-400 font-medium">Config</th>
              <th class="py-2 pr-4 text-slate-400 font-medium">ESP32 Receives</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in widgetMapping" :key="row.widget">
              <td class="py-2 pr-4 text-white">{{ row.widget }}</td>
              <td class="py-2 pr-4 text-slate-400">{{ row.config }}</td>
              <td class="py-2 pr-4"><code class="text-primary-400 text-xs font-mono">{{ row.code }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Widget Datastream Reference (kartu lengkap) -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-white mb-2">Widget Datastream Reference</h2>
      <p class="text-sm text-slate-400 mb-4">Panduan konfigurasi datastream untuk setiap widget:</p>
      <div class="grid gap-3">
        <div v-for="item in widgetDatastreamInfo" :key="item.widget" class="p-4 rounded-xl bg-background-elevated border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-semibold text-white">{{ item.widget }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="item.type === 'Read' ? 'bg-primary-500/20 text-primary-400' : 'bg-warning/20 text-warning'">{{ item.type }}</span>
            <span v-if="item.dataKey" class="text-xs font-mono text-slate-400 ml-auto">key: &quot;{{ item.dataKey }}&quot;</span>
          </div>
          <p class="text-xs text-slate-400 mb-2">{{ item.desc }}</p>
          <pre class="text-xs font-mono text-primary-400 bg-background p-2 rounded-lg overflow-x-auto scrollbar-thin">{{ item.esp32Code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldAlert, Download, ChevronRight } from 'lucide-vue-next'
import CodeBlock from '~/components/ui/CodeBlock.vue'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const activeTab = ref('library')

const codeTabs = [
  { id: 'library', label: 'Using Library' },
  { id: 'raw', label: 'Raw HTTP' },
  { id: 'commands', label: 'Command Control' },
  { id: 'multi', label: 'Multi Sensor' },
  { id: 'advanced', label: 'Arduino Libraries' },
]

const libraryCode = `#include <IoTFlow.h>

const char* DEVICE_ID = "ESP32-XXXXXX";
const char* DEVICE_TOKEN = "your_token_here";
const char* WIFI_SSID = "your_wifi";
const char* WIFI_PASS = "your_password";

IoTFlow iot(DEVICE_ID, DEVICE_TOKEN);

void setup() {
  Serial.begin(115200);
  iot.begin(WIFI_SSID, WIFI_PASS);

  // Register command handlers
  iot.onCommand("led", [](String value) {
    digitalWrite(2, value == "true" ? HIGH : LOW);
  });

  iot.onCommand("pump", [](String value) {
    digitalWrite(26, value == "true" ? HIGH : LOW);
  });
}

void loop() {
  iot.loop(); // Polls for commands automatically

  // Send sensor data every 5 seconds
  static unsigned long last = 0;
  if (millis() - last > 5000) {
    last = millis();
    iot.sendData("temperature", 28.5);
    iot.sendData("humidity", 73.0);
    iot.sendData("soil_moisture", 42.0);
  }
}`

const rawCode = `#include <WiFi.h>
#include <HTTPClient.h>

const char* DEVICE_ID = "ESP32-XXXXXX";
const char* DEVICE_TOKEN = "your_token";
const char* SERVER = "https://your-app.com";

void setup() {
  Serial.begin(115200);
  WiFi.begin("your_wifi", "your_password");
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  // Send sensor data
  HTTPClient http;
  http.begin(String(SERVER) + "/api/iot/data");
  http.addHeader("Content-Type", "application/json");
  String body = "{\\"device_id\\":\\"" + String(DEVICE_ID) +
    "\\",\\"token\\":\\"" + String(DEVICE_TOKEN) +
    "\\",\\"data\\\":{\\"temperature\\\":28.5}}";
  http.POST(body);
  http.end();

  delay(5000);
}`

const commandCode = `// In your ESP32 code, poll for commands:

void pollCommands() {
  HTTPClient http;
  http.begin(String(SERVER) + "/api/iot/commands/" +
    String(DEVICE_ID) + "?token=" + String(DEVICE_TOKEN));
  int code = http.GET();

  if (code == 200) {
    String resp = http.getString();

    // Parse JSON response
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, resp);
    JsonArray cmds = doc["commands"];

    for (JsonObject cmd : cmds) {
      String name = cmd["command"];  // "led", "pump", etc.
      bool value = cmd["value"];     // true or false
      String id = cmd["id"];

      // Handle the command
      if (name == "led") {
        digitalWrite(LED_PIN, value ? HIGH : LOW);
      }

      // Mark as executed so it won't run again
      markExecuted(id);
    }
  }
  http.end();
}`

const multiCode = `#include <IoTFlow.h>

const char* DEVICE_ID = "ESP32-XXXXXX";
const char* DEVICE_TOKEN = "your_token_here";

IoTFlow iot(DEVICE_ID, DEVICE_TOKEN);

float readTemperature() { return 28.5; }
float readHumidity()    { return 73.0; }
float readSoilMoisture(){ return 42.0; }

void setup() {
  Serial.begin(115200);
  iot.begin("your_wifi", "your_password");

  iot.onCommand("led",   [](String v){ digitalWrite(2,  v=="true"?HIGH:LOW); });
  iot.onCommand("pump",  [](String v){ digitalWrite(26, v=="true"?HIGH:LOW); });
  iot.onCommand("servo", [](String v){ /* myServo.write(v.toInt()); */ });
  iot.onCommand("rgb",   [](String v){ /* parseAndSetRGB(v); */ });
}

void loop() {
  iot.loop();

  static unsigned long last = 0;
  if (millis() - last > 5000) {
    last = millis();

    // Kirim banyak sensor dalam satu JSON
    String json = "{\\"temperature\\":" + String(readTemperature()) +
                  ",\\"humidity\\":" + String(readHumidity()) +
                  ",\\"soil_moisture\\":" + String(readSoilMoisture()) +
                  ",\\"motion\\":false" +
                  ",\\"speed\\":0" +
                  ",\\"bearing\\":180}";
    iot.sendDataJson(json);
  }
}`

const advancedCode = `// ===== CONTOH LENGKAP DENGAN SEMUA LIBRARY =====
// Library yang diinstall: ArduinoJson, DHT sensor library,
//                         ESP32Servo, TinyGPSPlus, Adafruit NeoPixel

#include <IoTFlow.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <TinyGPSPlus.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>

#define DHT_PIN     4
#define DHT_TYPE    DHT22
#define SERVO_PIN   18
#define LED_PIN     2
#define NEO_PIN     25
#define NEO_COUNT   8
#define GPS_RX      16
#define GPS_TX      17

DHT dht(DHT_PIN, DHT_TYPE);
Servo myServo;
TinyGPSPlus gps;
Adafruit_NeoPixel strip(NEO_COUNT, NEO_PIN, NEO_GRB + NEO_KHZ800);
SoftwareSerial gpsSerial(GPS_RX, GPS_TX);

IoTFlow iot("ESP32-XXXXXX", "your_token_here");

// Parse hex color dan set NeoPixel
void setRGBFromHex(String hex) {
  hex.replace("#", "");
  long number = strtol(hex.c_str(), NULL, 16);
  int r = (number >> 16) & 0xFF;
  int g = (number >> 8)  & 0xFF;
  int b =  number        & 0xFF;
  for (int i = 0; i < strip.numPixels(); i++)
    strip.setPixelColor(i, strip.Color(r, g, b));
  strip.show();
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  dht.begin();
  myServo.attach(SERVO_PIN);
  strip.begin();
  strip.show();
  pinMode(LED_PIN, OUTPUT);

  iot.begin("your_wifi", "your_password");

  iot.onCommand("led",   [](String v){ digitalWrite(LED_PIN, v=="true"?HIGH:LOW); });
  iot.onCommand("servo", [](String v){ myServo.write(v.toInt()); });
  iot.onCommand("rgb",   [](String v){ setRGBFromHex(v); });
  iot.onCommand("pump",  [](String v){ /* kontrol pompa */ });
}

void loop() {
  // Update GPS
  while (gpsSerial.available() > 0)
    gps.encode(gpsSerial.read());

  iot.loop();

  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) {
    lastSend = millis();

    // Kirim semua sensor sekaligus
    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();
    float spd  = gps.speed.isValid() ? gps.speed.kmph() : 0;

    String json = "{\\"temperature\\":" + String(temp,1) +
                  ",\\"humidity\\":" + String(hum,1) +
                  ",\\"speed\\":" + String(spd,1);

    if (gps.location.isValid()) {
      String lat = String(gps.location.lat(), 6);
      String lng = String(gps.location.lng(), 6);
      json += ",\\"location\\":\\"" + lat + "," + lng + "\\"";
    }
    json += "}";

    iot.sendDataJson(json);
  }
}`

const arduinoLibraries = [
  {
    name: 'ArduinoJson',
    author: 'Benoit Blanchon',
    version: '>=6.x',
    install: 'Library Manager → cari "ArduinoJson" → Install',
    required: true,
    desc: 'Digunakan oleh IoTFlow.h untuk parse/serialize JSON saat kirim dan terima data.',
  },
  {
    name: 'WiFi (built-in ESP32)',
    author: 'Espressif',
    version: 'Built-in ESP32 board package',
    install: 'Board Manager → cari "esp32 by Espressif Systems" → Install',
    required: true,
    desc: 'Library WiFi bawaan ESP32. Pastikan board package ESP32 sudah terinstall.',
  },
  {
    name: 'HTTPClient (built-in ESP32)',
    author: 'Espressif',
    version: 'Built-in ESP32 board package',
    install: 'Sudah termasuk jika board ESP32 sudah diinstall.',
    required: true,
    desc: 'Digunakan untuk HTTP POST/GET ke server IoTFlow.',
  },
  {
    name: 'DHT sensor library',
    author: 'Adafruit',
    version: '>=1.4.x',
    install: 'Library Manager → cari "DHT sensor library by Adafruit" → Install',
    required: false,
    desc: 'Untuk membaca sensor suhu/kelembaban DHT11 / DHT22.',
  },
  {
    name: 'Adafruit Unified Sensor',
    author: 'Adafruit',
    version: '>=1.1.x',
    install: 'Library Manager → cari "Adafruit Unified Sensor" → Install',
    required: false,
    desc: 'Dependensi dari DHT sensor library. Install bersamaan.',
  },
  {
    name: 'ESP32Servo',
    author: 'Kevin Harrington',
    version: '>=0.13.x',
    install: 'Library Manager → cari "ESP32Servo" → Install',
    required: false,
    desc: 'Untuk mengontrol servo motor dari widget Slider.',
  },
  {
    name: 'TinyGPS++ ',
    author: 'Mikal Hart',
    version: '>=1.0.x',
    install: 'Library Manager → cari "TinyGPSPlus" → Install',
    required: false,
    desc: 'Untuk membaca modul GPS (NEO-6M dll) dan mengirim koordinat ke widget Map.',
  },
  {
    name: 'Adafruit NeoPixel',
    author: 'Adafruit',
    version: '>=1.11.x',
    install: 'Library Manager → cari "Adafruit NeoPixel" → Install',
    required: false,
    desc: 'Untuk LED strip WS2812B yang dikontrol dari widget Color Picker.',
  },
]

const widgetDatastreamInfo = [
  {
    widget: 'Value',
    icon: '🔢',
    dataKey: 'temperature',
    unit: '°C',
    type: 'Read',
    esp32Code: 'iot.sendData("temperature", 28.5);',
    desc: 'Menampilkan angka dari sensor. Set Data Source = nama key yang dikirim ESP32.',
  },
  {
    widget: 'Gauge',
    icon: '📊',
    dataKey: 'humidity',
    unit: '%',
    type: 'Read',
    esp32Code: 'iot.sendData("humidity", 73.0);',
    desc: 'Bar horizontal dengan min/max. Set Min=0, Max=100 untuk persentase.',
  },
  {
    widget: 'Chart',
    icon: '📈',
    dataKey: 'temperature',
    unit: '°C',
    type: 'Read',
    esp32Code: 'iot.sendData("temperature", 28.5);',
    desc: 'Riwayat data sebagai grafik garis. Sama seperti Value, beda tampilannya.',
  },
  {
    widget: 'Switch',
    icon: '🔄',
    dataKey: 'led_state',
    unit: '',
    type: 'Write',
    esp32Code: 'iot.onCommand("led", [](String v){ digitalWrite(2, v=="true"?HIGH:LOW); });',
    desc: 'Toggle ON/OFF. Set Command Name = "led". ESP32 menerima "true" atau "false".',
  },
  {
    widget: 'Button',
    icon: '🔘',
    dataKey: '',
    unit: '',
    type: 'Write',
    esp32Code: 'iot.onCommand("pump", [](String v){ /* activate pump */ });',
    desc: 'Kirim command satu kali saat diklik. Set Command Name = "pump" dll.',
  },
  {
    widget: 'Slider',
    icon: '🎚️',
    dataKey: 'servo_angle',
    unit: 'deg',
    type: 'Write',
    esp32Code: 'iot.onCommand("servo", [](String v){ myServo.write(v.toInt()); });',
    desc: 'Kirim nilai 0-180 ke servo. Set Min=0, Max=180, Command Name="servo".',
  },
  {
    widget: 'LED',
    icon: '💡',
    dataKey: 'motion',
    unit: '',
    type: 'Read',
    esp32Code: 'iot.sendData("motion", true);',
    desc: 'Indikator boolean. Menyala jika nilai = true atau 1.',
  },
  {
    widget: 'Progress',
    icon: '⏳',
    dataKey: 'soil_moisture',
    unit: '%',
    type: 'Read',
    esp32Code: 'iot.sendData("soil_moisture", 42.0);',
    desc: 'Progress bar. Set Min=0, Max=100 untuk persentase kelembaban tanah.',
  },
  {
    widget: 'Status',
    icon: '🚨',
    dataKey: 'alarm',
    unit: '',
    type: 'Read',
    esp32Code: 'iot.sendData("alarm", true);',
    desc: 'Menampilkan status aktif/normal berdasarkan nilai boolean.',
  },
  {
    widget: 'Text',
    icon: '📝',
    dataKey: 'status_msg',
    unit: '',
    type: 'Read',
    esp32Code: 'iot.sendData("status_msg", "Running OK");',
    desc: 'Menampilkan teks string dari ESP32.',
  },
  {
    widget: 'Compass',
    icon: '🧭',
    dataKey: 'bearing',
    unit: '°',
    type: 'Read',
    esp32Code: 'iot.sendData("bearing", compass.getAzimuth());',
    desc: 'Jarum kompas berputar. Nilai 0-360. Gunakan modul HMC5883L atau QMC5883L.',
  },
  {
    widget: 'Thermometer',
    icon: '🌡️',
    dataKey: 'temperature',
    unit: '°C',
    type: 'Read',
    esp32Code: 'iot.sendData("temperature", dht.readTemperature());',
    desc: 'Visual termometer naik/turun. Set Min=-20, Max=80 untuk suhu ruangan.',
  },
  {
    widget: 'GPS Map',
    icon: '🗺️',
    dataKey: 'location',
    unit: '',
    type: 'Read',
    esp32Code: 'String loc = String(gps.location.lat(),6) + "," + String(gps.location.lng(),6);\niot.sendData("location", loc.toFloat()); // atau sendDataJson',
    desc: 'Tampilkan koordinat GPS. Kirim sebagai string "lat,lng" via sendDataJson.',
  },
  {
    widget: 'Speedometer',
    icon: '🏎️',
    dataKey: 'speed',
    unit: 'km/h',
    type: 'Read',
    esp32Code: 'iot.sendData("speed", gps.speed.kmph());',
    desc: 'Gauge melingkar kecepatan. Set Min=0, Max=200 untuk kecepatan normal.',
  },
  {
    widget: 'Data Table',
    icon: '📋',
    dataKey: 'temperature',
    unit: '',
    type: 'Read',
    esp32Code: 'iot.sendData("temperature", 28.5);',
    desc: 'Riwayat 10 data terakhir dalam tabel. Data Source sama dengan widget lain.',
  },
  {
    widget: 'Color Picker',
    icon: '🎨',
    dataKey: '',
    unit: '',
    type: 'Write',
    esp32Code: 'iot.onCommand("rgb", [](String v){ parseAndSetRGB(v); });',
    desc: 'Kirim nilai warna hex (#FF5500) ke ESP32. Set Command Name="rgb". Cocok untuk LED RGB / NeoPixel.',
  },
]

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/iot/data',
    desc: 'Send sensor data from ESP32 to IoTFlow',
    body: `{
  "device_id": "ESP32-XXXXXX",
  "token": "your_token",
  "data": {
    "temperature": 28.5,
    "humidity": 73,
    "soil_moisture": 42
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/iot/commands/{device_id}?token={token}',
    desc: 'Poll for pending commands from the dashboard',
    body: `// Response:
{
  "success": true,
  "commands": [
    { "id": "uuid", "command": "led", "value": true }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/iot/command-status',
    desc: 'Mark a command as executed after running it',
    body: `{
  "device_id": "ESP32-XXXXXX",
  "token": "your_token",
  "command_id": "uuid",
  "status": "executed"
}`,
  },
  {
    method: 'GET',
    path: '/api/iot/data/{device_id}?token={token}',
    desc: 'Retrieve stored sensor data history',
    body: null as string | null,
  },
]

const widgetMapping = [
  { widget: 'Switch', config: 'Command: "led"', code: 'iot.onCommand("led", cb)' },
  { widget: 'Button', config: 'Command: "pump"', code: 'iot.onCommand("pump", cb)' },
  { widget: 'Slider', config: 'Command: "servo"', code: 'iot.onCommand("servo", cb)' },
  { widget: 'Color Picker', config: 'Command: "rgb"', code: 'iot.onCommand("rgb", cb)' },
  { widget: 'Value', config: 'Data: "temperature"', code: 'iot.sendData("temperature", val)' },
  { widget: 'Gauge', config: 'Data: "humidity"', code: 'iot.sendData("humidity", val)' },
  { widget: 'Chart', config: 'Data: "temperature"', code: 'iot.sendData("temperature", val)' },
  { widget: 'LED', config: 'Data: "motion"', code: 'iot.sendData("motion", true)' },
  { widget: 'Progress', config: 'Data: "soil_moisture"', code: 'iot.sendData("soil_moisture", val)' },
  { widget: 'Compass', config: 'Data: "bearing"', code: 'iot.sendData("bearing", azimuth)' },
  { widget: 'Thermometer', config: 'Data: "temperature"', code: 'iot.sendData("temperature", val)' },
  { widget: 'GPS Map', config: 'Data: "location"', code: 'iot.sendDataJson(json)' },
  { widget: 'Speedometer', config: 'Data: "speed"', code: 'iot.sendData("speed", kmph)' },
  { widget: 'Data Table', config: 'Data: any key', code: 'iot.sendData("key", val)' },
]
</script>
