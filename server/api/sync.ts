export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'POST') {
    // Client updating state - broadcast via Pusher
    const body = await readBody(event)
    const pusher = getPusher()
    
    try {
      if (body.gameState !== undefined) {
        await pusher.trigger('game-channel', 'game-state-update', {
          gameState: body.gameState,
          timestamp: Date.now()
        })
        console.log('Game state broadcasted via Pusher')
      }
      
      if (body.settings !== undefined) {
        await pusher.trigger('game-channel', 'settings-update', {
          settings: body.settings,
          timestamp: Date.now()
        })
        console.log('Settings broadcasted via Pusher')
      }
      
      if (body.reset) {
        await pusher.trigger('game-channel', 'game-reset', {
          timestamp: Date.now()
        })
        console.log('Game reset broadcasted via Pusher')
      }
      
      return {
        success: true,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Pusher broadcast error:', error)
      return { 
        error: 'Failed to broadcast state change',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return { error: 'Method not supported' }
})