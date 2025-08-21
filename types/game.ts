export interface House {
  id: string
  name: string // 'Stark', 'Lannister', 'Baratheon', 'Greyjoy', 'Tyrell', 'Martell'
  color: string // hex color for UI
}

export interface GamePhase {
  id: string
  name: string // 'Westeros', 'Planning', 'Action'
  defaultDuration: number // in seconds
  description: string
}

export interface ActionSubPhase {
  id: string
  name: string // 'Raid Orders', 'March Orders', 'Consolidate Power Orders'
  requiresTurnOrder: boolean
}

export interface GameState {
  currentRound: number // 1-10
  currentPhase: GamePhase
  currentSubPhase?: ActionSubPhase
  currentPlayerIndex: number
  ironThroneOrder: House[] // ordered array, index 0 = Iron Throne holder
  timeRemaining: number // seconds
  isPaused: boolean
  isTimerActive: boolean
}

export interface GameSettings {
  audioEnabled: boolean
  visualAlertsEnabled: boolean
  darkTheme: boolean
  customPhaseDurations: Record<string, number>
}

// Game constants
export const HOUSES: House[] = [
  { id: 'stark', name: 'Stark', color: '#6B7280' },
  { id: 'lannister', name: 'Lannister', color: '#DC2626' },
  { id: 'baratheon', name: 'Baratheon', color: '#FBBF24' },
  { id: 'greyjoy', name: 'Greyjoy', color: '#1F2937' },
  { id: 'tyrell', name: 'Tyrell', color: '#10B981' },
  { id: 'martell', name: 'Martell', color: '#F97316' }
]

export const GAME_PHASES: GamePhase[] = [
  {
    id: 'westeros',
    name: 'Westeros',
    defaultDuration: 300, // 5 minutes
    description: 'Resolve Westeros cards and bid for influence tracks'
  },
  {
    id: 'planning',
    name: 'Planning',
    defaultDuration: 600, // 10 minutes
    description: 'Place orders face-down on areas containing units'
  },
  {
    id: 'action',
    name: 'Action',
    defaultDuration: 900, // 15 minutes
    description: 'Reveal and resolve orders'
  }
]

export const ACTION_SUBPHASES: ActionSubPhase[] = [
  {
    id: 'raid',
    name: 'Raid Orders',
    requiresTurnOrder: true
  },
  {
    id: 'march',
    name: 'March Orders',
    requiresTurnOrder: true
  },
  {
    id: 'consolidate',
    name: 'Consolidate Power Orders',
    requiresTurnOrder: false
  }
]

export const MAX_ROUNDS = 10