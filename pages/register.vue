<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Left side - branding -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-background-card to-background relative overflow-hidden">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-500 blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent-500 blur-3xl"></div>
      </div>

      <div class="relative z-10">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <Radio class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-white">IoTFlow</span>
        </NuxtLink>
      </div>

      <div class="relative z-10 space-y-6">
        <h1 class="text-4xl font-bold text-white leading-tight">
          Start building your IoT projects today.
        </h1>
        <p class="text-slate-400 text-lg">
          Join thousands of students and makers using IoTFlow to bring their ESP32 projects to life.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="feature in features" :key="feature" class="flex items-center gap-2 text-slate-300">
            <CheckCircle2 class="w-5 h-5 text-primary-400" />
            <span class="text-sm">{{ feature }}</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-sm text-slate-500">
        Free for students and educators
      </div>
    </div>

    <!-- Right side - form -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-8">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Radio class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold text-white">IoTFlow</span>
          </NuxtLink>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p class="text-slate-400">Get started with IoTFlow for free</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="label">Full Name</label>
            <input
              v-model="fullName"
              type="text"
              required
              placeholder="John Doe"
              class="input"
              :disabled="loading"
            />
          </div>

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

          <div>
            <label class="label">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="At least 6 characters"
                class="input pr-12"
                :disabled="loading"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <p v-if="error" class="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
            {{ error }}
          </p>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-slate-400 mt-6">
          Already have an account?
          <NuxtLink to="/login" class="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Radio, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'guest' })

const { signUp } = useAuth()
const toast = useToast()

const fullName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const features = [
  'ESP32 Integration',
  'Realtime Monitoring',
  'Drag & Drop Dashboard',
  'Device Control',
  'Sensor History',
  'Student Friendly',
]

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await signUp(email.value, password.value, fullName.value)
    toast.success('Account created! Welcome to IoTFlow.')
    navigateTo('/dashboard')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create account'
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>
