<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-slate-500" />
    </div>

    <template v-else-if="device">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-background-elevated flex items-center justify-center">
            <Cpu class="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-white">{{ device.name }}</h1>
              <span :class="device.status === 'online' ? 'badge-success' : 'badge-neutral'">
                <span :class="device.status === 'online' ? 'status-online' : 'status-offline'"></span>
                {{ device.status }}
              </span>
            </div>
            <div class="text-sm text-slate-500 font-mono mt-0.5">{{ device.device_id }}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/dashboards?device=${device.id}`" class="btn-secondary">
            <LayoutGrid class="w-4 h-4" />
            Dashboard
          </NuxtLink>
          <button class="btn-secondary" @click="showToken = !showToken">
            <Key class="w-4 h-4" />
            {{ showToken ? 'Hide' : 'Show' }} Token
          </button>
        </div>
      </div>

      <!-- Token display -->
      <div v-if="showToken" class="card p-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-slate-500 mb-1">Device Token</div>
            <div class="font-mono text-sm text-slate-300">{{ device.device_token }}</div>
          </div>
          <button class="btn-secondary" @click="copyToken">
            <Copy class="w-4 h-4" />
            Copy
          </button>
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="text-xs text-slate-500 mb-1">Device Type</div>
          <div class="text-sm font-medium text-white">{{ device.device_type }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-slate-500 mb-1">Last Seen</div>
          <div class="text-sm font-medium text-white">{{ formatLastSeen(device.last_seen) }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-slate-500 mb-1">Firmware</div>
          <div class="text-sm font-medium text-white">{{ device.firmware_version || 'Unknown' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-slate-500 mb-1">IP Address</div>
          <div class="text-sm font-medium text-white font-mono">{{ device.ip_address || 'N/A' }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card overflow-hidden">
        <div class="flex items-center gap-1 border-b border-border px-2 overflow-x-auto scrollbar-thin">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2"
            :class="activeTab === tab.id ? 'text-primary-400 border-primary-500' : 'text-slate-400 border-transparent hover:text-slate-200'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="p-5">
          <!-- Overview tab -->
          <div v-if="activeTab === 'overview'" class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="card p-4">
                <div class="text-sm text-slate-500 mb-3">Device Information</div>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Name</span>
                    <span class="text-white">{{ device.name }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">ID</span>
                    <span class="text-white font-mono">{{ device.device_id }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Type</span>
                    <span class="text-white">{{ device.device_type }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Created</span>
                    <span class="text-white">{{ new Date(device.created_at).toLocaleDateString() }}</span>
                  </div>
                </div>
              </div>
              <div class="card p-4">
                <div class="text-sm text-slate-500 mb-3">Connection Status</div>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Status</span>
                    <span :class="device.status === 'online' ? 'text-success' : 'text-slate-400'">{{ device.status }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Last seen</span>
                    <span class="text-white">{{ formatLastSeen(device.last_seen) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Uptime</span>
                    <span class="text-white">{{ device.uptime || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Battery</span>
                    <span class="text-white">{{ device.battery || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sensors tab -->
          <div v-if="activeTab === 'sensors'">
            <div v-if="latestData" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(value, key) in latestData.data" :key="key" class="card p-4">
                <div class="text-xs text-slate-500 mb-1">{{ key }}</div>
                <div class="text-2xl font-bold text-white">{{ value }}</div>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <Activity class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 class="text-white font-semibold mb-1">No sensor data yet</h3>
              <p class="text-sm text-slate-400">Connect your ESP32 and start sending data</p>
            </div>
          </div>

          <!-- Commands tab -->
          <div v-if="activeTab === 'commands'" class="space-y-4">
            <div class="flex gap-2">
              <input v-model="commandName" placeholder="Command name (e.g. pump)" class="input flex-1" />
              <input v-model="commandValue" placeholder="Value (e.g. true)" class="input flex-1" />
              <button class="btn-primary" @click="sendCommand">Send</button>
            </div>
            <div v-if="commands.length === 0" class="text-center py-12">
              <Send class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 class="text-white font-semibold mb-1">No commands sent</h3>
              <p class="text-sm text-slate-400">Send a command to control your ESP32</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="cmd in commands" :key="cmd.id" class="card p-3 flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-white">{{ cmd.command }}: {{ cmd.value }}</div>
                  <div class="text-xs text-slate-500">{{ new Date(cmd.created_at).toLocaleString() }}</div>
                </div>
                <span :class="commandStatusClass(cmd.status)" class="text-xs">
                  {{ cmd.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- History tab -->
          <div v-if="activeTab === 'history'">
            <div v-if="history.length === 0" class="text-center py-12">
              <History class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 class="text-white font-semibold mb-1">No history yet</h3>
              <p class="text-sm text-slate-400">Sensor data history will appear here</p>
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              <div v-for="entry in history" :key="entry.id" class="card p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs text-slate-500">{{ new Date(entry.created_at).toLocaleString() }}</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(value, key) in entry.data" :key="key" class="badge-neutral text-xs">
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings tab -->
          <div v-if="activeTab === 'settings'" class="space-y-4 max-w-md">
            <div>
              <label class="label">Device Name</label>
              <input v-model="editName" type="text" class="input" />
            </div>
            <button class="btn-primary" @click="saveSettings">Save Changes</button>

            <div class="pt-4 border-t border-border">
              <button class="btn-danger" @click="showDelete = true">
                <Trash2 class="w-4 h-4" />
                Delete Device
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="text-center py-20">
      <Cpu class="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h2 class="text-xl font-bold text-white mb-2">Device not found</h2>
      <NuxtLink to="/devices" class="text-primary-400 hover:text-primary-300">Back to devices</NuxtLink>
    </div>

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showDelete = false">
        <div class="card p-6 max-w-sm w-full animate-slide-up">
          <div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle class="w-6 h-6 text-error" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Delete this device?</h3>
          <p class="text-sm text-slate-400 mb-6">All data associated with this device will be permanently deleted.</p>
          <div class="flex gap-3">
            <button class="btn-secondary flex-1" @click="showDelete = false">Cancel</button>
            <button class="btn-danger flex-1" @click="handleDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  Cpu, LayoutGrid, Key, Copy, Loader2, Activity, Send, History, Trash2, AlertTriangle
} from 'lucide-vue-next'
import type { Device, SensorData, Command, CommandStatus } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const route = useRoute()
const { fetchDevice, deleteDevice, updateDevice } = useDevices()
const supabase = useSupabase()
const toast = useToast()
const { subscribeToSensorData } = useRealtime()

const device = ref<Device | null>(null)
const loading = ref(true)
const showToken = ref(false)
const showDelete = ref(false)
const activeTab = ref('overview')
const latestData = ref<SensorData | null>(null)
const history = ref<SensorData[]>([])
const commands = ref<Command[]>([])
const commandName = ref('')
const commandValue = ref('')
const editName = ref('')

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'commands', label: 'Commands' },
  { id: 'history', label: 'History' },
  { id: 'settings', label: 'Settings' },
]

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never'
  const diff = Date.now() - new Date(lastSeen).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function commandStatusClass(status: CommandStatus): string {
  if (status === 'executed') return 'badge-success'
  if (status === 'pending') return 'badge-warning'
  return 'badge-error'
}

async function loadDevice() {
  loading.value = true
  try {
    device.value = await fetchDevice(route.params.id as string)
    if (device.value) {
      editName.value = device.value.name
      await loadSensorData()
      await loadCommands()
    }
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to load device')
  } finally {
    loading.value = false
  }
}

async function loadSensorData() {
  if (!device.value) return
  const { data: latest } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', device.value.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  latestData.value = latest as SensorData | null

  const { data: hist } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', device.value.id)
    .order('created_at', { ascending: false })
    .limit(50)
  history.value = (hist || []) as SensorData[]
}

async function loadCommands() {
  if (!device.value) return
  const { data } = await supabase
    .from('commands')
    .select('*')
    .eq('device_id', device.value.id)
    .order('created_at', { ascending: false })
    .limit(20)
  commands.value = (data || []) as Command[]
}

async function sendCommand() {
  if (!device.value || !commandName.value.trim()) return
  try {
    let parsedValue: string | number | boolean = commandValue.value
    if (commandValue.value === 'true') parsedValue = true
    else if (commandValue.value === 'false') parsedValue = false
    else if (!isNaN(Number(commandValue.value))) parsedValue = Number(commandValue.value)

    const { error } = await supabase.from('commands').insert({
      device_id: device.value.id,
      command: commandName.value.trim(),
      value: parsedValue,
      status: 'pending',
    })
    if (error) throw error
    toast.success('Command sent')
    commandName.value = ''
    commandValue.value = ''
    await loadCommands()
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to send command')
  }
}

async function saveSettings() {
  if (!device.value) return
  try {
    await updateDevice(device.value.id, { name: editName.value })
    device.value.name = editName.value
    toast.success('Settings saved')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to save settings')
  }
}

async function handleDelete() {
  if (!device.value) return
  try {
    await deleteDevice(device.value.id)
    toast.success('Device deleted')
    navigateTo('/devices')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete device')
  }
}

async function copyToken() {
  if (!device.value) return
  try {
    await navigator.clipboard.writeText(device.value.device_token)
    toast.success('Token copied')
  } catch {
    toast.error('Failed to copy')
  }
}

let unsubSensorData: (() => void) | null = null

onMounted(async () => {
  await loadDevice()
  if (device.value) {
    unsubSensorData = subscribeToSensorData(device.value.id, () => {
      loadSensorData()
    })
  }
})

onUnmounted(() => {
  if (unsubSensorData) unsubSensorData()
})
</script>
