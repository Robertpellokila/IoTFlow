<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Templates</h1>
      <p class="text-slate-400 text-sm mt-1">Start from a pre-built IoT project template</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="card-hover p-5 group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="tpl.bg">
            {{ tpl.emoji }}
          </div>
          <span class="badge-neutral text-xs">{{ tpl.tag }}</span>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">{{ tpl.name }}</h3>
        <p class="text-sm text-slate-400 mb-4">{{ tpl.description }}</p>

        <div class="space-y-3 mb-4">
          <div>
            <div class="text-xs text-slate-500 mb-1.5">Sensors</div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="sensor in tpl.sensors" :key="sensor" class="badge-info text-xs">{{ sensor }}</span>
            </div>
          </div>
          <div v-if="tpl.controls.length > 0">
            <div class="text-xs text-slate-500 mb-1.5">Controls</div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="ctrl in tpl.controls" :key="ctrl" class="badge-warning text-xs">{{ ctrl }}</span>
            </div>
          </div>
          <div v-if="tpl.alerts && tpl.alerts.length > 0">
            <div class="text-xs text-slate-500 mb-1.5">Alerts</div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="alt in tpl.alerts" :key="alt" class="badge-error text-xs">{{ alt }}</span>
            </div>
          </div>
        </div>

        <button class="btn-primary w-full" @click="useTemplate(tpl)">
          <Wand2 class="w-4 h-4" />
          Use Template
        </button>
      </div>
    </div>

    <!-- Use template modal -->
    <Teleport to="body">
      <div v-if="selectedTemplate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedTemplate = null">
        <div class="card max-w-md w-full p-6 animate-slide-up">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="selectedTemplate.bg">
              {{ selectedTemplate.emoji }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">{{ selectedTemplate.name }}</h2>
              <p class="text-sm text-slate-400">Enter a name for your new device</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="label">Device Name</label>
              <input v-model="templateName" type="text" placeholder="My Smart Garden" class="input" autofocus />
            </div>
            <div class="p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
              <p class="text-xs text-slate-400">This will create:</p>
              <ul class="text-xs text-slate-300 mt-1 space-y-0.5">
                <li>- A new ESP32 device with credentials</li>
                <li>- A dashboard with pre-configured widgets</li>
                <li>- Alert rules (if applicable)</li>
              </ul>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn-secondary" @click="selectedTemplate = null">Cancel</button>
            <button class="btn-primary" :disabled="!templateName.trim() || creating" @click="createFromTemplate">
              <Loader2 v-if="creating" class="w-4 h-4 animate-spin" />
              <span>{{ creating ? 'Creating...' : 'Create Project' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Wand2, Loader2 } from 'lucide-vue-next'
import type { DeviceTemplate, WidgetType, WidgetConfig, WidgetSize } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { createDevice } = useDevices()
const supabase = useSupabase()
const toast = useToast()

const selectedTemplate = ref<DeviceTemplate | null>(null)
const templateName = ref('')
const creating = ref(false)

const templates: DeviceTemplate[] = [
  {
    id: 'smart-garden',
    name: 'Smart Garden',
    description: 'Monitor soil moisture and automate watering for your plants.',
    emoji: '🌱',
    bg: 'bg-success/10',
    tag: 'Popular',
    sensors: ['Temperature', 'Humidity', 'Soil Moisture'],
    controls: ['Water Pump'],
    widgets: [
      { type: 'value', title: 'Temperature', data_key: 'temperature', unit: '°C', config: {}, size: { w: 1, h: 1 } },
      { type: 'gauge', title: 'Humidity', data_key: 'humidity', unit: '%', config: { min: 0, max: 100 }, size: { w: 1, h: 1 } },
      { type: 'progress', title: 'Soil Moisture', data_key: 'soil_moisture', unit: '%', config: { min: 0, max: 100 }, size: { w: 1, h: 1 } },
      { type: 'switch', title: 'Water Pump', data_key: 'pump', unit: '', config: { command: 'pump' }, size: { w: 1, h: 1 } },
      { type: 'chart', title: 'Temperature History', data_key: 'temperature', unit: '°C', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
    ],
  },
  {
    id: 'smart-trash-bin',
    name: 'Smart Trash Bin',
    description: 'Track fill levels and optimize waste collection.',
    emoji: '🗑️',
    bg: 'bg-accent-500/10',
    tag: 'Smart City',
    sensors: ['Distance', 'Fill Level', 'Motion'],
    controls: [],
    widgets: [
      { type: 'progress', title: 'Fill Level', data_key: 'fill_level', unit: '%', config: { min: 0, max: 100 }, size: { w: 1, h: 1 } },
      { type: 'value', title: 'Distance', data_key: 'distance', unit: 'cm', config: {}, size: { w: 1, h: 1 } },
      { type: 'led', title: 'Motion', data_key: 'motion', unit: '', config: {}, size: { w: 1, h: 1 } },
      { type: 'chart', title: 'Fill Level History', data_key: 'fill_level', unit: '%', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
    ],
  },
  {
    id: 'fire-detector',
    name: 'Fire Detector',
    description: 'Early fire detection with multi-sensor alerts.',
    emoji: '🔥',
    bg: 'bg-error/10',
    tag: 'Safety',
    sensors: ['Temperature', 'Gas', 'Flame'],
    controls: [],
    alerts: ['Fire detected', 'High temperature', 'Gas detected'],
    widgets: [
      { type: 'value', title: 'Temperature', data_key: 'temperature', unit: '°C', config: {}, size: { w: 1, h: 1 } },
      { type: 'gauge', title: 'Gas Level', data_key: 'gas', unit: 'ppm', config: { min: 0, max: 1000 }, size: { w: 1, h: 1 } },
      { type: 'status', title: 'Flame', data_key: 'flame', unit: '', config: { max: 1, command: 'FIRE DETECTED' }, size: { w: 1, h: 1 } },
      { type: 'chart', title: 'Temperature History', data_key: 'temperature', unit: '°C', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
    ],
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    description: 'Control lights, fans, and monitor room conditions.',
    emoji: '🏠',
    bg: 'bg-primary-500/10',
    tag: 'Home',
    sensors: ['Temperature', 'Motion', 'Light'],
    controls: ['Lights', 'Fan'],
    widgets: [
      { type: 'value', title: 'Temperature', data_key: 'temperature', unit: '°C', config: {}, size: { w: 1, h: 1 } },
      { type: 'led', title: 'Motion', data_key: 'motion', unit: '', config: {}, size: { w: 1, h: 1 } },
      { type: 'switch', title: 'Lights', data_key: 'lights', unit: '', config: { command: 'lights' }, size: { w: 1, h: 1 } },
      { type: 'switch', title: 'Fan', data_key: 'fan', unit: '', config: { command: 'fan' }, size: { w: 1, h: 1 } },
      { type: 'chart', title: 'Temperature', data_key: 'temperature', unit: '°C', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
    ],
  },
  {
    id: 'animal-feeder',
    name: 'Animal Feeder',
    description: 'Automated feeding schedules and food level monitoring.',
    emoji: '🐾',
    bg: 'bg-warning/10',
    tag: 'Pet Care',
    sensors: ['Weight', 'Distance'],
    controls: ['Feeder'],
    widgets: [
      { type: 'value', title: 'Food Weight', data_key: 'weight', unit: 'g', config: {}, size: { w: 1, h: 1 } },
      { type: 'progress', title: 'Food Level', data_key: 'food_level', unit: '%', config: { min: 0, max: 100 }, size: { w: 1, h: 1 } },
      { type: 'button', title: 'Feed Now', data_key: '', unit: '', config: { command: 'feed' }, size: { w: 1, h: 1 } },
    ],
  },
  {
    id: 'weather-station',
    name: 'Weather Station',
    description: 'Track weather conditions in realtime.',
    emoji: '☁️',
    bg: 'bg-accent-500/10',
    tag: 'Environment',
    sensors: ['Temperature', 'Humidity', 'Pressure'],
    controls: [],
    widgets: [
      { type: 'value', title: 'Temperature', data_key: 'temperature', unit: '°C', config: {}, size: { w: 1, h: 1 } },
      { type: 'gauge', title: 'Humidity', data_key: 'humidity', unit: '%', config: { min: 0, max: 100 }, size: { w: 1, h: 1 } },
      { type: 'value', title: 'Pressure', data_key: 'pressure', unit: 'hPa', config: {}, size: { w: 1, h: 1 } },
      { type: 'chart', title: 'Temperature', data_key: 'temperature', unit: '°C', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
      { type: 'chart', title: 'Humidity', data_key: 'humidity', unit: '%', config: { historyPoints: 20 }, size: { w: 2, h: 2 } },
    ],
  },
]

function useTemplate(tpl: DeviceTemplate) {
  selectedTemplate.value = tpl
  templateName.value = tpl.name
}

async function createFromTemplate() {
  if (!selectedTemplate.value || !templateName.value.trim()) return
  creating.value = true
  try {
    const device = await createDevice(templateName.value.trim(), 'ESP32')

    const { data: dash, error: dashErr } = await supabase
      .from('dashboards')
      .insert({
        name: `${templateName.value} Dashboard`,
        description: selectedTemplate.value.description,
        device_id: device.id,
      })
      .select()
      .single()

    if (dashErr || !dash) throw new Error('Failed to create dashboard')

    let yPos = 0
    for (const w of selectedTemplate.value.widgets) {
      const widgetData = {
        dashboard_id: dash.id,
        type: w.type as WidgetType,
        title: w.title,
        data_key: w.data_key,
        unit: w.unit,
        config: w.config as WidgetConfig,
        size: w.size as WidgetSize,
        position: { x: 0, y: yPos },
      }
      await supabase.from('widgets').insert(widgetData)
      yPos += w.size.h
    }

    if (selectedTemplate.value.alerts) {
      for (const alertMsg of selectedTemplate.value.alerts) {
        const field = alertMsg.toLowerCase().includes('temperature') ? 'temperature' :
                      alertMsg.toLowerCase().includes('gas') ? 'gas' : 'flame'
        const threshold = field === 'temperature' ? 35 : field === 'gas' ? 500 : 1
        await supabase.from('alerts').insert({
          device_id: device.id,
          type: 'threshold_rule',
          message: alertMsg,
          status: 'active',
          rule_config: { field, operator: '>', threshold },
        })
      }
    }

    toast.success('Project created from template!')
    selectedTemplate.value = null
    navigateTo(`/dashboards/${dash.id}/edit`)
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to create from template')
  } finally {
    creating.value = false
  }
}
</script>
