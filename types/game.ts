export interface House {
  id: string
  name: string // 'Stark', 'Lannister', 'Baratheon', 'Greyjoy', 'Tyrell', 'Martell'
  color: string // hex color for UI
  playerName?: string // Player's name, defaults to "Player X" if not provided
}

export interface GamePhase {
  id: string
  name: string // 'Westeros', 'Planning', 'Action'
  defaultDuration: number // in seconds
  description: string
}

export interface SubPhase {
  id: string
  name: string
  requiresTurnOrder: boolean // Whether this sub-phase uses Iron Throne track order
}

export interface ActionSubPhase extends SubPhase {
  // Specific to Action phase subphases
}

export interface WesterosSubPhase extends SubPhase {
  // Specific to Westeros phase subphases
}

export interface PlanningSubPhase extends SubPhase {
  // Specific to Planning phase subphases
}

export interface GameState {
  currentRound: number // 1-10
  currentPhase: GamePhase
  currentSubPhase?: SubPhase
  currentPlayerIndex: number
  ironThroneOrder: House[] // ordered array, index 0 = Iron Throne holder
  timeRemaining: number // seconds
  isPaused: boolean
  isTimerActive: boolean
  gameStartTime?: number // timestamp when game was started during setup
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

export const WESTEROS_SUBPHASES: WesterosSubPhase[] = [
  {
    id: 'draw-cards',
    name: 'Draw Westeros Cards',
    requiresTurnOrder: false
  },
  {
    id: 'advance-wildlings',
    name: 'Advance Wildlings Track',
    requiresTurnOrder: false
  },
  {
    id: 'resolve-cards',
    name: 'Resolve Westeros Cards',
    requiresTurnOrder: false
  }
]

export const PLANNING_SUBPHASES: PlanningSubPhase[] = [
  {
    id: 'assign-orders',
    name: 'Assign Orders',
    requiresTurnOrder: false
  },
  {
    id: 'reveal-orders',
    name: 'Reveal Orders',
    requiresTurnOrder: false
  },
  {
    id: 'messenger-raven',
    name: 'Use Messenger Raven',
    requiresTurnOrder: false
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
    requiresTurnOrder: true
  }
]

export const MAX_ROUNDS = 10

// Faction availability by player count
export const FACTION_AVAILABILITY: Record<number, string[]> = {
  3: ['stark', 'lannister', 'baratheon'],
  4: ['stark', 'lannister', 'baratheon', 'greyjoy'],
  5: ['stark', 'lannister', 'baratheon', 'greyjoy', 'tyrell'],
  6: ['stark', 'lannister', 'baratheon', 'greyjoy', 'tyrell', 'martell']
}

export const getAvailableHouses = (playerCount: number): House[] => {
  const availableFactionIds = FACTION_AVAILABILITY[playerCount] || []
  return HOUSES.filter(house => availableFactionIds.includes(house.id))
}

// Predefined Iron Throne track starting positions by player count
export const IRON_THRONE_STARTING_POSITIONS: Record<number, string[]> = {
  3: ['baratheon', 'lannister', 'stark'],
  4: ['baratheon', 'lannister', 'stark', 'greyjoy'],
  5: ['baratheon', 'lannister', 'stark', 'greyjoy', 'tyrell'],
  6: ['baratheon', 'lannister', 'stark', 'martell', 'greyjoy', 'tyrell']
}

export const getStartingIronThroneOrder = (playerCount: number): House[] => {
  const startingOrder = IRON_THRONE_STARTING_POSITIONS[playerCount] || []
  return startingOrder.map(factionId => HOUSES.find(house => house.id === factionId)).filter(Boolean) as House[]
}