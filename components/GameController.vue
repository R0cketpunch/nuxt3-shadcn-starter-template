<template>
  <div class="grid grid-cols-3">
    <div class="col-span-2 p-10 space-y-2">
      <div class="text-sm text-muted-foreground">Round</div>
      <div class="text-6xl">
        <NumberFlow :value="gameState.currentRound" />
        <span class="text-muted-foreground">
          of
          <NumberFlow :value="maxRounds" />
        </span>
      </div>
      <!-- <div class="text-xs text-muted-foreground">
        {{ gameState.currentPhase.name }}
        <span v-if="gameState.currentSubPhase">
          - {{ gameState.currentSubPhase.name }}</span
        >
      </div> -->
    </div>
    <div
      @click="$emit('advance-subphase')"
      class="flex flex-col col-span-1 justify-center items-start p-10 text-white cursor-pointer bg-muted"
      :disabled="!gameState.currentSubPhase"
    >
      <div class="text-4xl font-semibold">Next</div>
      <div class="text-xl text-muted-foreground">{{ getNextStepName }}</div>
    </div>
    <!-- <div class="space-y-4">
      <div class="space-y-3">
        <div
          v-if="gameState.currentSubPhase?.requiresTurnOrder"
          class="space-y-2"
        >
          <Label class="text-sm font-medium">Player Controls</Label>
          <div class="grid grid-cols-2 gap-2">
            <Button
              @click="$emit('previous-player')"
              variant="outline"
              size="sm"
            >
              <ChevronLeft class="mr-1 w-4 h-4" />
              Previous
            </Button>
            <Button @click="$emit('next-player')" variant="outline" size="sm">
              <ChevronRight class="mr-1 w-4 h-4" />
              Next
            </Button>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Pause,
  Play,
} from "lucide-vue-next";
import {
  MAX_ROUNDS,
  GAME_PHASES,
  WESTEROS_SUBPHASES,
  PLANNING_SUBPHASES,
  ACTION_SUBPHASES,
} from "~/types/game";
import type { GameState, House } from "~/types/game";
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface Props {
  gameState: any;
  currentPlayer?: House | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "advance-phase": [];
  "advance-subphase": [];
  "next-player": [];
  "previous-player": [];
  "toggle-pause": [];
}>();

const maxRounds = MAX_ROUNDS;

const getNextStepName = computed(() => {
  const currentPhase = props.gameState.currentPhase;
  const currentSubPhase = props.gameState.currentSubPhase;
  const currentRound = props.gameState.currentRound;

  if (!currentSubPhase) {
    // If no subphase, next step is the first subphase of current phase
    if (currentPhase.id === "westeros") {
      return WESTEROS_SUBPHASES[0]?.name || "Next Phase";
    } else if (currentPhase.id === "planning") {
      return PLANNING_SUBPHASES[0]?.name || "Next Phase";
    } else if (currentPhase.id === "action") {
      return ACTION_SUBPHASES[0]?.name || "Next Phase";
    }
    return "Next Phase";
  }

  // Find current subphase and determine next
  if (currentPhase.id === "westeros") {
    const currentIndex = WESTEROS_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < WESTEROS_SUBPHASES.length - 1) {
      return WESTEROS_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of westeros phase, go to planning
      return GAME_PHASES[1].name; // Planning
    }
  } else if (currentPhase.id === "planning") {
    const currentIndex = PLANNING_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < PLANNING_SUBPHASES.length - 1) {
      return PLANNING_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of planning phase, go to action
      return GAME_PHASES[2].name; // Action
    }
  } else if (currentPhase.id === "action") {
    const currentIndex = ACTION_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < ACTION_SUBPHASES.length - 1) {
      return ACTION_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of action phase, go to next round or end game
      if (currentRound < MAX_ROUNDS) {
        return `Round ${currentRound + 1}`;
      } else {
        return "Game End";
      }
    }
  }

  return "Continue";
});
</script>
