import type { SensorData } from '~/types/database'

let channelCounter = 0

function uniqueChannelName(base: string): string {
  channelCounter += 1
  return `${base}-${channelCounter}`
}

export function useRealtime() {
  const supabase = useSupabase()

  function subscribeToSensorData(
    deviceId: string,
    callback: (payload: SensorData) => void,
    onError?: (err: Error) => void
  ) {
    const channel = supabase
      .channel(uniqueChannelName(`sensor-data-${deviceId}`))
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data', filter: `device_id=eq.${deviceId}` },
        (payload) => {
          callback(payload.new as SensorData)
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && onError) {
          onError(new Error('Realtime connection failed'))
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  function subscribeToCommands(
    deviceId: string,
    callback: (payload: { eventType: string; new: unknown }) => void
  ) {
    const channel = supabase
      .channel(uniqueChannelName(`commands-${deviceId}`))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commands', filter: `device_id=eq.${deviceId}` },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  function subscribeToDeviceStatus(
    callback: (payload: { eventType: string; new: unknown }) => void
  ) {
    const channel = supabase
      .channel(uniqueChannelName('device-status'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'devices' },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    subscribeToSensorData,
    subscribeToCommands,
    subscribeToDeviceStatus,
  }
}
