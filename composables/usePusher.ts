import Pusher from 'pusher-js'

export const usePusher = () => {
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  let pusher: Pusher | null = null
  let channel: any = null

  const connect = () => {
    if (typeof window === 'undefined') return
    if (pusher && pusher.connection.state === 'connected') return

    connectionStatus.value = 'connecting'
    
    try {
      pusher = new Pusher(process.env.NUXT_PUBLIC_PUSHER_KEY || '', {
        cluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        encrypted: true
      })

      pusher.connection.bind('connected', () => {
        console.log('Pusher connected')
        isConnected.value = true
        connectionStatus.value = 'connected'
      })

      pusher.connection.bind('disconnected', () => {
        console.log('Pusher disconnected')
        isConnected.value = false
        connectionStatus.value = 'disconnected'
      })

      pusher.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error)
        isConnected.value = false
        connectionStatus.value = 'error'
      })

      // Subscribe to the game channel
      channel = pusher.subscribe('game-state')

    } catch (error) {
      console.error('Failed to initialize Pusher:', error)
      connectionStatus.value = 'error'
    }
  }

  const disconnect = () => {
    if (channel) {
      pusher?.unsubscribe('game-state')
      channel = null
    }
    
    if (pusher) {
      pusher.disconnect()
      pusher = null
    }
    
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  const send = async (eventName: string, data: any) => {
    if (!isConnected.value) {
      console.warn('Pusher not connected, cannot send message')
      return false
    }

    try {
      // Send via API endpoint to trigger Pusher event
      await $fetch('/api/pusher', {
        method: 'POST',
        body: {
          event: eventName,
          data
        }
      })
      return true
    } catch (error) {
      console.error('Failed to send Pusher message:', error)
      return false
    }
  }

  const onMessage = (eventName: string, handler: (data: any) => void) => {
    if (!channel) {
      console.warn('Pusher channel not available')
      return
    }
    
    channel.bind(eventName, handler)
  }

  const offMessage = (eventName: string, handler?: (data: any) => void) => {
    if (!channel) return
    
    if (handler) {
      channel.unbind(eventName, handler)
    } else {
      channel.unbind(eventName)
    }
  }

  // Auto-connect when composable is created
  onMounted(() => {
    connect()
  })

  // Cleanup on unmount
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    connect,
    disconnect,
    send,
    onMessage,
    offMessage
  }
}