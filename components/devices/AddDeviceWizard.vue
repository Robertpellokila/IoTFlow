<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
      <div class="card max-w-lg w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
        <!-- Step 1: Name -->
        <template v-if="step === 1">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <span class="text-primary-400 font-bold">1</span>
              </div>
              <h2 class="text-xl font-bold text-white">Name Your Device</h2>
            </div>
            <p class="text-sm text-slate-400 ml-13">Give your ESP32 device a descriptive name</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="label">Device Name</label>
              <input
                v-model="name"
                type="text"
                placeholder="Smart Garden 01"
                class="input"
                autofocus
                @keyup.enter="step = 2"
              />
              <p class="text-xs text-slate-500 mt-2">Example: Smart Garden, Fire Detector, Weather Station</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button class="btn-secondary" @click="$emit('close')">Cancel</button>
            <button class="btn-primary" :disabled="!name.trim()" @click="step = 2">
              Next
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </template>

        <!-- Step 2: Type -->
        <template v-if="step === 2">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <span class="text-primary-400 font-bold">2</span>
              </div>
              <h2 class="text-xl font-bold text-white">Select Device Type</h2>
            </div>
            <p class="text-sm text-slate-400 ml-13">Choose your hardware board</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="t in deviceTypes"
              :key="t.value"
              class="card p-4 text-left transition-all"
              :class="deviceType === t.value ? 'border-primary-500 bg-primary-500/5' : 'hover:border-border-light'"
              @click="deviceType = t.value"
            >
              <div class="flex items-center gap-2 mb-1">
                <component :is="t.icon" class="w-5 h-5" :class="deviceType === t.value ? 'text-primary-400' : 'text-slate-400'" />
                <span class="font-medium text-white text-sm">{{ t.label }}</span>
              </div>
              <p class="text-xs text-slate-500">{{ t.desc }}</p>
            </button>
          </div>

          <div class="flex justify-between gap-3 mt-6">
            <button class="btn-secondary" @click="step = 1">
              <ArrowLeft class="w-4 h-4" />
              Back
            </button>
            <button class="btn-primary" @click="handleCreate">
              <Loader2 v-if="creating" class="w-4 h-4 animate-spin" />
              <span>{{ creating ? 'Creating...' : 'Create Device' }}</span>
            </button>
          </div>
        </template>

        <!-- Step 3: Credentials -->
        <template v-if="step === 3 && createdDevice">
          <div class="text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 class="w-8 h-8 text-success" />
            </div>
            <h2 class="text-xl font-bold text-white">Device Created Successfully</h2>
            <p class="text-sm text-slate-400 mt-1">Use these credentials to connect your ESP32</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="label">Device ID</label>
              <div class="flex gap-2">
                <input :value="createdDevice.device_id" readonly class="input font-mono" />
                <button class="btn-secondary px-3" @click="copyToClipboard(createdDevice.device_id, 'Device ID')">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="label">Device Token</label>
              <div class="flex gap-2">
                <input :value="showToken ? createdDevice.device_token : '•'.repeat(32)" readonly class="input font-mono" />
                <button class="btn-secondary px-3" @click="showToken = !showToken">
                  <component :is="showToken ? EyeOff : Eye" class="w-4 h-4" />
                </button>
                <button class="btn-secondary px-3" @click="copyToClipboard(createdDevice.device_token, 'Token')">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-start gap-2 p-3 rounded-xl bg-warning/5 border border-warning/20">
              <ShieldAlert class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p class="text-xs text-slate-400">
                Keep your device token private. Anyone with this token can send data to your device.
              </p>
            </div>
          </div>

          <div class="flex justify-between gap-3 mt-6">
            <button class="btn-secondary" @click="viewSetupGuide = !viewSetupGuide">
              <BookOpen class="w-4 h-4" />
              Setup Guide
            </button>
            <button class="btn-primary" @click="$emit('close')">
              Done
            </button>
          </div>

          <!-- Setup guide -->
          <div v-if="viewSetupGuide" class="mt-4 p-4 rounded-xl bg-background-elevated border border-border space-y-3 animate-fade-in">
            <h4 class="text-sm font-semibold text-white">ESP32 Setup Code</h4>
            <pre class="text-xs font-mono text-slate-300 overflow-x-auto scrollbar-thin p-3 rounded-lg bg-background rounded-lg">{{ setupCode }}</pre>
            <button class="btn-secondary text-xs w-full" @click="copyToClipboard(setupCode, 'Setup code')">
              <Copy class="w-3 h-3" />
              Copy Code
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ArrowRight, ArrowLeft, Loader2, CheckCircle2, Copy, Eye, EyeOff,
  ShieldAlert, BookOpen, Cpu, CircuitBoard, Wifi, HelpCircle
} from 'lucide-vue-next'
import type { Device, DeviceType } from '~/types/database'

const emit = defineEmits<{ close: []; created: [device: Device] }>()

