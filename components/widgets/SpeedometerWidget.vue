<template>
  <div class="flex flex-col items-center justify-center h-full gap-1">
    <svg :width="svgSize" :height="svgSize * 0.62" :viewBox="`0 0 ${svgSize} ${svgSize * 0.62}`" class="overflow-visible">
      <!-- Background arc -->
      <path
        :d="arcPath(0, 1)"
        fill="none"
        stroke="#1e293b"
        :stroke-width="trackWidth"
        stroke-linecap="round"
      />

      <!-- Colored zone arcs -->
      <path
        :d="arcPath(0, 0.6)"
        fill="none"
        stroke="#22c55e"
        :stroke-width="trackWidth"
        stroke-linecap="butt"
        opacity="0.25"
      />
      <path
        :d="arcPath(0.6, 0.8)"
        fill="none"
        stroke="#facc15"
        :stroke-width="trackWidth"
        stroke-linecap="butt"
        opacity="0.25"
      />
      <path
        :d="arcPath(0.8, 1)"
        fill="none"
        stroke="#f87171"
        :stroke-width="trackWidth"
        stroke-linecap="butt"
        opacity="0.25"
      />

      <!-- Value arc -->
      <path
        :d="arcPath(0, fillPercent)"
        fill="none"
        :stroke="needleColor"
        :stroke-width="trackWidth"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
      />

      <!-- Tick marks -->
      <g v-for="tick in ticks" :key="tick.angle">
        <line
          :x1="tick.x1" :y1="tick.y1"
          :x2="tick.x2" :y2="tick.y2"
          stroke="#475569"
          :stroke-width="tick.major ? 1.5 : 1"
        />
        <text
          v-if="tick.major"
          :x="tick.tx" :y="tick.ty"
          text-anchor="middle"
          dominant-baseline="central"
          fill="#64748b"
          font-size="8"
          font-family="system-ui, sans-serif"
        >{{ tick.label }}</text>
      </g>

      <!-- Needle -->
      <g :style="needleTransform">
        <line
          :x1="cx" :y1="cy"
          :x2="cx" :y2="cy - needleLength"
          :stroke="needleColor"
          stroke-width="2.5"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
        />
      </g>

      <!-- Center cap -->
      <circle :cx="cx" :cy="cy" r="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
      <circle :cx="cx" :cy="cy" r="3" :fill="needleColor" class="transition-colors duration-500" />

      <!-- Value text -->
      <text
        :x="cx" :y="cy - 28"
        text-anchor="middle"
        dominant-baseline="central"
        fill="white"
        :font-size="valueSize"
        font-weight="700"
        font-family="system-ui, sans-serif"
      >{{ displayValue }}</text>
      <text
        v-if="widget.unit"
        :x="cx" :y="cy - 12"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#94a3b8"
        font-size="9"
        font-family="system-ui, sans-serif"
      >{{ widget.unit }}</text>
    </svg>

    <!-- Min / Max labels -->
    <div class="flex justify-between w-full px-2 -mt-1">
      <span class="text-xs text-slate-500">{{ min }}</span>
      <span class="text-xs text-slate-500">{{ max }}</span>
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

const svgSize = 180
const cx = svgSize / 2
const cy = svgSize * 0.57
const arcRadius = 72
const trackWidth = 12
const needleLength = arcRadius - trackWidth / 2 - 4

// Arc spans from -210° to +30° (240° sweep, semi-circle style)
const startAngle = -210 // degrees from positive x-axis
const sweepAngle = 240  // total degrees

const min = computed(() => props.widget.config?.min ?? 0)
const max = computed(() => props.widget.config?.max ?? 100)

const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  if (typeof props.value === 'string') {
    const n = parseFloat(props.value)
    return isNaN(n) ? 0 : n
  }
  return 0
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  const v = numericValue.value
  return v.toFixed(v % 1 === 0 ? 0 : 1)
})

const valueSize = computed(() => {
  const len = displayValue.value.length
  return len > 4 ? 16 : len > 3 ? 18 : 22
})

const fillPercent = computed(() => {
  const pct = (numericValue.value - min.value) / (max.value - min.value)
  return Math.max(0, Math.min(1, pct))
})

const needleColor = computed(() => {
  const pct = fillPercent.value
  if (pct > 0.8) return '#f87171'
  if (pct > 0.6) return '#facc15'
  return '#22c55e'
})

// Convert arc fraction to SVG path
function polarToCart(angleDeg: number, r: number) {
  const rad = angleDeg * (Math.PI / 180)
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function arcPath(fromFrac: number, toFrac: number): string {
  const aStart = startAngle + fromFrac * sweepAngle
  const aEnd = startAngle + toFrac * sweepAngle
  const p1 = polarToCart(aStart, arcRadius)
  const p2 = polarToCart(aEnd, arcRadius)
  const largeArc = (toFrac - fromFrac) * sweepAngle > 180 ? 1 : 0
  if (fromFrac === toFrac) return ''
  return `M ${p1.x} ${p1.y} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
}

// Needle rotation: maps 0→startAngle+90, 1→startAngle+sweepAngle+90
// The needle points up (270° from x-axis), we rotate from startAngle
const needleAngle = computed(() => startAngle + fillPercent.value * sweepAngle + 90)

const needleTransform = computed(() => ({
  transform: `rotate(${needleAngle.value}deg)`,
  transformOrigin: `${cx}px ${cy}px`,
  transition: 'transform 0.5s ease',
}))

interface Tick {
  angle: number
  x1: number; y1: number
  x2: number; y2: number
  major: boolean
  tx: number; ty: number
  label: string
}

const ticks = computed<Tick[]>(() => {
  const result: Tick[] = []
  const numTicks = 24
  for (let i = 0; i <= numTicks; i++) {
    const frac = i / numTicks
    const angleDeg = startAngle + frac * sweepAngle
    const rad = angleDeg * (Math.PI / 180)
    const major = i % 4 === 0
    const innerR = arcRadius + trackWidth / 2 + 3
    const outerR = innerR + (major ? 8 : 4)
    const labelR = innerR + 14
    const labelVal = Math.round(min.value + frac * (max.value - min.value))
    result.push({
      angle: angleDeg,
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      major,
      tx: cx + labelR * Math.cos(rad),
      ty: cy + labelR * Math.sin(rad),
      label: String(labelVal),
    })
  }
  return result
})
</script>
