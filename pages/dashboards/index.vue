<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboards</h1>
        <p class="text-slate-400 text-sm mt-1">Visualize and control your devices</p>
      </div>
      <button class="btn-primary" @click="showCreate = true">
        <Plus class="w-4 h-4" />
        Create Dashboard
      </button>
    </div>

    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-32 rounded-2xl bg-background-elevated"></div>
      </div>
    </div>

    <div v-else-if="dashboards.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mx-auto mb-4">
        <LayoutGrid class="w-8 h-8 text-slate-500" />
      </div>
      <h3 class="text-white font-semibold mb-1">No dashboards yet</h3>
      <p class="text-sm text-slate-400 mb-4">Create a dashboard to visualize your sensor data</p>
      <button class="btn-primary inline-flex" @click="showCreate = true">
        <Plus class="w-4 h-4" />
        Create Dashboard
      </button>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="dash in dashboards"
        :key="dash.id"
        :to="`/dashboards/${dash.id}/edit`"
        class="card-hover p-5 group"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <LayoutGrid class="w-5 h-5 text-primary-400" />
          </div>
          <ArrowRight class="w-4 h-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
        </div>
        <div class="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">{{ dash.name }}</div>
        <div class="text-sm text-slate-400">{{ dash.description || 'No description' }}</div>
        <div class="text-xs text-slate-500 mt-3">{{ getDeviceName(dash.device_id) }}</div>
      </NuxtLink>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showCreate = false">
        <div class="card max-w-md w-full p-6 animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-4">Create Dashboard</h2>
          <div class="space-y-4">
            <div>
              <label class="label">Dashboard Name</label>
              <input v-model="newName" type="text" placeholder="Smart Garden Dashboard" class="input" autofocus />
            </div>
            <div>
              <label class="label">Description (optional)</label>
              <input v-model="newDesc" type="text" placeholder="Monitor and control the garden" class="input" />
            </div>
            <div>
              <label class="label">Device</label>
              <select v-model="newDeviceId" class="input">
                <option value="" disabled>Select a device</option>
                <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn-secondary" @click="showCreate = false">Cancel</button>
            <button class="btn-primary" :disabled="!newName.trim() || !newDeviceId || creating" @click="handleCreate">
              <Loader2 v-if="creating" class="w-4 h-4 animate-spin" />
              <span>{{ creating ? 'Creating...' : 'Create' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, LayoutGrid, ArrowRight, Loader2 } from 'lucide-vue-next'
import type { Dashboard, Device } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const route = useRoute()
const supabase = useSupabase()
const { devices, fetchDevices } = useDevices()
const toast = useToast()

const dashboards = ref<Dashboard[]>([])
const loading = ref(true)
const showCreate = ref(false)
const newName = ref('')
const newDesc = ref('')
const newDeviceId = ref('')
const creating = ref(false)

function getDeviceName(deviceId: string): string {
  const d = devices.value.find((dev: Device) => dev.id === deviceId)
  return d?.name || 'Unknown device'
}

async function fetchDashboards() {
  loading.value = true
  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    toast.error('Failed to load dashboards')
  } else {
    dashboards.value = (data || []) as Dashboard[]
  }
  loading.value = false
}

async function handleCreate() {
  creating.value = true
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .insert({
        name: newName.value.trim(),
        description: newDesc.value.trim() || null,
        device_id: newDeviceId.value,
      })
      .select()
      .single()
    if (error) throw error
    toast.success('Dashboard created')
    showCreate.value = false
    newName.value = ''
    newDesc.value = ''
    newDeviceId.value = ''
    await fetchDashboards()
    navigateTo(`/dashboards/${data.id}/edit`)
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to create dashboard')
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  fetchDevices()
  fetchDashboards()
  if (route.query.device) {
    newDeviceId.value = route.query.device as string
    showCreate.value = true
  }
})
</script>
