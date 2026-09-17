import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const deviceId = query.device_id as string
  const token = query.token as string

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

  const { data: commands, error: cmdError } = await supabase
    .from('commands')
    .select('*')
    .eq('device_id', device.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (cmdError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch commands' })
  }

  return {
    success: true,
    commands: commands || [],
  }
})
