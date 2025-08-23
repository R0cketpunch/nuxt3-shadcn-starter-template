import { initWebSocketServer } from '../websocket'

export default async () => {
  // Only initialize WebSocket server in development mode
  // In production (Vercel), we use SSE instead
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (!isDevelopment) {
    console.log('⚡ Using SSE for production deployment')
    return
  }
  
  // Initialize WebSocket server on a different port from the main Nuxt app
  const wsPort = process.env.NUXT_WS_PORT ? parseInt(process.env.NUXT_WS_PORT) : 3001
  
  try {
    initWebSocketServer(wsPort)
    console.log('✓ WebSocket server initialized successfully')
  } catch (error) {
    console.error('✗ Failed to initialize WebSocket server:', error)
  }
}