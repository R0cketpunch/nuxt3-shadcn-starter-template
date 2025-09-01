import Pusher from 'pusher'
import type { GameState, GameSettings } from '~/types/game'

let pusherInstance: Pusher | null = null

// Simple in-memory storage for current state
let currentGameState: GameState | null = null
let currentSettings: GameSettings | null = null
let lastStateUpdate = 0
let lastSettingsUpdate = 0

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

export function setCurrentGameState(gameState: GameState) {
  currentGameState = gameState
  lastStateUpdate = Date.now()
}

export function setCurrentSettings(settings: GameSettings) {
  currentSettings = settings
  lastSettingsUpdate = Date.now()
}

export function getCurrentGameState() {
  return {
    gameState: currentGameState,
    settings: currentSettings,
    lastStateUpdate,
    lastSettingsUpdate
  }
}