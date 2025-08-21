<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container px-4 py-4 mx-auto">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">Game of Thrones: Game Master</h1>
            <p class="text-sm text-muted-foreground">
              Board Game 2nd Edition Timer & Turn Manager
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Emergency Pause -->
            <Button
              v-if="gameState.isTimerActive"
              @click="toggleEmergencyPause"
              :variant="gameState.isPaused ? 'default' : 'destructive'"
              size="sm"
            >
              {{ gameState.isPaused ? "Resume" : "Emergency Pause" }}
            </Button>

            <!-- Navigation -->
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/setup">Setup</NuxtLink>
            </Button>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/settings">Settings</NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="container px-4 py-6 mx-auto" v-auto-animate>
      <div v-if="!hasGameStarted" class="py-12 text-center">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">No Game in Progress</h2>
          <p class="text-muted-foreground">
            Start a new game to begin managing turns and timers.
          </p>
          <Button as-child size="lg">
            <NuxtLink to="/setup">Start New Game</NuxtLink>
          </Button>
        </div>
      </div>

      <div v-else class="space-y-6" v-auto-animate>
        <!-- Phase and Round Info -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Phase Indicator -->
          <div class="lg:col-span-1">
            <PhaseIndicator
              :current-round="gameState.currentRound"
              :current-phase="gameState.currentPhase"
              :current-sub-phase="gameState.currentSubPhase"
              @advance-phase="advancePhase"
              @advance-subphase="nextSubPhase"
            />
          </div>

          <!-- Timer -->
          <div class="flex justify-center lg:col-span-1">
            <GameTimer
              :duration="currentPhaseDuration"
              :phase-text="getPhaseDisplayText()"
            />
          </div>

          <!-- Turn Order -->
          <div class="lg:col-span-1">
            <TurnOrderTrack
              :houses="[...gameState.ironThroneOrder]"
              :current-player-index="gameState.currentPlayerIndex"
              :is-action-phase="gameState.currentPhase.id === 'action'"
              :current-sub-phase="gameState.currentSubPhase?.name"
              :allow-reordering="gameState.currentPhase.id === 'westeros'"
              @next-player="nextPlayer"
              @previous-player="previousPlayer"
              @set-current-player="setCurrentPlayer"
              @reorder-houses="handleReorderHouses"
            />
          </div>
        </div>

        <!-- Westeros Phase Controls -->
        <div
          v-if="gameState.currentPhase.id === 'westeros'"
          class="p-6 rounded-lg border bg-card"
        >
          <h3 class="mb-4 text-lg font-semibold">Westeros Phase</h3>

          <div class="text-center">
            <Button @click="advancePhase" size="lg" class="px-8">
              <ChevronRight class="mr-2 w-4 h-4" />
              Proceed to Planning Phase
            </Button>
          </div>
        </div>

        <!-- Action Phase Controls -->
        <div
          v-if="gameState.currentPhase.id === 'action'"
          class="p-6 rounded-lg border bg-card"
        >
          <h3 class="mb-4 text-lg font-semibold">
            Action Phase - Turn Order Resolution
          </h3>

          <!-- Sub-phase Progress -->
          <div class="space-y-4">
            <div class="flex space-x-1">
              <div
                :data-active="isCurrentSubPhase(index)"
                v-for="(subPhase, index) in actionSubPhases"
                :key="subPhase.id"
                class="flex-1 p-3 text-sm text-center rounded border data-[active=true]:bg-muted data-[active=true]:text-foreground text-muted-foreground"
              >
                <div class="font-semibold">{{ subPhase.name }}</div>
                <div class="mt-1 text-xs">
                  {{
                    subPhase.requiresTurnOrder
                      ? "One at a Time"
                      : "Simultaneous"
                  }}
                </div>
              </div>
            </div>

            <!-- Turn Order Queue (only show for turn order sub-phases) -->
            <div
              v-if="gameState.currentSubPhase?.requiresTurnOrder"
              class="space-y-2"
            >
              <div class="text-sm font-medium">Resolution Queue:</div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(house, index) in gameState.ironThroneOrder"
                  :key="house.id"
                  class="px-3 py-2 text-sm rounded-lg border"
                  :class="{
                    'bg-blue-100 border-blue-500 text-blue-800 font-semibold':
                      index === gameState.currentPlayerIndex,
                    'bg-gray-100 border-gray-300 text-gray-600':
                      index !== gameState.currentPlayerIndex,
                  }"
                  :style="
                    index === gameState.currentPlayerIndex
                      ? {
                          backgroundColor: house.color + '20',
                          borderColor: house.color,
                        }
                      : {}
                  "
                >
                  <div class="font-medium">
                    {{ index + 1 }}. {{ house.name }}
                  </div>
                  <div class="text-xs">
                    {{ house.playerName || `Player ${index + 1}` }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-phase Controls -->
            <div class="flex justify-center space-x-2">
              <Button
                @click="nextSubPhase"
                :disabled="!gameState.currentSubPhase"
              >
                <ChevronRight class="mr-2 w-4 h-4" />
                Next Sub-phase
              </Button>

              <Button
                v-if="gameState.currentSubPhase?.requiresTurnOrder"
                @click="skipCurrentPlayer"
                variant="outline"
              >
                <SkipForward class="mr-2 w-4 h-4" />
                Skip Current Player
              </Button>
            </div>
          </div>
        </div>

        <!-- Game Controls -->
        <div class="flex flex-wrap gap-2 justify-center">
          <Button @click="resetGame" variant="outline">
            <RotateCcw class="mr-2 w-4 h-4" />
            Reset Game
          </Button>

          <Button @click="exportGame" variant="outline">
            <Download class="mr-2 w-4 h-4" />
            Export State
          </Button>

          <input
            ref="importFileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImportFile"
          />
          <Button @click="importFileInput?.click()" variant="outline">
            <Upload class="mr-2 w-4 h-4" />
            Import State
          </Button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRight,
  RotateCcw,
  Download,
  Upload,
  SkipForward,
} from "lucide-vue-next";
import { ACTION_SUBPHASES } from "~/types/game";
import type { House } from "~/types/game";
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;

