<template>
  <div class="space-y-4">
    <!-- Round Indicator -->
    <div class="text-center">
      <div class="text-sm text-muted-foreground">Round</div>
      <div class="text-3xl font-bold">
        {{ currentRound }} / {{ maxRounds }}
      </div>
    </div>
    
    <!-- Current Phase -->
    <div class="text-center p-6 rounded-lg border bg-card shadow-sm">
      <div class="text-sm text-muted-foreground mb-2">Current Phase</div>
      <div class="text-2xl font-bold mb-2">{{ currentPhase.name }}</div>
      <div class="text-sm text-muted-foreground">{{ currentPhase.description }}</div>
      
      <!-- Sub-phase indicator for Action phase -->
      <div v-if="currentSubPhase" class="mt-4 p-3 rounded bg-muted">
        <div class="text-sm font-semibold">{{ currentSubPhase.name }}</div>
        <div v-if="currentSubPhase.requiresTurnOrder" class="text-xs text-muted-foreground mt-1">
          Resolved in turn order
        </div>
      </div>
    </div>
    
    <!-- Phase Progress -->
    <div class="space-y-2">
      <div class="text-sm text-muted-foreground">Phase Progress</div>
      <div class="flex space-x-1">
        <div
          v-for="(phase, index) in allPhases"
          :key="phase.id"
          class="flex-1 h-2 rounded"
          :class="{
            'bg-green-500': isPhaseComplete(index),
            'bg-blue-500': isCurrentPhase(index),
            'bg-muted': !isPhaseComplete(index) && !isCurrentPhase(index)
          }"
        />
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span v-for="phase in allPhases" :key="phase.id">
          {{ phase.name.slice(0, 1) }}
        </span>
      </div>
    </div>
    
    <!-- Next Phase Preview -->
    <div v-if="nextPhase" class="text-center text-sm text-muted-foreground">
      Next: {{ nextPhase.name }}
      <span v-if="isLastPhaseOfRound"> (Round {{ nextRound }})</span>
    </div>
    
    <!-- Phase Control -->
    <div class="text-center">
      <Button
        @click="advancePhase"
        size="lg"
        class="px-8"
        :disabled="isGameComplete"
      >
        <ChevronRight class="w-4 h-4 mr-2" />
        {{ isLastPhaseOfRound ? 'Next Round' : 'Next Phase' }}
      </Button>
    </div>
    
    <!-- Game Complete Message -->
    <div v-if="isGameComplete" class="text-center p-4 rounded-lg bg-green-100 text-green-800 border border-green-200">
      <Trophy class="w-6 h-6 mx-auto mb-2" />
      <div class="font-bold">Game Complete!</div>
      <div class="text-sm">All 10 rounds have been played.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Trophy } from 'lucide-vue-next'
import type { GamePhase, ActionSubPhase } from '~/types/game'
import { GAME_PHASES, MAX_ROUNDS } from '~/types/game'

interface Props {
  currentRound: number
  currentPhase: GamePhase
  currentSubPhase?: ActionSubPhase
}

interface Emits {
  (e: 'advance-phase'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const maxRounds = MAX_ROUNDS
const allPhases = GAME_PHASES

const currentPhaseIndex = computed(() => {
  return GAME_PHASES.findIndex(p => p.id === props.currentPhase.id)
})

const nextPhase = computed(() => {
  if (props.currentPhase.id === 'action') {
    return props.currentRound < MAX_ROUNDS ? GAME_PHASES[0] : null // Back to Westeros or end
  }
  const nextIndex = currentPhaseIndex.value + 1
  return nextIndex < GAME_PHASES.length ? GAME_PHASES[nextIndex] : null
})

const nextRound = computed(() => {
  return props.currentPhase.id === 'action' ? props.currentRound + 1 : props.currentRound
})

const isLastPhaseOfRound = computed(() => {
  return props.currentPhase.id === 'action'
})

const isGameComplete = computed(() => {
  return props.currentRound > MAX_ROUNDS
})

const isPhaseComplete = (index: number) => {
  if (props.currentRound === 1) {
    return index < currentPhaseIndex.value
  }
  return false // In subsequent rounds, we only track current round phases
}

const isCurrentPhase = (index: number) => {
  return index === currentPhaseIndex.value
}

const advancePhase = () => {
  emit('advance-phase')
}
</script>