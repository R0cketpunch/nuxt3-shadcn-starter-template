<template>
  <main v-auto-animate class="h-screen max-h-screen">
    <div v-if="!hasGameStarted">
      <div class="p-8 space-y-4">
        <h2 class="text-xl font-semibold">No Game in Progress</h2>
        <p class="text-muted-foreground">
          Start a new game to begin controlling the game flow.
        </p>
        <Button as-child size="lg">
          <NuxtLink to="/setup">Start New Game</NuxtLink>
        </Button>
      </div>
    </div>

    <div v-else class="flex flex-col min-h-screen">
      <div
        class="grid sticky top-0 right-0 left-0 grid-cols-4 grid-rows-2 gap-px border-b bg-muted"
      >
        <div
          class="flex flex-col col-span-4 justify-center items-center bg-background"
        >
          <div class="font-medium">{{ currentPhase }}</div>
          <div v-if="currentSubPhase" class="text-muted-foreground">
            {{ currentSubPhase }}
          </div>
        </div>
        <input
          ref="importFileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImportFile"
        />
        <div
          @click="resetGame"
          class="grid place-items-center cursor-pointer aspect-square bg-background"
        >
          <RotateCcw class="size-6" />
        </div>
        <div
          @click="exportGame"
          class="grid place-items-center cursor-pointer aspect-square bg-background"
        >
          <Download class="size-6" />
        </div>
        <div
          @click="importFileInput?.click()"
          class="grid place-items-center cursor-pointer aspect-square bg-background"
        >
          <Upload class="size-6" />
        </div>
        <NuxtLink
          to="/sync-test"
          class="grid place-items-center cursor-pointer aspect-square bg-background"
        >
          <Logs class="size-6" />
        </NuxtLink>
      </div>
      <div class="flex flex-col flex-1">
        <!-- Assign Orders Timer (only shown during assign-orders sub-phase) -->
        <div v-if="showAssignOrdersTimer" class="flex flex-col flex-1">
          <div class="grid flex-1 place-items-center">
            <NumberFlowGroup>
              <div class="text-6xl" :class="timer.getTimerColor()">
                <NumberFlow
                  v-if="timeComponents.hh > 0"
                  :trend="-1"
                  :value="timeComponents.hh"
                  :format="{ minimumIntegerDigits: 2 }"
                />
                <NumberFlow
                  v-if="timeComponents.hh > 0"
                  prefix=":"
                  :trend="-1"
                  :value="timeComponents.mm"
                  :digits="{ 1: { max: 5 } }"
                  :format="{ minimumIntegerDigits: 2 }"
                />
                <NumberFlow
                  v-else
                  :trend="-1"
                  :value="timeComponents.mm"
                  :format="{ minimumIntegerDigits: 1 }"
                />
                <NumberFlow
                  prefix=":"
                  :trend="-1"
                  :value="timeComponents.ss"
                  :digits="{ 1: { max: 5 } }"
                  :format="{ minimumIntegerDigits: 2 }"
                />
              </div>
            </NumberFlowGroup>
          </div>

          <!-- Timer Controls -->
          <div class="grid grid-cols-4 gap-px border-t bg-muted">
            <!-- Start Timer Button -->
            <div
              v-if="!timer.isActive.value"
              @click="startAssignOrdersTimer"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              <Play class="size-6" />
            </div>

            <!-- Pause Button -->
            <div
              v-if="timer.isActive.value && !timer.isPaused.value"
              @click="pauseTimer"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              <Pause class="size-6" />
            </div>

            <!-- Resume Button -->
            <div
              v-if="timer.isActive.value && timer.isPaused.value"
              @click="resumeTimer"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              <Play class="size-6" />
            </div>

            <!-- Reset Button -->
            <div
              @click="resetAssignOrdersTimer"
              :disabled="!timer.isActive.value"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              <RotateCcw class="size-6" />
            </div>
            <div
              @click="addTime(-60)"
              :disabled="!timer.isActive.value"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              -1m
            </div>
            <div
              @click="addTime(60)"
              :disabled="!timer.isActive.value"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
            >
              +1m
            </div>
          </div>
        </div>

        <!-- Player Controls (when turn order matters) -->
        <div
          v-if="gameState.currentSubPhase?.requiresTurnOrder"
          class="flex flex-col flex-1"
        >
          <div class="flex flex-col flex-1 justify-center items-center">
            <div class="grid flex-1 place-items-center text-2xl">
              {{ getCurrentPlayer()?.name || "None" }}
            </div>

            <div class="grid grid-cols-2 w-full">
              <div
                @click="previousPlayer"
                class="grid place-items-center bg-muted aspect-square"
              >
                <ChevronLeft class="size-6" />
              </div>
              <div
                @click="nextPlayer"
                class="grid place-items-center bg-muted aspect-square"
              >
                <ChevronRight class="size-6" />
              </div>
            </div>
          </div>
        </div>

        <!-- Influence Track Controls (Westeros Phase Only) -->
        <div
          v-if="gameState.currentPhase.id === 'westeros'"
          class="flex flex-col flex-1"
        >
          <!-- Track Navigation -->
          <div class="grid grid-cols-3 gap-px border-b bg-muted">
            <button
              v-for="(track, index) in tracks"
              :key="track.id"
              @click="currentTrackIndex = index"
              class="grid place-items-center cursor-pointer aspect-square bg-background"
              :class="
                currentTrackIndex === index
                  ? 'bg-foreground text-background'
                  : 'bg-background'
              "
            >
              {{ track.name }}
            </button>
          </div>

          <!-- Swipeable Track Container -->
          <div class="overflow-hidden relative flex-1">
            <div
              class="flex h-full transition-transform duration-300 ease-out"
              :style="{ transform: `translateX(-${currentTrackIndex * 100}%)` }"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
            >
              <!-- Iron Throne Track -->
              <div class="flex-shrink-0 w-full bg-card">
                <InfluenceTrack
                  :houses="[...gameState.ironThroneOrder]"
                  track-title="Iron Throne"
                  track-description="Turn order and tiebreakers"
                  track-type="iron-throne"
                  :allow-reordering="true"
                  @reorder-houses="handleIronThroneReorder"
                />
              </div>

              <!-- Fiefdoms Track -->
              <div class="flex-shrink-0 w-full bg-card">
                <InfluenceTrack
                  :houses="[...gameState.fiefdomsOrder]"
                  track-title="Fiefdoms"
                  track-description="Combat strength bonuses"
                  track-type="fiefdoms"
                  :allow-reordering="true"
                  @reorder-houses="handleFiefdomsReorder"
                />
              </div>

              <!-- King's Court Track -->
              <div class="flex-shrink-0 w-full bg-card">
                <InfluenceTrack
                  :houses="[...gameState.kingsCourtOrder]"
                  track-title="King's Court"
                  track-description="Special order tokens"
                  track-type="kings-court"
                  :allow-reordering="true"
                  @reorder-houses="handleKingsCourtReorder"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid sticky right-0 bottom-0 left-0 grid-cols-4 items-center">
        <div
          @click="advanceSubPhase"
          class="flex col-span-4 justify-center items-center p-4 w-full h-full text-4xl cursor-pointer bg-foreground text-background"
        >
          {{ getNextStepName }}
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  RotateCcw,
  Download,
  Upload,
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Timer,
  Users,
  Logs,
} from "lucide-vue-next";
import type { House } from "~/types/game";
import { MAX_ROUNDS } from "~/types/game";
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;
const timer = useGlobalGameTimer();

