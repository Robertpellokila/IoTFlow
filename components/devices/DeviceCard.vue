<template>
  <div class="card-hover p-5 group">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-background-elevated flex items-center justify-center">
          <Cpu class="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <NuxtLink :to="`/devices/${device.id}`" class="font-semibold text-white hover:text-primary-400 transition-colors">
            {{ device.name }}
          </NuxtLink>
          <div class="text-xs text-slate-500 font-mono">{{ device.device_id }}</div>
        </div>
      </div>
      <span :class="device.status === 'online' ? 'badge-success' : 'badge-neutral'" class="text-xs">
        <span :class="device.status === 'online' ? 'status-online' : 'status-offline'"></span>
        {{ device.status }}
      </span>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-500">Type</span>
        <span class="text-slate-300">{{ device.device_type }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-500">Last seen</span>
        <span class="text-slate-300">{{ formatLastSeen(device.last_seen) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <NuxtLink :to="`/devices/${device.id}`" class="btn-secondary flex-1 text-sm justify-center">
        <LayoutGrid class="w-4 h-4" />
        Open
      </NuxtLink>
      <button class="btn-ghost p-2.5" @click="showDeleteConfirm = true">
        <Trash2 class="w-4 h-4 text-error" />
      </button>
    </div>

    <!-- Delete confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showDeleteConfirm = false">
        <div class="card p-6 max-w-sm w-full animate-slide-up">
          <div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle class="w-6 h-6 text-error" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Delete device?</h3>
          <p class="text-sm text-slate-400 mb-6">
            This will permanently delete "{{ device.name }}" and all associated data. This cannot be undone.
          </p>
          <div class="flex gap-3">
            <button class="btn-secondary flex-1" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn-danger flex-1" :disabled="deleting" @click="handleDelete">
              <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
              <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Cpu, LayoutGrid, Trash2, AlertTriangle, Loader2 } from 'lucide-vue-next'
import type { Device } from '~/types/database'

const props = defineProps<{ device: Device }>()
const emit = defineEmits<{ deleted: [] }>()

const { deleteDevice } = useDevices()
const toast = useToast()

const showDeleteConfirm = ref(false)
const deleting = ref(false)

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never'
  const diff = Date.now() - new Date(lastSeen).getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteDevice(props.device.id)
    toast.success('Device deleted')
    showDeleteConfirm.value = false
    emit('deleted')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete device')
  } finally {
    deleting.value = false
  }
}
</script>