const { createDevice } = useDevices()
const toast = useToast()

const step = ref(1)
const name = ref('')
const deviceType = ref<DeviceType>('ESP32')
const creating = ref(false)
const createdDevice = ref<Device | null>(null)
const showToken = ref(false)
const viewSetupGuide = ref(false)

const deviceTypes = [
  { value: 'ESP32' as DeviceType, label: 'ESP32', desc: 'Standard ESP32 board', icon: Cpu },
  { value: 'ESP32-S3' as DeviceType, label: 'ESP32-S3', desc: 'ESP32-S3 variant', icon: CircuitBoard },
  { value: 'ESP8266' as DeviceType, label: 'ESP8266', desc: 'ESP8266 board', icon: Wifi },
  { value: 'Other' as DeviceType, label: 'Other', desc: 'Other IoT board', icon: HelpCircle },
]

const setupCode = computed(() => {
  const did = createdDevice.value?.device_id || 'ESP32-XXXXXX'
  const token = createdDevice.value?.device_token || 'your_token_here'
  return [
    '#include <WiFi.h>',
    '#include <HTTPClient.h>',
    '#include <ArduinoJson.h>',
    '',
    'const char* WIFI_SSID = "your_wifi";',
    'const char* WIFI_PASS = "your_password";',
    'const char* SERVER = "https://your-app.com";',
    `const char* DEVICE_ID = "${did}";`,
    `const char* DEVICE_TOKEN = "${token}";`,
    '',
    'void setup() {',
    '  Serial.begin(115200);',
    '  WiFi.begin(WIFI_SSID, WIFI_PASS);',
    '  while (WiFi.status() != WL_CONNECTED) { delay(500); }',
    '  Serial.println("WiFi connected!");',
    '  pinMode(2, OUTPUT); // Built-in LED',
    '}',
    '',
    '// Send sensor data to IoTFlow',
    'void sendData(const char* key, float value) {',
    '  HTTPClient http;',
    '  http.begin(String(SERVER) + "/api/iot/data");',
    '  http.addHeader("Content-Type", "application/json");',
    '  String body = "{\\"device_id\\":\\"" + String(DEVICE_ID) +',
    '    "\\",\\"token\\":\\"" + String(DEVICE_TOKEN) +',
    '    "\\",\\"data\\\":{\\"" + String(key) + "\\":" + String(value) + "}}";',
    '  http.POST(body);',
    '  http.end();',
    '}',
    '',
    '// Poll for commands from dashboard',
    'void pollCommands() {',
    '  HTTPClient http;',
    '  http.begin(String(SERVER) + "/api/iot/commands/" + String(DEVICE_ID) +',
    '    "?token=" + String(DEVICE_TOKEN));',
    '  int code = http.GET();',
    '  if (code == 200) {',
    '    String resp = http.getString();',
    '    StaticJsonDocument<1024> doc;',
    '    deserializeJson(doc, resp);',
    '    JsonArray cmds = doc["commands"];',
    '    for (JsonObject cmd : cmds) {',
    '      String name = cmd["command"].as<String>();',
    '      String id = cmd["id"].as<String>();',
    '      bool val = cmd["value"].as<bool>();',
    '      Serial.printf("Command: %s = %s\\n", name, val ? "ON" : "OFF");',
    '      if (name == "led") digitalWrite(2, val ? HIGH : LOW);',
    '      markExecuted(id);',
    '    }',
    '  }',
    '  http.end();',
    '}',
    '',
    'void markExecuted(String cmdId) {',
    '  HTTPClient http;',
    '  http.begin(String(SERVER) + "/api/iot/command-status");',
    '  http.addHeader("Content-Type", "application/json");',
    '  String body = "{\\"device_id\\":\\"" + String(DEVICE_ID) +',
    '    "\\",\\"token\\":\\"" + String(DEVICE_TOKEN) +',
    '    "\\",\\"command_id\\":\\"" + cmdId + "\\",\\"status\\":\\"executed\\"}";',
    '  http.POST(body);',
    '  http.end();',
    '}',
    '',
    'unsigned long lastSend = 0, lastPoll = 0;',
    '',
    'void loop() {',
    '  if (millis() - lastSend > 5000) {',
    '    lastSend = millis();',
    '    sendData("temperature", 28.5);',
    '    sendData("humidity", 73.0);',
    '  }',
    '  if (millis() - lastPoll > 2000) {',
    '    lastPoll = millis();',
    '    pollCommands();',
    '  }',
    '}',
  ].join('\n')
})

async function handleCreate() {
  creating.value = true
  try {
    const device = await createDevice(name.value.trim(), deviceType.value)
    createdDevice.value = device
    step.value = 3
    toast.success('Device created successfully')
    emit('created', device)
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to create device')
  } finally {
    creating.value = false
  }
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  } catch {
    toast.error('Failed to copy')
  }
}
</script>
