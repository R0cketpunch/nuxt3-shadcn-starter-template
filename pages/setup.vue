<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container px-4 py-4 mx-auto">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">Game Setup</h1>
            <p class="text-sm text-muted-foreground">
              Configure your Game of Thrones board game session
            </p>
          </div>

          <Button as-child variant="ghost">
            <NuxtLink to="/">← Back to Dashboard</NuxtLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Setup Form -->
    <main class="container px-4 py-8 mx-auto max-w-4xl" v-auto-animate>
      <div class="space-y-8">
        <!-- Progress Indicator -->
        <div class="flex items-center justify-center space-x-4 mb-8">
          <div class="flex items-center space-x-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', 
                         setupStep === 'player-count' ? 'bg-blue-500 text-white' : 
                         ['player-names', 'house-assignment', 'final-setup'].includes(setupStep) ? 'bg-green-500 text-white' : 'bg-gray-300']">1</div>
            <span :class="setupStep === 'player-count' ? 'font-semibold' : ''">Players</span>
          </div>
          <div class="w-8 h-px bg-gray-300"></div>
          <div class="flex items-center space-x-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', 
                         setupStep === 'player-names' ? 'bg-blue-500 text-white' : 
                         ['house-assignment', 'final-setup'].includes(setupStep) ? 'bg-green-500 text-white' : 'bg-gray-300']">2</div>
            <span :class="setupStep === 'player-names' ? 'font-semibold' : ''">Names</span>
          </div>
          <div class="w-8 h-px bg-gray-300"></div>
          <div class="flex items-center space-x-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', 
                         setupStep === 'house-assignment' ? 'bg-blue-500 text-white' : 
                         setupStep === 'final-setup' ? 'bg-green-500 text-white' : 'bg-gray-300']">3</div>
            <span :class="setupStep === 'house-assignment' ? 'font-semibold' : ''">Houses</span>
          </div>
          <div class="w-8 h-px bg-gray-300"></div>
          <div class="flex items-center space-x-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', 
                         setupStep === 'final-setup' ? 'bg-blue-500 text-white' : 'bg-gray-300']">4</div>
            <span :class="setupStep === 'final-setup' ? 'font-semibold' : ''">Setup</span>
          </div>
        </div>

        <!-- Step 1: Player Count Selection -->
        <div v-if="setupStep === 'player-count'" class="space-y-4">
          <h2 class="text-xl font-semibold">Number of Players</h2>
          <div class="flex space-x-2">
            <Button
              v-for="count in [3, 4, 5, 6]"
              :key="count"
              @click="selectedPlayerCount = count"
              :variant="selectedPlayerCount === count ? 'default' : 'outline'"
              class="px-8"
            >
              {{ count }} Players
            </Button>
          </div>
          
          <!-- Navigation -->
          <div class="flex justify-end pt-6">
            <Button
              @click="setupStep = 'player-names'"
              :disabled="selectedPlayerCount === 0"
              size="lg"
            >
              Next: Enter Names →
            </Button>
          </div>
        </div>

        <!-- Step 2: Player Names -->
        <div v-if="setupStep === 'player-names'" class="space-y-4">
          <h2 class="text-xl font-semibold">Enter Player Names</h2>
          <p class="text-sm text-muted-foreground">
            Enter the names of all {{ selectedPlayerCount }} players. You can customize these or use the defaults.
          </p>
          
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div 
              v-for="(name, index) in playerNames" 
              :key="index"
              class="space-y-2"
            >
              <label class="text-sm font-medium">Player {{ index + 1 }}</label>
              <input
                v-model="playerNames[index]"
                type="text"
                :placeholder="`Player ${index + 1}`"
                class="px-3 py-2 w-full rounded-md border bg-background"
              />
            </div>
          </div>
          
          <!-- Navigation -->
          <div class="flex justify-between pt-6">
            <Button @click="goBack" variant="outline" size="lg">
              ← Back
            </Button>
            <Button
              @click="proceedToHouseAssignment"
              :disabled="!canProceedToHouseAssignment"
              size="lg"
            >
              Next: Choose Houses →
            </Button>
          </div>
        </div>

        <!-- Step 3: House Assignment Method -->
        <div v-if="setupStep === 'house-assignment'" class="space-y-6">
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">House Assignment</h2>
            <p class="text-sm text-muted-foreground">
              Choose how to assign houses to players.
            </p>
            
            <!-- Assignment Method Selection -->
            <div class="flex space-x-4">
              <Button
                @click="assignmentMethod = 'random'"
                :variant="assignmentMethod === 'random' ? 'default' : 'outline'"
                class="px-6"
              >
                🎲 Random Assignment
              </Button>
              <Button
                @click="assignmentMethod = 'manual'"
                :variant="assignmentMethod === 'manual' ? 'default' : 'outline'"
                class="px-6"
              >
                🎯 Manual Selection
              </Button>
            </div>

            <!-- Preview for Random Assignment -->
            <div v-if="assignmentMethod === 'random'" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="mb-2 font-semibold text-blue-800">Random Assignment</div>
              <div class="text-sm text-blue-700">
                Houses will be randomly assigned to players. Available houses for {{ selectedPlayerCount }} players:
                <strong>{{ availableHouses.map(h => h.name).join(', ') }}</strong>
              </div>
            </div>

            <!-- Manual Selection Interface -->
            <div v-if="assignmentMethod === 'manual'" class="space-y-4">
              <div class="p-4 bg-green-50 rounded-lg border border-green-200">
                <div class="mb-2 font-semibold text-green-800">Manual Selection</div>
                <div class="text-sm text-green-700">
                  Choose which house each player will control.
                </div>
              </div>
              
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  v-for="house in availableHouses"
                  :key="house.id"
                  class="p-4 rounded-lg border-2 transition-all"
                  :class="[
                    isHouseSelected(house.id) ? `border-2` : 'border-gray-300',
                    selectedHouses.length >= selectedPlayerCount &&
                    !isHouseSelected(house.id)
                      ? 'opacity-50'
                      : '',
                  ]"
                  :style="
                    isHouseSelected(house.id)
                      ? {
                          backgroundColor: house.color + '15',
                          borderColor: house.color,
                        }
                      : {}
                  "
                >
                  <div class="space-y-3">
                    <!-- House Header -->
                    <div class="flex justify-between items-center">
                      <div class="flex items-center space-x-3">
                        <div
                          class="text-lg font-bold"
                          :style="{ color: house.color }"
                        >
                          {{ house.name }}
                        </div>
                        <div v-if="isHouseSelected(house.id)">
                          <CheckCircle
                            class="w-5 h-5"
                            :style="{ color: house.color }"
                          />
                        </div>
                      </div>

                      <Button
                        @click="toggleHouseSelection(house)"
                        :variant="
                          isHouseSelected(house.id) ? 'destructive' : 'default'
                        "
                        size="sm"
                        :disabled="
                          selectedHouses.length >= selectedPlayerCount &&
                          !isHouseSelected(house.id)
                        "
                      >
                        {{ isHouseSelected(house.id) ? "Remove" : "Add" }}
                      </Button>
                    </div>

                    <!-- Player Assignment (only if house is selected) -->
                    <div v-if="isHouseSelected(house.id)" class="space-y-2">
                      <label class="text-sm font-medium">Assigned Player</label>
                      <select
                        v-model="getSelectedHouse(house.id)!.playerName"
                        class="px-3 py-2 w-full rounded-md border bg-background"
                      >
                        <option v-for="name in playerNames" :key="name" :value="name">
                          {{ name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation -->
          <div class="flex justify-between pt-6">
            <Button @click="goBack" variant="outline" size="lg">
              ← Back
            </Button>
            <Button
              @click="proceedToFinalSetup"
              :disabled="!canProceedToFinalSetup"
              size="lg"
            >
              Next: Final Setup →
            </Button>
          </div>
        </div>

        <!-- Step 4: Final Setup -->
        <div v-if="setupStep === 'final-setup'" class="space-y-6">

        <!-- Starting Iron Throne Order Preview -->
        <div
          v-if="selectedHouses.length === selectedPlayerCount"
          class="space-y-4"
        >
          <h2 class="text-xl font-semibold">
            Starting Iron Throne Track Order
          </h2>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">
              The Iron Throne track starts with predefined positions based on
              the official rules. This order can only change during the game
              through Westeros card effects.
            </p>
            <div
              class="p-3 text-sm bg-blue-50 rounded-lg border border-blue-200"
            >
              <div class="mb-1 font-semibold text-blue-800">
                Turn Order Mechanics:
              </div>
              <div class="text-blue-700">
                The Iron Throne track determines turn order during the
                <strong>Action Phase</strong>. All order types (Raid → March →
                Consolidate) resolve <strong>one at a time</strong> in Iron
                Throne order, cycling through until all orders are resolved.
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(house, index) in startingIronThroneOrder"
              :key="house.id"
              class="flex items-center p-4 rounded-lg border-2"
              :style="{
                backgroundColor: house.color + '15',
                borderColor: house.color,
              }"
            >
              <div class="flex items-center space-x-4">
                <!-- Crown for Iron Throne holder -->
                <Crown v-if="index === 0" class="w-6 h-6 text-yellow-500" />
                <div class="w-6 font-bold text-center">{{ index + 1 }}</div>
                <div class="space-y-1">
                  <div class="font-semibold" :style="{ color: house.color }">
                    {{ house.name }}
                  </div>
                  <div class="text-sm font-medium">
                    {{
                      getPlayerNameForHouse(house.id) || `Player ${index + 1}`
                    }}
                  </div>
                  <div v-if="index === 0" class="text-xs text-muted-foreground">
                    (Iron Throne Holder)
                  </div>
                </div>
              </div>

              <div class="ml-auto text-xs text-muted-foreground">
                Official Starting Position
              </div>
            </div>
          </div>
        </div>

        <!-- Timer Configuration -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Timer Configuration</h2>
          <p class="text-sm text-muted-foreground">
            Set the duration for the Assign Orders timer during the Planning phase.
          </p>

          <div class="flex justify-between items-center p-4 rounded-lg border">
            <div>
              <div class="font-semibold">Assign Orders Timer</div>
              <div class="text-sm text-muted-foreground">
                Timer for players to assign order tokens during Planning phase
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground">Default: 8min</span>
              <input
                v-model.number="assignOrdersDuration"
                type="number"
                placeholder="8"
                class="px-3 py-2 w-20 rounded-md border"
                min="1"
                max="30"
                step="1"
              />
              <span class="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between pt-6">
          <Button @click="goBack" variant="outline" size="lg">
            ← Back
          </Button>
          <Button
            @click="startGame"
            size="lg"
            class="px-12"
            :disabled="!canStartGame"
          >
            <Play class="mr-2 w-5 h-5" />
            Start Game
          </Button>
        </div>
      </div>

      <!-- Error Messages -->
        <div v-if="errorMessage" class="text-center">
          <div
            class="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200"
          >
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, Crown, GripVertical, Play } from "lucide-vue-next";
import {
  HOUSES,
  getAvailableHouses,
  getStartingIronThroneOrder,
} from "~/types/game";
import type { House } from "~/types/game";
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const gameStateManager = useGameState();
const router = useRouter();

