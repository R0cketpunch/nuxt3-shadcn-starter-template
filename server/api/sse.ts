// Server-Sent Events for real-time synchronization on Vercel
let gameState: any = null
let settings: any = null
let lastUpdateTime = Date.now()

// Store active SSE connections
const activeConnections = new Map<string, { 
  res: any, 
  lastSeen: number,
  clientId: string 
}>()

// Note: On Vercel, serverless functions have limited execution time
// So we use a simpler approach for connection management

const broadcastToOthers = (message: any, excludeClientId: string) => {
  const data = JSON.stringify(message)
  let sentCount = 0
  
  activeConnections.forEach((conn, id) => {
    if (conn.clientId !== excludeClientId) {
      try {
        conn.res.write(`data: ${data}\n\n`)
        sentCount++
      } catch (error) {
        // Connection broken, remove it
        activeConnections.delete(id)
      }
    }
  })
  
  console.log(`Broadcasted SSE message to ${sentCount} clients`)
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const url = getRequestURL(event)
  
  // Handle SSE connection
  if (method === 'GET' && url.searchParams.get('stream') === 'true') {
    const clientId = url.searchParams.get('clientId') || `sse-${Math.random().toString(36).substring(7)}`
    
    console.log(`SSE client connected: ${clientId}`)
    
    // Set SSE headers
    setHeader(event, 'Content-Type', 'text/event-stream')
    setHeader(event, 'Cache-Control', 'no-cache')
    setHeader(event, 'Connection', 'keep-alive')
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')
    
    // Store connection
    const connection = {
      res: event.node.res,
      lastSeen: Date.now(),
      clientId
    }
    activeConnections.set(clientId, connection)
    
    // Send initial state if available
    if (gameState || settings) {
      const initialMessage = {
        type: 'initial',
        data: {
          gameState,
          settings
        },
        timestamp: Date.now(),
        clientId: 'server'
      }
      event.node.res.write(`data: ${JSON.stringify(initialMessage)}\n\n`)
    }
    
    // Send client ID
    const clientIdMessage = {
      type: 'clientId',
      data: clientId,
      timestamp: Date.now(),
      clientId: 'server'
    }
    event.node.res.write(`data: ${JSON.stringify(clientIdMessage)}\n\n`)
    
    // Keep connection alive with periodic heartbeat
    // Note: Vercel has a 10-second timeout for serverless functions
    // So we send heartbeats more frequently and handle timeouts gracefully
    const heartbeatInterval = setInterval(() => {
      try {
        event.node.res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`)
        connection.lastSeen = Date.now()
      } catch (error) {
        clearInterval(heartbeatInterval)
        activeConnections.delete(clientId)
      }
    }, 5000) // Send heartbeat every 5 seconds
    
    // Handle client disconnect
    event.node.req.on('close', () => {
      console.log(`SSE client disconnected: ${clientId}`)
      clearInterval(heartbeatInterval)
      activeConnections.delete(clientId)
    })
    
    // Automatically close connection after 25 seconds to avoid Vercel timeout
    const autoCloseTimeout = setTimeout(() => {
      console.log(`SSE connection auto-closed to avoid timeout: ${clientId}`)
      clearInterval(heartbeatInterval)
      activeConnections.delete(clientId)
      try {
        event.node.res.end()
      } catch (error) {
        // Connection may already be closed
      }
    }, 25000) // Close after 25 seconds
    
    // Clean up timeout if connection closes naturally
    event.node.req.on('close', () => {
      clearTimeout(autoCloseTimeout)
    })
    
    // Don't end the response, keep it open for streaming
    return new Promise(() => {}) // Keep the connection alive
  }
  
  // Handle state updates via POST
  if (method === 'POST') {
    const body = await readBody(event)
    const clientId = body.clientId || 'unknown'
    
    let message: any = null
    
    if (body.type === 'gameState' && body.data !== undefined) {
      gameState = body.data
      lastUpdateTime = Date.now()
      message = {
        type: 'gameState',
        data: gameState,
        timestamp: lastUpdateTime,
        clientId
      }
      console.log('Game state updated via SSE API')
    }
    
    if (body.type === 'settings' && body.data !== undefined) {
      settings = body.data
      lastUpdateTime = Date.now()
      message = {
        type: 'settings',
        data: settings,
        timestamp: lastUpdateTime,
        clientId
      }
      console.log('Settings updated via SSE API')
    }
    
    if (body.type === 'reset') {
      gameState = null
      settings = null
      lastUpdateTime = Date.now()
      message = {
        type: 'reset',
        data: null,
        timestamp: lastUpdateTime,
        clientId
      }
      console.log('Game reset via SSE API')
    }
    
    // Broadcast to other clients
    if (message) {
      broadcastToOthers(message, clientId)
    }
    
    return {
      success: true,
      lastUpdate: lastUpdateTime,
      activeConnections: activeConnections.size
    }
  }
  
  // Handle regular GET requests (for compatibility)
  if (method === 'GET') {
    const clientLastUpdate = getQuery(event).lastUpdate as string
    const clientTime = clientLastUpdate ? parseInt(clientLastUpdate) : 0
    
    if (lastUpdateTime > clientTime) {
      return {
        gameState,
        settings,
        lastUpdate: lastUpdateTime
      }
    } else {
      return {
        noChanges: true,
        lastUpdate: lastUpdateTime
      }
    }
  }
  
  return { error: 'Method not supported' }
})