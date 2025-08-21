<template>
  <div
    v-if="shouldCountdown"
    class="grid grid-cols-3 gap-px items-center bg-muted"
  >
    <!-- Timer Display -->
    <div class="p-10 bg-background aspect-[16/6] flex flex-col justify-center">
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
            v-if="shouldCountdown"
            prefix=":"
            :trend="-1"
            :value="timeComponents.ss"
            :digits="{ 1: { max: 5 } }"
            :format="{ minimumIntegerDigits: 2 }"
          />
          <span v-if="!shouldCountdown">
            {{ timeComponents.hh > 0 ? "H" : "Min" }}
          </span>
        </div>
      </NumberFlowGroup>
    </div>
    <!-- Progress Ring -->
    <div class="col-span-2 w-full h-full bg-background">
      <div
        v-if="shouldCountdown"
        class="h-full text-2xl"
        :class="timer.getTimerBackground()"
        :style="`width: ${timeProgress}%`"
      />
      <div
        v-else
        class="h-full transition-all duration-500 bg-muted"
        :style="`width: ${roundProgress}%`"
      />

      <!-- <Progress v-model="timeProgress" class="w-full" /> -->
    </div>

    <!-- Timer Controls - only show during countdown mode -->
    <!-- <div v-if="shouldCountdown" class="flex space-x-2">
      <Button v-if="!timer.isActive.value" @click="startTimer" size="icon">
        <Play class="w-4 h-4" />
      </Button>

      <Button
        v-if="timer.isActive.value && !timer.isPaused.value"
        @click="timer.pauseTimer"
        variant="outline"
        size="icon"
      >
        <Pause class="w-4 h-4" />
      </Button>

      <Button
        v-if="timer.isActive.value && timer.isPaused.value"
        @click="timer.resumeTimer"
        size="icon"
      >
        <Play class="w-4 h-4" />
      </Button>

      <Button @click="resetTimer" variant="outline" size="icon">
        <RotateCcw class="w-4 h-4" />
      </Button>
    </div> -->

    <!-- Quick Time Adjustments - only show during countdown mode -->
    <!-- <div v-if="shouldCountdown" class="flex space-x-2">
      <Button
        @click="timer.addTime(-60)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value || !shouldCountdown"
      >
        -1m
      </Button>
      <Button
        @click="timer.addTime(-30)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value || !shouldCountdown"
      >
        -30s
      </Button>
      <Button
        @click="timer.addTime(30)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value || !shouldCountdown"
      >
        +30s
      </Button>
      <Button
        @click="timer.addTime(60)"
        variant="ghost"
        size="sm"
        :disabled="!timer.isActive.value || !shouldCountdown"
      >
        +1m
      </Button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { Play, Pause, RotateCcw } from "lucide-vue-next";
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue";
import { Progress } from "@/components/ui/progress";
import {
  MAX_ROUNDS,
  GAME_PHASES,
  WESTEROS_SUBPHASES,
  PLANNING_SUBPHASES,
  ACTION_SUBPHASES,
} from "~/types/game";

interface Props {
  duration?: number;
  phaseText?: string;
  subPhaseText?: string;
  currentSubPhase?: string;
  gameStartTime?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 300,
  phaseText: "Timer",
  subPhaseText: "Sub-phase",
  currentSubPhase: undefined,
  gameStartTime: undefined,
});

const timer = useGameTimer();
const gameState = useGameState();
const circumference = 2 * Math.PI * 45;

// Check if we should countdown (during both Assign Orders and Reveal Orders sub-phases)
const shouldCountdown = computed(() => {
  return props.currentSubPhase === "assign-orders";
});

// Automatically start timer when component mounts or mode changes
watch(
  [shouldCountdown],
  () => {
    if (shouldCountdown.value) {
      // Automatically start countdown timer when entering Assign Orders phase
      timer.startTimer(props.duration, true, props.gameStartTime);
    } else {
      // Start total game time tracking when not in countdown mode
      timer.startTimer(props.duration, false, props.gameStartTime);
    }
  },
  { immediate: true }
);

const timeComponents = computed(() => {
  return timer.getTimeComponents(timer.timeRemaining.value);
});

const timerBorderClass = computed(() => {
  if (timer.timeRemaining.value > 60) return "border-green-500";
  if (timer.timeRemaining.value > 30) return "border-yellow-500";
  return "border-red-500";
});

const strokeDashoffset = computed(() => {
  if (props.duration === 0) return circumference;
  const progress = timer.timeRemaining.value / props.duration;
  return circumference * (1 - progress);
});

const startTimer = () => {
  timer.startTimer(props.duration, shouldCountdown.value, props.gameStartTime);
};

const resetTimer = () => {
  timer.resetTimer(props.duration, shouldCountdown.value, props.gameStartTime);
};

const timeProgress = computed(() => {
  return (timer.timeRemaining.value / props.duration) * 100;
});

const roundProgress = computed(() => {
  return (gameState.gameState.value.currentRound / MAX_ROUNDS) * 100;
});

const getNextStepName = computed(() => {
  const currentPhase = gameState.gameState.value.currentPhase;
  const currentSubPhase = gameState.gameState.value.currentSubPhase;
  const currentRound = gameState.gameState.value.currentRound;

  if (!currentSubPhase) {
    // If no subphase, next step is the first subphase of current phase
    if (currentPhase.id === "westeros") {
      return WESTEROS_SUBPHASES[0]?.name || "Next Phase";
    } else if (currentPhase.id === "planning") {
      return PLANNING_SUBPHASES[0]?.name || "Next Phase";
    } else if (currentPhase.id === "action") {
      return ACTION_SUBPHASES[0]?.name || "Next Phase";
    }
    return "Next Phase";
  }

  // Find current subphase and determine next
  if (currentPhase.id === "westeros") {
    const currentIndex = WESTEROS_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < WESTEROS_SUBPHASES.length - 1) {
      return WESTEROS_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of westeros phase, go to planning
      return GAME_PHASES[1].name; // Planning
    }
  } else if (currentPhase.id === "planning") {
    const currentIndex = PLANNING_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < PLANNING_SUBPHASES.length - 1) {
      return PLANNING_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of planning phase, go to action
      return GAME_PHASES[2].name; // Action
    }
  } else if (currentPhase.id === "action") {
    const currentIndex = ACTION_SUBPHASES.findIndex(
      (sp) => sp.id === currentSubPhase.id
    );
    if (currentIndex < ACTION_SUBPHASES.length - 1) {
      return ACTION_SUBPHASES[currentIndex + 1].name;
    } else {
      // End of action phase, go to next round or end game
      if (currentRound < MAX_ROUNDS) {
        return `Round ${currentRound + 1}`;
      } else {
        return "Game End";
      }
    }
  }

  return "Continue";
});
</script>
