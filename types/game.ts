export interface House {
  id: string;
  name: string; // 'Stark', 'Lannister', 'Baratheon', 'Greyjoy', 'Tyrell', 'Martell'
  color: string; // hex color for UI
  image: string; // path to house sigil image
  playerName?: string; // Player's name, defaults to "Player X" if not provided
}

export interface GamePhase {
  id: string;
  name: string; // 'Westeros', 'Planning', 'Action'
  description: string;
  icon?: string; // Lucide icon name
}

export interface SubPhase {
  id: string;
  name: string;
  requiresTurnOrder: boolean; // Whether this sub-phase uses Iron Throne track order
  icon?: string; // Lucide icon name
}

export interface InfluenceTrack {
  id: "iron-throne" | "fiefdoms" | "kings-court";
  name: string;
  description: string;
  icon: string; // Lucide icon name
  image: string; // path to track image
  dominanceTokenId: string; // ID of the dominance token awarded to #1 position
  benefits: string[]; // List of benefits for track positions
  specialRules?: string; // Any special rules for this track
}

export interface DominanceToken {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  image: string; // path to token image
  trackId: "iron-throne" | "fiefdoms" | "kings-court"; // Which track awards this token
  abilities: string[]; // List of abilities this token provides
  usageType: "passive" | "once-per-round" | "active"; // How the token is used
  specialRules?: string; // Any special rules for this token
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
  assignOrdersDuration: number; // in seconds, default 480 (8 minutes)
}

// Game constants
export const HOUSES: House[] = [
  { id: "stark", name: "Stark", color: "#6B7280", image: "/img/stark.png" },
  {
    id: "lannister",
    name: "Lannister",
    color: "#DC2626",
    image: "/img/lannister.png",
  },
  {
    id: "baratheon",
    name: "Baratheon",
    color: "#FBBF24",
    image: "/img/baratheon.png",
  },
  {
    id: "greyjoy",
    name: "Greyjoy",
    color: "#1F2937",
    image: "/img/greyjoy.png",
  },
  { id: "tyrell", name: "Tyrell", color: "#10B981", image: "/img/tyrell.png" },
  {
    id: "martell",
    name: "Martell",
    color: "#F97316",
    image: "/img/martell.png",
  },
];

export const INFLUENCE_TRACKS: InfluenceTrack[] = [
  {
    id: "iron-throne",
    name: "Iron Throne Track",
    description: "Determines turn order for all game actions",
    icon: "Crown",
    image: "/img/iron-throne-track.png",
    dominanceTokenId: "iron-throne-token",
    benefits: [
      "First in turn order for all game phases",
      "Higher positions act before lower positions",
    ],
    specialRules:
      "Turn order follows track positions from 1 to 6. Position determines who acts first in each phase.",
  },
  {
    id: "fiefdoms",
    name: "Fiefdoms Track",
    description: "Determines combat tie resolution",
    icon: "Sword",
    image: "/img/fiefdoms-track.png",
    dominanceTokenId: "valyrian-steel-blade",
    benefits: [
      "Higher positions win combat ties against lower positions",
      "Combat strength ties resolved by track position",
    ],
    specialRules:
      "Only position matters for combat ties - higher positions beat lower positions in tied combats.",
  },
  {
    id: "kings-court",
    name: "King's Court Track",
    description: "Determines available special order tokens",
    icon: "Bird",
    image: "/img/kings-court-track.png",
    dominanceTokenId: "messenger-raven",
    benefits: [
      "Position determines number of special order tokens available",
      "Stars next to position show special order limit",
    ],
    specialRules:
      "In 3-4 player games, overlay modifies the number of special orders available at each position.",
  },
];

// The dominance tokens/artifacts awarded to #1 position
export const DOMINANCE_TOKENS: DominanceToken[] = [
  {
    id: "iron-throne-token",
    name: "Iron Throne Token",
    description: "Grants tie-breaking authority",
    icon: "Crown",
    image: "/img/iron-throne.png",
    trackId: "iron-throne",
    abilities: [
      "Decides outcome of all ties (except combat and game winner)",
      "Controls bidding tie resolution",
      "Resolves wildling attack ties",
    ],
    usageType: "passive", // always active
    specialRules:
      "Cannot resolve combat ties (Fiefdoms track) or game winner ties.",
  },
  {
    id: "valyrian-steel-blade",
    name: "Valyrian Steel Blade",
    description: "Provides combat strength bonus",
    icon: "Sword",
    image: "/img/valyrian-steel-blade.png",
    trackId: "fiefdoms",
    abilities: [
      "Grants +1 combat strength once per round",
      "Can be used in any combat as attacker or defender",
    ],
    usageType: "once-per-round", // flip to faded side after use
    specialRules:
      "Flips to faded side when used, returns to available at end of Action Phase.",
  },
  {
    id: "messenger-raven",
    name: "Messenger Raven",
    description: "Provides planning phase flexibility",
    icon: "Bird",
    image: "/img/messenger-raven.png",
    trackId: "kings-court",
    abilities: [
      "Replace one order token on the board",
      "Look at top wildling card and choose top/bottom placement",
    ],
    usageType: "once-per-round", // choose one ability per round
    specialRules:
      "Choose ONE ability at end of Reveal Orders step. Flips to faded side when used.",
  },
];

export const GAME_PHASES: GamePhase[] = [
  {
    id: "westeros",
    name: "Westeros",
    description: "Resolve Westeros cards and bid for influence tracks",
    icon: "Drama",
  },
  {
    id: "planning",
    name: "Planning",
    description: "Place orders face-down on areas containing units",
    icon: "Brain",
  },
  {
    id: "action",
    name: "Action",
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

// Helper function to get influence track information
export const getInfluenceTrack = (
  trackId: "iron-throne" | "fiefdoms" | "kings-court"
): InfluenceTrack | undefined => {
  return INFLUENCE_TRACKS.find((track) => track.id === trackId);
};

// Helper functions for dominance token management
export const getDominanceToken = (
  tokenId: string
): DominanceToken | undefined => {
  return DOMINANCE_TOKENS.find((token) => token.id === tokenId);
};

export const getDominanceTokenByTrack = (
  trackId: "iron-throne" | "fiefdoms" | "kings-court"
): DominanceToken | undefined => {
  return DOMINANCE_TOKENS.find((token) => token.trackId === trackId);
};

export const getTrackDominanceToken = (
  track: InfluenceTrack
): DominanceToken | undefined => {
  return getDominanceToken(track.dominanceTokenId);
};
