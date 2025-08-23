<template>
  <main v-auto-animate class="h-screen max-h-screen">
    <div v-if="!hasGameStarted">
      <div class="space-y-4 p-8">
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
      <!-- Header -->
      <header class="bg-card border-b">
        <div class="px-4 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold">Game Master Control</h1>
              <p class="text-sm text-muted-foreground">
                Control panel for Game of Thrones Board Game
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <Button as-child variant="outline" size="sm">
                <NuxtLink to="/">Display View</NuxtLink>
              </Button>
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

      <div class="flex-1 p-6 space-y-6">
        <!-- Game Flow Controls -->
        <div class="grid gap-4">
          <h2 class="text-xl font-semibold">Game Flow Control</h2>
          
          <!-- Main Controls -->
          <div class="grid gap-4" :class="showAssignOrdersTimer ? 'grid-cols-2' : 'grid-cols-1'">
            <!-- Phase Control -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Play class="w-5 h-5" />
                  Phase Control
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="text-sm">
                  <div class="font-medium">Current: {{ currentPhase }}</div>
                  <div v-if="currentSubPhase" class="text-muted-foreground">
                    {{ currentSubPhase }}
                  </div>
                </div>
                
                <div class="space-y-2">
                  <Button @click="advanceSubPhase" class="w-full" size="lg">
                    <SkipForward class="mr-2 w-4 h-4" />
                    Next: {{ getNextStepName }}
                  </Button>
                  
                  <Button 
                    @click="advancePhase" 
                    variant="outline" 
                    class="w-full"
                    size="sm"
                  >
                    Skip to Next Phase
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Assign Orders Timer (only shown during assign-orders sub-phase) -->
            <Card v-if="showAssignOrdersTimer">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Timer class="w-5 h-5" />
                  Assign Orders Timer
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="text-sm space-y-1">
                  <div class="font-medium">{{ timer.formatTime(timer.timeRemaining.value) }}</div>
                  <div class="text-muted-foreground">
                    {{ timer.isPaused.value ? 'Paused' : timer.isActive.value ? 'Running' : 'Stopped' }}
                  </div>
                </div>
                
                <!-- Timer Controls -->
                <div class="flex space-x-2">
                  <!-- Start Timer Button -->
                  <Button 
                    v-if="!timer.isActive.value"
                    @click="startAssignOrdersTimer"
                    class="flex-1"
                    size="lg"
                  >
                    <Play class="mr-2 w-4 h-4" />
                    Start Timer
                  </Button>
                  
                  <!-- Pause Button -->
                  <Button
                    v-if="timer.isActive.value && !timer.isPaused.value"
                    @click="pauseTimer"
                    variant="outline"
                    size="icon"
                  >
                    <Pause class="w-4 h-4" />
                  </Button>
                  
                  <!-- Resume Button -->
                  <Button
                    v-if="timer.isActive.value && timer.isPaused.value"
                    @click="resumeTimer"
                    size="icon"
                  >
                    <Play class="w-4 h-4" />
                  </Button>
                  
                  <!-- Reset Button -->
                  <Button 
                    @click="resetAssignOrdersTimer" 
                    variant="outline" 
                    size="icon"
                    :disabled="!timer.isActive.value"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </Button>
                </div>
                
                <!-- Quick Time Adjustments -->
                <div v-if="timer.isActive.value" class="flex space-x-2">
                  <Button
                    @click="addTime(-60)"
                    variant="ghost"
                    size="sm"
                    :disabled="!timer.isActive.value"
                  >
                    -1m
                  </Button>
                  <Button
                    @click="addTime(60)"
                    variant="ghost"
                    size="sm"
                    :disabled="!timer.isActive.value"
                  >
                    +1m
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Player Controls (when turn order matters) -->
          <Card v-if="gameState.currentSubPhase?.requiresTurnOrder">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="w-5 h-5" />
                Player Turn Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="text-sm">
                  <div class="font-medium">
                    Current Player: {{ getCurrentPlayer()?.name || 'None' }}
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                  <Button @click="previousPlayer" variant="outline">
                    <ChevronLeft class="mr-2 w-4 h-4" />
                    Previous
                  </Button>
                  <Button @click="nextPlayer" variant="outline">
                    <ChevronRight class="mr-2 w-4 h-4" />
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Influence Track Controls (Westeros Phase Only) -->
        <div v-if="gameState.currentPhase.id === 'westeros'" class="space-y-4">
          <h2 class="text-xl font-semibold">Influence Track Management</h2>
          
          <div class="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Influence Tracks</CardTitle>
                <CardDescription>
                  Drag and drop houses to reorder the influence tracks during Westeros phase
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <!-- Iron Throne Track Control -->
                <div>
                  <h3 class="font-medium mb-2">Iron Throne Track</h3>
                  <InfluenceTrackControl
                    :houses="[...gameState.ironThroneOrder]"
                    @reorder="handleIronThroneReorder"
                  />
                </div>

                <!-- Fiefdoms Track Control -->
                <div>
                  <h3 class="font-medium mb-2">Fiefdoms Track</h3>
                  <InfluenceTrackControl
                    :houses="[...gameState.fiefdomsOrder]"
                    @reorder="handleFiefdomsReorder"
                  />
                </div>

                <!-- King's Court Track Control -->
                <div>
                  <h3 class="font-medium mb-2">King's Court Track</h3>
                  <InfluenceTrackControl
                    :houses="[...gameState.kingsCourtOrder]"
                    @reorder="handleKingsCourtReorder"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Game Management -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Game Management</h2>
          
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button @click="resetGame" variant="destructive">
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

            <Button as-child variant="outline">
              <NuxtLink to="/setup">New Game</NuxtLink>
            </Button>
          </div>
        </div>

        <!-- Current Game Info -->
        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Round:</span>
                {{ gameState.currentRound }} of {{ MAX_ROUNDS }}
              </div>
              <div>
                <span class="font-medium">Players:</span>
                {{ gameState.ironThroneOrder.length }}
              </div>
              <div>
                <span class="font-medium">Game Started:</span>
                {{ formatGameStartTime }}
              </div>
              <div v-if="showAssignOrdersTimer">
                <span class="font-medium">Assign Orders Duration:</span>
                {{ assignOrdersTimerMinutes }}min
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Game Announcement Modal -->
    <GameAnnouncement ref="announcementModal" title="" />
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
  Users
} from "lucide-vue-next";
import type { House } from "~/types/game";
import { MAX_ROUNDS } from "~/types/game";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const gameStateManager = useGameState();
const gameState = gameStateManager.gameState;
const timer = useGlobalGameTimer();

