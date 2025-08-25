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
    <!-- Wildling Threat Display -->
    <div
      class="flex flex-col items-center p-4 border-b"
      :class="wildlingThreatColor"
    >
      <div class="mb-1 text-sm text-muted-foreground">Wildling Threat</div>
      <div class="flex items-center space-x-2">
        <div class="text-2xl font-bold">
          {{ gameState.wildlingThreat }}
        </div>
        <div class="text-sm text-muted-foreground">/12</div>
      </div>
      <div
        v-if="gameState.wildlingThreat >= 10"
        class="mt-1 text-xs font-medium text-red-600"
      >
        Attack imminent!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MAX_ROUNDS } from "~/types/game";
import type { GameState, House } from "~/types/game";
import NumberFlow from "@number-flow/vue";
const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;
interface Props {
  gameState: GameState;
}

const props = defineProps<Props>();

const maxRounds = MAX_ROUNDS;

const currentPlayer = computed(() => {
  const gameStateManager = useGameState();
  return gameStateManager.getCurrentPlayer();
});

const wildlingThreatColor = computed(() => {
  const threat = gameState.value.wildlingThreat;
  if (threat >= 10) return "bg-red-600";
  if (threat >= 7) return "bg-orange-500";
  if (threat >= 4) return "bg-yellow-500";
  return "";
});
</script>
