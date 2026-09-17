import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const { device_id, token, command_id, status } = body as {
    device_id?: string
    token?: string
    command_id?: string
    status?: string
  }

  if (!device_id || !token || !command_id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const supabase = createServerClient()

  const { data: device, error } = await supabase
    .from('devices')
    .select('id')
    .eq('device_id', device_id)
    .eq('device_token', token)
    .maybeSingle()

  if (error || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  const { error: updateError } = await supabase
    .from('commands')
    .update({
      status,
      executed_at: new Date().toISOString(),
    })
    .eq('id', command_id)
    .eq('device_id', device.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update command status' })
  }

  return { success: true }
})
