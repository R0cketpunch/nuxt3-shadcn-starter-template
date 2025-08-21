import type { GameState, House, GamePhase, ActionSubPhase, GameSettings } from '~/types/game'
import { GAME_PHASES, ACTION_SUBPHASES, HOUSES, MAX_ROUNDS } from '~/types/game'

const STORAGE_KEY = 'agot-gm-game-state'
const SETTINGS_KEY = 'agot-gm-settings'

export const useGameState = () => {
  const initialGameState: GameState = {
    currentRound: 1,
    currentPhase: GAME_PHASES[0], // Westeros phase
    currentSubPhase: undefined,
    currentPlayerIndex: 0,
    ironThroneOrder: [],
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
  
  const initializeGame = (selectedHouses: House[]) => {
    gameState.value = {
      ...initialGameState,
      ironThroneOrder: [...selectedHouses],
      currentPhase: GAME_PHASES[0]
    }
  }
  
  const nextPhase = () => {
    const currentPhaseIndex = GAME_PHASES.findIndex(p => p.id === gameState.value.currentPhase.id)
    
    if (gameState.value.currentPhase.id === 'action') {
      // End of round, advance to next round
      if (gameState.value.currentRound < MAX_ROUNDS) {
        gameState.value.currentRound++
        gameState.value.currentPhase = GAME_PHASES[0] // Back to Westeros
        gameState.value.currentSubPhase = undefined
        gameState.value.currentPlayerIndex = 0
      }
    } else if (gameState.value.currentPhase.id === 'westeros') {
      gameState.value.currentPhase = GAME_PHASES[1] // Planning
    } else if (gameState.value.currentPhase.id === 'planning') {
      gameState.value.currentPhase = GAME_PHASES[2] // Action
      gameState.value.currentSubPhase = ACTION_SUBPHASES[0] // Raid Orders
      gameState.value.currentPlayerIndex = 0
    }
  }
  
  const nextSubPhase = () => {
    if (gameState.value.currentPhase.id !== 'action' || !gameState.value.currentSubPhase) return
    
    const currentSubPhaseIndex = ACTION_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
    
    if (currentSubPhaseIndex < ACTION_SUBPHASES.length - 1) {
      gameState.value.currentSubPhase = ACTION_SUBPHASES[currentSubPhaseIndex + 1]
      gameState.value.currentPlayerIndex = 0
    } else {
      // End of action phase
      nextPhase()
    }
  }
  
  const nextPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = (gameState.value.currentPlayerIndex + 1) % gameState.value.ironThroneOrder.length
  }
  
  const previousPlayer = () => {
    if (gameState.value.ironThroneOrder.length === 0) return
    
    gameState.value.currentPlayerIndex = gameState.value.currentPlayerIndex === 0 
      ? gameState.value.ironThroneOrder.length - 1 
      : gameState.value.currentPlayerIndex - 1
  }
  
  const setIronThroneOrder = (houses: House[]) => {
    gameState.value.ironThroneOrder = [...houses]
    gameState.value.currentPlayerIndex = 0
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
    if (customDuration) return customDuration
    
    const phase = GAME_PHASES.find(p => p.id === phaseId)
    return phase?.defaultDuration || 300
  }
  
  const isGameComplete = (): boolean => {
    return gameState.value.currentRound > MAX_ROUNDS
  }
  
  // Initialize on mount
  onMounted(() => {
    loadGameState()
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
    getCurrentPlayer,
    getNextPlayer,
    resetGame,
    exportGameState,
    importGameState,
    getPhaseDuration,
    isGameComplete,
    loadGameState,
    saveGameState
  }
}