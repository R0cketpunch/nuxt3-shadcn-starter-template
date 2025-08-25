<template>
  <!-- Main Dashboard -->
  <main v-auto-animate class="h-screen max-h-screen">
    <div v-if="!hasGameStarted">
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

    <div
      v-else
      v-auto-animate
      class="flex flex-col min-h-screen divide-x divide-y"
    >
      <!-- Header -->
      <!-- <header class="bg-card">
        <div class="px-4 py-4 mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold">Game of Thrones: Game Master</h1>
              <p class="text-sm text-muted-foreground">
                Board Game 2nd Edition Timer & Turn Manager
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/control">Control Panel</NuxtLink>
              </Button>
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/setup">Setup</NuxtLink>
              </Button>
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/settings">Settings</NuxtLink>
              </Button>
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/sync-test">Sync Test</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </header> -->
      <!-- Main Game Dashboard -->
      <GameDisplay :game-state="gameStateForComponents" />
      <!-- Phase Indicator -->
      <PhaseIndicator
        :current-round="gameState.currentRound"
        :current-phase="gameState.currentPhase"
        :current-sub-phase="gameState.currentSubPhase"
      />
      <GameTimer
        :duration="assignOrdersDuration"
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
          :allow-reordering="false"
          :track-benefits="[
            'Decides ties',
            'Turn order in Action Phase',
            'Throne Room special orders',
          ]"
          :current-player-index="gameState.currentPlayerIndex"
          :show-current-player="shouldHighlightIronThrone"
        />

        <!-- Fiefdoms Track -->
        <InfluenceTrack
          :houses="[...gameState.fiefdomsOrder]"
          track-title="Fiefdoms"
          track-description="Provides combat bonuses"
          track-type="fiefdoms"
          :allow-reordering="false"
          :track-benefits="[
            '+1 Combat Strength (1st position)',
            'Valyrian Steel Blade holder',
            'Combat ties broken by position',
          ]"
          :current-player-index="gameState.currentPlayerIndex"
          :show-current-player="shouldHighlightFiefdoms"
        />

        <!-- King's Court Track -->
        <InfluenceTrack
          :houses="[...gameState.kingsCourtOrder]"
          track-title="King\'s Court"
          track-description="Provides special orders"
          track-type="kings-court"
          :allow-reordering="false"
          :track-benefits="[
            'Extra special orders',
            'Messenger Raven holder',
            'Star and Crown orders',
          ]"
          :current-player-index="0"
          :show-current-player="shouldHighlightKingsCourt"
        />
      </div>
      <!-- Left Column: Game Controller -->
    </div>

    <!-- Game Announcement Modal -->
    <GameAnnouncement ref="announcementModal" title="" />
  </main>
</template>

<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import type { GameState } from "~/types/game";

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;

// Create a computed property that provides the correct type for components
const gameStateForComponents = computed(
  (): GameState => ({
    currentRound: gameState.value.currentRound,
    currentPhase: gameState.value.currentPhase,
    currentSubPhase: gameState.value.currentSubPhase,
    currentPlayerIndex: gameState.value.currentPlayerIndex,
    ironThroneOrder: [...gameState.value.ironThroneOrder],
    fiefdomsOrder: [...gameState.value.fiefdomsOrder],
    kingsCourtOrder: [...gameState.value.kingsCourtOrder],
    wildlingThreat: gameState.value.wildlingThreat,
    timeRemaining: gameState.value.timeRemaining,
    isPaused: gameState.value.isPaused,
    isTimerActive: gameState.value.isTimerActive,
    gameStartTime: gameState.value.gameStartTime,
  })
);

const announcementModal = ref<{
  show: (title: string, subtitle?: string) => void;
} | null>(null);
const realtimeSync = useRealtimeSync();

const hasGameStarted = computed(() => {
  return gameState.value.ironThroneOrder.length > 0;
});

// Watch for round changes to trigger announcements
let previousRound = gameState.value.currentRound;
watch(
  () => gameState.value.currentRound,
  (newRound) => {
    if (newRound > previousRound && newRound > 1) {
      // Show announcement for new rounds (skip round 1 since that's the start)
      announcementModal.value?.show(`Round ${newRound}`);
    }
    previousRound = newRound;
  }
);

// Get assign orders duration from settings
const assignOrdersDuration = computed(() => {
  return gameStateManager.settings.value.assignOrdersDuration;
});

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

// Note: Game state loading is handled by the useGameState composable
</script>
