<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <button
      class="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
      :class="pressed ? 'bg-primary-500 text-white' : 'bg-background-elevated text-slate-300 border border-border hover:border-border-light'"
      @mousedown="pressed = true"
      @mouseup="pressed = false"
      @mouseleave="pressed = false"
      @touchstart.prevent="pressed = true"
      @touchend.prevent="pressed = false; handlePress()"
      @click="handlePress"
    >
      {{ widget.title }}
    </button>
    <div class="text-xs text-slate-500">{{ widget.config?.command || 'Send command' }}</div>
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
  sendCommand: [command: string, value: string | number | boolean]
}>()

const pressed = ref(false)

function handlePress() {
  const cmd = props.widget.config?.command || props.widget.title.toLowerCase().replace(/\s/g, '_')
  const val = props.widget.config?.commandValue ?? true
  emit('sendCommand', cmd, val)
}
</script>
