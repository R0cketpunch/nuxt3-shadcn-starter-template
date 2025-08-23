<template>
  <div class="grid grid-cols-3">
    <div class="col-span-2 p-10">
      <div class="text-6xl">
        <NumberFlow :value="gameState.currentRound" />
        <span class="text-muted-foreground">
          of
          <NumberFlow :value="maxRounds" />
        </span>
      </div>
    </div>
    <div class="flex flex-col col-span-1 justify-center items-start p-10 text-white bg-muted">
      <div class="text-4xl font-semibold">{{ gameState.currentPhase.name }}</div>
      <div v-if="gameState.currentSubPhase" class="text-xl text-muted-foreground">
        {{ gameState.currentSubPhase.name }}
      </div>
      <div v-if="currentPlayer" class="text-sm text-muted-foreground mt-2">
        Current: {{ currentPlayer.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MAX_ROUNDS } from "~/types/game";
import type { GameState, House } from "~/types/game";
import NumberFlow from "@number-flow/vue";

interface Props {
  gameState: GameState;
}

const props = defineProps<Props>();

const maxRounds = MAX_ROUNDS;

const currentPlayer = computed(() => {
  const gameStateManager = useGameState();
  return gameStateManager.getCurrentPlayer();
});
</script>