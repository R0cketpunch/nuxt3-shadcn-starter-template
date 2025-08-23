import { initWebSocketServer } from '../websocket'

export default async () => {
  // Initialize WebSocket server on a different port from the main Nuxt app
  const wsPort = process.env.NUXT_WS_PORT ? parseInt(process.env.NUXT_WS_PORT) : 3001
  
  try {
    initWebSocketServer(wsPort)
    console.log('✓ WebSocket server initialized successfully')
  } catch (error) {
    console.error('✗ Failed to initialize WebSocket server:', error)
  }
}