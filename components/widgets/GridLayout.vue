<template>
  <div
    ref="containerEl"
    class="grid-layout relative w-full"
    :style="containerStyle"
    @dragover.prevent
    @drop.prevent
  >
    <!-- Grid background lines (visible in edit mode) -->
    <div v-if="editable" class="absolute inset-0 pointer-events-none" :style="gridBgStyle" />

    <!-- Widget slots -->
    <div
      v-for="item in layout"
      :key="item.id"
      class="grid-item absolute transition-shadow"
      :class="[
        dragging === item.id ? 'z-30 shadow-2xl opacity-90 scale-[1.02]' : 'z-10',
        resizing === item.id ? 'z-30' : '',
      ]"
      :style="itemStyle(item)"
    >
      <!-- Drag handle (top bar) -->
      <div
        v-if="editable"
        class="drag-handle absolute top-0 left-0 right-8 h-7 cursor-move z-20 flex items-center px-2 gap-1 opacity-0 group-hover:opacity-100 rounded-t-xl"
        style="background: linear-gradient(to bottom, rgba(255,152,80,0.15), transparent)"
        @mousedown.prevent="startDrag($event, item)"
        @touchstart.prevent="startDragTouch($event, item)"
      >
        <GripHorizontal class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-xs text-slate-400 truncate">{{ item.title }}</span>
      </div>

      <!-- Slot content -->
      <div class="w-full h-full group">
        <slot :item="item" />
      </div>

      <!-- Resize handle (bottom-right corner) -->
      <div
        v-if="editable"
        class="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-20 flex items-end justify-end p-0.5"
        @mousedown.prevent="startResize($event, item)"
        @touchstart.prevent="startResizeTouch($event, item)"
      >
        <GripVertical class="w-3 h-3 text-slate-400 rotate-45" />
      </div>
    </div>

    <!-- Drop placeholder -->
    <div
      v-if="placeholder"
      class="absolute rounded-xl border-2 border-dashed border-primary-400 bg-primary-500/5 z-20 pointer-events-none transition-all duration-100"
      :style="placeholderStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { GripHorizontal, GripVertical } from 'lucide-vue-next'

export interface GridItem {
  id: string
  x: number   // grid column (0-based)
  y: number   // grid row (0-based)
  w: number   // width in cols
  h: number   // height in rows
  title?: string
}

const props = withDefaults(defineProps<{
  layout: GridItem[]
  cols?: number
  rowHeight?: number
  gap?: number
  editable?: boolean
}>(), {
  cols: 12,
  rowHeight: 120,
  gap: 12,
  editable: true,
})

const emit = defineEmits<{
  layoutChanged: [layout: GridItem[]]
}>()

const containerEl = ref<HTMLElement | null>(null)
const dragging = ref<string | null>(null)
const resizing = ref<string | null>(null)
const placeholder = ref<GridItem | null>(null)

// ─── Computed styles ────────────────────────────────────────────────
const colWidth = computed(() => {
  if (!containerEl.value) return 100
  const totalGap = props.gap * (props.cols - 1)
  return (containerEl.value.clientWidth - totalGap) / props.cols
})

const totalRows = computed(() => {
  if (!props.layout.length) return 4
  return Math.max(...props.layout.map((i) => i.y + i.h)) + 1
})

const containerStyle = computed(() => ({
  height: `${totalRows.value * (props.rowHeight + props.gap) - props.gap + 24}px`,
  minHeight: '200px',
}))

const gridBgStyle = computed(() => ({
  backgroundImage: `
    linear-gradient(to right, rgba(255,152,80,0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,152,80,0.07) 1px, transparent 1px)
  `,
  backgroundSize: `${colWidth.value + props.gap}px ${props.rowHeight + props.gap}px`,
  backgroundPosition: '0 0',
}))

function itemStyle(item: GridItem) {
  const left = item.x * (colWidth.value + props.gap)
  const top = item.y * (props.rowHeight + props.gap)
  const width = item.w * colWidth.value + (item.w - 1) * props.gap
  const height = item.h * props.rowHeight + (item.h - 1) * props.gap
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    transition: dragging.value === item.id || resizing.value === item.id
      ? 'box-shadow 0.15s, opacity 0.15s, transform 0.15s'
      : 'left 0.15s ease, top 0.15s ease, width 0.15s ease, height 0.15s ease, box-shadow 0.15s',
  }
}

