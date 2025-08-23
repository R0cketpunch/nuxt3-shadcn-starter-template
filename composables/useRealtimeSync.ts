import type { GameState, GameSettings } from '~/types/game'

export const useRealtimeSync = () => {
  const { $pusher } = useNuxtApp()
  const isConnected = ref(false)
  const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  let channel: any = null
  
  const connect = () => {
    if (!$pusher || channel) return
    
    try {
      console.log('Connecting to Pusher channel: game-channel')
      channel = $pusher.subscribe('game-channel')
      
      // Handle connection events
      $pusher.connection.bind('connected', () => {
        isConnected.value = true
        connectionStatus.value = 'connected'
        console.log('✅ Connected to Pusher successfully')
      })
      
      $pusher.connection.bind('disconnected', () => {
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        console.log('❌ Disconnected from Pusher')
      })
      
      $pusher.connection.bind('error', (err: any) => {
        isConnected.value = false
        connectionStatus.value = 'error'
        console.error('❌ Pusher connection error:', err)
      })
      
      // Handle subscription events
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to game-channel')
      })
      
      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('❌ Subscription error:', err)
        connectionStatus.value = 'error'
      })
      
    } catch (error) {
      connectionStatus.value = 'error'
      console.error('❌ Failed to connect to Pusher:', error)
    }
  }
  
  const disconnect = () => {
    if (channel) {
      $pusher.unsubscribe('game-channel')
      channel = null
    }
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }
  
  const onGameStateUpdate = (callback: (data: { gameState: GameState, timestamp: number }) => void) => {
    if (!channel) return
    
    channel.bind('game-state-update', (data: { gameState: GameState, timestamp: number }) => {
      console.log('Received game state update from Pusher:', data)
      callback(data)
    })
  }
  
  const onSettingsUpdate = (callback: (data: { settings: GameSettings, timestamp: number }) => void) => {
    if (!channel) return
    
    channel.bind('settings-update', (data: { settings: GameSettings, timestamp: number }) => {
      console.log('Received settings update from Pusher:', data)
      callback(data)
    })
  }
  
  const onGameReset = (callback: (data: { timestamp: number }) => void) => {
    if (!channel) return
    
    channel.bind('game-reset', (data: { timestamp: number }) => {
      console.log('Received game reset from Pusher:', data)
      callback(data)
    })
  }
  
  const broadcastGameState = async (gameState: GameState) => {
    try {
      console.log('🚀 Broadcasting game state update:', gameState)
      const response = await $fetch('/api/sync', {
        method: 'POST',
        body: { gameState }
      })
      
      if (response.success) {
        console.log('✅ Game state broadcast successful')
      } else {
        console.error('❌ Failed to broadcast game state:', response)
      }
    } catch (error) {
      console.error('❌ Error broadcasting game state:', error)
    }
  }
  
  const broadcastSettings = async (settings: GameSettings) => {
    try {
      console.log('🚀 Broadcasting settings update:', settings)
      const response = await $fetch('/api/sync', {
        method: 'POST',
        body: { settings }
      })
      
      if (response.success) {
        console.log('✅ Settings broadcast successful')
      } else {
        console.error('❌ Failed to broadcast settings:', response)
      }
    } catch (error) {
      console.error('❌ Error broadcasting settings:', error)
    }
  }
  
  const broadcastReset = async () => {
    try {
      console.log('🚀 Broadcasting game reset')
      const response = await $fetch('/api/sync', {
        method: 'POST',
        body: { reset: true }
      })
      
      if (response.success) {
        console.log('✅ Game reset broadcast successful')
      } else {
        console.error('❌ Failed to broadcast reset:', response)
      }
    } catch (error) {
      console.error('❌ Error broadcasting reset:', error)
    }
  }
  
  return {
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    connect,
    disconnect,
    onGameStateUpdate,
    onSettingsUpdate,
    onGameReset,
    broadcastGameState,
    broadcastSettings,
    broadcastReset
  }
}