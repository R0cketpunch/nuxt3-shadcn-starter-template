<template>
  <div class="grid grid-cols-3 gap-px border-t bg-muted">
    <div
      class="flex col-span-1 justify-center items-center px-8 h-32 bg-background"
    >
      <Timer class="size-12" />
      <div class="text-6xl">
        <NumberFlow :value="gameState.currentRound" />
        <span class="text-2xl text-muted-foreground">
          /
          <NumberFlow :value="maxRounds" />
        </span>
      </div>
    </div>
    <div class="grid grid-cols-3 col-span-1 gap-px bg-muted">
      <div
        v-for="(phase, index) in allPhases"
        :key="phase.id"
        class="flex flex-col gap-4 justify-center items-center p-8 h-32 bg-background"
        :class="{
          'bg-muted text-white': isCurrentPhase(index),
          'bg-background text-border line-through': isPhaseComplete(index),
          'bg-background text-border':
            !isPhaseComplete(index) && !isCurrentPhase(index),
        }"
      >
        <component :is="getPhaseIconComponent(phase.id)" class="size-6" />
        <!-- <div class="text-xl">{{ phase.name }} Phase</div> -->
      </div>
    </div>

    <!-- Wildling Threat Display -->
    <div
      class="flex col-span-1 justify-center items-center px-8 h-32"
      :class="wildlingThreatColor"
    >
      <Skull class="size-12" />
      <div class="text-6xl">
        <NumberFlow :value="gameState.wildlingThreat" />
        <span class="text-2xl text-muted-foreground">
          /
          <NumberFlow :value="12" />
        </span>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-px bg-muted">
    <!-- Current Phase Subphases -->
    <div
      v-for="(subPhase, index) in currentPhaseSubPhases"
      :key="`sub-${subPhase.id}`"
      class="flex gap-4 items-center p-8 h-32"
      :class="{
        'bg-muted text-white': isCurrentSubPhase(subPhase),
        'bg-background text-border line-through': isSubPhaseComplete(index),
        'bg-background text-border':
          !isSubPhaseComplete(index) && !isCurrentSubPhase(subPhase),
      }"
    >
      <!-- <div class="relative">
        <component :is="getSubPhaseIconComponent(subPhase)" class="size-6" />
      </div> -->
      <img
        :src="subPhase.image"
        :alt="subPhase.name"
        class="size-16"
        :class="{
          'opacity-50':
            isSubPhaseComplete(index) || !isCurrentSubPhase(subPhase),
        }"
      />

      <div class="text-xl">
        {{ subPhase.name }}
      </div>
      <!-- <div
            v-if="subPhase.requiresTurnOrder"
            class="text-[9px] sm:text-[10px] opacity-60 mt-1"
          >
            Turn order
          </div> -->
    </div>
  </div>

  <!-- Current Phase Description -->
  <!-- <div v-if="currentPhase" class="pt-3 mt-4 text-center border-t">
        <div class="text-sm text-muted-foreground">
          {{ currentPhase.description }}
        </div>
      </div> -->
  <!-- Phase Control -->
</template>

<script setup lang="ts">
import {
  ChevronRight,
  Trophy,
  Play,
  CircleDashed,
  CirclePlay,
  Crown,
  Brain,
  Swords,
  Captions,
  PenTool,
  Eye,
  Bird,
  Zap,
  Sword,
  Shield,
  Circle,
  Skull,
  Dices,
  Drama,
  Flame,
  Timer,
} from "lucide-vue-next";
import type { GamePhase, SubPhase } from "~/types/game";
import {
  GAME_PHASES,
  MAX_ROUNDS,
  WESTEROS_SUBPHASES,
  PLANNING_SUBPHASES,
  ACTION_SUBPHASES,
  getPhaseIcon,
  getSubPhaseIcon,
} from "~/types/game";
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

// Props removed - using useGameState() directly

interface Emits {
  (e: "advance-phase"): void;
  (e: "advance-subphase"): void;
  (e: "next-player"): void;
}

const emit = defineEmits<Emits>();

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;

const maxRounds = MAX_ROUNDS;
const allPhases = GAME_PHASES;

// Icon mapping
const iconComponents = {
  Crown,
  Brain,
  Swords,
  Dices,
  Skull,
  Captions,
  PenTool,
  Eye,
  Bird,
  Zap,
  Sword,
  Shield,
  Circle,
  Drama,
  Flame,
} as const;

const currentPhaseIndex = computed(() => {
  return GAME_PHASES.findIndex((p) => p.id === gameState.value.currentPhase.id);
});

const nextPhase = computed(() => {
  if (gameState.value.currentPhase.id === "action") {
    return gameState.value.currentRound < MAX_ROUNDS ? GAME_PHASES[0] : null; // Back to Westeros or end
  }
  const nextIndex = currentPhaseIndex.value + 1;
  return nextIndex < GAME_PHASES.length ? GAME_PHASES[nextIndex] : null;
});

const nextRound = computed(() => {
  return gameState.value.currentPhase.id === "action"
    ? gameState.value.currentRound + 1
    : gameState.value.currentRound;
});

const isLastPhaseOfRound = computed(() => {
  return gameState.value.currentPhase.id === "action";
});

const isGameComplete = computed(() => {
  return gameState.value.currentRound > MAX_ROUNDS;
});

const isPhaseComplete = (index: number) => {
  // A phase is complete if we've passed it in the current round
  return index < currentPhaseIndex.value;
};

const isCurrentPhase = (index: number) => {
  return index === currentPhaseIndex.value;
};

const advancePhase = () => {
  emit("advance-phase");
};

const advanceSubPhase = () => {
  emit("advance-subphase");
};

const nextPlayer = () => {
  emit("next-player");
};

const getSubPhasesForPhase = (phaseId: string) => {
  switch (phaseId) {
    case "westeros":
      return WESTEROS_SUBPHASES;
    case "planning":
      return PLANNING_SUBPHASES;
    case "action":
      return ACTION_SUBPHASES;
    default:
      return [];
  }
};

const currentPhaseSubPhases = computed(() => {
  return getSubPhasesForPhase(gameState.value.currentPhase.id);
});

const currentSubPhaseIndex = computed(() => {
  if (!gameState.value.currentSubPhase) return -1;
  return currentPhaseSubPhases.value.findIndex(
    (sp) => sp.id === gameState.value.currentSubPhase!.id
  );
});

const isCurrentSubPhase = (subPhase: SubPhase) => {
  return gameState.value.currentSubPhase?.id === subPhase.id;
};

const isSubPhaseComplete = (index: number) => {
  if (!gameState.value.currentSubPhase) return false;
  return index < currentSubPhaseIndex.value;
};

// Helper functions to get icon components
const getPhaseIconComponent = (phaseId: string) => {
  const iconName = getPhaseIcon(phaseId);
  return iconComponents[iconName as keyof typeof iconComponents] || Circle;
};

const getSubPhaseIconComponent = (subPhase: SubPhase) => {
  const iconName = getSubPhaseIcon(
    gameState.value.currentPhase.id,
    subPhase.id
  );
  return iconComponents[iconName as keyof typeof iconComponents] || Circle;
};

const wildlingThreatColor = computed(() => {
  const threat = gameState.value.wildlingThreat;
  if (threat >= 10) return "bg-red-600";
  if (threat >= 7) return "bg-orange-500";
  if (threat >= 4) return "bg-yellow-500";
  return "bg-background";
});
</script>
