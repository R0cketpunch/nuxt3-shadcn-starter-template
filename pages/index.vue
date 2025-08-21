<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Game of Thrones: Game Master</h1>
            <p class="text-sm text-muted-foreground">Board Game 2nd Edition Timer & Turn Manager</p>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Emergency Pause -->
            <Button
              v-if="gameState.isTimerActive"
              @click="toggleEmergencyPause"
              :variant="gameState.isPaused ? 'default' : 'destructive'"
              size="sm"
            >
              {{ gameState.isPaused ? 'Resume' : 'Emergency Pause' }}
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
    <main class="container mx-auto px-4 py-6">
      <div v-if="!hasGameStarted" class="text-center py-12">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">No Game in Progress</h2>
          <p class="text-muted-foreground">Start a new game to begin managing turns and timers.</p>
          <Button as-child size="lg">
            <NuxtLink to="/setup">Start New Game</NuxtLink>
          </Button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Phase and Round Info -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Phase Indicator -->
          <div class="lg:col-span-1">
            <PhaseIndicator
              :current-round="gameState.currentRound"
              :current-phase="gameState.currentPhase"
              :current-sub-phase="gameState.currentSubPhase"
              @advance-phase="advancePhase"
            />
          </div>
          
          <!-- Timer -->
          <div class="lg:col-span-1 flex justify-center">
            <GameTimer
              :duration="currentPhaseDuration"
              :phase-text="getPhaseDisplayText()"
            />
          </div>
          
          <!-- Turn Order -->
          <div class="lg:col-span-1">
            <TurnOrderTrack
              :houses="gameState.ironThroneOrder"
              :current-player-index="gameState.currentPlayerIndex"
              @next-player="nextPlayer"
              @previous-player="previousPlayer"
              @set-current-player="setCurrentPlayer"
            />
          </div>
        </div>

        <!-- Action Phase Controls -->
        <div v-if="gameState.currentPhase.id === 'action'" class="bg-card rounded-lg p-6 border">
          <h3 class="text-lg font-semibold mb-4">Action Phase Controls</h3>
          
          <!-- Sub-phase Progress -->
          <div class="space-y-4">
            <div class="flex space-x-1">
              <div
                v-for="(subPhase, index) in actionSubPhases"
                :key="subPhase.id"
                class="flex-1 p-3 rounded text-center text-sm border"
                :class="{
                  'bg-green-100 border-green-500 text-green-800': isSubPhaseComplete(index),
                  'bg-blue-100 border-blue-500 text-blue-800': isCurrentSubPhase(index),
                  'bg-muted border-border text-muted-foreground': !isSubPhaseComplete(index) && !isCurrentSubPhase(index)
                }"
              >
                <div class="font-semibold">{{ subPhase.name }}</div>
                <div class="text-xs mt-1">
                  {{ subPhase.requiresTurnOrder ? 'Turn Order' : 'Simultaneous' }}
                </div>
              </div>
            </div>
            
            <!-- Sub-phase Controls -->
            <div class="flex justify-center space-x-2">
              <Button
                @click="nextSubPhase"
                :disabled="!gameState.currentSubPhase"
              >
                <ChevronRight class="w-4 h-4 mr-2" />
                Next Sub-phase
              </Button>
              
              <Button
                v-if="gameState.currentSubPhase?.requiresTurnOrder"
                @click="skipCurrentPlayer"
                variant="outline"
              >
                <SkipForward class="w-4 h-4 mr-2" />
                Skip Player
              </Button>
            </div>
          </div>
        </div>

        <!-- Game Controls -->
        <div class="flex flex-wrap gap-2 justify-center">
          <Button @click="resetGame" variant="outline">
            <RotateCcw class="w-4 h-4 mr-2" />
            Reset Game
          </Button>
          
          <Button @click="exportGame" variant="outline">
            <Download class="w-4 h-4 mr-2" />
            Export State
          </Button>
          
          <input
            ref="importFileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImportFile"
          />
          <Button @click="$refs.importFileInput?.click()" variant="outline">
            <Upload class="w-4 h-4 mr-2" />
            Import State
          </Button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, RotateCcw, Download, Upload, SkipForward } from 'lucide-vue-next'
import { ACTION_SUBPHASES } from '~/types/game'

const gameStateManager = useGameState()
const gameState = gameStateManager.gameState

const actionSubPhases = ACTION_SUBPHASES
const importFileInput = ref<HTMLInputElement | null>(null)

const hasGameStarted = computed(() => {
  return gameState.value.ironThroneOrder.length > 0
})

const currentPhaseDuration = computed(() => {
  return gameStateManager.getPhaseDuration(gameState.value.currentPhase.id)
})

const toggleEmergencyPause = () => {
  // This would need to be connected to the timer
  // For now, just update the state
  gameState.value.isPaused = !gameState.value.isPaused
}

const advancePhase = () => {
  gameStateManager.nextPhase()
}

const nextSubPhase = () => {
  gameStateManager.nextSubPhase()
}

const nextPlayer = () => {
  gameStateManager.nextPlayer()
}

const previousPlayer = () => {
  gameStateManager.previousPlayer()
}

const setCurrentPlayer = (index: number) => {
  gameState.value.currentPlayerIndex = index
}

const skipCurrentPlayer = () => {
  nextPlayer()
}

const getPhaseDisplayText = () => {
  let text = gameState.value.currentPhase.name
  if (gameState.value.currentSubPhase) {
    text += ` - ${gameState.value.currentSubPhase.name}`
  }
  return text
}

const isSubPhaseComplete = (index: number) => {
  if (!gameState.value.currentSubPhase) return false
  const currentIndex = ACTION_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
  return index < currentIndex
}

const isCurrentSubPhase = (index: number) => {
  if (!gameState.value.currentSubPhase) return index === 0
  const currentIndex = ACTION_SUBPHASES.findIndex(sp => sp.id === gameState.value.currentSubPhase!.id)
  return index === currentIndex
}

const resetGame = () => {
  if (confirm('Are you sure you want to reset the game? This will clear all progress.')) {
    gameStateManager.resetGame()
  }
}

const exportGame = () => {
  const jsonString = gameStateManager.exportGameState()
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agot-game-state-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleImportFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const jsonString = e.target?.result as string
    const success = gameStateManager.importGameState(jsonString)
    if (success) {
      alert('Game state imported successfully!')
    } else {
      alert('Failed to import game state. Please check the file format.')
    }
  }
  reader.readAsText(file)
}

// Load game state on mount
onMounted(() => {
  gameStateManager.loadGameState()
})
</script>