const importFileInput = ref<HTMLInputElement | null>(null);
const announcementModal = ref<{ show: (title: string, subtitle?: string) => void } | null>(null);

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
  return gameState.value.currentPhase.id === 'planning' && 
         gameState.value.currentSubPhase?.id === 'assign-orders';
});

const assignOrdersTimerMinutes = computed(() => {
  return Math.floor(currentPhaseDuration.value / 60);
});

const formatGameStartTime = computed(() => {
  if (!gameState.value.gameStartTime) return 'Unknown';
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

const realtimeSync = useRealtimeSync();

const startAssignOrdersTimer = () => {
  realtimeSync.broadcastTimerAction('start', currentPhaseDuration.value);
};

const resetAssignOrdersTimer = () => {
  realtimeSync.broadcastTimerAction('reset', currentPhaseDuration.value);
};

const pauseTimer = () => {
  realtimeSync.broadcastTimerAction('pause');
};

const resumeTimer = () => {
  realtimeSync.broadcastTimerAction('resume');
};

const addTime = (seconds: number) => {
  realtimeSync.broadcastTimerAction('addTime', seconds);
};

const advancePhase = () => {
  const previousRound = gameState.value.currentRound;
  gameStateManager.nextPhase();
  
  const currentRound = gameState.value.currentRound;
  if (currentRound > previousRound) {
    announcementModal.value?.show(`Round ${currentRound}`);
  }
};

const advanceSubPhase = () => {
  const previousRound = gameState.value.currentRound;
  gameStateManager.nextSubPhase();
  
  const currentRound = gameState.value.currentRound;
  if (currentRound > previousRound) {
    announcementModal.value?.show(`Round ${currentRound}`);
  }
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
  if (confirm("Are you sure you want to reset the game? This will clear all progress.")) {
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