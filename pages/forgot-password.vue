<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <NuxtLink to="/" class="flex items-center gap-2.5 mb-8 justify-center">
        <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
          <Radio class="w-6 h-6 text-white" />
        </div>
        <span class="text-xl font-bold text-white">IoTFlow</span>
      </NuxtLink>

      <div class="card p-8">
        <div v-if="!sent" class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">Reset your password</h2>
          <p class="text-slate-400 text-sm">Enter your email and we'll send you a reset link</p>
        </div>
        <div v-else class="text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <MailCheck class="w-8 h-8 text-success" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p class="text-slate-400 text-sm">We've sent a password reset link to {{ email }}</p>
        </div>

        <form v-if="!sent" @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="label">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="input"
              :disabled="loading"
            />
          </div>

          <p v-if="error" class="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
            {{ error }}
          </p>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Sending...' : 'Send Reset Link' }}</span>
          </button>
        </form>

        <div class="text-center mt-6">
          <NuxtLink to="/login" class="text-sm text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft class="w-4 h-4" />
            Back to login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Radio, MailCheck, ArrowLeft, Loader2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'guest' })

const { resetPassword } = useAuth()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await resetPassword(email.value)
    sent.value = true
    toast.success('Reset link sent to your email')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send reset link'
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>
