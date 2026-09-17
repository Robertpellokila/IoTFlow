import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '~/types/database'

export function useAuth() {
  const supabase = useSupabase()
  const user = useState<User | null>('auth_user', () => null)
  const session = useState<Session | null>('auth_session', () => null)
  const profile = useState<Profile | null>('auth_profile', () => null)
  const loading = useState<boolean>('auth_loading', () => true)

  async function fetchProfile() {
    if (!user.value) {
      profile.value = null
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle()

    if (!error && data) {
      profile.value = data as Profile
    }
  }

  async function init() {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    user.value = currentSession?.user ?? null
    if (user.value) await fetchProfile()
    loading.value = false

    supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        session.value = newSession
        user.value = newSession?.user ?? null
        if (user.value) {
          await fetchProfile()
        } else {
          profile.value = null
        }
        loading.value = false
      })()
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
    user.value = data.user
    if (user.value) await fetchProfile()
    return data
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    if (data.user) {
      session.value = data.session
      user.value = data.user
    }
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
    profile.value = null
    navigateTo('/login')
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return {
    user,
    session,
    profile,
    loading,
    init,
    signIn,
    signUp,
    signOut,
    resetPassword,
    fetchProfile,
  }
}
