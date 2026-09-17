<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <!-- Empty state -->
    <div v-if="rows.length === 0" class="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <span class="text-xs">Belum ada data riwayat</span>
    </div>

    <!-- Table -->
    <div v-else class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center text-xs text-slate-500 font-medium border-b border-slate-700/60 pb-1.5 mb-1 shrink-0">
        <div class="flex-1">Waktu</div>
        <div class="w-24 text-right">
          Nilai<span v-if="widget.unit" class="text-slate-600 ml-1">({{ widget.unit }})</span>
        </div>
      </div>

      <!-- Rows -->
      <div class="flex-1 overflow-y-auto space-y-px scrollbar-thin">
        <div
          v-for="(row, idx) in rows"
          :key="row.time"
          class="flex items-center text-xs py-1 px-0.5 rounded-md transition-colors"
          :class="idx % 2 === 0 ? 'bg-slate-800/30' : ''"
        >
          <div class="flex-1 text-slate-400 font-mono tabular-nums">{{ row.timeStr }}</div>
          <div class="w-24 text-right font-semibold tabular-nums" :class="valueColorClass(row.value)">
            {{ row.displayVal }}
          </div>
        </div>
      </div>

      <!-- Footer count -->
      <div class="text-right text-xs text-slate-600 mt-1.5 shrink-0">
        {{ rows.length }} data terakhir
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '~/types/database'

const props = defineProps<{
  widget: Widget
  value: unknown
  history: { time: number; value: unknown }[]
}>()

const MAX_ROWS = 10

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '--'
  if (typeof val === 'boolean') return val ? 'ON' : 'OFF'
  if (typeof val === 'number') return val.toFixed(val % 1 === 0 ? 0 : 2)
  return String(val)
}

interface Row {
  time: number
  timeStr: string
  value: unknown
  displayVal: string
}

const rows = computed<Row[]>(() => {
  return [...props.history]
    .sort((a, b) => b.time - a.time)
    .slice(0, MAX_ROWS)
    .map((h) => ({
      time: h.time,
      timeStr: formatTime(h.time),
      value: h.value,
      displayVal: formatValue(h.value),
    }))
})

function valueColorClass(val: unknown): string {
  if (typeof val === 'boolean') return val ? 'text-emerald-400' : 'text-red-400'
  if (typeof val === 'number') {
    const min = props.widget.config?.min
    const max = props.widget.config?.max
    if (max !== undefined && val > max * 0.8) return 'text-red-400'
    if (max !== undefined && val > max * 0.6) return 'text-yellow-400'
    return 'text-white'
  }
  return 'text-white'
}
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #334155;
  border-radius: 2px;
}
</style>
