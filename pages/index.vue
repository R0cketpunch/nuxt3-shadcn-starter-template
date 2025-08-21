<template>
  <!-- Main Dashboard -->
  <main v-auto-animate>
    <div v-if="!hasGameStarted">
      <div class="space-y-4">
        as
        <h2 class="text-xl font-semibold">No Game in Progress</h2>
        <p class="text-muted-foreground">
          Start a new game to begin managing turns and timers.
        </p>
        <Button as-child size="lg">
          <NuxtLink to="/setup">Start New Game</NuxtLink>
        </Button>
      </div>
    </div>

    <div
      v-else
      v-auto-animate
      class="flex flex-col min-h-screen divide-x divide-y"
    >
      <!-- Header -->
      <header class="bg-card">
        <div class="px-4 py-4 mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold">Game of Thrones: Game Master</h1>
              <p class="text-sm text-muted-foreground">
                Board Game 2nd Edition Timer & Turn Manager
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <div class="flex flex-wrap gap-2 justify-center">
                <Button @click="resetGame" variant="outline" size="sm">
                  <RotateCcw class="mr-2 w-4 h-4" />
                  Reset Game
                </Button>

                <Button @click="exportGame" variant="outline" size="sm">
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
                <Button
                  @click="importFileInput?.click()"
                  variant="outline"
                  size="sm"
                >
                  <Upload class="mr-2 w-4 h-4" />
                  Import State
                </Button>
              </div>
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/setup">Setup</NuxtLink>
              </Button>
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/settings">Settings</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <!-- Main Game Dashboard -->
      <GameController
        :game-state="gameState"
        :current-player="getCurrentPlayer()"
        @advance-phase="advancePhase"
        @advance-subphase="nextSubPhase"
        @next-player="nextPlayer"
        @previous-player="previousPlayer"
        @toggle-pause="toggleEmergencyPause"
      />
      <!-- Phase Indicator -->
      <PhaseIndicator
        :current-round="gameState.currentRound"
        :current-phase="gameState.currentPhase"
        :current-sub-phase="gameState.currentSubPhase"
        @advance-phase="advancePhase"
        @advance-subphase="nextSubPhase"
        @next-player="nextPlayer"
      />
      <GameTimer
        :duration="currentPhaseDuration"
        :phase-text="currentPhase"
        :sub-phase-text="currentSubPhase"
        :current-sub-phase="gameState.currentSubPhase?.id"
        :game-start-time="gameState.gameStartTime"
      />
      <!-- Influence Tracks -->
      <div class="grid flex-1 grid-cols-3 gap-px bg-muted">
        <!-- Iron Throne Track -->
        <InfluenceTrack
          :houses="[...gameState.ironThroneOrder]"
          track-title="Iron Throne"
          track-description="Determines turn order and ties"
          track-type="iron-throne"
          :allow-reordering="gameState.currentPhase.id === 'westeros'"
          :track-benefits="[
            'Decides ties',
            'Turn order in Action Phase',
            'Throne Room special orders',
          ]"
          :current-player-index="gameState.currentPlayerIndex"
          :show-current-player="shouldHighlightIronThrone"
          @reorder-houses="handleIronThroneReorder"
        />

        <!-- Fiefdoms Track -->
        <InfluenceTrack
          :houses="[...gameState.fiefdomsOrder]"
          track-title="Fiefdoms"
          track-description="Provides combat bonuses"
          track-type="fiefdoms"
          :allow-reordering="gameState.currentPhase.id === 'westeros'"
          :track-benefits="[
            '+1 Combat Strength (1st position)',
            'Valyrian Steel Blade holder',
            'Combat ties broken by position',
          ]"
          :current-player-index="gameState.currentPlayerIndex"
          :show-current-player="shouldHighlightFiefdoms"
          @reorder-houses="handleFiefdomsReorder"
        />

        <!-- King's Court Track -->
        <InfluenceTrack
          :houses="[...gameState.kingsCourtOrder]"
          track-title="King\'s Court"
          track-description="Provides special orders"
          track-type="kings-court"
          :allow-reordering="gameState.currentPhase.id === 'westeros'"
          :track-benefits="[
            'Extra special orders',
            'Messenger Raven holder',
            'Star and Crown orders',
          ]"
          :current-player-index="0"
          :show-current-player="shouldHighlightKingsCourt"
          @reorder-houses="handleKingsCourtReorder"
        />
      </div>
      <!-- Left Column: Game Controller -->
    </div>
  </main>
</template>

<script setup lang="ts">
import { RotateCcw, Download, Upload } from "lucide-vue-next";
import type { House } from "~/types/game";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;

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

const getCurrentPlayer = () => {
  return gameStateManager.getCurrentPlayer();
};

const handleIronThroneReorder = (reorderedHouses: House[]) => {
  gameStateManager.setIronThroneOrder(reorderedHouses);
};

const handleFiefdomsReorder = (reorderedHouses: House[]) => {
  gameStateManager.setFiefdomsOrder(reorderedHouses);
};

const handleKingsCourtReorder = (reorderedHouses: House[]) => {
  gameStateManager.setKingsCourtOrder(reorderedHouses);
};

const currentPhase = computed(() => {
  return gameState.value.currentPhase.name;
});

const currentSubPhase = computed(() => {
  return gameState.value.currentSubPhase?.name;
});

// Determine which tracks should show current player highlighting
const shouldHighlightIronThrone = computed(() => {
  const currentSubPhase = gameState.value.currentSubPhase;
  // Iron Throne track is used for turn order in Action phase sub-phases and some Planning sub-phases
  return currentSubPhase?.requiresTurnOrder || false;
});

const shouldHighlightFiefdoms = computed(() => {
  // Fiefdoms track is primarily used during combat, which we don't have implemented yet
  // So for now, never highlight
  return false;
});

const shouldHighlightKingsCourt = computed(() => {
  const currentSubPhase = gameState.value.currentSubPhase;
  // King's Court track is used during "Use Messenger Raven" sub-phase
  return currentSubPhase?.id === "messenger-raven";
});

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
