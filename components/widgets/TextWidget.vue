<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-sm text-slate-300 text-center break-words">
      {{ displayText }}
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

const displayText = computed(() => {
  if (props.value === null || props.value === undefined) return 'No data'
  return String(props.value)
})
</script>