const placeholderStyle = computed(() => {
  if (!placeholder.value) return {}
  const item = placeholder.value
  const left = item.x * (colWidth.value + props.gap)
  const top = item.y * (props.rowHeight + props.gap)
  const width = item.w * colWidth.value + (item.w - 1) * props.gap
  const height = item.h * props.rowHeight + (item.h - 1) * props.gap
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

// ─── Helpers ────────────────────────────────────────────────────────
function getContainerRect() {
  return containerEl.value!.getBoundingClientRect()
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function pxToCol(px: number) {
  return Math.round(px / (colWidth.value + props.gap))
}

function pxToRow(px: number) {
  return Math.round(px / (props.rowHeight + props.gap))
}

// ─── DRAG ───────────────────────────────────────────────────────────
let dragState: {
  itemId: string
  startMouseX: number
  startMouseY: number
  startX: number
  startY: number
} | null = null

function startDrag(e: MouseEvent, item: GridItem) {
  if (!props.editable) return
  dragging.value = item.id
  placeholder.value = { ...item }
  dragState = {
    itemId: item.id,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startX: item.x,
    startY: item.y,
  }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function startDragTouch(e: TouchEvent, item: GridItem) {
  const t = e.touches[0]
  startDrag({ clientX: t.clientX, clientY: t.clientY } as MouseEvent, item)
  window.addEventListener('touchmove', onDragMoveTouch, { passive: false })
  window.addEventListener('touchend', onDragEndTouch)
}

function onDragMove(e: MouseEvent) {
  if (!dragState || !containerEl.value) return
  const rect = getContainerRect()
  const dx = e.clientX - dragState.startMouseX
  const dy = e.clientY - dragState.startMouseY

  const item = props.layout.find((i) => i.id === dragState!.itemId)
  if (!item) return

  const newX = clamp(dragState.startX + pxToCol(dx), 0, props.cols - item.w)
  const newY = clamp(dragState.startY + pxToRow(dy), 0, 50)

  if (placeholder.value) {
    placeholder.value = { ...placeholder.value, x: newX, y: newY }
  }
}

function onDragMoveTouch(e: TouchEvent) {
  e.preventDefault()
  onDragMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as MouseEvent)
}

function onDragEnd() {
  if (!dragState) return
  const item = props.layout.find((i) => i.id === dragState!.itemId)
  if (item && placeholder.value) {
    const newLayout = props.layout.map((i) =>
      i.id === dragState!.itemId
        ? { ...i, x: placeholder.value!.x, y: placeholder.value!.y }
        : i
    )
    emit('layoutChanged', newLayout)
  }
  dragging.value = null
  placeholder.value = null
  dragState = null
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

function onDragEndTouch() {
  onDragEnd()
  window.removeEventListener('touchmove', onDragMoveTouch)
  window.removeEventListener('touchend', onDragEndTouch)
}

// ─── RESIZE ─────────────────────────────────────────────────────────
let resizeState: {
  itemId: string
  startMouseX: number
  startMouseY: number
  startW: number
  startH: number
} | null = null

function startResize(e: MouseEvent, item: GridItem) {
  if (!props.editable) return
  resizing.value = item.id
  placeholder.value = { ...item }
  resizeState = {
    itemId: item.id,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startW: item.w,
    startH: item.h,
  }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function startResizeTouch(e: TouchEvent, item: GridItem) {
  const t = e.touches[0]
  startResize({ clientX: t.clientX, clientY: t.clientY } as MouseEvent, item)
  window.addEventListener('touchmove', onResizeMoveTouch, { passive: false })
  window.addEventListener('touchend', onResizeEndTouch)
}

function onResizeMove(e: MouseEvent) {
  if (!resizeState) return
  const item = props.layout.find((i) => i.id === resizeState!.itemId)
  if (!item) return

  const dx = e.clientX - resizeState.startMouseX
  const dy = e.clientY - resizeState.startMouseY

  const newW = clamp(resizeState.startW + pxToCol(dx), 1, props.cols - item.x)
  const newH = clamp(resizeState.startH + pxToRow(dy), 1, 8)

  if (placeholder.value) {
    placeholder.value = { ...placeholder.value, w: newW, h: newH }
  }
}

function onResizeMoveTouch(e: TouchEvent) {
  e.preventDefault()
  onResizeMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as MouseEvent)
}

function onResizeEnd() {
  if (!resizeState) return
  const item = props.layout.find((i) => i.id === resizeState!.itemId)
  if (item && placeholder.value) {
    const newLayout = props.layout.map((i) =>
      i.id === resizeState!.itemId
        ? { ...i, w: placeholder.value!.w, h: placeholder.value!.h }
        : i
    )
    emit('layoutChanged', newLayout)
  }
  resizing.value = null
  placeholder.value = null
  resizeState = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

function onResizeEndTouch() {
  onResizeEnd()
  window.removeEventListener('touchmove', onResizeMoveTouch)
  window.removeEventListener('touchend', onResizeEndTouch)
}

// recalculate colWidth on window resize
useResizeObserver(containerEl, () => {
  // trigger reactivity
})
</script>

<style scoped>
.grid-item {
  border-radius: 12px;
  overflow: hidden;
}
.grid-item:hover .drag-handle,
.grid-item:hover .resize-handle {
  opacity: 1 !important;
}
.resize-handle {
  opacity: 0;
  transition: opacity 0.15s;
}
.drag-handle {
  opacity: 0;
  transition: opacity 0.15s;
}
</style>
