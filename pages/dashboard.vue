<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Overview</h1>
      <p class="text-slate-400 text-sm mt-1">Welcome back, {{ displayName }}</p>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card p-5 hover:border-border-light transition-all">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.iconBg">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
          </div>
          <span v-if="stat.badge" class="badge text-xs" :class="stat.badgeClass">
            {{ stat.badge }}
          </span>
        </div>
        <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
        <div class="text-sm text-slate-400 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Recent Devices -->
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Recent Devices</h2>
        <NuxtLink to="/devices" class="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
          View all
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div v-if="devicesLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-32 rounded-xl bg-background-elevated"></div>
        </div>
      </div>

      <div v-else-if="devices.length === 0" class="text-center py-12">
        <div class="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mx-auto mb-4">
          <Cpu class="w-8 h-8 text-slate-500" />
        </div>
        <h3 class="text-white font-semibold mb-1">No devices yet</h3>
        <p class="text-sm text-slate-400 mb-4">Create your first device to get started</p>
        <NuxtLink to="/devices" class="btn-primary inline-flex">
          <Plus class="w-4 h-4" />
          Add Device
        </NuxtLink>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="device in devices.slice(0, 6)"
          :key="device.id"
          :to="`/devices/${device.id}`"
          class="card-hover p-4 group"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-background-elevated flex items-center justify-center">
                <Cpu class="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div class="font-medium text-white text-sm group-hover:text-primary-400 transition-colors">{{ device.name }}</div>
                <div class="text-xs text-slate-500 font-mono">{{ device.device_id }}</div>
              </div>
            </div>
            <span :class="device.status === 'online' ? 'badge-success' : 'badge-neutral'" class="text-xs">
              <span :class="device.status === 'online' ? 'status-online' : 'status-offline'"></span>
              {{ device.status }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span>{{ device.device_type }}</span>
            <span>{{ formatLastSeen(device.last_seen) }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-3 gap-4">
      <NuxtLink to="/devices" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <Plus class="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <div class="font-semibold text-white">Add Device</div>
          <div class="text-sm text-slate-400">Connect a new ESP32</div>
        </div>
      </NuxtLink>
      <NuxtLink to="/dashboards" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
          <LayoutGrid class="w-6 h-6 text-accent-400" />
        </div>
        <div>
          <div class="font-semibold text-white">Create Dashboard</div>
          <div class="text-sm text-slate-400">Build a new dashboard</div>
        </div>
      </NuxtLink>
      <NuxtLink to="/templates" class="card-hover p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
          <FileStack class="w-6 h-6 text-warning" />
        </div>
        <div>
          <div class="font-semibold text-white">Browse Templates</div>
          <div class="text-sm text-slate-400">Start from a template</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Plus, ArrowRight, LayoutGrid, FileStack, Activity, Wifi, WifiOff, Database } from 'lucide-vue-next'
import type { Device } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { profile, user } = useAuth()
const { devices, loading: devicesLoading, fetchDevices } = useDevices()
const { subscribeToDeviceStatus } = useRealtime()

const displayName = computed(() => profile.value?.full_name || user.value?.email?.split('@')[0] || 'User')

const stats = computed(() => {
  const total = devices.value.length
  const online = devices.value.filter((d: Device) => d.status === 'online').length
  const offline = total - online
  return [
    { label: 'Total Devices', value: total, icon: Cpu, iconBg: 'bg-primary-500/10', iconColor: 'text-primary-400', badge: online > 0 ? 'Active' : null, badgeClass: 'badge-success' },
    { label: 'Online', value: online, icon: Wifi, iconBg: 'bg-success/10', iconColor: 'text-success' },
    { label: 'Offline', value: offline, icon: WifiOff, iconBg: 'bg-slate-700/40', iconColor: 'text-slate-400' },
    { label: 'Data Points', value: formatNumber(124582), icon: Database, iconBg: 'bg-accent-500/10', iconColor: 'text-accent-400', badge: '+2.4K', badgeClass: 'badge-info' },
  ]
})

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never'
  const diff = Date.now() - new Date(lastSeen).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

let unsubDeviceStatus: (() => void) | null = null

onMounted(() => {
  fetchDevices()
  unsubDeviceStatus = subscribeToDeviceStatus(() => {
    fetchDevices()
  })
})

onUnmounted(() => {
  if (unsubDeviceStatus) unsubDeviceStatus()
})
</script>
