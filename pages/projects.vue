<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">My Projects</h1>
      <p class="text-slate-400 text-sm mt-1">Track your IoT project progress</p>
    </div>

    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-40 rounded-2xl bg-background-elevated"></div>
      </div>
    </div>

    <div v-else-if="devices.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mx-auto mb-4">
        <FolderKanban class="w-8 h-8 text-slate-500" />
      </div>
      <h3 class="text-white font-semibold mb-1">No projects yet</h3>
      <p class="text-sm text-slate-400 mb-4">Create a device or use a template to start</p>
      <div class="flex justify-center gap-3">
        <NuxtLink to="/devices" class="btn-primary">
          <Plus class="w-4 h-4" />
          Add Device
        </NuxtLink>
        <NuxtLink to="/templates" class="btn-secondary">Browse Templates</NuxtLink>
      </div>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in projectList"
        :key="project.device.id"
        :to="`/devices/${project.device.id}`"
        class="card-hover p-5 group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="project.bg">
            {{ project.emoji }}
          </div>
          <span :class="project.device.status === 'online' ? 'badge-success' : 'badge-neutral'" class="text-xs">
            <span :class="project.device.status === 'online' ? 'status-online' : 'status-offline'"></span>
            {{ project.device.status }}
          </span>
        </div>
        <h3 class="font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">{{ project.device.name }}</h3>
        <div class="text-xs text-slate-500 font-mono mb-4">{{ project.device.device_id }}</div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">Progress</span>
            <span class="text-slate-300">{{ project.progress }}%</span>
          </div>
          <div class="h-1.5 rounded-full bg-background-elevated overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="project.progress >= 80 ? 'bg-success' : project.progress >= 50 ? 'bg-primary-500' : 'bg-warning'" :style="{ width: `${project.progress}%` }"></div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>{{ project.sensorCount }} sensors</span>
          <span>{{ project.dashboardCount }} dashboard{{ project.dashboardCount !== 1 ? 's' : '' }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderKanban, Plus } from 'lucide-vue-next'
import type { Device } from '~/types/database'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { devices, loading, fetchDevices } = useDevices()
const supabase = useSupabase()

interface ProjectInfo {
  device: Device
  emoji: string
  bg: string
  progress: number
  sensorCount: number
  dashboardCount: number
}

const projectList = ref<ProjectInfo[]>([])

function getProjectVisual(name: string): { emoji: string; bg: string } {
  const lower = name.toLowerCase()
  if (lower.includes('garden') || lower.includes('plant')) return { emoji: '🌱', bg: 'bg-success/10' }
  if (lower.includes('trash') || lower.includes('bin')) return { emoji: '🗑️', bg: 'bg-accent-500/10' }
  if (lower.includes('fire')) return { emoji: '🔥', bg: 'bg-error/10' }
  if (lower.includes('home')) return { emoji: '🏠', bg: 'bg-primary-500/10' }
  if (lower.includes('feed') || lower.includes('animal')) return { emoji: '🐾', bg: 'bg-warning/10' }
  if (lower.includes('weather')) return { emoji: '☁️', bg: 'bg-accent-500/10' }
  if (lower.includes('parking')) return { emoji: '🚗', bg: 'bg-primary-500/10' }
  return { emoji: '📦', bg: 'bg-slate-700/40' }
}

async function loadProjects() {
  const projects: ProjectInfo[] = []

  for (const device of devices.value) {
    const { data: sensorData } = await supabase
      .from('sensor_data')
      .select('data')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sensorCount = sensorData?.data ? Object.keys(sensorData.data).length : 0

    const { count } = await supabase
      .from('dashboards')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', device.id)

    let progress = 20
    if (device.status === 'online') progress += 20
    if (sensorCount > 0) progress += 30
    if ((count || 0) > 0) progress += 30

    const visual = getProjectVisual(device.name)
    projects.push({
      device,
      emoji: visual.emoji,
      bg: visual.bg,
      progress,
      sensorCount,
      dashboardCount: count || 0,
    })
  }

  projectList.value = projects
}

onMounted(async () => {
  await fetchDevices()
  await loadProjects()
})
</script>
