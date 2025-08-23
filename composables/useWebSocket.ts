export const useWebSocket = () => {
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const clientId = ref<string | null>(null)
  
  let ws: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let heartbeatTimer: NodeJS.Timeout | null = null
  
  const wsUrl = computed(() => {
    if (typeof window === 'undefined') return ''
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsPort = process.env.NODE_ENV === 'production' ? window.location.port : '3001'
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:${wsPort}`
  })

  const connect = () => {
    if (typeof window === 'undefined') return

    connectionStatus.value = 'connecting'
    
    try {
      ws = new WebSocket(wsUrl.value)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        connectionStatus.value = 'connected'
        
        // Start heartbeat
        startHeartbeat()
        
        // Clear any pending reconnection
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason)
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        
        // Stop heartbeat
        stopHeartbeat()
        
        // Attempt to reconnect after 3 seconds if not manually closed
        if (event.code !== 1000 && event.code !== 1001) {
          scheduleReconnect()
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        connectionStatus.value = 'error'
        scheduleReconnect()
      }
      
      ws.onmessage = (event) => {
        handleMessage(event.data)
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      connectionStatus.value = 'error'
      scheduleReconnect()
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close(1000, 'Manual disconnect')
      ws = null
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    stopHeartbeat()
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  const send = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return
    
    reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...')
      connect()
    }, 3000)
  }

  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
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
      
      if (message.type === 'pong') {
        // Heartbeat response, connection is alive
        return
      }
      
      // Route message to appropriate handler
      const handler = messageHandlers.get(message.type)
      if (handler) {
        handler(message.data)
      }
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
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