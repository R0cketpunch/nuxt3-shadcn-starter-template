<template>
  <div class="container px-4 py-8 mx-auto space-y-6">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-3xl font-bold">Real-time Sync Test</h1>
      <p class="mb-6 text-muted-foreground">
        Test the Pusher-based real-time synchronization between devices. Open
        this page on multiple devices or browsers to see changes sync in
        real-time.
      </p>

      <!-- Connection Status -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <span>Connection Status</span>
            <ConnectionStatus :status="connectionStatus" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <p><strong>Status:</strong> {{ connectionStatus }}</p>
            <p><strong>Connected:</strong> {{ isConnected ? "Yes" : "No" }}</p>
            <p><strong>Current Round:</strong> {{ gameState.currentRound }}</p>
            <p>
              <strong>Current Phase:</strong> {{ gameState.currentPhase.name }}
            </p>
            <p>
              <strong>Player Count:</strong>
              {{ gameState.ironThroneOrder.length }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Test Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>
            Perform these actions to test real-time sync
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Button @click="testNextRound" class="w-full">
              Advance to Next Round
            </Button>
            <Button @click="testPhaseChange" variant="outline" class="w-full">
              Change Phase
            </Button>
            <Button @click="testResetGame" variant="destructive" class="w-full">
              Reset Game (Test Reset Sync)
            </Button>
          </div>

          <div class="mt-6">
            <h3 class="mb-2 font-medium">Quick Setup (if no game):</h3>
            <Button @click="setupTestGame" variant="outline" size="sm">
              Create Test Game (6 players)
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Sync Log -->
      <Card>
        <CardHeader>
          <CardTitle>Sync Activity Log</CardTitle>
          <CardDescription>
            Recent sync events (check browser console for detailed logs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="overflow-y-auto space-y-1 max-h-40 font-mono text-sm">
            <div
              v-for="log in syncLogs"
              :key="log.id"
              class="flex items-center space-x-2"
            >
              <span
                :class="
                  log.type === 'success'
                    ? 'text-green-600'
                    : log.type === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600'
                "
              >
                {{
                  log.type === "success"
                    ? "✅"
                    : log.type === "error"
                    ? "❌"
                    : "ℹ️"
                }}
              </span>
              <span class="text-xs text-muted-foreground">{{
                log.timestamp
              }}</span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HOUSES } from "~/types/game";

const {
  gameState,
  connectionStatus,
  isConnected,
  initializeGame,
  nextPhase,
  resetGame,
} = useGameState();
const syncLogs = ref<
  Array<{
    id: number;
    type: "info" | "success" | "error";
    message: string;
    timestamp: string;
  }>
>([]);

let logId = 0;

const addLog = (type: "info" | "success" | "error", message: string) => {
  syncLogs.value.unshift({
    id: logId++,
    type,
    message,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Keep only last 20 logs
  if (syncLogs.value.length > 20) {
    syncLogs.value = syncLogs.value.slice(0, 20);
  }
};

const testNextRound = () => {
  if (gameState.value.ironThroneOrder.length === 0) {
    addLog("error", "No game in progress. Create a test game first.");
    return;
  }

  const oldRound = gameState.value.currentRound;
  gameState.value.currentRound++;
  addLog(
    "info",
    `Advanced from Round ${oldRound} to Round ${gameState.value.currentRound}`
  );
};

const testPhaseChange = () => {
  if (gameState.value.ironThroneOrder.length === 0) {
    addLog("error", "No game in progress. Create a test game first.");
    return;
  }

  const oldPhase = gameState.value.currentPhase.name;
  nextPhase();
  addLog(
    "info",
    `Changed phase from ${oldPhase} to ${gameState.value.currentPhase.name}`
  );
};

const testResetGame = () => {
  resetGame();
  addLog("info", "Game reset - this should sync to all devices");
};

const setupTestGame = () => {
  // Create a simple 6-player game for testing
  const testHouses = [
    { ...HOUSES[0], playerName: "Jonathan" }, // Stark
    { ...HOUSES[1], playerName: "Pete" }, // Lannister
    { ...HOUSES[2], playerName: "John" }, // Baratheon
    { ...HOUSES[3], playerName: "Dave" }, // Tyrell
    { ...HOUSES[4], playerName: "Jim" }, // Tyrell
    { ...HOUSES[5], playerName: "Jill" }, // Greyjoy
  ];

  initializeGame(testHouses);
  addLog("success", "Created test game with 3 players");
};

// Add log when component mounts
onMounted(() => {
  addLog("info", "Sync test page loaded");

  // Watch for connection status changes
  watch(connectionStatus, (newStatus, oldStatus) => {
    if (oldStatus && newStatus !== oldStatus) {
      addLog("info", `Connection status changed: ${oldStatus} → ${newStatus}`);
    }
  });

  // Watch for game state changes (these indicate incoming sync events)
  watch(
    gameState,
    () => {
      addLog("success", "Game state updated (possibly from another device)");
    },
    { deep: true }
  );
});
</script>