const selectedPlayerCount = ref<number>(0);
const selectedHouses = ref<House[]>([]);
const errorMessage = ref("");
const assignOrdersDuration = ref<number>(8); // Default 8 minutes

// New state for the multi-step setup
const setupStep = ref<'player-count' | 'player-names' | 'house-assignment' | 'final-setup'>('player-count');
const playerNames = ref<string[]>([]);
const assignmentMethod = ref<'random' | 'manual'>('manual');

// No complex duration handling needed - just one simple timer

const availableHouses = computed(() => {
  return selectedPlayerCount.value > 0
    ? getAvailableHouses(selectedPlayerCount.value)
    : HOUSES;
});

const startingIronThroneOrder = computed(() => {
  return selectedPlayerCount.value > 0
    ? getStartingIronThroneOrder(selectedPlayerCount.value)
    : [];
});

// gamePhases no longer needed - we only have one timer now

const canStartGame = computed(() => {
  return selectedHouses.value.length === selectedPlayerCount.value;
});

const canProceedToHouseAssignment = computed(() => {
  return playerNames.value.length === selectedPlayerCount.value && 
         playerNames.value.every(name => name.trim().length > 0);
});

const canProceedToFinalSetup = computed(() => {
  if (assignmentMethod.value === 'random') {
    return true; // Can always proceed with random assignment
  } else {
    return selectedHouses.value.length === selectedPlayerCount.value;
  }
});

