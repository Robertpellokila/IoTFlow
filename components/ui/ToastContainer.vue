<template>
  <div
    v-if="toasts.length > 0"
    class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xl animate-slide-up"
        :class="toastStyles(toast.type)"
      >
        <component :is="toastIcon(toast.type)" class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        <button class="text-slate-400 hover:text-slate-200 transition-colors" @click="remove(toast.id)">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import type { ToastMessage } from '~/composables/useToast'

const { toasts, remove } = useToast()

function toastStyles(type: ToastMessage['type']) {
  const styles: Record<string, string> = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    info: 'bg-info/10 border-info/20 text-info',
    warning: 'bg-warning/10 border-warning/20 text-warning',
  }
  return styles[type] || styles.info
}

function toastIcon(type: ToastMessage['type']) {
  const icons: Record<string, unknown> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }
  return icons[type] || Info
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
