import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const deviceId = query.device_id as string
  const token = query.token as string

  if (!deviceId || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing device_id or token' })
  }

  const supabase = createServerClient()

  const { data: device, error } = await supabase
    .from('devices')
    .select('id, device_id, device_token, name, device_type, status, last_seen, firmware_version, ip_address, uptime, battery')
    .eq('device_id', deviceId)
    .eq('device_token', token)
    .maybeSingle()

  if (error || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  return {
    success: true,
    device: {
      id: device.id,
      device_id: device.device_id,
      name: device.name,
      device_type: device.device_type,
      status: device.status,
      last_seen: device.last_seen,
      firmware_version: device.firmware_version,
      ip_address: device.ip_address,
      uptime: device.uptime,
      battery: device.battery,
    },
  }
})