const isHouseSelected = (houseId: string) => {
  return selectedHouses.value.some((h) => h.id === houseId);
};

const getSelectedHouse = (houseId: string) => {
  return selectedHouses.value.find((h) => h.id === houseId);
};

const getPlayerNumber = (houseId: string) => {
  const index = selectedHouses.value.findIndex((h) => h.id === houseId);
  return index + 1;
};

const getPlayerNameForHouse = (houseId: string) => {
  const selectedHouse = selectedHouses.value.find((h) => h.id === houseId);
  return selectedHouse?.playerName;
};

const updatePlayerName = (houseId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const house = selectedHouses.value.find((h) => h.id === houseId);
  if (house) {
    house.playerName = target.value;
  }
};

const toggleHouseSelection = (house: House) => {
  const isSelected = isHouseSelected(house.id);

  if (isSelected) {
    selectedHouses.value = selectedHouses.value.filter(
      (h) => h.id !== house.id
    );
  } else if (selectedHouses.value.length < selectedPlayerCount.value) {
    const newHouse = {
      ...house,
      playerName: `Player ${selectedHouses.value.length + 1}`,
    };
    selectedHouses.value.push(newHouse);
  }
};

// formatDuration no longer needed

const proceedToHouseAssignment = () => {
  if (!canProceedToHouseAssignment.value) {
    errorMessage.value = "Please enter names for all players.";
    return;
  }
  setupStep.value = 'house-assignment';
  errorMessage.value = "";
};

