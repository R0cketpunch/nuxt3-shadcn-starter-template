export interface House {
  id: string;
  name: string; // 'Stark', 'Lannister', 'Baratheon', 'Greyjoy', 'Tyrell', 'Martell'
  color: string; // hex color for UI
  playerName?: string; // Player's name, defaults to "Player X" if not provided
}

export interface GamePhase {
  id: string;
  name: string; // 'Westeros', 'Planning', 'Action'
  defaultDuration: number; // in seconds
  description: string;
  icon?: string; // Lucide icon name
}

export interface SubPhase {
  id: string;
  name: string;
  requiresTurnOrder: boolean; // Whether this sub-phase uses Iron Throne track order
  icon?: string; // Lucide icon name
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
  currentRound: number; // 1-10
  currentPhase: GamePhase;
  currentSubPhase?: SubPhase;
  currentPlayerIndex: number;
  ironThroneOrder: House[]; // ordered array, index 0 = Iron Throne holder
  fiefdomsOrder: House[]; // ordered array, index 0 = Fiefdoms track leader
  kingsCourtOrder: House[]; // ordered array, index 0 = King's Court track leader
  timeRemaining: number; // seconds
  isPaused: boolean;
  isTimerActive: boolean;
  gameStartTime?: number; // timestamp when game was started during setup
}

export interface GameSettings {
  audioEnabled: boolean;
  visualAlertsEnabled: boolean;
  darkTheme: boolean;
  customPhaseDurations: Record<string, number>;
}

// Game constants
export const HOUSES: House[] = [
  { id: "stark", name: "Stark", color: "#6B7280" },
  { id: "lannister", name: "Lannister", color: "#DC2626" },
  { id: "baratheon", name: "Baratheon", color: "#FBBF24" },
  { id: "greyjoy", name: "Greyjoy", color: "#1F2937" },
  { id: "tyrell", name: "Tyrell", color: "#10B981" },
  { id: "martell", name: "Martell", color: "#F97316" },
];

export const GAME_PHASES: GamePhase[] = [
  {
    id: "westeros",
    name: "Westeros",
    defaultDuration: 300, // 5 minutes
    description: "Resolve Westeros cards and bid for influence tracks",
    icon: "Drama",
  },
  {
    id: "planning",
    name: "Planning",
    defaultDuration: 600, // 10 minutes
    description: "Place orders face-down on areas containing units",
    icon: "Brain",
  },
  {
    id: "action",
    name: "Action",
    defaultDuration: 900, // 15 minutes
    description: "Reveal and resolve orders",
    icon: "Swords",
  },
];

export const WESTEROS_SUBPHASES: WesterosSubPhase[] = [
  {
    id: "draw-cards",
    name: "Draw Westeros Cards",
    requiresTurnOrder: false,
    icon: "Dices",
  },
  {
    id: "advance-wildlings",
    name: "Advance Wildlings Track",
    requiresTurnOrder: false,
    icon: "Ghost",
  },
  {
    id: "resolve-cards",
    name: "Resolve Westeros Cards",
    requiresTurnOrder: false,
    icon: "CircleCheck",
  },
];

export const PLANNING_SUBPHASES: PlanningSubPhase[] = [
  {
    id: "assign-orders",
    name: "Assign Orders",
    requiresTurnOrder: false,
    icon: "PenTool",
  },
  {
    id: "reveal-orders",
    name: "Reveal Orders",
    requiresTurnOrder: false,
    icon: "Eye",
  },
  {
    id: "messenger-raven",
    name: "Use Messenger Raven",
    requiresTurnOrder: false,
    icon: "Bird",
  },
];

export const ACTION_SUBPHASES: ActionSubPhase[] = [
  {
    id: "raid",
    name: "Raid Orders",
    requiresTurnOrder: true,
    icon: "Zap",
  },
  {
    id: "march",
    name: "March Orders",
    requiresTurnOrder: true,
    icon: "ArrowRight",
  },
  {
    id: "consolidate",
    name: "Consolidate Power Orders",
    requiresTurnOrder: true,
    icon: "Crown",
  },
];

export const MAX_ROUNDS = 10;

// Helper functions to get icons
export const getPhaseIcon = (phaseId: string): string => {
  const phase = GAME_PHASES.find((p) => p.id === phaseId);
  return phase?.icon || "Circle";
};

export const getSubPhaseIcon = (
  phaseId: string,
  subPhaseId: string
): string => {
  let subPhases: SubPhase[] = [];

  if (phaseId === "westeros") {
    subPhases = WESTEROS_SUBPHASES;
  } else if (phaseId === "planning") {
    subPhases = PLANNING_SUBPHASES;
  } else if (phaseId === "action") {
    subPhases = ACTION_SUBPHASES;
  }

  const subPhase = subPhases.find((sp) => sp.id === subPhaseId);
  return subPhase?.icon || "Circle";
};

