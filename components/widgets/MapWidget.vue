<template>
  <div class="flex flex-col items-center justify-center h-full gap-3 px-2">
    <!-- Pin icon + coordinates -->
    <div v-if="hasCoords" class="flex flex-col items-center gap-2 w-full">
      <!-- Map placeholder visual -->
      <div class="w-full rounded-xl bg-slate-800/60 border border-slate-700 overflow-hidden relative" style="height: 80px;">
        <!-- Stylized grid lines -->
        <svg width="100%" height="100%" class="absolute inset-0 opacity-30">
          <defs>
            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#475569" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
        <!-- Pin marker centered -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-0.5">
            <div class="w-5 h-5 rounded-full bg-primary-500 border-2 border-white shadow-lg shadow-primary-500/50 flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <div class="w-px h-2 bg-primary-500" />
          </div>
        </div>
      </div>

      <!-- Coordinate readout -->
      <div class="w-full space-y-1">
        <div class="flex items-center justify-between text-xs rounded-lg bg-slate-800/50 px-3 py-1.5">
          <span class="text-slate-400">Lat</span>
          <span class="font-mono text-white tabular-nums">{{ lat }}</span>
        </div>
        <div class="flex items-center justify-between text-xs rounded-lg bg-slate-800/50 px-3 py-1.5">
          <span class="text-slate-400">Lng</span>
          <span class="font-mono text-white tabular-nums">{{ lng }}</span>
        </div>
      </div>
    </div>

    <!-- No data state -->
    <div v-else class="flex flex-col items-center gap-2 text-slate-500">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
      <span class="text-xs">Tidak ada koordinat</span>
    </div>

    <!-- Open Maps button -->
    <a
      v-if="hasCoords"
      :href="mapsUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 hover:border-primary-500/50 transition-all"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      Buka di Maps
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '~/types/database'

const props = defineProps<{
  widget: Widget
  value: unknown
  history: { time: number; value: unknown }[]
}>()

/**
 * value dapat berupa:
 *  - string "lat,lng"  misalnya "1.2345,103.8765"
 *  - object { lat, lng } atau { latitude, longitude }
 *  - number (dianggap lat, lng=0)
 */
const parsed = computed<{ lat: number; lng: number } | null>(() => {
  const v = props.value
  if (v === null || v === undefined) return null

  // String "lat,lng"
  if (typeof v === 'string') {
    const parts = v.split(',')
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0].trim())
      const lng = parseFloat(parts[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    return null
  }

  // Object
  if (typeof v === 'object' && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>
    const lat = parseFloat(String(obj.lat ?? obj.latitude ?? ''))
    const lng = parseFloat(String(obj.lng ?? obj.longitude ?? ''))
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }

  return null
})

const hasCoords = computed(() => parsed.value !== null)

const lat = computed(() => parsed.value?.lat.toFixed(6) ?? '--')
const lng = computed(() => parsed.value?.lng.toFixed(6) ?? '--')

const mapsUrl = computed(() => {
  if (!parsed.value) return '#'
  const { lat, lng } = parsed.value
  return `https://www.google.com/maps?q=${lat},${lng}`
})
</script>
