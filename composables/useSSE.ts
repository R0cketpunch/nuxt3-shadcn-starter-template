export const useSSE = () => {
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const clientId = ref<string | null>(null)
  
  let eventSource: EventSource | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let heartbeatTimeout: NodeJS.Timeout | null = null
  let shouldReconnect = true
  
  const connect = () => {
    if (typeof window === 'undefined') return
    
    // Don't connect if we're already connected or connecting
    if (eventSource && eventSource.readyState === EventSource.OPEN) return
    if (eventSource && eventSource.readyState === EventSource.CONNECTING) return
    
    shouldReconnect = true
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
        
        // Start heartbeat monitoring
        startHeartbeatMonitoring()
      }
      
      eventSource.onmessage = (event) => {
        handleMessage(event.data)
      }
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        isConnected.value = false
        
        // Check if the connection is in a failed state
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          connectionStatus.value = 'error'
        } else {
          // Connection is still trying, set as connecting
          connectionStatus.value = 'connecting'
        }
        
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
    shouldReconnect = false
    
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout)
      heartbeatTimeout = null
    }
    
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  const startHeartbeatMonitoring = () => {
    // Reset any existing heartbeat timeout
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout)
    }
    
    // Expect a heartbeat within 10 seconds
    heartbeatTimeout = setTimeout(() => {
      console.log('SSE heartbeat timeout, reconnecting...')
      if (shouldReconnect) {
        // Force reconnection if we haven't received a heartbeat
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
        isConnected.value = false
        connectionStatus.value = 'connecting'
        scheduleReconnect()
      }
    }, 10000)
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
    
    // Shorter reconnect delay for SSE since connections close more frequently on Vercel
    reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect SSE...')
      connect()
    }, 1000)
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
      
      // Reset heartbeat timeout for any received message
      if (message.type === 'heartbeat') {
        startHeartbeatMonitoring()
        return
      }
      
      // Handle timeout message - server is closing connection
      if (message.type === 'timeout') {
        console.log('SSE connection timeout, preparing to reconnect...')
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
        isConnected.value = false
        connectionStatus.value = 'connecting'
        scheduleReconnect()
        return
      }
      
      // Handle special message types
      if (message.type === 'clientId') {
        clientId.value = message.data
        return
      }
      
      // For data messages, also reset heartbeat and route to handler
      startHeartbeatMonitoring()
      
      // Route message to appropriate handler
      const handler = messageHandlers.get(message.type)
      if (handler) {
        handler(message.data)
      }
      
    } catch (error) {
      console.error('Failed to parse SSE message:', error)
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
    clientId: readonly(clientId),
    connect,
    disconnect,
    send,
    onMessage,
    offMessage
  }
}