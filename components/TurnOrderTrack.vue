<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Iron Throne Track</h3>
    
    <!-- Turn Order Display -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <div
        v-for="(house, index) in houses"
        :key="house.id"
        class="relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105"
        :class="[
          `border-[${house.color}]`,
          {
            'ring-4 ring-yellow-400 ring-opacity-50 shadow-lg': index === currentPlayerIndex,
            'opacity-50': !isCurrentPlayerTurn(index)
          }
        ]"
        :style="{ backgroundColor: house.color + '20', borderColor: house.color }"
        @click="setCurrentPlayer(index)"
      >
        <!-- Crown for Iron Throne holder -->
        <Crown 
          v-if="index === 0" 
          class="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 bg-background rounded-full p-1" 
        />
        
        <div class="text-center">
          <div class="font-bold text-sm" :style="{ color: house.color }">
            {{ house.name }}
          </div>
          <div class="text-xs font-medium text-foreground">
            {{ house.playerName || `Player ${index + 1}` }}
          </div>
          <div class="text-xs text-muted-foreground">
            Position {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Current Player Indicator -->
    <div v-if="currentPlayer" class="text-center p-4 rounded-lg border bg-card">
      <div class="text-sm text-muted-foreground">Current Player</div>
      <div 
        class="text-xl font-bold"
        :style="{ color: currentPlayer.color }"
      >
        {{ currentPlayer.name }}
      </div>
      <div class="text-sm font-medium text-muted-foreground">
        {{ currentPlayer.playerName || `Player ${currentPlayerIndex + 1}` }}
      </div>
    </div>
    
    <!-- Turn Controls -->
    <div class="flex justify-center space-x-2">
      <Button
        @click="previousPlayer"
        variant="outline"
        size="sm"
        :disabled="houses.length === 0"
      >
        <ChevronLeft class="w-4 h-4 mr-1" />
        Previous
      </Button>
      
      <Button
        @click="nextPlayerAction"
        size="sm"
        :disabled="houses.length === 0"
      >
        Next
        <ChevronRight class="w-4 h-4 ml-1" />
      </Button>
    </div>
    
    <!-- Next Player Preview -->
    <div v-if="nextPlayer" class="text-center text-sm text-muted-foreground">
      Next: <span :style="{ color: nextPlayer.color }" class="font-semibold">{{ nextPlayer.name }}</span>
      <span class="font-medium">({{ nextPlayer.playerName || 'Player' }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Crown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { House } from '~/types/game'

interface Props {
  houses: House[]
  currentPlayerIndex: number
}

interface Emits {
  (e: 'next-player'): void
  (e: 'previous-player'): void
  (e: 'set-current-player', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentPlayer = computed(() => {
  return props.houses[props.currentPlayerIndex] || null
})

const nextPlayer = computed(() => {
  if (props.houses.length === 0) return null
  const nextIndex = (props.currentPlayerIndex + 1) % props.houses.length
  return props.houses[nextIndex] || null
})

const isCurrentPlayerTurn = (index: number) => {
  return index === props.currentPlayerIndex
}

const nextPlayerAction = () => {
  emit('next-player')
}

const previousPlayer = () => {
  emit('previous-player')
}

const setCurrentPlayer = (index: number) => {
  emit('set-current-player', index)
}
</script>