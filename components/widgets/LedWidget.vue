<template>
  <div class="flex items-center gap-3">
    <span
      class="w-4 h-4 rounded-full transition-all duration-300"
      :class="isOn ? 'bg-primary-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'"
    ></span>
    <span class="text-sm" :class="isOn ? 'text-primary-400' : 'text-slate-500'">
      {{ isOn ? 'HIGH' : 'LOW' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '~/types/database'

const props = defineProps<{
  widget: Widget
  value: unknown
  history: { time: number; value: unknown }[]
}>()

const isOn = computed(() => {
  if (typeof props.value === 'boolean') return props.value
  if (typeof props.value === 'number') return props.value > 0
  if (typeof props.value === 'string') return props.value === 'true' || props.value === '1' || props.value === 'HIGH'
  return false
})
</script>
