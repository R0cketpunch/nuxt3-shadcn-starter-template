import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

interface GameStateMessage {
  type: 'gameState' | 'settings' | 'reset'
  data: any
  timestamp: number
  clientId: string
}

interface ClientConnection {
  ws: WebSocket
  id: string
  lastSeen: number
}

let wss: WebSocketServer | null = null
let gameState: any = null
let settings: any = null
let connections: Map<string, ClientConnection> = new Map()

const generateClientId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

const broadcastToOthers = (message: GameStateMessage, excludeId: string) => {
  const payload = JSON.stringify(message)
  connections.forEach((client, id) => {
    if (id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload)
    }
  })
}

export const initWebSocketServer = (port: number = 3001) => {
  if (wss) return wss

  const server = createServer()
  wss = new WebSocketServer({ server })
  
  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId()
    console.log(`WebSocket client connected: ${clientId}`)
    
    connections.set(clientId, {
      ws,
      id: clientId,
      lastSeen: Date.now()
    })

    // Send current state to new client
    if (gameState || settings) {
      ws.send(JSON.stringify({
        type: 'initial',
        data: {
          gameState,
          settings
        },
        timestamp: Date.now(),
        clientId: 'server'
      }))
    }

    // Send client their ID
    ws.send(JSON.stringify({
      type: 'clientId',
      data: clientId,
      timestamp: Date.now(),
      clientId: 'server'
    }))

    ws.on('message', (data: Buffer) => {
      try {
        const message: GameStateMessage = JSON.parse(data.toString())
        
        // Update server state
        if (message.type === 'gameState') {
          gameState = message.data
        } else if (message.type === 'settings') {
          settings = message.data
        } else if (message.type === 'reset') {
          gameState = null
          settings = null
        }

        // Broadcast to other clients
        broadcastToOthers(message, clientId)
        
        // Update client's last seen time
        const client = connections.get(clientId)
        if (client) {
          client.lastSeen = Date.now()
        }
        
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    })

    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`)
      connections.delete(clientId)
    })

    ws.on('error', (error) => {
      console.error(`WebSocket client error (${clientId}):`, error)
      connections.delete(clientId)
    })
  })

  server.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`)
  })

  // Cleanup inactive connections every minute
  setInterval(() => {
    const now = Date.now()
    const timeout = 60000 // 1 minute
    
    connections.forEach((client, id) => {
      if (now - client.lastSeen > timeout && client.ws.readyState !== WebSocket.OPEN) {
        console.log(`Cleaning up inactive connection: ${id}`)
        connections.delete(id)
      }
    })
  }, 60000)

  return wss
}

export const getConnectedClientsCount = (): number => {
  return connections.size
}

export const getGameState = () => gameState
export const getSettings = () => settings