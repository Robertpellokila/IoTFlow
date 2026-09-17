import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const config = useRuntimeConfig()
  const url = config.supabaseUrl || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseServiceRoleKey

  if (!url || !serviceKey) {
    throw new Error('Server Supabase configuration missing')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
