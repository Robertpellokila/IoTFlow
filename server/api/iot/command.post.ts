import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const { device_id, token, command, value } = body as {
    device_id?: string
    token?: string
    command?: string
    value?: unknown
  }

  if (!device_id || !token || !command) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: device_id, token, command',
    })
  }

  const supabase = createServerClient()

  const { data: device, error } = await supabase
    .from('devices')
    .select('id, device_id, device_token')
    .eq('device_id', device_id)
    .eq('device_token', token)
    .maybeSingle()

  if (error || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  const { data: cmd, error: insertError } = await supabase
    .from('commands')
    .insert({
      device_id: device.id,
      command,
      value,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create command' })
  }

  return {
    success: true,
    command: cmd,
  }
})
