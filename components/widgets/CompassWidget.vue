<template>
  <div class="flex flex-col items-center justify-center h-full gap-2">
    <!-- SVG Compass -->
    <div class="relative">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="overflow-visible">
        <!-- Outer ring -->
        <circle
          :cx="cx" :cy="cy" :r="radius"
          fill="none"
          stroke="#334155"
          stroke-width="2"
        />
        <!-- Tick marks -->
        <g v-for="tick in ticks" :key="tick.angle">
          <line
            :x1="tick.x1" :y1="tick.y1"
            :x2="tick.x2" :y2="tick.y2"
            :stroke="tick.major ? '#64748b' : '#334155'"
            :stroke-width="tick.major ? 2 : 1"
          />
          <text
            v-if="tick.label"
            :x="tick.tx" :y="tick.ty"
            text-anchor="middle"
            dominant-baseline="central"
            :fill="tick.label === 'N' ? '#f87171' : '#94a3b8'"
            :font-size="tick.label === 'N' ? 11 : 9"
            font-weight="600"
            font-family="system-ui, sans-serif"
          >{{ tick.label }}</text>
        </g>
        <!-- Needle group — rotates around center -->
        <g :style="{ transform: `rotate(${bearing}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.5s ease' }">
          <!-- North needle (red) -->
          <polygon
            :points="northNeedle"
            fill="#f87171"
            opacity="0.95"
          />
          <!-- South needle (slate) -->
          <polygon
            :points="southNeedle"
            fill="#475569"
            opacity="0.95"
          />
          <!-- Center cap -->
          <circle :cx="cx" :cy="cy" r="4" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
        </g>
      </svg>
    </div>

    <!-- Bearing value -->
    <div class="text-center">
      <div class="text-2xl font-bold text-white tabular-nums">
        {{ displayBearing }}°
      </div>
      <div class="text-xs text-slate-400 mt-0.5">{{ cardinalDirection }}</div>
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

const size = 140
const cx = size / 2
const cy = size / 2
const radius = 58

const bearing = computed(() => {
  if (typeof props.value === 'number') return props.value % 360
  if (typeof props.value === 'string') {
    const n = parseFloat(props.value)
    return isNaN(n) ? 0 : n % 360
  }
  return 0
})

const displayBearing = computed(() => Math.round(bearing.value))

const cardinalDirection = computed(() => {
  const b = ((bearing.value % 360) + 360) % 360
  if (b < 22.5 || b >= 337.5) return 'Utara'
  if (b < 67.5) return 'Timur Laut'
  if (b < 112.5) return 'Timur'
  if (b < 157.5) return 'Tenggara'
  if (b < 202.5) return 'Selatan'
  if (b < 247.5) return 'Barat Daya'
  if (b < 292.5) return 'Barat'
  return 'Barat Laut'
})

// Needle polygon points — pointing up (north at 0°)
const needleW = 5
const northNeedle = computed(() => {
  const tip = cy - radius + 10
  const base = cy + 12
  return `${cx},${tip} ${cx - needleW},${base} ${cx + needleW},${base}`
})
const southNeedle = computed(() => {
  const tip = cy + radius - 10
  const base = cy - 12
  return `${cx},${tip} ${cx - needleW},${base} ${cx + needleW},${base}`
})

interface Tick {
  angle: number
  x1: number; y1: number
  x2: number; y2: number
  major: boolean
  label: string | null
  tx: number; ty: number
}

const cardinals: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }

const ticks = computed<Tick[]>(() => {
  const result: Tick[] = []
  for (let a = 0; a < 360; a += 10) {
    const rad = (a - 90) * (Math.PI / 180)
    const major = a % 90 === 0
    const inner = radius - (major ? 10 : 5)
    const outer = radius
    const labelR = radius - 18
    result.push({
      angle: a,
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
      major,
      label: cardinals[a] ?? null,
      tx: cx + labelR * Math.cos(rad),
      ty: cy + labelR * Math.sin(rad),
    })
  }
  return result
})
</script>
