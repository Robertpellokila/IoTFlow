import type { Device, DeviceType } from '~/types/database'

export function useDevices() {
  const supabase = useSupabase()
  const devices = useState<Device[]>('devices', () => [])
  const loading = useState<boolean>('devices_loading', () => false)
  const error = useState<string | null>('devices_error', () => null)

  async function fetchDevices() {
    loading.value = true
    error.value = null
    const { data, error: fetchError } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      error.value = fetchError.message
    } else {
      devices.value = (data || []) as Device[]
    }
    loading.value = false
  }

  async function fetchDevice(id: string): Promise<Device | null> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data as Device | null
  }

  async function createDevice(name: string, deviceType: DeviceType): Promise<Device> {
    const deviceId = `ESP32-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const deviceToken = generateToken()

    const { data, error } = await supabase
      .from('devices')
      .insert({
        name,
        device_id: deviceId,
        device_token: deviceToken,
        device_type: deviceType,
        status: 'offline',
      })
      .select()
      .single()

    if (error) throw error
    await fetchDevices()
    return data as Device
  }

  async function updateDevice(id: string, updates: Partial<Device>) {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await fetchDevices()
    return data as Device
  }

  async function deleteDevice(id: string) {
    const { error } = await supabase.from('devices').delete().eq('id', id)
    if (error) throw error
    await fetchDevices()
  }

  function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)]
    }
    return token
  }

  function subscribeToDeviceStatus(callback: (payload: { eventType: string; new: Device; old: Device }) => void) {
    return supabase
      .channel('devices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, callback)
      .subscribe()
  }

  return {
    devices,
    loading,
    error,
    fetchDevices,
    fetchDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    subscribeToDeviceStatus,
  }
}
