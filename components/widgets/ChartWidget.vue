<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 min-h-0">
      <canvas ref="canvasEl"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, LineController, PointElement, LineElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'
import type { Widget } from '~/types/database'

const props = defineProps<{
  widget: Widget
  value: unknown
  history: { time: number; value: unknown }[]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildChart() {
  if (!canvasEl.value) return
  if (chart) chart.destroy()

  Chart.register(LineController, PointElement, LineElement, LinearScale, CategoryScale, Filler, Tooltip)

  const labels = props.history.map((h) => {
    const d = new Date(h.time)
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
  })
  const data = props.history.map((h) => Number(h.value))

  chart = new Chart(canvasEl.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          borderColor: '#1e293b',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#fff',
          padding: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          display: true,
          grid: { color: 'rgba(30, 41, 59, 0.5)' },
          ticks: { color: '#475569', font: { size: 9 }, maxTicksLimit: 5 },
        },
        y: {
          display: true,
          grid: { color: 'rgba(30, 41, 59, 0.5)' },
          ticks: { color: '#475569', font: { size: 9 }, maxTicksLimit: 4 },
        },
      },
    },
  })
}

watch(() => props.history, buildChart, { deep: true })

onMounted(() => {
  nextTick(() => buildChart())
})

onUnmounted(() => {
  if (chart) chart.destroy()
})
</script>
