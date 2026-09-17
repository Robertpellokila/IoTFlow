import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request body' })
  }

  const { device_id, token, data } = body as {
    device_id?: string
    token?: string
    data?: Record<string, unknown>
  }

  if (!device_id || !token || !data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: device_id, token, data',
    })
  }

  const supabase = createServerClient()

  // Validate device by device_id and token
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, device_id, device_token, status, user_id')
    .eq('device_id', device_id)
    .eq('device_token', token)
    .maybeSingle()

  if (deviceError || !device) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid device credentials' })
  }

  // Update device status and last_seen
  const { error: updateError } = await supabase
    .from('devices')
    .update({
      status: 'online',
      last_seen: new Date().toISOString(),
    })
    .eq('id', device.id)

  if (updateError) {
    console.error('Failed to update device status:', updateError.message)
  }

  // Store sensor data
  const { error: insertError } = await supabase
    .from('sensor_data')
    .insert({
      device_id: device.id,
      data,
    })

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to store sensor data' })
  }

  // Check alert rules
  try {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('device_id', device.id)
      .eq('status', 'active')
      .not('rule_config', 'is', null)

    if (alerts && alerts.length > 0) {
      for (const alert of alerts) {
        const rule = alert.rule_config as { field?: string; operator?: string; threshold?: number }
        if (rule?.field && rule?.operator && rule?.threshold !== undefined) {
          const value = data[rule.field]
          if (typeof value === 'number') {
            let triggered = false
            switch (rule.operator) {
              case '>': triggered = value > rule.threshold; break
              case '<': triggered = value < rule.threshold; break
              case '>=': triggered = value >= rule.threshold; break
              case '<=': triggered = value <= rule.threshold; break
              case '==': triggered = value === rule.threshold; break
            }
            if (triggered) {
              await supabase.from('alerts').insert({
                device_id: device.id,
                user_id: device.user_id,
                type: 'threshold',
                message: `${rule.field} ${rule.operator} ${rule.threshold} (current: ${value})`,
                value: String(value),
                status: 'active',
              })
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Alert check failed:', e)
  }

  return {
    success: true,
    message: 'Data received',
    device_id: device.device_id,
    timestamp: new Date().toISOString(),
  }
})
