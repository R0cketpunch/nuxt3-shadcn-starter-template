export const useRealtimeSync = () => {
  // Check if Pusher is configured (preferred for production)
  const hasPusherConfig = typeof window !== 'undefined' && process.env.NUXT_PUBLIC_PUSHER_KEY
  
  // Determine connection type based on environment and configuration
  let connection: any
  let connectionType: string
  
  if (hasPusherConfig) {
    // Use Pusher for real-time sync if configured
    connection = usePusher()
    connectionType = 'pusher'
  } else {
    // Fallback to WebSocket (local) or SSE (production)
    const isDevelopment = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    connection = isDevelopment ? useWebSocket() : useSSE()
    connectionType = isDevelopment ? 'websocket' : 'sse'
  }
  
  return {
    ...connection,
    connectionType
  }
}