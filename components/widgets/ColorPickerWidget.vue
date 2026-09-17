<template>
  <div class="flex flex-col items-center justify-center h-full gap-3 px-2">
    <!-- Color preview swatch -->
    <div
      class="w-16 h-16 rounded-2xl border-2 border-slate-600 shadow-lg transition-all duration-300 shrink-0"
      :style="{ backgroundColor: selectedColor, boxShadow: `0 0 20px ${selectedColor}55` }"
    />

    <!-- Color input -->
    <div class="flex flex-col items-center gap-2 w-full">
      <label class="relative cursor-pointer">
        <input
          type="color"
          v-model="selectedColor"
          class="sr-only"
        />
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
        >
          <div class="w-4 h-4 rounded-md border border-slate-600" :style="{ backgroundColor: selectedColor }" />
          <span class="text-xs font-mono text-slate-300 uppercase tracking-wider">{{ selectedColor }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-500">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      </label>

      <!-- RGB sliders -->
      <div class="w-full space-y-1.5">
        <div v-for="ch in channels" :key="ch.key" class="flex items-center gap-2">
          <span class="text-xs font-semibold w-3 shrink-0" :style="{ color: ch.color }">{{ ch.key.toUpperCase() }}</span>
          <input
            type="range"
            min="0"
            max="255"
            :value="rgb[ch.key as 'r' | 'g' | 'b']"
            class="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer"
            :style="{ accentColor: ch.color }"
            @input="updateChannel(ch.key as 'r' | 'g' | 'b', ($event.target as HTMLInputElement).valueAsNumber)"
          />
          <span class="text-xs text-slate-500 tabular-nums w-6 text-right">{{ rgb[ch.key as 'r' | 'g' | 'b'] }}</span>
        </div>
      </div>
    </div>

    <!-- Send button -->
    <button
      class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
      :class="sent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 hover:border-primary-500/50'"
      @click="handleSend"
    >
      <svg v-if="!sent" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ sent ? 'Terkirim!' : 'Kirim Warna' }}
    </button>

    <!-- Command label -->
    <div class="text-xs text-slate-600 -mt-1">
      cmd: <span class="text-slate-500">{{ commandName }}</span>
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

const emit = defineEmits<{
  sendCommand: [command: string, value: string]
}>()

const selectedColor = ref('#22c55e')
const sent = ref(false)
let sentTimer: ReturnType<typeof setTimeout> | null = null

const channels = [
  { key: 'r', color: '#f87171' },
  { key: 'g', color: '#4ade80' },
  { key: 'b', color: '#60a5fa' },
]

// Parse hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const n = parseInt(clean, 16)
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

const rgb = computed(() => hexToRgb(selectedColor.value))

function updateChannel(ch: 'r' | 'g' | 'b', val: number) {
  const cur = hexToRgb(selectedColor.value)
  cur[ch] = Math.max(0, Math.min(255, Math.round(val)))
  selectedColor.value = rgbToHex(cur.r, cur.g, cur.b)
}

// Sync from incoming value if it's a hex string
watch(
  () => props.value,
  (v) => {
    if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) {
      selectedColor.value = v
    }
  },
  { immediate: true }
)

const commandName = computed(
  () => props.widget.config?.command || props.widget.data_key || 'color'
)

function handleSend() {
  emit('sendCommand', commandName.value, selectedColor.value)
  sent.value = true
  if (sentTimer) clearTimeout(sentTimer)
  sentTimer = setTimeout(() => (sent.value = false), 2000)
}

onUnmounted(() => {
  if (sentTimer) clearTimeout(sentTimer)
})
</script>
