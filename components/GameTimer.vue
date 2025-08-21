<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Timer Display -->
    <div class="relative">
      <div 
        class="w-32 h-32 sm:w-48 sm:h-48 rounded-full border-8 flex items-center justify-center transition-colors duration-300"
        :class="timerBorderClass"
      >
        <div class="text-center">
          <div 
            class="text-2xl sm:text-4xl font-mono font-bold transition-colors duration-300"
            :class="timer.getTimerColor()"
          >
            {{ timer.formatTime(timer.timeRemaining.value) }}
          </div>
          <div class="text-xs sm:text-sm text-muted-foreground">
            {{ phaseText }}
          </div>
        </div>
      </div>
      
      <!-- Progress Ring -->
      <svg 
        class="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          :stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          :class="timer.getTimerColor()"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>
    </div>
    
    <!-- Timer Controls -->
    <div class="flex space-x-2">
      <Button
        v-if="!timer.isActive.value"
        @click="startTimer"
        size="sm"
        class="px-6"
      >
        <Play class="w-4 h-4 mr-2" />
        Start
      </Button>
      
      <Button
        v-if="timer.isActive.value && !timer.isPaused.value"
        @click="timer.pauseTimer"
        variant="outline"
        size="sm"
        class="px-6"
      >
        <Pause class="w-4 h-4 mr-2" />
        Pause
      </Button>
      
      <Button
        v-if="timer.isActive.value && timer.isPaused.value"
        @click="timer.resumeTimer"
        size="sm"
        class="px-6"
      >
        <Play class="w-4 h-4 mr-2" />
        Resume
      </Button>
      
      <Button
        @click="resetTimer"
        variant="outline"
        size="sm"
        class="px-6"
      >
        <RotateCcw class="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
    
    <!-- Quick Time Adjustments -->
    <div class="flex space-x-2">
      <Button
        @click="timer.addTime(-60)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value"
      >
        -1m
      </Button>
      <Button
        @click="timer.addTime(-30)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value"
      >
        -30s
      </Button>
      <Button
        @click="timer.addTime(30)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value"
      >
        +30s
      </Button>
      <Button
        @click="timer.addTime(60)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value"
      >
        +1m
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Play, Pause, RotateCcw } from 'lucide-vue-next'

interface Props {
  duration?: number
  phaseText?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: 300,
  phaseText: 'Timer'
})

const timer = useGameTimer()
const circumference = 2 * Math.PI * 45

const timerBorderClass = computed(() => {
  if (timer.timeRemaining.value > 60) return 'border-green-500'
  if (timer.timeRemaining.value > 30) return 'border-yellow-500'
  return 'border-red-500'
})

const strokeDashoffset = computed(() => {
  if (props.duration === 0) return circumference
  const progress = timer.timeRemaining.value / props.duration
  return circumference * (1 - progress)
})

const startTimer = () => {
  timer.startTimer(props.duration)
}

const resetTimer = () => {
  timer.resetTimer(props.duration)
}
</script>