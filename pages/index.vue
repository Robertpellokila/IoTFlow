<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <Radio class="w-5 h-5 text-white" />
          </div>
          <span class="text-lg font-bold text-white">IoTFlow</span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8">
          <a href="#how-it-works" class="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
          <a href="#features" class="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#projects" class="text-sm text-slate-400 hover:text-white transition-colors">Projects</a>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/login" class="btn-ghost text-sm hidden sm:inline-flex">Sign In</NuxtLink>
          <NuxtLink to="/register" class="btn-primary text-sm">Get Started</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative pt-32 pb-20 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary-500 blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent-500 blur-3xl"></div>
      </div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-6 animate-fade-in">
            <span class="status-online"></span>
            ESP32 IoT Platform for Students & Makers
          </div>
          <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Build Your IoT Dashboard<br />
            <span class="text-primary-400">Without Building It From Scratch.</span>
          </h1>
          <p class="text-lg text-slate-400 mb-8 max-w-2xl mx-auto animate-slide-up">
            Connect your ESP32, add widgets, monitor sensors, and control your devices from one simple dashboard.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <NuxtLink to="/register" class="btn-primary px-6 py-3 text-base">
              Get Started
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>
            <a href="#how-it-works" class="btn-secondary px-6 py-3 text-base">
              Explore Platform
            </a>
          </div>
        </div>

        <!-- Dashboard mockup -->
        <div class="mt-16 max-w-5xl mx-auto animate-fade-in">
          <DashboardMockup />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-20 border-t border-border">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Three simple steps from ESP32 to live dashboard</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(step, i) in steps" :key="step.title" class="card p-8 relative group hover:border-border-light transition-all duration-300">
            <div class="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {{ i + 1 }}
            </div>
            <div class="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <component :is="step.icon" class="w-6 h-6 text-primary-400" />
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">{{ step.title }}</h3>
            <p class="text-sm text-slate-400">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-20 border-t border-border">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Powerful features designed for IoT builders</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="feature in features" :key="feature.title" class="card p-6 hover:border-border-light transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <component :is="feature.icon" class="w-5 h-5 text-primary-400" />
            </div>
            <h3 class="font-semibold text-white mb-1.5">{{ feature.title }}</h3>
            <p class="text-sm text-slate-400">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Supported Projects -->
    <section id="projects" class="py-20 border-t border-border">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Supported Projects</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Start from a template or build your own</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in projects" :key="project.name" class="card p-6 hover:border-border-light transition-all duration-300 group">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="project.bg">
                {{ project.emoji }}
              </div>
              <span class="badge-neutral">{{ project.tag }}</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">{{ project.name }}</h3>
            <p class="text-sm text-slate-400 mb-4">{{ project.desc }}</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="sensor in project.sensors" :key="sensor" class="badge-info text-xs">
                {{ sensor }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 border-t border-border">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to build your IoT project?</h2>
        <p class="text-slate-400 mb-8 max-w-2xl mx-auto">Join thousands of students and makers using IoTFlow</p>
        <NuxtLink to="/register" class="btn-primary px-8 py-3.5 text-base inline-flex">
          Get Started for Free
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-border">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Radio class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-white">IoTFlow</span>
          <span class="text-sm text-slate-500 ml-2">ESP32 IoT Dashboard Platform</span>
        </div>
        <p class="text-sm text-slate-500">Built for students, makers, and educators.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Radio, ArrowRight, Cpu, LayoutGrid, Activity, ToggleLeft,
  History, BarChart3, Server, GraduationCap, Sprout, Trash2,
  Home, PawPrint, Flame, CloudSun, Car
} from 'lucide-vue-next'
import DashboardMockup from '~/components/landing/DashboardMockup.vue'

const scrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
})

const steps = [
  { icon: Cpu, title: 'Connect Device', desc: 'Create a device, get your Device ID and Token, then connect your ESP32 via simple HTTP requests.' },
  { icon: LayoutGrid, title: 'Add Widgets', desc: 'Choose from value, gauge, switch, slider, chart, and more. Configure data sources in seconds.' },
  { icon: Activity, title: 'Monitor & Control', desc: 'Watch sensor data update in realtime and send commands back to your ESP32 instantly.' },
]

const features = [
  { icon: Cpu, title: 'ESP32 Integration', desc: 'Simple HTTP API for ESP32, ESP8266, and more.' },
  { icon: LayoutGrid, title: 'Drag & Drop Dashboard', desc: 'Build custom dashboards without writing code.' },
  { icon: Activity, title: 'Realtime Monitoring', desc: 'See sensor data update instantly as it arrives.' },
  { icon: ToggleLeft, title: 'Device Control', desc: 'Send commands to control relays, LEDs, motors.' },
  { icon: History, title: 'Sensor History', desc: 'View and analyze historical sensor data.' },
  { icon: BarChart3, title: 'Charts & Analytics', desc: 'Beautiful charts for temperature, humidity, more.' },
  { icon: Server, title: 'Multiple Devices', desc: 'Manage all your IoT projects in one place.' },
  { icon: GraduationCap, title: 'Student Friendly', desc: 'Designed for learning and education projects.' },
]

const projects = [
  { name: 'Smart Garden', emoji: '🌱', bg: 'bg-success/10', tag: 'Popular', desc: 'Monitor soil moisture and automate watering.', sensors: ['Temperature', 'Humidity', 'Soil Moisture'] },
  { name: 'Smart Trash Bin', emoji: '🗑️', bg: 'bg-accent-500/10', tag: 'Smart City', desc: 'Track fill levels and optimize collection.', sensors: ['Distance', 'Fill Level', 'Motion'] },
  { name: 'Smart Home', emoji: '🏠', bg: 'bg-primary-500/10', tag: 'Home', desc: 'Control lights, fans, and monitor rooms.', sensors: ['Temperature', 'Motion', 'Light'] },
  { name: 'Animal Feeder', emoji: '🐾', bg: 'bg-warning/10', tag: 'Pet Care', desc: 'Automated feeding schedules and monitoring.', sensors: ['Weight', 'Distance'] },
  { name: 'Fire Detection', emoji: '🔥', bg: 'bg-error/10', tag: 'Safety', desc: 'Early fire detection with multi-sensor alerts.', sensors: ['Temperature', 'Gas', 'Flame'] },
  { name: 'Weather Station', emoji: '☁️', bg: 'bg-accent-500/10', tag: 'Environment', desc: 'Track weather conditions in realtime.', sensors: ['Temperature', 'Humidity', 'Pressure'] },
]
</script>
