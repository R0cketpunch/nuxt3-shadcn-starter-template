// Simple HTTP-based state synchronization
let gameState: any = null
let settings: any = null
let lastUpdateTime = Date.now()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'GET') {
    // Client requesting current state
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
  
  if (method === 'POST') {
    // Client updating state
    const body = await readBody(event)
    
    if (body.gameState !== undefined) {
      gameState = body.gameState
      lastUpdateTime = Date.now()
      console.log('Game state updated via sync API')
    }
    
    if (body.settings !== undefined) {
      settings = body.settings
      lastUpdateTime = Date.now()
      console.log('Settings updated via sync API')
    }
    
    if (body.reset) {
      gameState = null
      settings = null
      lastUpdateTime = Date.now()
      console.log('Game reset via sync API')
    }
    
    return {
      success: true,
      lastUpdate: lastUpdateTime
    }
  }
  
  return { error: 'Method not supported' }
})