const actionSubPhases = ACTION_SUBPHASES;
const importFileInput = ref<HTMLInputElement | null>(null);

const hasGameStarted = computed(() => {
  return gameState.value.ironThroneOrder.length > 0;
});

const currentPhaseDuration = computed(() => {
  return gameStateManager.getPhaseDuration(gameState.value.currentPhase.id);
});

const toggleEmergencyPause = () => {
  gameStateManager.togglePause();
};

const advancePhase = () => {
  gameStateManager.nextPhase();
};

const nextSubPhase = () => {
  gameStateManager.nextSubPhase();
};

const nextPlayer = () => {
  gameStateManager.nextPlayer();
};

const previousPlayer = () => {
  gameStateManager.previousPlayer();
};

const setCurrentPlayer = (index: number) => {
  gameStateManager.setCurrentPlayerIndex(index);
};

const skipCurrentPlayer = () => {
  nextPlayer();
};

const handleReorderHouses = (reorderedHouses: House[]) => {
  gameStateManager.setIronThroneOrder(reorderedHouses);
};

const getPhaseDisplayText = () => {
  let text = gameState.value.currentPhase.name;
  if (gameState.value.currentSubPhase) {
    text += ` - ${gameState.value.currentSubPhase.name}`;
  }
  return text;
};

const isCurrentSubPhase = (index: number) => {
  if (!gameState.value.currentSubPhase) return index === 0;
  const currentIndex = ACTION_SUBPHASES.findIndex(
    (sp) => sp.id === gameState.value.currentSubPhase!.id
  );
  return index === currentIndex;
};

const resetGame = () => {
  if (
    confirm(
      "Are you sure you want to reset the game? This will clear all progress."
    )
  ) {
    gameStateManager.resetGame();
  }
};

const exportGame = () => {
  const jsonString = gameStateManager.exportGameState();
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agot-game-state-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleImportFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const jsonString = e.target?.result as string;
    const success = gameStateManager.importGameState(jsonString);
    if (success) {
      alert("Game state imported successfully!");
    } else {
      alert("Failed to import game state. Please check the file format.");
    }
  };
  reader.readAsText(file);
};

// Load game state on mount
onMounted(() => {
  gameStateManager.loadGameState();
});
</script>
