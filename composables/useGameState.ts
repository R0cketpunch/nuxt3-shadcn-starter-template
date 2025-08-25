import type { GameState, House, GameSettings, SubPhase } from '~/types/game'
import { GAME_PHASES, WESTEROS_SUBPHASES, PLANNING_SUBPHASES, ACTION_SUBPHASES, MAX_ROUNDS, getStartingIronThroneOrder, getStartingFiefdomsOrder, getStartingKingsCourtOrder, STARTING_WILDLING_THREAT } from '~/types/game'

const STORAGE_KEY = 'agot-gm-game-state'
const SETTINGS_KEY = 'agot-gm-settings'

// Global event deduplication - track last processed timestamp for each action type
const lastProcessedTimerAction: Record<string, number> = {
  start: 0,
  pause: 0,
  resume: 0,
  reset: 0,
  addTime: 0
}

export const useGameState = () => {
  const realtimeSync = useRealtimeSync()
  const gameAudio = useGameAudio()
  const initialGameState: GameState = {
    currentRound: 1,
    currentPhase: GAME_PHASES[0], // Westeros phase
    currentSubPhase: undefined,
    currentPlayerIndex: 0,
    ironThroneOrder: [],
    fiefdomsOrder: [],
    kingsCourtOrder: [],
    wildlingThreat: STARTING_WILDLING_THREAT,
    timeRemaining: 0,
    isPaused: false,
    isTimerActive: false
  }
  
  const initialSettings: GameSettings = {
    audioEnabled: true,
    visualAlertsEnabled: true,
    darkTheme: false,
    assignOrdersDuration: 480 // 8 minutes default
  }
  
  const gameState = ref<GameState>({ ...initialGameState })
  const settings = ref<GameSettings>({ ...initialSettings })
  
  // Load state from localStorage
  const loadGameState = () => {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        gameState.value = { ...initialGameState, ...parsed }
      }
      
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        settings.value = { ...initialSettings, ...parsedSettings }
      }
    } catch (error) {
      console.warn('Failed to load game state:', error)
    }
  }
  
  // Save state to localStorage
  const saveGameState = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.value))
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.warn('Failed to save game state:', error)
    }
  }
  
  // Watch for changes and auto-save
  watch(gameState, saveGameState, { deep: true })
  watch(settings, saveGameState, { deep: true })
  
  // Broadcast state changes to other devices via Pusher
  const broadcastStateChange = () => {
    if (typeof window !== 'undefined') {
      realtimeSync.broadcastGameState(gameState.value)
    }
  }
  
  // Track if listeners are already set up to prevent duplicates
  let listenersInitialized = false
  
  // Listen for state changes from other devices via Pusher
  const listenForStateChanges = () => {
    if (typeof window !== 'undefined' && !listenersInitialized) {
      listenersInitialized = true
      
      // Connect to Pusher
      realtimeSync.connect()
      
      // Listen for game state updates from other devices
      realtimeSync.onGameStateUpdate(({ gameState: newState, timestamp }) => {
        gameState.value = { ...initialGameState, ...newState }
      })
      
      // Listen for settings updates from other devices
      realtimeSync.onSettingsUpdate(({ settings: newSettings, timestamp }) => {
        settings.value = { ...initialSettings, ...newSettings }
      })
      
      // Listen for game reset from other devices
      realtimeSync.onGameReset(({ timestamp }) => {
        gameState.value = { ...initialGameState }
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
      })
      
      // Listen for timer actions from other devices
      realtimeSync.onTimerAction(({ action, duration, timeAdjustment, timestamp, serverTime }) => {
        // Check if we've already processed this timestamp for this action type
        const lastTimestamp = lastProcessedTimerAction[action] || 0
        if (lastTimestamp >= timestamp) {
          console.warn('🔄 Duplicate timer event ignored:', action)
          return
        }
        
        // Mark this timestamp as processed for this action type
        lastProcessedTimerAction[action] = timestamp
        
        const timer = useGlobalGameTimer()
        
        // Calculate time drift to sync with the remote device
        const timeDrift = Date.now() - serverTime
        
        switch (action) {
          case 'start':
            if (duration) {
              // Ensure audio is ready when timer starts
              const gameAudio = useGameAudio()
              gameAudio.ensureAudioReady().then(ready => {
                console.log(`Audio ready: ${ready}`)
              }).catch(console.warn)
              
              // Skip start sound here since it's already played by the initiating device
              timer.startTimer(duration, true, undefined, true)
            }
            break
          case 'pause':
            timer.pauseTimer()
            break
          case 'resume':
            timer.resumeTimer()
            break
          case 'reset':
            if (duration) {
              timer.resetTimer(duration, true)
            }
            break
          case 'addTime':
            if (timeAdjustment !== undefined) {
              timer.addTime(timeAdjustment)
            } else {
              console.warn('❌ addTime action but no timeAdjustment value');
            }
            break
        }
      })
      
      // Return cleanup function
      return () => {
        realtimeSync.disconnect()
      }
    }
    return () => {}
  }
  
  const initializeGame = (selectedHouses: House[]) => {
    const playerCount = selectedHouses.length
    
    // Get the predefined starting orders for all three tracks
    const startingIronThrone = getStartingIronThroneOrder(playerCount)
    const startingFiefdoms = getStartingFiefdomsOrder(playerCount)
    const startingKingsCourt = getStartingKingsCourtOrder(playerCount)
    
    // Map the predefined orders to the actual selected houses with player names
    const ironThroneOrder = startingIronThrone.map(predefinedHouse => {
      const selectedHouse = selectedHouses.find(h => h.id === predefinedHouse.id)
      return selectedHouse || predefinedHouse
    })
    
    const fiefdomsOrder = startingFiefdoms.map(predefinedHouse => {
      const selectedHouse = selectedHouses.find(h => h.id === predefinedHouse.id)
      return selectedHouse || predefinedHouse
    })
    
    const kingsCourtOrder = startingKingsCourt.map(predefinedHouse => {
      const selectedHouse = selectedHouses.find(h => h.id === predefinedHouse.id)
      return selectedHouse || predefinedHouse
    })
    
    gameState.value = {
      ...initialGameState,
      ironThroneOrder,
      fiefdomsOrder,
      kingsCourtOrder,
      wildlingThreat: STARTING_WILDLING_THREAT,
      currentPhase: GAME_PHASES[1], // Start with Planning phase in round 1 (Westeros is skipped)
      currentSubPhase: PLANNING_SUBPHASES[0], // Start with Assign Orders
      gameStartTime: Date.now() // Save timestamp when game starts
    }
    
    // Explicitly broadcast the new game state
    broadcastStateChange()
    
    // Auto-start the Assign Orders timer when game initializes
    setTimeout(() => {
      realtimeSync.broadcastTimerAction('start', settings.value.assignOrdersDuration)
    }, 1000) // Delay to ensure game state is fully set up
  }
  
  const nextPhase = () => {
    const wasRoundAdvance = gameState.value.currentPhase.id === 'action' && gameState.value.currentRound < MAX_ROUNDS
    
    if (gameState.value.currentPhase.id === 'action') {
      // End of round, advance to next round
      if (gameState.value.currentRound < MAX_ROUNDS) {
        gameState.value.currentRound++
        gameState.value.currentPhase = GAME_PHASES[0] // Back to Westeros
        gameState.value.currentSubPhase = gameState.value.currentRound === 1 ? undefined : WESTEROS_SUBPHASES[0]
        gameState.value.currentPlayerIndex = 0
        // Play round transition sound
        gameAudio.playPhaseSound('round')
      } else {
        // Game has ended (reached max rounds)
        gameAudio.playGameEndSound()
      }
    } else if (gameState.value.currentPhase.id === 'westeros') {
      gameState.value.currentPhase = GAME_PHASES[1] // Planning
      gameState.value.currentSubPhase = PLANNING_SUBPHASES[0] // Assign Orders
      gameState.value.currentPlayerIndex = 0
      // Play planning phase sound
      gameAudio.playPhaseSound('planning')
      
      // Auto-start the Assign Orders timer
      if (gameState.value.currentSubPhase.id === 'assign-orders') {
        setTimeout(() => {
          realtimeSync.broadcastTimerAction('start', settings.value.assignOrdersDuration)
        }, 500) // Small delay to ensure phase transition is complete
      }
    } else if (gameState.value.currentPhase.id === 'planning') {
      gameState.value.currentPhase = GAME_PHASES[2] // Action
      gameState.value.currentSubPhase = ACTION_SUBPHASES[0] // Raid Orders
      gameState.value.currentPlayerIndex = 0
      // Play action phase sound
      gameAudio.playPhaseSound('action')
    }
    
    // Play westeros sound if we just advanced to a new round
    if (wasRoundAdvance && gameState.value.currentPhase.id === 'westeros') {
      setTimeout(() => gameAudio.playPhaseSound('westeros'), 1000) // Delay to not overlap with round sound
    }
    
    broadcastStateChange()
  }
  
  const nextSubPhase = () => {
    if (!gameState.value.currentSubPhase) return
    
    if (gameState.value.currentPhase.id === 'westeros') {
      const currentSubPhaseIndex = WESTEROS_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < WESTEROS_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = WESTEROS_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
        // Play subphase transition sound
        gameAudio.playSubPhaseSound()
      } else {
        // End of westeros phase
        nextPhase()
      }
    } else if (gameState.value.currentPhase.id === 'planning') {
      const currentSubPhaseIndex = PLANNING_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < PLANNING_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = PLANNING_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
        // Play subphase transition sound
        gameAudio.playSubPhaseSound()
      } else {
        // End of planning phase
        nextPhase()
      }
    } else if (gameState.value.currentPhase.id === 'action') {
      const currentSubPhaseIndex = ACTION_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < ACTION_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = ACTION_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
        // Play subphase transition sound
        gameAudio.playSubPhaseSound()
      } else {
        // End of action phase
        nextPhase()
        return
      }
    }
    broadcastStateChange()
  }
  
  const nextPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = (gameState.value.currentPlayerIndex + 1) % gameState.value.ironThroneOrder.length
    broadcastStateChange()
  }
  
  const previousPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = gameState.value.currentPlayerIndex === 0 
      ? gameState.value.ironThroneOrder.length - 1 
      : gameState.value.currentPlayerIndex - 1
    broadcastStateChange()
  }
  
  const setIronThroneOrder = (houses: House[]) => {
    gameState.value.ironThroneOrder = [...houses]
    gameState.value.currentPlayerIndex = 0
    broadcastStateChange()
  }
  
  const setFiefdomsOrder = (houses: House[]) => {
    gameState.value.fiefdomsOrder = [...houses]
    broadcastStateChange()
  }
  
  const setKingsCourtOrder = (houses: House[]) => {
    gameState.value.kingsCourtOrder = [...houses]
    broadcastStateChange()
  }
  
  const setCurrentPlayerIndex = (index: number) => {
    gameState.value.currentPlayerIndex = index
  }
  
  const togglePause = () => {
    gameState.value.isPaused = !gameState.value.isPaused
    broadcastStateChange()
  }
  
  const getCurrentPlayer = (): House | null => {
    return gameState.value.ironThroneOrder[gameState.value.currentPlayerIndex] || null
  }
  
  const getNextPlayer = (): House | null => {
    if (gameState.value.ironThroneOrder.length === 0) return null
    const nextIndex = (gameState.value.currentPlayerIndex + 1) % gameState.value.ironThroneOrder.length
    return gameState.value.ironThroneOrder[nextIndex] || null
  }
  
  const resetGame = () => {
    gameState.value = { ...initialGameState }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    realtimeSync.broadcastReset()
  }
  
  const exportGameState = (): string => {
    return JSON.stringify({
      gameState: gameState.value,
      settings: settings.value,
      exportDate: new Date().toISOString()
    }, null, 2)
  }
  
  const importGameState = (jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString)
      if (imported.gameState) {
        gameState.value = { ...initialGameState, ...imported.gameState }
      }
      if (imported.settings) {
        settings.value = { ...initialSettings, ...imported.settings }
      }
      return true
    } catch (error) {
      console.error('Failed to import game state:', error)
      return false
    }
  }
  
  
  const isGameComplete = (): boolean => {
    return gameState.value.currentRound > MAX_ROUNDS
  }

  const updateSettings = (newSettings: GameSettings) => {
    settings.value = { ...newSettings }
    realtimeSync.broadcastSettings(newSettings)
  }

  const getNextAction = (): { action: 'nextPlayer' | 'nextSubPhase' | 'nextPhase' | 'complete'; label: string } => {
    if (isGameComplete()) {
      return { action: 'complete', label: 'Game Complete' }
    }

    const currentSubPhase = gameState.value.currentSubPhase
    
    // If we have a sub-phase that requires turn order, check if we need to advance player
    if (currentSubPhase?.requiresTurnOrder) {
      // For turn order sub-phases, we cycle through players
      return { action: 'nextPlayer', label: 'Next Player' }
    }
    
    // If we have a sub-phase (turn order or simultaneous), advance to next sub-phase
    if (currentSubPhase) {
      const currentPhaseId = gameState.value.currentPhase.id
      let subPhases: SubPhase[] = []
      
      if (currentPhaseId === 'westeros') {
        subPhases = WESTEROS_SUBPHASES
      } else if (currentPhaseId === 'planning') {
        subPhases = PLANNING_SUBPHASES
      } else if (currentPhaseId === 'action') {
        subPhases = ACTION_SUBPHASES
      }
      
      const currentSubPhaseIndex = subPhases.findIndex(sp => sp.id === currentSubPhase.id)
      
      // If there are more sub-phases, go to next sub-phase
      if (currentSubPhaseIndex < subPhases.length - 1) {
        return { action: 'nextSubPhase', label: 'Next Sub-phase' }
      } else {
        // This is the last sub-phase, advance to next phase
        if (gameState.value.currentPhase.id === 'action') {
          return { action: 'nextPhase', label: 'Next Round' }
        } else {
          return { action: 'nextPhase', label: 'Next Phase' }
        }
      }
    }
    
    // No sub-phase, advance to next phase
    if (gameState.value.currentPhase.id === 'action') {
      return { action: 'nextPhase', label: 'Next Round' }
    } else {
      return { action: 'nextPhase', label: 'Next Phase' }
    }
  }

  const continueGame = () => {
    const nextAction = getNextAction()
    
    switch (nextAction.action) {
      case 'nextPlayer':
        nextPlayer()
        break
      case 'nextSubPhase':
        nextSubPhase()
        break
      case 'nextPhase':
        nextPhase()
        break
      case 'complete':
        // Game is complete, no action needed
        break
    }
  }

  const updateWildlingThreat = (threatLevel: number) => {
    gameState.value.wildlingThreat = Math.max(0, Math.min(12, threatLevel))
    broadcastStateChange()
  }

  const advanceWildlingThreat = (amount: number = 1) => {
    const newThreat = gameState.value.wildlingThreat + amount
    updateWildlingThreat(newThreat)
    
    // Check if wildling attack is triggered
    if (gameState.value.wildlingThreat >= 12) {
      return true // Indicates wildling attack should be triggered
    }
    return false
  }

  const resetWildlingThreat = () => {
    updateWildlingThreat(0)
  }

  const wildlingWinReduction = () => {
    const newThreat = gameState.value.wildlingThreat - 2
    updateWildlingThreat(newThreat)
  }
  
  // Initialize on mount
  onMounted(() => {
    loadGameState()
    const cleanup = listenForStateChanges()
    
    // Cleanup when component unmounts (if available)
    if (typeof onBeforeUnmount === 'function') {
      onBeforeUnmount(() => {
        cleanup()
      })
    }
  })
  
  return {
    gameState: readonly(gameState),
    settings: readonly(settings),
    connectionStatus: realtimeSync.connectionStatus,
    isConnected: realtimeSync.isConnected,
    initializeGame,
    nextPhase,
    nextSubPhase,
    nextPlayer,
    previousPlayer,
    setIronThroneOrder,
    setFiefdomsOrder,
    setKingsCourtOrder,
    setCurrentPlayerIndex,
    togglePause,
    getCurrentPlayer,
    getNextPlayer,
    resetGame,
    exportGameState,
    importGameState,
    isGameComplete,
    loadGameState,
    saveGameState,
    updateSettings,
    getNextAction,
    continueGame,
    updateWildlingThreat,
    advanceWildlingThreat,
    resetWildlingThreat,
    wildlingWinReduction
  }
}