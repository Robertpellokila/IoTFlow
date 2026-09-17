<template>
  <div class="card p-2 shadow-2xl border-border-light">
    <div class="rounded-xl overflow-hidden bg-background">
      <!-- Mock topbar -->
      <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div class="flex gap-1.5">
          <div class="w-3 h-3 rounded-full bg-error/60"></div>
          <div class="w-3 h-3 rounded-full bg-warning/60"></div>
          <div class="w-3 h-3 rounded-full bg-success/60"></div>
        </div>
        <div class="flex-1 flex justify-center">
          <div class="px-4 py-1 rounded-lg bg-background-elevated text-xs text-slate-500">iotflow.app/dashboard</div>
        </div>
      </div>

      <!-- Mock content -->
      <div class="flex">
        <!-- Sidebar -->
        <div class="hidden md:flex flex-col w-48 p-3 border-r border-border gap-1">
          <div v-for="item in sidebarItems" :key="item" class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            :class="item === 'Overview' ? 'bg-primary-500/10 text-primary-400' : 'text-slate-500'"
          >
            <div class="w-1.5 h-1.5 rounded-full" :class="item === 'Overview' ? 'bg-primary-400' : 'bg-slate-600'"></div>
            {{ item }}
          </div>
        </div>

        <!-- Main -->
        <div class="flex-1 p-4 space-y-3">
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div v-for="stat in mockStats" :key="stat.label" class="card p-3">
              <div class="text-xs text-slate-500 mb-1">{{ stat.label }}</div>
              <div class="text-lg font-bold text-white">{{ stat.value }}</div>
              <div class="text-xs" :class="stat.color">{{ stat.sub }}</div>
            </div>
          </div>

          <!-- Widget grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div class="card p-4">
              <div class="text-xs text-slate-500 mb-1">Temperature</div>
              <div class="text-2xl font-bold text-white">28.5<span class="text-sm text-slate-400 ml-1">°C</span></div>
              <div class="mt-2 h-1 rounded-full bg-background-elevated overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full" style="width: 57%"></div>
              </div>
            </div>
            <div class="card p-4">
              <div class="text-xs text-slate-500 mb-1">Humidity</div>
              <div class="text-2xl font-bold text-white">73<span class="text-sm text-slate-400 ml-1">%</span></div>
              <div class="mt-2 flex items-end gap-0.5 h-6">
                <div v-for="i in 10" :key="i" class="flex-1 rounded-sm"
                  :class="i <= 7 ? 'bg-accent-500' : 'bg-slate-700'"
                  :style="{ height: `${30 + i * 6}%` }"
                ></div>
              </div>
            </div>
            <div class="card p-4">
              <div class="text-xs text-slate-500 mb-1">Water Pump</div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-sm font-semibold text-success">ON</span>
                <div class="w-9 h-5 rounded-full bg-success/30 relative">
                  <div class="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-success"></div>
                </div>
              </div>
            </div>
            <div class="card p-4 col-span-2">
              <div class="text-xs text-slate-500 mb-2">Temperature History</div>
              <div class="flex items-end gap-1 h-12">
                <div v-for="(h, i) in chartBars" :key="i" class="flex-1 rounded-t-sm bg-primary-500/60 hover:bg-primary-500 transition-colors"
                  :style="{ height: `${h}%` }"
                ></div>
              </div>
            </div>
            <div class="card p-4">
              <div class="text-xs text-slate-500 mb-1">Soil Moisture</div>
              <div class="text-2xl font-bold text-white">42<span class="text-sm text-slate-400 ml-1">%</span></div>
              <div class="mt-2 h-1.5 rounded-full bg-background-elevated overflow-hidden">
                <div class="h-full bg-warning rounded-full" style="width: 42%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarItems = ['Overview', 'My Devices', 'Dashboards', 'Templates', 'Data', 'Alerts', 'Settings']

const mockStats = [
  { label: 'Devices', value: '12', sub: '8 online', color: 'text-success' },
  { label: 'Online', value: '8', sub: '66% active', color: 'text-success' },
  { label: 'Offline', value: '4', sub: 'needs attention', color: 'text-slate-500' },
  { label: 'Data Points', value: '124K', sub: '+2.4K today', color: 'text-accent-400' },
]

const chartBars = [40, 55, 48, 62, 70, 58, 65, 72, 68, 75, 60, 55, 68, 72, 65, 58, 62, 70, 75, 68]
</script>
