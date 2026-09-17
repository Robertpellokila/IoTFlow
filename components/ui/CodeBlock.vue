<template>
  <div class="relative group">
    <pre class="text-xs font-mono text-slate-700 p-4 bg-background-elevated border-2 border-border overflow-x-auto scrollbar-thin">{{ code }}</pre>
    <button
      class="absolute top-2 right-2 p-2 bg-background-card border-2 border-border text-slate-600 hover:text-primary-600 hover:border-primary-500 transition-all opacity-0 group-hover:opacity-100"
      @click="copy"
    >
      <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{ code: string }>()
const toast = useToast()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    toast.success('Code copied')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    toast.error('Failed to copy')
  }
}
</script>
