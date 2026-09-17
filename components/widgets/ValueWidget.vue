<template>
  <div class="text-center">
    <div class="text-3xl md:text-4xl font-bold text-white tabular-nums">
      {{ formatValue(value) }}
      <span v-if="widget.unit" class="text-base text-slate-400 ml-1">{{ widget.unit }}</span>
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

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '--'
  if (typeof val === 'boolean') return val ? 'ON' : 'OFF'
  if (typeof val === 'number') return val.toFixed(val % 1 === 0 ? 0 : 1)
  return String(val)
}
</script>
