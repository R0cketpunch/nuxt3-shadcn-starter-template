<template>
  <div class="grid grid-cols-3">
    <div class="flex col-span-2 items-center px-8 h-32">
      <div class="text-6xl">
        <NumberFlow :value="gameState.currentRound" />
        <span class="text-2xl text-muted-foreground">
          of
          <NumberFlow :value="maxRounds" />
        </span>
      </div>
    </div>
    <!-- Wildling Threat Display -->
    <div class="flex items-center px-8 h-32" :class="wildlingThreatColor">
      <!-- <Skull class="size-10" /> -->
      <div class="text-6xl">
        <NumberFlow :value="gameState.wildlingThreat" />
        <span class="text-2xl text-muted-foreground">
          of
          <NumberFlow :value="12" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skull } from "lucide-vue-next";
import { MAX_ROUNDS } from "~/types/game";
import NumberFlow from "@number-flow/vue";

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;

const maxRounds = MAX_ROUNDS;

const currentPlayer = computed(() => {
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