const importFileInput = ref<HTMLInputElement | null>(null);

const hasGameStarted = computed(() => {
  return gameState.value.ironThroneOrder.length > 0;
});

const currentPhase = computed(() => {
  return gameState.value.currentPhase.name;
});

const currentSubPhase = computed(() => {
  return gameState.value.currentSubPhase?.name;
});

const showAssignOrdersTimer = computed(() => {
  return (
    gameState.value.currentPhase.id === "planning" &&
    gameState.value.currentSubPhase?.id === "assign-orders"
  );
});

const assignOrdersTimerMinutes = computed(() => {
  return Math.floor(currentPhaseDuration.value / 60);
});

const formatGameStartTime = computed(() => {
  if (!gameState.value.gameStartTime) return "Unknown";
  return new Date(gameState.value.gameStartTime).toLocaleString();
});

const getNextStepName = computed(() => {
  // This logic should match GameController component
  const currentPhase = gameState.value.currentPhase;
  const currentSubPhase = gameState.value.currentSubPhase;

  if (!currentSubPhase) {
    if (currentPhase.id === "westeros") {
      return "Draw Westeros Cards";
    } else if (currentPhase.id === "planning") {
      return "Assign Orders";
    } else if (currentPhase.id === "action") {
      return "Resolve Raids";
    }
    return "Next Phase";
  }

  // Use the same logic as GameController
  // This is a simplified version - you may want to import the actual logic
  return "Continue";
});

const currentPhaseDuration = computed(() => {
  return gameStateManager.getPhaseDuration(gameState.value.currentPhase.id);
});

const timeComponents = computed(() => {
  return timer.getTimeComponents(timer.timeRemaining.value);
});

const realtimeSync = useRealtimeSync();

// Influence track carousel state
const currentTrackIndex = ref(0);
const tracks = [
  { id: "iron-throne", name: "Iron Throne" },
  { id: "fiefdoms", name: "Fiefdoms" },
  { id: "kings-court", name: "King's Court" },
];

// Touch handling for swipe gestures
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50; // Minimum distance for a swipe
  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      // Swiped left - go to next track
      currentTrackIndex.value = Math.min(
        currentTrackIndex.value + 1,
        tracks.length - 1
      );
    } else {
      // Swiped right - go to previous track
      currentTrackIndex.value = Math.max(currentTrackIndex.value - 1, 0);
    }
  }
};

const startAssignOrdersTimer = async () => {
  // Ensure audio is ready when user starts timer
  const gameAudio = useGameAudio()
  try {
    const ready = await gameAudio.ensureAudioReady()
    console.log(`Audio ready on timer start: ${ready}`)
  } catch (error) {
    console.warn('Failed to initialize audio:', error)
  }
  
  realtimeSync.broadcastTimerAction("start", currentPhaseDuration.value);
};

const resetAssignOrdersTimer = () => {
  realtimeSync.broadcastTimerAction("reset", currentPhaseDuration.value);
};

const pauseTimer = () => {
  realtimeSync.broadcastTimerAction("pause");
};

const resumeTimer = () => {
  realtimeSync.broadcastTimerAction("resume");
};

const addTime = (seconds: number) => {
  realtimeSync.broadcastTimerAction("addTime", seconds);
};

const advancePhase = () => {
  gameStateManager.nextPhase();
};

const advanceSubPhase = () => {
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
  gameStateManager.setIronThroneOrder([...reorderedHouses]);
};

const handleFiefdomsReorder = (reorderedHouses: House[]) => {
  gameStateManager.setFiefdomsOrder([...reorderedHouses]);
};

const handleKingsCourtReorder = (reorderedHouses: House[]) => {
  gameStateManager.setKingsCourtOrder([...reorderedHouses]);
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
</script>
