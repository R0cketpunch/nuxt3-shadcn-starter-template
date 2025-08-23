import Pusher from 'pusher'

// Initialize Pusher server instance
const pusher = new Pusher({
  appId: process.env.NUXT_PUSHER_APP_ID || '',
  key: process.env.NUXT_PUSHER_KEY || '',
  secret: process.env.NUXT_PUSHER_SECRET || '',
  cluster: process.env.NUXT_PUSHER_CLUSTER || 'us2',
  useTLS: true
})

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const { event: eventName, data } = body
      
      if (!eventName) {
        return { error: 'Event name is required' }
      }
      
      // Trigger the event on the game-state channel
      await pusher.trigger('game-state', eventName, {
        ...data,
        timestamp: Date.now()
      })
      
      console.log(`Pusher event triggered: ${eventName}`)
      
      return {
        success: true,
        event: eventName,
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error('Pusher API error:', error)
      return { 
        error: 'Failed to trigger event',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return { error: 'Method not supported' }
})