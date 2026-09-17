<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="text-2xl font-bold text-white tabular-nums">
        {{ percent }}<span class="text-sm text-slate-400 ml-1">%</span>
      </span>
    </div>
    <div class="h-3 rounded-full bg-background-elevated overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="progressColor"
        :style="{ width: `${percent}%` }"
      ></div>
    </div>
    <div class="flex justify-between text-xs text-slate-500">
      <span>{{ widget.config?.min ?? 0 }}{{ widget.unit }}</span>
      <span>{{ widget.config?.max ?? 100 }}{{ widget.unit }}</span>
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

const percent = computed(() => {
  const pct = ((numericValue.value - min.value) / (max.value - min.value)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
})

const progressColor = computed(() => {
  const pct = percent.value
  if (pct > 80) return 'bg-error'
  if (pct > 60) return 'bg-warning'
  return 'bg-primary-500'
})
</script>
