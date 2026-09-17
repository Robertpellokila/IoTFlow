export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

export function useToast() {
  const toasts = useState<ToastMessage[]>('toasts', () => [])

  function show(type: ToastMessage['type'], message: string, duration = 3000) {
    const id = Date.now() + Math.random()
    toasts.value = [...toasts.value, { id, type, message }]
    if (duration > 0) {
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }, duration)
    }
  }

  function success(message: string) {
    show('success', message)
  }

  function error(message: string) {
    show('error', message, 4000)
  }

  function info(message: string) {
    show('info', message)
  }

  function warning(message: string) {
    show('warning', message)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, success, error, info, warning, remove }
}
