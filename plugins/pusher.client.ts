import Pusher from 'pusher-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const pusher = new Pusher(config.public.pusherKey, {
    cluster: config.public.pusherCluster
  })
  
  return {
    provide: {
      pusher
    }
  }
})