import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  // Gunakan alias 'esp32_id' agar tidak tertukar dengan 'device.id' (UUID) di bawah
  const { device_id: esp32_id, token, command_id, status } = body as {
    device_id?: string
    token?: string
    command_id?: string
    status?: string
  }

  if (!esp32_id || !token || !command_id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Langsung panggil tanpa import, persis seperti kodemu sebelumnya
  const supabase = createServerClient()

  // TAHAP 1: Cari UUID perangkat berdasarkan device_id (ESP32-Z0R87I)
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id')
    .eq('device_id', esp32_id) 
    .eq('device_token', token)
    .maybeSingle()

  if (deviceError || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  // TAHAP 2: Update status command menggunakan UUID (device.id)
  const { error: updateError } = await supabase
    .from('commands')
    .update({
      status,
      executed_at: new Date().toISOString(),
    })
    .eq('id', command_id)
    .eq('device_id', device.id) // <-- Gunakan device.id (UUID), BUKAN esp32_id

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update command status' })
  }

  return { success: true }
})