export const getNextStepIcon = (
  currentPhase: GamePhase,
  currentSubPhase?: SubPhase,
  currentRound?: number
): string => {
  if (!currentSubPhase) {
    // If no subphase, next step is the first subphase of current phase
    if (currentPhase.id === "westeros") {
      return WESTEROS_SUBPHASES[0]?.icon || "Circle";
    } else if (currentPhase.id === "planning") {
      return PLANNING_SUBPHASES[0]?.icon || "Circle";
    } else if (currentPhase.id === "action") {
      return ACTION_SUBPHASES[0]?.icon || "Circle";
    }
    return "Circle";
  }

  // Find current subphase and determine next
  if (currentPhase.id === "westeros") {
    const currentIndex = WESTEROS_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < WESTEROS_SUBPHASES.length - 1) {
      return WESTEROS_SUBPHASES[currentIndex + 1].icon || "Circle";
    } else {
      // End of westeros phase, go to planning
      return GAME_PHASES[1].icon || "Circle"; // Planning
    }
  } else if (currentPhase.id === "planning") {
    const currentIndex = PLANNING_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < PLANNING_SUBPHASES.length - 1) {
      return PLANNING_SUBPHASES[currentIndex + 1].icon || "Circle";
    } else {
      // End of planning phase, go to action
      return GAME_PHASES[2].icon || "Circle"; // Action
    }
  } else if (currentPhase.id === "action") {
    const currentIndex = ACTION_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < ACTION_SUBPHASES.length - 1) {
      return ACTION_SUBPHASES[currentIndex + 1].icon || "Circle";
    } else {
      // End of action phase, go to next round or end game
      if (currentRound && currentRound < MAX_ROUNDS) {
        return "RotateCcw"; // Round icon
      } else {
        return "Flag"; // Game End icon
      }
    }
  }

  return "Circle";
};

// Faction availability by player count
export const FACTION_AVAILABILITY: Record<number, string[]> = {
  3: ["stark", "lannister", "baratheon"],
  4: ["stark", "lannister", "baratheon", "greyjoy"],
  5: ["stark", "lannister", "baratheon", "greyjoy", "tyrell"],
  6: ["stark", "lannister", "baratheon", "greyjoy", "tyrell", "martell"],
};

export const getAvailableHouses = (playerCount: number): House[] => {
  const availableFactionIds = FACTION_AVAILABILITY[playerCount] || [];
  return HOUSES.filter((house) => availableFactionIds.includes(house.id));
};

// Predefined influence track starting positions by player count
export const IRON_THRONE_STARTING_POSITIONS: Record<number, string[]> = {
  3: ["baratheon", "lannister", "stark"],
  4: ["baratheon", "lannister", "stark", "greyjoy"],
  5: ["baratheon", "lannister", "stark", "greyjoy", "tyrell"],
  6: ["baratheon", "lannister", "stark", "martell", "greyjoy", "tyrell"],
};

export const FIEFDOMS_STARTING_POSITIONS: Record<number, string[]> = {
  3: ["stark", "baratheon", "lannister"],
  4: ["greyjoy", "stark", "baratheon", "lannister"],
  5: ["greyjoy", "tyrell", "stark", "baratheon", "lannister"],
  6: ["greyjoy", "tyrell", "martell", "stark", "baratheon", "lannister"],
};

export const KINGS_COURT_STARTING_POSITIONS: Record<number, string[]> = {
  3: ["lannister", "stark", "baratheon"],
  4: ["lannister", "stark", "baratheon", "greyjoy"],
  5: ["lannister", "stark", "baratheon", "tyrell", "greyjoy"],
  6: ["lannister", "stark", "martell", "baratheon", "tyrell", "greyjoy"],
};

export const getStartingIronThroneOrder = (playerCount: number): House[] => {
  const startingOrder = IRON_THRONE_STARTING_POSITIONS[playerCount] || [];
  return startingOrder
    .map((factionId) => HOUSES.find((house) => house.id === factionId))
    .filter(Boolean) as House[];
};

export const getStartingFiefdomsOrder = (playerCount: number): House[] => {
  const startingOrder = FIEFDOMS_STARTING_POSITIONS[playerCount] || [];
  return startingOrder
    .map((factionId) => HOUSES.find((house) => house.id === factionId))
    .filter(Boolean) as House[];
};

export const getStartingKingsCourtOrder = (playerCount: number): House[] => {
  const startingOrder = KINGS_COURT_STARTING_POSITIONS[playerCount] || [];
  return startingOrder
    .map((factionId) => HOUSES.find((house) => house.id === factionId))
    .filter(Boolean) as House[];
};
