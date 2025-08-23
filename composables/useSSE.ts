export const useSSE = () => {
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const clientId = ref<string | null>(null)
  
  let eventSource: EventSource | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  
  const connect = () => {
    if (typeof window === 'undefined') return

    connectionStatus.value = 'connecting'
    
    try {
      const sseUrl = `/api/sse?stream=true&clientId=${clientId.value || 'new'}`
      eventSource = new EventSource(sseUrl)
      
      eventSource.onopen = () => {
        console.log('SSE connected')
        isConnected.value = true
        connectionStatus.value = 'connected'
        
        // Clear any pending reconnection
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }
      
      eventSource.onmessage = (event) => {
        handleMessage(event.data)
      }
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        isConnected.value = false
        connectionStatus.value = 'error'
        
        // Close the connection
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
        
        // Attempt to reconnect
        scheduleReconnect()
      }
      
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      connectionStatus.value = 'error'
      scheduleReconnect()
    }
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  const send = async (message: any) => {
    if (!isConnected.value && connectionStatus.value !== 'connecting') {
      return false
    }
    
    try {
      const response = await $fetch('/api/sse', {
        method: 'POST',
        body: {
          ...message,
          clientId: clientId.value
        }
      })
      return true
    } catch (error) {
      console.error('Failed to send SSE message:', error)
      return false
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return
    
    reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect SSE...')
      connect()
    }, 3000)
  }

  const messageHandlers = new Map<string, (data: any) => void>()

  const onMessage = (type: string, handler: (data: any) => void) => {
    messageHandlers.set(type, handler)
  }

  const offMessage = (type: string) => {
    messageHandlers.delete(type)
  }

  const handleMessage = (rawData: string) => {
    try {
      const message = JSON.parse(rawData)
      
      // Handle special message types
      if (message.type === 'clientId') {
        clientId.value = message.data
        return
      }
      
      if (message.type === 'heartbeat') {
        // Heartbeat received, connection is alive
        return
      }
      
      // Route message to appropriate handler
      const handler = messageHandlers.get(message.type)
      if (handler) {
        handler(message.data)
      }
      
    } catch (error) {
      console.error('Failed to parse SSE message:', error)
    }
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    clientId: readonly(clientId),
    connect,
    disconnect,
    send,
    onMessage,
    offMessage
  }
}