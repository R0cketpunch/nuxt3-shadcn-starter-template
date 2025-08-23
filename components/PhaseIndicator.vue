<template>
  <div class="grid grid-cols-3 gap-px bg-muted">
    <div
      v-for="(phase, index) in allPhases"
      :key="phase.id"
      class="flex flex-col justify-between p-8"
      :class="{
        'bg-muted text-white': isCurrentPhase(index),
        'bg-background text-border line-through': isPhaseComplete(index),
        'bg-background text-border':
          !isPhaseComplete(index) && !isCurrentPhase(index),
      }"
    >
      <component :is="getPhaseIconComponent(phase.id)" class="size-6" />
      <div class="text-xl">{{ phase.name }} Phase</div>
    </div>

    <!-- Current Phase Subphases -->
    <div
      v-for="(subPhase, index) in currentPhaseSubPhases"
      :key="`sub-${subPhase.id}`"
      class="flex flex-col justify-between p-8"
      :class="{
        'bg-muted text-white': isCurrentSubPhase(subPhase),
        'bg-background text-border line-through': isSubPhaseComplete(index),
        'bg-background text-border':
          !isSubPhaseComplete(index) && !isCurrentSubPhase(subPhase),
      }"
    >
      <div class="relative">
        <component :is="getSubPhaseIconComponent(subPhase)" class="size-6" />
      </div>

      <div class="text-xl">
        {{ subPhase.name }}
      </div>
      <!-- <div
            v-if="subPhase.requiresTurnOrder"
            class="text-[9px] sm:text-[10px] opacity-60 mt-1"
          >
            Turn order
          </div> -->
    </div>
  </div>

  <!-- Current Phase Description -->
  <!-- <div v-if="currentPhase" class="pt-3 mt-4 text-center border-t">
        <div class="text-sm text-muted-foreground">
          {{ currentPhase.description }}
        </div>
      </div> -->
  <!-- Phase Control -->
</template>

<script setup lang="ts">
import {
  ChevronRight,
  Trophy,
  Play,
  CircleDashed,
  CirclePlay,
  Crown,
  Brain,
  Swords,
  CircleCheck,
  PenTool,
  Eye,
  Bird,
  Zap,
  ArrowRight,
  Shield,
  Circle,
  Ghost,
  Dices,
  Drama,
} from "lucide-vue-next";
import type { GamePhase, SubPhase } from "~/types/game";
import {
  GAME_PHASES,
  MAX_ROUNDS,
  WESTEROS_SUBPHASES,
  PLANNING_SUBPHASES,
  ACTION_SUBPHASES,
  getPhaseIcon,
  getSubPhaseIcon,
} from "~/types/game";
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface Props {
  currentRound: number;
  currentPhase: GamePhase;
  currentSubPhase?: SubPhase;
}

interface Emits {
  (e: "advance-phase"): void;
  (e: "advance-subphase"): void;
  (e: "next-player"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const maxRounds = MAX_ROUNDS;
const allPhases = GAME_PHASES;

// Icon mapping
const iconComponents = {
  Crown,
  Brain,
  Swords,
  Dices,
  Ghost,
  CircleCheck,
  PenTool,
  Eye,
  Bird,
  Zap,
  ArrowRight,
  Shield,
  Circle,
  Drama,
} as const;

const currentPhaseIndex = computed(() => {
  return GAME_PHASES.findIndex((p) => p.id === props.currentPhase.id);
});

const nextPhase = computed(() => {
  if (props.currentPhase.id === "action") {
    return props.currentRound < MAX_ROUNDS ? GAME_PHASES[0] : null; // Back to Westeros or end
  }
  const nextIndex = currentPhaseIndex.value + 1;
  return nextIndex < GAME_PHASES.length ? GAME_PHASES[nextIndex] : null;
});

const nextRound = computed(() => {
  return props.currentPhase.id === "action"
    ? props.currentRound + 1
    : props.currentRound;
});

const isLastPhaseOfRound = computed(() => {
  return props.currentPhase.id === "action";
});

const isGameComplete = computed(() => {
  return props.currentRound > MAX_ROUNDS;
});

const isPhaseComplete = (index: number) => {
  // A phase is complete if we've passed it in the current round
  return index < currentPhaseIndex.value;
};

const isCurrentPhase = (index: number) => {
  return index === currentPhaseIndex.value;
};

const advancePhase = () => {
  emit("advance-phase");
};

const advanceSubPhase = () => {
  emit("advance-subphase");
};

const nextPlayer = () => {
  emit("next-player");
};

const getSubPhasesForPhase = (phaseId: string) => {
  switch (phaseId) {
    case "westeros":
      return WESTEROS_SUBPHASES;
    case "planning":
      return PLANNING_SUBPHASES;
    case "action":
      return ACTION_SUBPHASES;
    default:
      return [];
  }
};

const currentPhaseSubPhases = computed(() => {
  return getSubPhasesForPhase(props.currentPhase.id);
});

const currentSubPhaseIndex = computed(() => {
  if (!props.currentSubPhase) return -1;
  return currentPhaseSubPhases.value.findIndex(
    (sp) => sp.id === props.currentSubPhase!.id
  );
});

const isCurrentSubPhase = (subPhase: SubPhase) => {
  return props.currentSubPhase?.id === subPhase.id;
};

const isSubPhaseComplete = (index: number) => {
  if (!props.currentSubPhase) return false;
  return index < currentSubPhaseIndex.value;
};

// Helper functions to get icon components
const getPhaseIconComponent = (phaseId: string) => {
  const iconName = getPhaseIcon(phaseId);
  return iconComponents[iconName as keyof typeof iconComponents] || Circle;
};

const getSubPhaseIconComponent = (subPhase: SubPhase) => {
  const iconName = getSubPhaseIcon(props.currentPhase.id, subPhase.id);
  return iconComponents[iconName as keyof typeof iconComponents] || Circle;
};
</script>
