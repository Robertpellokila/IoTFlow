<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">My Devices</h1>
        <p class="text-slate-400 text-sm mt-1">Manage your ESP32 devices</p>
      </div>
      <button class="btn-primary" @click="showAddWizard = true">
        <Plus class="w-4 h-4" />
        Add Device
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="h-40 rounded-2xl bg-background-elevated"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="devices.length === 0" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mx-auto mb-4">
        <Cpu class="w-8 h-8 text-slate-500" />
      </div>
      <h3 class="text-white font-semibold mb-1">No devices yet</h3>
      <p class="text-sm text-slate-400 mb-4">Create your first ESP32 device to get started</p>
      <button class="btn-primary inline-flex" @click="showAddWizard = true">
        <Plus class="w-4 h-4" />
        Add Device
      </button>
    </div>

    <!-- Device grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <DeviceCard
        v-for="device in devices"
        :key="device.id"
        :device="device"
        @deleted="handleDeleted"
      />
    </div>

    <!-- Add Device Wizard -->
    <AddDeviceWizard
      v-if="showAddWizard"
      @close="showAddWizard = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Cpu } from 'lucide-vue-next'
import type { Device } from '~/types/database'
import DeviceCard from '~/components/devices/DeviceCard.vue'
import AddDeviceWizard from '~/components/devices/AddDeviceWizard.vue'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { devices, loading, fetchDevices } = useDevices()
const { subscribeToDeviceStatus } = useRealtime()
const showAddWizard = ref(false)

function handleCreated() {
  showAddWizard.value = false
  fetchDevices()
}

function handleDeleted() {
  fetchDevices()
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
