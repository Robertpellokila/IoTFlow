<template>
  <div class="flex flex-col items-center justify-center h-full gap-2">
    <div class="flex items-end gap-4">
      <!-- SVG Thermometer -->
      <svg width="48" height="140" viewBox="0 0 48 140">
        <!-- Tube background -->
        <rect x="19" y="8" width="10" height="90" rx="5" ry="5" fill="#1e293b" stroke="#334155" stroke-width="1.5" />

        <!-- Fluid fill (animated) -->
        <clipPath id="thermo-clip">
          <rect x="20" y="8" width="8" height="90" rx="4" ry="4" />
        </clipPath>
        <rect
          x="20"
          :y="fluidY"
          width="8"
          :height="fluidHeight"
          rx="3"
          :fill="fluidColor"
          clip-path="url(#thermo-clip)"
          class="transition-all duration-700 ease-out"
        />

        <!-- Tick marks -->
        <g v-for="tick in tickMarks" :key="tick.y">
          <line :x1="tick.x1" :y1="tick.y" :x2="tick.x2" :y2="tick.y" stroke="#475569" stroke-width="1" />
          <text v-if="tick.label !== null" :x="tick.tx" :y="tick.y + 3.5" text-anchor="end" fill="#64748b" font-size="7" font-family="system-ui, sans-serif">
            {{ tick.label }}
          </text>
        </g>

        <!-- Bulb background -->
        <circle cx="24" cy="112" r="13" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <!-- Bulb fluid -->
        <circle cx="24" cy="112" r="10" :fill="fluidColor" class="transition-colors duration-700" />
      </svg>

      <!-- Value display -->
      <div class="flex flex-col justify-center">
        <div class="text-2xl font-bold text-white tabular-nums leading-tight">
          {{ displayValue }}
        </div>
        <div class="text-sm text-slate-400">
          {{ widget.unit || '°C' }}
        </div>
        <div class="mt-2 flex flex-col gap-0.5">
          <div class="text-xs text-slate-500">Max: <span class="text-slate-400">{{ max }}{{ widget.unit || '°C' }}</span></div>
          <div class="text-xs text-slate-500">Min: <span class="text-slate-400">{{ min }}{{ widget.unit || '°C' }}</span></div>
        </div>
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

const min = computed(() => props.widget.config?.min ?? 0)
const max = computed(() => props.widget.config?.max ?? 100)

const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  if (typeof props.value === 'string') {
    const n = parseFloat(props.value)
    return isNaN(n) ? min.value : n
  }
  return min.value
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  return numericValue.value.toFixed(numericValue.value % 1 === 0 ? 0 : 1)
})

// Tube area: y=8 (top) to y=98 (bottom, meets bulb)
const tubeTop = 8
const tubeBottom = 98
const tubeLength = tubeBottom - tubeTop

const fillPercent = computed(() => {
  const pct = (numericValue.value - min.value) / (max.value - min.value)
  return Math.max(0, Math.min(1, pct))
})

const fluidHeight = computed(() => Math.max(0, fillPercent.value * tubeLength))
const fluidY = computed(() => tubeBottom - fluidHeight.value)

const fluidColor = computed(() => {
  const pct = fillPercent.value
  if (pct > 0.8) return '#f87171'  // red
  if (pct > 0.5) return '#fb923c'  // orange
  if (pct > 0.25) return '#facc15' // yellow
  return '#38bdf8'                  // blue (cold)
})

interface TickMark {
  y: number
  x1: number
  x2: number
  tx: number
  label: number | null
}

const tickMarks = computed<TickMark[]>(() => {
  const result: TickMark[] = []
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const pct = i / steps
    const y = tubeBottom - pct * tubeLength
    const isMajor = true
    const labelVal = Math.round(min.value + pct * (max.value - min.value))
    result.push({
      y,
      x1: 17,
      x2: isMajor ? 14 : 16,
      tx: 13,
      label: labelVal,
    })
  }
  return result
})
</script>
