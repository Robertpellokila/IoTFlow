<template>
  <div class="flex flex-col items-center justify-center h-full">
    <div class="text-3xl font-bold text-white tabular-nums mb-2">
      {{ displayValue }}<span v-if="widget.unit" class="text-base text-slate-400 ml-1">{{ widget.unit }}</span>
    </div>
    <div class="w-full max-w-[160px]">
      <div class="h-2 rounded-full bg-background-elevated overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="gaugeColor"
          :style="{ width: `${gaugePercent}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>{{ widget.config?.min ?? 0 }}</span>
        <span>{{ widget.config?.max ?? 100 }}</span>
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
    return isNaN(n) ? 0 : n
  }
  return 0
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  if (typeof props.value === 'number') return props.value.toFixed(props.value % 1 === 0 ? 0 : 1)
  return String(props.value)
})

const gaugePercent = computed(() => {
  const pct = ((numericValue.value - min.value) / (max.value - min.value)) * 100
  return Math.max(0, Math.min(100, pct))
})

const gaugeColor = computed(() => {
  const pct = gaugePercent.value
  if (pct > 80) return 'bg-error'
  if (pct > 60) return 'bg-warning'
  return 'bg-primary-500'
})
</script>
