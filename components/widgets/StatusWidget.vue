<template>
  <div class="flex items-center gap-2">
    <span
      class="w-3 h-3 rounded-full transition-all duration-300"
      :class="isAlert ? 'bg-error animate-pulse-glow' : 'bg-success'"
    ></span>
    <span class="text-sm font-semibold" :class="isAlert ? 'text-error' : 'text-success'">
      {{ statusText }}
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

const isAlert = computed(() => {
  if (typeof props.value === 'boolean') return props.value
  if (typeof props.value === 'number') {
    const threshold = props.widget.config?.max ?? 1
    return props.value >= threshold
  }
  if (typeof props.value === 'string') return props.value === 'true' || props.value === '1'
  return false
})

const statusText = computed(() => {
  if (isAlert.value) return props.widget.config?.command || 'ALERT'
  return 'NORMAL'
})
</script>
