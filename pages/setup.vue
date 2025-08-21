<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Game Setup</h1>
            <p class="text-sm text-muted-foreground">Configure your Game of Thrones board game session</p>
          </div>
          
          <Button as-child variant="ghost">
            <NuxtLink to="/">← Back to Dashboard</NuxtLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Setup Form -->
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="space-y-8">
        <!-- Player Count Selection -->
        <div class="space-y-4">
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
        </div>

        <!-- House Selection -->
        <div v-if="selectedPlayerCount" class="space-y-4">
          <h2 class="text-xl font-semibold">Select Houses & Players ({{ selectedHouses.length }}/{{ selectedPlayerCount }})</h2>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">
              Choose {{ selectedPlayerCount }} houses and assign player names.
            </p>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div class="font-semibold text-blue-800 mb-1">Available Factions for {{ selectedPlayerCount }} Players:</div>
              <div class="text-blue-700">
                {{ availableHouses.map(h => h.name).join(', ') }}
                <span v-if="selectedPlayerCount < 6" class="text-blue-600 italic">
                  ({{ 6 - selectedPlayerCount }} faction{{ 6 - selectedPlayerCount > 1 ? 's' : '' }} excluded for balance)
                </span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="house in availableHouses"
              :key="house.id"
              class="p-4 rounded-lg border-2 transition-all"
              :class="[
                isHouseSelected(house.id) 
                  ? `border-2` 
                  : 'border-gray-300',
                selectedHouses.length >= selectedPlayerCount && !isHouseSelected(house.id) ? 'opacity-50' : ''
              ]"
              :style="isHouseSelected(house.id) ? { backgroundColor: house.color + '15', borderColor: house.color } : {}"
            >
              <div class="space-y-3">
                <!-- House Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="font-bold text-lg" :style="{ color: house.color }">
                      {{ house.name }}
                    </div>
                    <div v-if="isHouseSelected(house.id)">
                      <CheckCircle class="w-5 h-5" :style="{ color: house.color }" />
                    </div>
                  </div>
                  
                  <Button
                    @click="toggleHouseSelection(house)"
                    :variant="isHouseSelected(house.id) ? 'destructive' : 'default'"
                    size="sm"
                    :disabled="selectedHouses.length >= selectedPlayerCount && !isHouseSelected(house.id)"
                  >
                    {{ isHouseSelected(house.id) ? 'Remove' : 'Add' }}
                  </Button>
                </div>
                
                <!-- Player Name Input (only if house is selected) -->
                <div v-if="isHouseSelected(house.id)" class="space-y-2">
                  <label class="text-sm font-medium">Player Name</label>
                  <input
                    v-model="getSelectedHouse(house.id)!.playerName"
                    type="text"
                    :placeholder="`Player ${getPlayerNumber(house.id)}`"
                    class="w-full px-3 py-2 border rounded-md bg-background"
                    @input="updatePlayerName(house.id, $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Starting Iron Throne Order Preview -->
        <div v-if="selectedHouses.length === selectedPlayerCount" class="space-y-4">
          <h2 class="text-xl font-semibold">Starting Iron Throne Track Order</h2>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">
              The Iron Throne track starts with predefined positions based on the official rules. This order can only change during the game through Westeros card effects.
            </p>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div class="font-semibold text-blue-800 mb-1">Turn Order Mechanics:</div>
              <div class="text-blue-700">
                The Iron Throne track determines turn order during the <strong>Action Phase</strong>. All order types (Raid → March → Consolidate) 
                resolve <strong>one at a time</strong> in Iron Throne order, cycling through until all orders are resolved.
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="(house, index) in startingIronThroneOrder"
              :key="house.id"
              class="flex items-center p-4 rounded-lg border-2"
              :style="{ backgroundColor: house.color + '15', borderColor: house.color }"
            >
              <div class="flex items-center space-x-4">
                <!-- Crown for Iron Throne holder -->
                <Crown v-if="index === 0" class="w-6 h-6 text-yellow-500" />
                <div class="w-6 text-center font-bold">{{ index + 1 }}</div>
                <div class="space-y-1">
                  <div class="font-semibold" :style="{ color: house.color }">
                    {{ house.name }}
                  </div>
                  <div class="text-sm font-medium">
                    {{ getPlayerNameForHouse(house.id) || `Player ${index + 1}` }}
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

        <!-- Phase Duration Customization -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Phase Durations</h2>
          <p class="text-sm text-muted-foreground">
            Customize timer durations for each game phase. Leave empty to use defaults.
          </p>
          
          <div class="space-y-4">
            <div
              v-for="phase in gamePhases"
              :key="phase.id"
              class="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div class="font-semibold">{{ phase.name }}</div>
                <div class="text-sm text-muted-foreground">{{ phase.description }}</div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted-foreground">Default: {{ formatDuration(phase.defaultDuration) }}</span>
                <input
                  v-model.number="customDurations[phase.id]"
                  type="number"
                  :placeholder="Math.floor(phase.defaultDuration / 60).toString()"
                  class="w-20 px-3 py-2 border rounded-md"
                  min="1"
                  max="60"
                />
                <span class="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Start Game Button -->
        <div class="flex justify-center pt-8">
          <Button
            @click="startGame"
            size="lg"
            class="px-12"
            :disabled="!canStartGame"
          >
            <Play class="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </div>

        <!-- Error Messages -->
        <div v-if="errorMessage" class="text-center">
          <div class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, Crown, GripVertical, Play } from 'lucide-vue-next'
