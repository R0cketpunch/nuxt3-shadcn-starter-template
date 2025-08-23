export const useRealtimeSync = () => {
  // Detect if we're running in development (with WebSocket) or production (with SSE)
  const isDevelopment = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  
  // Use WebSocket for local development, SSE for production/Vercel
  const connection = isDevelopment ? useWebSocket() : useSSE()
  
  return {
    ...connection,
    connectionType: isDevelopment ? 'websocket' : 'sse'
  }
}