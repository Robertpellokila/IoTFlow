<template>
  <div class="min-h-screen flex" style="background-color: #f4f4f6;">
    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      style="background-color: #ffffff; border-right: 2px solid #e2e2e6; box-shadow: 4px 0 24px rgba(0,0,0,0.08);"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-5 border-b border-border flex-shrink-0">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <Radio class="w-5 h-5 text-white" />
          </div>
          <span class="text-lg font-bold text-white">IoTFlow</span>
        </NuxtLink>
        <button class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-background-hover" @click="sidebarOpen = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-item"
          :class="isActive(item.path) ? 'sidebar-item-active' : ''"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>

        <div class="pt-4 mt-4 border-t border-border">
          <div class="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resources</div>
          <NuxtLink
            to="/projects"
            class="sidebar-item"
            :class="isActive('/projects') ? 'sidebar-item-active' : ''"
            @click="sidebarOpen = false"
          >
            <FolderKanban class="w-4 h-4 flex-shrink-0" />
            <span>My Projects</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- User card -->
      <div class="flex-shrink-0 p-3 relative" style="border-top: 2px solid #e2e2e6; background-color: #f7f7f9;">
        <div
          class="flex items-center gap-3 p-2 rounded-xl hover:bg-background-hover transition-colors cursor-pointer"
          @click="showUserMenu = !showUserMenu"
        >
          <div class="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm flex-shrink-0">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ displayName }}</div>
            <div class="text-xs text-slate-500 truncate">{{ user?.email }}</div>
          </div>
          <ChevronUp class="w-4 h-4 text-slate-400 flex-shrink-0" :class="showUserMenu ? 'rotate-180' : ''" style="transition: transform 0.2s" />
        </div>

        <Transition name="dropdown">
          <div v-if="showUserMenu" class="absolute bottom-20 left-3 right-3 card p-2 shadow-xl z-50">
            <NuxtLink to="/settings" class="sidebar-item" @click="showUserMenu = false; sidebarOpen = false">
              <Settings class="w-4 h-4" />
              <span>Settings</span>
            </NuxtLink>
            <button class="sidebar-item w-full text-error" @click="handleSignOut">
              <LogOut class="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </Transition>
      </div>
    </aside>

    <!-- Overlay (click to close sidebar) -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30"
        @click="sidebarOpen = false"
      ></div>
    </Transition>

    <!-- Main content — always full width, sidebar overlays on top -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Topbar -->
      <header class="sticky top-0 z-20 h-16 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6" style="background-color: rgba(255,255,255,0.92); border-bottom: 2px solid #e2e2e6;">
        <div class="flex items-center gap-3 flex-1">
          <!-- Hamburger — always visible -->
          <button
            class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-background-hover transition-colors flex-shrink-0"
            @click="sidebarOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Brand (shown when sidebar closed) -->
          <NuxtLink to="/dashboard" class="flex items-center gap-2 mr-2">
            <div class="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <Radio class="w-4 h-4 text-white" />
            </div>
            <span class="text-sm font-bold text-white hidden sm:block">IoTFlow</span>
          </NuxtLink>

          <div class="relative max-w-md flex-1 hidden sm:block">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search devices, dashboards..."
              class="input pl-10 py-2 text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-elevated border border-border">
            <span class="status-online"></span>
            <span class="text-xs text-slate-400 hidden sm:inline">Connected</span>
          </div>

          <button class="relative p-2 rounded-lg hover:bg-background-hover transition-colors">
            <Bell class="w-5 h-5 text-slate-500" />
            <span v-if="unreadAlerts > 0" class="absolute top-1 right-1 w-2 h-2 rounded-full bg-error"></span>
          </button>

          <div
            class="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm cursor-pointer"
            @click="sidebarOpen = true"
          >
            {{ initials }}
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Radio, X, Menu, Search, Bell, ChevronUp, Settings, LogOut,
  LayoutDashboard, Cpu, LayoutGrid, FileStack, Database,
  BellRing, FolderKanban, BookMarked
} from 'lucide-vue-next'

const { user, profile, signOut } = useAuth()
const route = useRoute()

const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const unreadAlerts = ref(0)

const navItems = [
  { label: 'Overview',     path: '/dashboard',   icon: LayoutDashboard },
  { label: 'My Devices',   path: '/devices',     icon: Cpu },
  { label: 'Dashboards',   path: '/dashboards',  icon: LayoutGrid },
  { label: 'Templates',    path: '/templates',   icon: FileStack },
  { label: 'Data',         path: '/data',        icon: Database },
  { label: 'Alerts',       path: '/alerts',      icon: BellRing },
  { label: 'Setup Guide',  path: '/setup-guide', icon: BookMarked },
  { label: 'Settings',     path: '/settings',    icon: Settings },
]

const displayName = computed(() => profile.value?.full_name || user.value?.email?.split('@')[0] || 'User')
const initials = computed(() => {
  const name = displayName.value
  return name.charAt(0).toUpperCase() + (name.split(' ')[1]?.charAt(0).toUpperCase() || '')
})

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

async function handleSignOut() {
  showUserMenu.value = false
  await signOut()
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
