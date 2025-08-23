import type { GameState, House, GameSettings, SubPhase } from '~/types/game'
import { GAME_PHASES, WESTEROS_SUBPHASES, PLANNING_SUBPHASES, ACTION_SUBPHASES, MAX_ROUNDS, getStartingIronThroneOrder, getStartingFiefdomsOrder, getStartingKingsCourtOrder } from '~/types/game'

const STORAGE_KEY = 'agot-gm-game-state'
const SETTINGS_KEY = 'agot-gm-settings'

export const useGameState = () => {
  const initialGameState: GameState = {
    currentRound: 1,
    currentPhase: GAME_PHASES[0], // Westeros phase
    currentSubPhase: undefined,
    currentPlayerIndex: 0,
    ironThroneOrder: [],
    fiefdomsOrder: [],
    kingsCourtOrder: [],
    timeRemaining: 0,
    isPaused: false,
    isTimerActive: false
  }
  
  const initialSettings: GameSettings = {
    audioEnabled: true,
    visualAlertsEnabled: true,
    darkTheme: false,
    customPhaseDurations: {}
  }
  
  const gameState = ref<GameState>({ ...initialGameState })
  const settings = ref<GameSettings>({ ...initialSettings })
  
  // Real-time connection (WebSocket for local, SSE for production)
  const { isConnected, connectionStatus, send, onMessage, connect, disconnect, connectionType } = useRealtimeSync()
  const isReceivingUpdate = ref(false)
  
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
  watch(gameState, () => {
    if (!isReceivingUpdate.value) {
      saveGameState()
      broadcastStateChange('gameState', gameState.value)
    }
  }, { deep: true })
  
  watch(settings, () => {
    if (!isReceivingUpdate.value) {
      saveGameState()
      broadcastStateChange('settings', settings.value)
    }
  }, { deep: true })
  
  // Broadcast state changes to other devices via WebSocket
  const broadcastStateChange = (type: 'gameState' | 'settings' | 'reset', data: any) => {
    if (typeof window !== 'undefined') {
      // First, use localStorage for same-tab synchronization (keeps existing functionality)
      const broadcastData = {
        [type]: data,
        timestamp: Date.now()
      }
      localStorage.setItem('agot-gm-broadcast', JSON.stringify(broadcastData))
      localStorage.removeItem('agot-gm-broadcast') // Trigger storage event
      
      // Then broadcast via WebSocket for cross-device sync
      if (isConnected.value) {
        send({
          type,
          data,
          timestamp: Date.now(),
          clientId: 'client' // Will be replaced by server with actual client ID
        })
      }
    }
  }
  
  // Listen for state changes from other tabs/devices
  const listenForStateChanges = () => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const newState = JSON.parse(event.newValue)
            console.log('Received state update from another tab:', newState)
            isReceivingUpdate.value = true
            gameState.value = { ...initialGameState, ...newState }
            nextTick(() => {
              isReceivingUpdate.value = false
            })
          } catch (error) {
            console.warn('Failed to parse state update:', error)
          }
        }
      }
      
      // Handle WebSocket messages
      const handleWebSocketGameState = (data: any) => {
        console.log('Received game state update from WebSocket:', data)
        isReceivingUpdate.value = true
        gameState.value = { ...initialGameState, ...data }
        nextTick(() => {
          isReceivingUpdate.value = false
        })
      }
      
      const handleWebSocketSettings = (data: any) => {
        console.log('Received settings update from WebSocket:', data)
        isReceivingUpdate.value = true
        settings.value = { ...initialSettings, ...data }
        nextTick(() => {
          isReceivingUpdate.value = false
        })
      }
      
      const handleWebSocketReset = () => {
        console.log('Received reset from WebSocket')
        isReceivingUpdate.value = true
        gameState.value = { ...initialGameState }
        settings.value = { ...initialSettings }
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(SETTINGS_KEY)
        }
        nextTick(() => {
          isReceivingUpdate.value = false
        })
      }
      
      const handleWebSocketInitial = (data: any) => {
        console.log('Received initial state from WebSocket:', data)
        if (data.gameState) {
          isReceivingUpdate.value = true
          gameState.value = { ...initialGameState, ...data.gameState }
        }
        if (data.settings) {
          settings.value = { ...initialSettings, ...data.settings }
        }
        nextTick(() => {
          isReceivingUpdate.value = false
        })
      }
      
      window.addEventListener('storage', handleStorageChange)
      onMessage('gameState', handleWebSocketGameState)
      onMessage('settings', handleWebSocketSettings)
      onMessage('reset', handleWebSocketReset)
      onMessage('initial', handleWebSocketInitial)
      
      // Return cleanup function
      return () => {
        window.removeEventListener('storage', handleStorageChange)
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
      currentPhase: GAME_PHASES[1], // Start with Planning phase in round 1 (Westeros is skipped)
      currentSubPhase: PLANNING_SUBPHASES[0], // Start with Assign Orders
      gameStartTime: Date.now() // Save timestamp when game starts
    }
  }
  
  const nextPhase = () => {
    if (gameState.value.currentPhase.id === 'action') {
      // End of round, advance to next round
      if (gameState.value.currentRound < MAX_ROUNDS) {
        gameState.value.currentRound++
        gameState.value.currentPhase = GAME_PHASES[0] // Back to Westeros
        gameState.value.currentSubPhase = gameState.value.currentRound === 1 ? undefined : WESTEROS_SUBPHASES[0]
        gameState.value.currentPlayerIndex = 0
      }
    } else if (gameState.value.currentPhase.id === 'westeros') {
      gameState.value.currentPhase = GAME_PHASES[1] // Planning
      gameState.value.currentSubPhase = PLANNING_SUBPHASES[0] // Assign Orders
      gameState.value.currentPlayerIndex = 0
    } else if (gameState.value.currentPhase.id === 'planning') {
      gameState.value.currentPhase = GAME_PHASES[2] // Action
      gameState.value.currentSubPhase = ACTION_SUBPHASES[0] // Raid Orders
      gameState.value.currentPlayerIndex = 0
    }
    broadcastStateChange('gameState', gameState.value)
  }
  
  const nextSubPhase = () => {
    if (!gameState.value.currentSubPhase) return
    
    if (gameState.value.currentPhase.id === 'westeros') {
      const currentSubPhaseIndex = WESTEROS_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < WESTEROS_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = WESTEROS_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
      } else {
        // End of westeros phase
        nextPhase()
      }
    } else if (gameState.value.currentPhase.id === 'planning') {
      const currentSubPhaseIndex = PLANNING_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < PLANNING_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = PLANNING_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
      } else {
        // End of planning phase
        nextPhase()
      }
    } else if (gameState.value.currentPhase.id === 'action') {
      const currentSubPhaseIndex = ACTION_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
      
      if (currentSubPhaseIndex < ACTION_SUBPHASES.length - 1) {
        gameState.value.currentSubPhase = ACTION_SUBPHASES[currentSubPhaseIndex + 1]
        gameState.value.currentPlayerIndex = 0
      } else {
        // End of action phase
        nextPhase()
        return
      }
    }
    broadcastStateChange('gameState', gameState.value)
  }
  
  const nextPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = (gameState.value.currentPlayerIndex + 1) % gameState.value.ironThroneOrder.length
    broadcastStateChange('gameState', gameState.value)
  }
  
  const previousPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = gameState.value.currentPlayerIndex === 0 
      ? gameState.value.ironThroneOrder.length - 1 
      : gameState.value.currentPlayerIndex - 1
    broadcastStateChange('gameState', gameState.value)
  }
  
  const setIronThroneOrder = (houses: House[]) => {
    gameState.value.ironThroneOrder = [...houses]
    gameState.value.currentPlayerIndex = 0
    broadcastStateChange('gameState', gameState.value)
  }
  
  const setFiefdomsOrder = (houses: House[]) => {
    gameState.value.fiefdomsOrder = [...houses]
    broadcastStateChange('gameState', gameState.value)
  }
  
  const setKingsCourtOrder = (houses: House[]) => {
    gameState.value.kingsCourtOrder = [...houses]
    broadcastStateChange('gameState', gameState.value)
  }
  
  const setCurrentPlayerIndex = (index: number) => {
    gameState.value.currentPlayerIndex = index
  }
  
  const togglePause = () => {
    gameState.value.isPaused = !gameState.value.isPaused
    broadcastStateChange('gameState', gameState.value)
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
    broadcastStateChange('reset', null)
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
  
  const getPhaseDuration = (phaseId: string): number => {
    const customDuration = settings.value.customPhaseDurations[phaseId]
    if (customDuration && customDuration > 0) {
      return customDuration
    }
    
    const phase = GAME_PHASES.find(p => p.id === phaseId)
    return phase?.defaultDuration || 300
  }
  
  const isGameComplete = (): boolean => {
    return gameState.value.currentRound > MAX_ROUNDS
  }

  const updateSettings = (newSettings: GameSettings) => {
    settings.value = { ...newSettings }
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
  
  // Initialize on mount
  onMounted(() => {
    loadGameState()
    const cleanup = listenForStateChanges()
    
    // Connect to WebSocket for real-time sync
    connect()
    
    // Cleanup when component unmounts (if available)
    if (typeof onBeforeUnmount === 'function') {
      onBeforeUnmount(() => {
        cleanup()
        disconnect()
      })
    }
  })
  
  return {
    gameState: readonly(gameState),
    settings: readonly(settings),
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
    getPhaseDuration,
    isGameComplete,
    loadGameState,
    saveGameState,
    updateSettings,
    getNextAction,
    continueGame,
    // Real-time connection status
    isConnected: readonly(isConnected),
    connectionStatus: readonly(connectionStatus),
    connectionType: readonly(ref(connectionType))
  }
}