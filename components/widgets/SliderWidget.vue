<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-400">{{ sliderValue }}</span>
      <span v-if="widget.unit" class="text-xs text-slate-500">{{ widget.unit }}</span>
    </div>
    <input
      type="range"
      :min="widget.config?.min ?? 0"
      :max="widget.config?.max ?? 100"
      v-model.number="sliderValue"
      class="w-full accent-primary-500"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '~/types/database'

const props = defineProps<{
  widget: Widget
  value: unknown
  history: { time: number; value: unknown }[]
}>()

const emit = defineEmits<{
  sendCommand: [command: string, value: number]
}>()

const sliderValue = ref(typeof props.value === 'number' ? props.value : 0)

watch(() => props.value, (newVal) => {
  if (typeof newVal === 'number') sliderValue.value = newVal
})

function handleChange() {
  const cmd = props.widget.config?.command || props.widget.data_key || props.widget.title.toLowerCase().replace(/\s/g, '_')
  emit('sendCommand', cmd, sliderValue.value)
}
</script>
