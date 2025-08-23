import Pusher from 'pusher'

let pusherInstance: Pusher | null = null

export function getPusher() {
  if (!pusherInstance) {
    const config = useRuntimeConfig()
    
    pusherInstance = new Pusher({
      appId: config.pusherAppId,
      key: config.public.pusherKey,
      secret: config.pusherSecret,
      cluster: config.public.pusherCluster,
      useTLS: true
    })
  }
  
  return pusherInstance
}