const proceedToFinalSetup = () => {
  if (assignmentMethod.value === 'random') {
    assignHousesRandomly();
  }
  setupStep.value = 'final-setup';
  errorMessage.value = "";
};

const assignHousesRandomly = () => {
  const available = [...availableHouses.value];
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  selectedHouses.value = shuffled.slice(0, selectedPlayerCount.value).map((house, index) => ({
    ...house,
    playerName: playerNames.value[index]
  }));
};

const goBack = () => {
  switch (setupStep.value) {
    case 'player-names':
      setupStep.value = 'player-count';
      break;
    case 'house-assignment':
      setupStep.value = 'player-names';
      break;
    case 'final-setup':
      setupStep.value = 'house-assignment';
      break;
  }
  errorMessage.value = "";
};

const startGame = () => {
  errorMessage.value = "";

  // Validation
  if (selectedHouses.value.length !== selectedPlayerCount.value) {
    errorMessage.value = `Please select exactly ${selectedPlayerCount.value} houses.`;
    return;
  }

  try {
    // Save timer duration settings before initializing the game
    if (assignOrdersDuration.value !== 8) {
      gameStateManager.updateSettings({
        ...gameStateManager.settings.value,
        assignOrdersDuration: assignOrdersDuration.value * 60 // Convert minutes to seconds
      });
    }

    // Initialize the game with selected houses (Iron Throne order will be set automatically)
    gameStateManager.initializeGame(selectedHouses.value);

    // Navigate to the main dashboard
    router.push("/");
  } catch (error) {
    errorMessage.value = "Failed to start game. Please try again.";
    console.error("Game start error:", error);
  }
};

// Reset form when player count changes
watch(selectedPlayerCount, () => {
  selectedHouses.value = [];
  playerNames.value = [];
  errorMessage.value = "";
  setupStep.value = 'player-names';
});

// Initialize player names array when needed
watch([selectedPlayerCount, setupStep], ([count, step]) => {
  if (step === 'player-names' && count > 0) {
    playerNames.value = Array(count).fill('').map((_, i) => `Player ${i + 1}`);
  }
});

// No initialization needed for the simple timer approach
</script>
