<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Sensor Data</h1>
      <p class="text-slate-400 text-sm mt-1">View and analyze historical sensor readings</p>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="label">Device</label>
          <select v-model="selectedDevice" class="input" @change="loadSensorKeys">
            <option value="" disabled>Select device</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">Sensor Field</label>
          <select v-model="selectedKey" class="input" :disabled="!selectedDevice">
            <option value="" disabled>Select field</option>
            <option v-for="key in sensorKeys" :key="key" :value="key">{{ key }}</option>
          </select>
        </div>
        <div>
          <label class="label">Time Range</label>
          <select v-model="timeRange" class="input">
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="chartData.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="text-xs text-slate-500 mb-1">Minimum</div>
        <div class="text-xl font-bold text-white">{{ stats.min }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-slate-500 mb-1">Maximum</div>
        <div class="text-xl font-bold text-white">{{ stats.max }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-slate-500 mb-1">Average</div>
        <div class="text-xl font-bold text-white">{{ stats.avg }}</div>
      </div>
      <div class="card p-4">
        <div class="text-xs text-slate-500 mb-1">Latest</div>
        <div class="text-xl font-bold text-primary-400">{{ stats.latest }}</div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="loading" class="card p-12 flex items-center justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-500" />
    </div>

    <div v-else-if="chartData.length > 0" class="card p-5">
      <h3 class="text-sm font-semibold text-white mb-4">{{ selectedKey }} over time</h3>
      <div class="h-64">
        <canvas ref="canvasEl"></canvas>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!selectedDevice" class="card p-12 text-center">
      <Database class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 class="text-white font-semibold mb-1">Select a device</h3>
      <p class="text-sm text-slate-400">Choose a device and sensor field to view data</p>
    </div>

    <div v-else class="card p-12 text-center">
      <BarChart3 class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 class="text-white font-semibold mb-1">No data available</h3>
      <p class="text-sm text-slate-400">No sensor data found for the selected criteria</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, Database, BarChart3 } from 'lucide-vue-next'
import { Chart, LineController, PointElement, LineElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'
import type { Device, SensorData } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { devices, fetchDevices } = useDevices()
const supabase = useSupabase()

const selectedDevice = ref('')
const selectedKey = ref('')
const timeRange = ref('24h')
const sensorKeys = ref<string[]>([])
const chartData = ref<{ time: number; value: number }[]>([])
const loading = ref(false)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

Chart.register(LineController, PointElement, LineElement, LinearScale, CategoryScale, Filler, Tooltip)

const stats = computed(() => {
  if (chartData.value.length === 0) return { min: '--', max: '--', avg: '--', latest: '--' }
  const values = chartData.value.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const latest = values[values.length - 1]
  const fmt = (n: number) => n.toFixed(n % 1 === 0 ? 0 : 1)
  return { min: fmt(min), max: fmt(max), avg: fmt(avg), latest: fmt(latest) }
})

async function loadSensorKeys() {
  if (!selectedDevice.value) return
  const { data } = await supabase
    .from('sensor_data')
    .select('data')
    .eq('device_id', selectedDevice.value)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (data) {
    const d = data.data as Record<string, unknown>
    sensorKeys.value = Object.keys(d || {})
  }
  selectedKey.value = ''
  await loadData()
}

async function loadData() {
  if (!selectedDevice.value || !selectedKey.value) {
    chartData.value = []
    return
  }

  loading.value = true
  const now = new Date()
  let since = new Date()
  switch (timeRange.value) {
    case '1h': since = new Date(now.getTime() - 3600000); break
    case '24h': since = new Date(now.getTime() - 86400000); break
    case '7d': since = new Date(now.getTime() - 7 * 86400000); break
    case '30d': since = new Date(now.getTime() - 30 * 86400000); break
  }

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', selectedDevice.value)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(1000)

  if (error) {
    chartData.value = []
  } else {
    chartData.value = ((data || []) as SensorData[])
      .filter((d) => d.data && selectedKey.value in d.data)
      .map((d) => ({
        time: new Date(d.created_at).getTime(),
        value: Number(d.data[selectedKey.value]),
      }))
  }
  loading.value = false
  nextTick(() => buildChart())
}

function buildChart() {
  if (!canvasEl.value || chartData.value.length === 0) return
  if (chart) chart.destroy()

  const labels = chartData.value.map((d) => {
    const dt = new Date(d.time)
    return dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0')
  })
  const data = chartData.value.map((d) => d.value)

  chart = new Chart(canvasEl.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 1,
        pointHoverRadius: 4,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          borderColor: '#1e293b',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#fff',
          padding: 8,
          displayColors: false,
        },
      },
      scales: {
        x: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#475569', font: { size: 10 }, maxTicksLimit: 8 } },
        y: { grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#475569', font: { size: 10 } } },
      },
    },
  })
}

watch([selectedKey, timeRange], () => loadData())

onMounted(() => {
  fetchDevices()
})
</script>
