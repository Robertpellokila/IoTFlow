<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
    </div>

    <!-- Profile section -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-white mb-4">Profile</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-xl">
            {{ initials }}
          </div>
          <div>
            <div class="font-medium text-white">{{ displayName }}</div>
            <div class="text-sm text-slate-500">{{ user?.email }}</div>
          </div>
        </div>
        <div>
          <label class="label">Full Name</label>
          <input v-model="fullName" type="text" class="input" />
        </div>
        <button class="btn-primary" :disabled="savingProfile" @click="saveProfile">
          <Loader2 v-if="savingProfile" class="w-4 h-4 animate-spin" />
          <span>{{ savingProfile ? 'Saving...' : 'Save Profile' }}</span>
        </button>
      </div>
    </div>

    <!-- Role section -->
    <div class="card p-5">
      <h2 class="text-sm font-semibold text-white mb-4">Account Type</h2>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <component :is="roleIcon" class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <div class="text-sm font-medium text-white capitalize">{{ profile?.role || 'Student' }}</div>
          <div class="text-xs text-slate-500">{{ roleDescription }}</div>
        </div>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="card p-5 border-error/20">
      <h2 class="text-sm font-semibold text-error mb-4">Danger Zone</h2>
      <button class="btn-danger" @click="showSignOutConfirm = true">
        <LogOut class="w-4 h-4" />
        Sign Out
      </button>
    </div>

    <!-- Sign out confirm -->
    <Teleport to="body">
      <div v-if="showSignOutConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showSignOutConfirm = false">
        <div class="card max-w-sm w-full p-6 animate-slide-up">
          <h3 class="text-lg font-semibold text-white mb-2">Sign out?</h3>
          <p class="text-sm text-slate-400 mb-6">You'll need to sign in again to access your devices.</p>
          <div class="flex gap-3">
            <button class="btn-secondary flex-1" @click="showSignOutConfirm = false">Cancel</button>
            <button class="btn-primary flex-1" @click="handleSignOut">Sign Out</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Loader2, LogOut, GraduationCap, Shield, Users } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { user, profile, signOut, fetchProfile } = useAuth()
const supabase = useSupabase()
const toast = useToast()

const fullName = ref(profile.value?.full_name || '')
const savingProfile = ref(false)
const showSignOutConfirm = ref(false)

const displayName = computed(() => profile.value?.full_name || user.value?.email?.split('@')[0] || 'User')
const initials = computed(() => {
  const name = displayName.value
  return name.charAt(0).toUpperCase() + (name.split(' ')[1]?.charAt(0).toUpperCase() || '')
})

const roleIcon = computed(() => {
  const role = profile.value?.role || 'student'
  if (role === 'admin') return Shield
  if (role === 'teacher') return Users
  return GraduationCap
})

const roleDescription = computed(() => {
  const role = profile.value?.role || 'student'
  if (role === 'admin') return 'Full access to all features and settings'
  if (role === 'teacher') return 'Can view student projects and manage classes'
  return 'Create and manage your own IoT projects'
})

async function saveProfile() {
  savingProfile.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.value })
      .eq('id', user.value!.id)
    if (error) throw error
    await fetchProfile()
    toast.success('Profile updated')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

async function handleSignOut() {
  showSignOutConfirm.value = false
  await signOut()
}

onMounted(() => {
  fetchProfile()
})
</script>
