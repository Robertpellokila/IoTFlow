import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const deviceId = query.device_id as string
  const token = query.token as string
  const limit = parseInt((query.limit as string) || '50', 10)

  if (!deviceId || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing device_id or token' })
  }

  const supabase = createServerClient()

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id')
    .eq('device_id', deviceId)
    .eq('device_token', token)
    .maybeSingle()

  if (deviceError || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  const { data: sensorData, error: dataError } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('device_id', device.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (dataError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch sensor data' })
  }

  return {
    success: true,
    data: sensorData || [],
  }
})