import { HOUSES, GAME_PHASES, getAvailableHouses, getStartingIronThroneOrder } from '~/types/game'
import type { House } from '~/types/game'

const gameStateManager = useGameState()
const router = useRouter()

const selectedPlayerCount = ref<number>(0)
const selectedHouses = ref<House[]>([])
const customDurations = ref<Record<string, number>>({})
const errorMessage = ref('')

const availableHouses = computed(() => {
  return selectedPlayerCount.value > 0 ? getAvailableHouses(selectedPlayerCount.value) : HOUSES
})

const startingIronThroneOrder = computed(() => {
  return selectedPlayerCount.value > 0 ? getStartingIronThroneOrder(selectedPlayerCount.value) : []
})

const gamePhases = GAME_PHASES

const canStartGame = computed(() => {
  return selectedHouses.value.length === selectedPlayerCount.value
})

const isHouseSelected = (houseId: string) => {
  return selectedHouses.value.some(h => h.id === houseId)
}

const getSelectedHouse = (houseId: string) => {
  return selectedHouses.value.find(h => h.id === houseId)
}

const getPlayerNumber = (houseId: string) => {
  const index = selectedHouses.value.findIndex(h => h.id === houseId)
  return index + 1
}

const getPlayerNameForHouse = (houseId: string) => {
  const selectedHouse = selectedHouses.value.find(h => h.id === houseId)
  return selectedHouse?.playerName
}

const updatePlayerName = (houseId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const house = selectedHouses.value.find(h => h.id === houseId)
  if (house) {
    house.playerName = target.value
  }
}

const toggleHouseSelection = (house: House) => {
  const isSelected = isHouseSelected(house.id)
  
  if (isSelected) {
    selectedHouses.value = selectedHouses.value.filter(h => h.id !== house.id)
  } else if (selectedHouses.value.length < selectedPlayerCount.value) {
    const newHouse = { 
      ...house, 
      playerName: `Player ${selectedHouses.value.length + 1}` 
    }
    selectedHouses.value.push(newHouse)
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m`
}

const startGame = () => {
  errorMessage.value = ''
  
  // Validation
  if (selectedHouses.value.length !== selectedPlayerCount.value) {
    errorMessage.value = `Please select exactly ${selectedPlayerCount.value} houses.`
    return
  }
  
  try {
    // Set up custom durations
    const customPhaseDurations: Record<string, number> = {}
    Object.entries(customDurations.value).forEach(([phaseId, minutes]) => {
      if (minutes && minutes > 0) {
        customPhaseDurations[phaseId] = minutes * 60 // Convert to seconds
      }
    })
    
    // Initialize the game with selected houses (Iron Throne order will be set automatically)
    gameStateManager.initializeGame(selectedHouses.value)
    
    // Apply custom durations
    if (Object.keys(customPhaseDurations).length > 0) {
      gameStateManager.settings.value.customPhaseDurations = customPhaseDurations
    }
    
    // Navigate to the main dashboard
    router.push('/')
  } catch (error) {
    errorMessage.value = 'Failed to start game. Please try again.'
    console.error('Game start error:', error)
  }
}

// Reset form when player count changes
watch(selectedPlayerCount, () => {
  selectedHouses.value = []
  errorMessage.value = ''
})
</script>