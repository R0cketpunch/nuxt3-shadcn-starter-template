<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Timer Display -->
    <div class="relative">
      <div
        class="flex justify-center items-center w-32 h-32 rounded-full border-8 transition-colors duration-300 sm:w-48 sm:h-48"
        :class="timerBorderClass"
      >
        <div class="text-center">
          <NumberFlowGroup>
            <div
              :style="{
                fontVariantNumeric: 'tabular-nums',
                '--number-flow-char-height': '0.85em',
              }"
              class="flex justify-center items-baseline text-2xl font-semibold transition-colors duration-300 sm:text-4xl"
              :class="timer.getTimerColor()"
            >
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
          <div class="text-sm">{{ phaseText }}</div>
          <div class="text-xs text-muted-foreground">
            {{ subPhaseText }}
          </div>
        </div>
      </div>

      <!-- Progress Ring -->
      <svg
        class="absolute top-0 left-0 w-32 h-32 -rotate-90 sm:w-48 sm:h-48"
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
import { Play, Pause, RotateCcw } from "lucide-vue-next";
import NumberFlow, { NumberFlowGroup } from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
interface Props {
  duration?: number;
  phaseText?: string;
  subPhaseText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 300,
  phaseText: "Timer",
  subPhaseText: "Sub-phase",
});

const timer = useGameTimer();
const circumference = 2 * Math.PI * 45;

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
  timer.startTimer(props.duration);
};

const resetTimer = () => {
  timer.resetTimer(props.duration);
};
</script>
