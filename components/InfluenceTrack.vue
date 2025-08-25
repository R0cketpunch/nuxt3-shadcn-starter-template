<template>
  <div class="flex flex-col bg-background" v-auto-animate>
    <!-- Track Title -->
    <!-- <div class="p-4 text-center border-b">
      <div class="flex gap-2 justify-center items-center">
        <component :is="trackIcon" class="w-5 h-5" />
        <h3 class="text-lg font-bold">{{ trackTitle }}</h3>
      </div>
      <div class="text-xs text-muted-foreground">{{ trackDescription }}</div>
    </div> -->

    <!-- Houses in Order -->
    <div class="grid grid-cols-1 min-h-full bg-background" v-auto-animate>
      <div
        v-for="(house, index) in houses"
        :key="house.id"
        class="grid relative grid-cols-[auto_1fr] items-center transition-all duration-200"
        :class="{
          'bg-foreground text-background':
            showCurrentPlayer && index === currentPlayerIndex,
          'text-muted-foreground':
            !isCurrentPlayerTurn(index) && showCurrentPlayer,
          'cursor-move': allowReordering,
          'cursor-pointer': !allowReordering && showCurrentPlayer,
        }"
        :draggable="allowReordering"
        @click="!allowReordering && showCurrentPlayer && setCurrentPlayer()"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event)"
        @drop="handleDrop($event, index)"
      >
        <!-- Position Number -->
        <div
          class="grid place-items-center h-full text-6xl font-bold text-white aspect-square"
          :style="{
            backgroundColor: house.color + '20',
            color: house.color,
          }"
          v-auto-animate
        >
          <img :src="house.image" :alt="house.name" class="size-24" />
          <!-- <div v-if="index === 0" class="flex items-center mt-2">
            <Crown v-if="trackType === 'iron-throne'" class="size-12" />
            <Sword v-else-if="trackType === 'fiefdoms'" class="size-12" />
            <Bird v-else-if="trackType === 'kings-court'" class="size-12" />
            <span v-if="index === 0" class="text-sm font-medium"> </span>
          </div>

          <NumberFlow v-else :value="index + 1" /> -->
        </div>

        <!-- House Info -->
        <div class="p-10">
          <div class="flex gap-8 items-center text-4xl font-bold">
            {{ house.playerName || `Player ${getPlayerNumber(house.id)}` }}
            <div
              v-if="trackType === 'kings-court' && index <= 3"
              class="flex bottom-10 gap-1"
            >
              <Star
                v-for="star in getStarCount(index)"
                :key="`star-${index}-${star}`"
                class="text-amber-500 fill-current size-3"
              />
            </div>
          </div>
          <div class="font-medium text-muted-foreground">
            House {{ house.name }}
          </div>

          <!-- Special Position Indicator -->
        </div>
      </div>
    </div>

    <!-- Track Benefits (if any) -->
    <!-- <div
      v-if="trackBenefits && trackBenefits.length > 0"
      class="p-3 text-xs border-t bg-muted/30"
    >
      <div class="mb-1 font-medium text-muted-foreground">Track Benefits:</div>
      <ul class="space-y-1">
        <li v-for="benefit in trackBenefits" :key="benefit">• {{ benefit }}</li>
      </ul>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {
  Crown,
  GripVertical,
  Crown as Throne,
  Gavel,
  Bird,
  Sword,
  Star,
} from "lucide-vue-next";
import type { House } from "~/types/game";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import NumberFlow from "@number-flow/vue";

interface Props {
  houses: House[];
  trackTitle: string;
  trackDescription: string;
  trackType: "iron-throne" | "fiefdoms" | "kings-court";
  allowReordering?: boolean;
  trackBenefits?: string[];
  currentPlayerIndex?: number; // Index of currently active player (-1 or undefined means no highlighting)
  showCurrentPlayer?: boolean; // Whether to show current player highlighting
}

interface Emits {
  (e: "reorder-houses", houses: House[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Track-specific icons
const trackIcons = {
  "iron-throne": Throne,
  fiefdoms: Sword,
  "kings-court": Gavel,
};

const trackIcon = computed(() => trackIcons[props.trackType]);

// Get player number for display
const gameStateManager = useGameState();
const getPlayerNumber = (houseId: string): number => {
  const ironThroneOrder = gameStateManager.gameState.value.ironThroneOrder;
  const playerIndex = ironThroneOrder.findIndex(
    (house) => house.id === houseId
  );
  return playerIndex + 1;
};

const isCurrentPlayerTurn = (index: number) => {
  return index === props.currentPlayerIndex;
};

const setCurrentPlayer = () => {
  // We could emit an event for this, but for now it's just for styling
  // The parent component handles actual player switching
};

const getPositionTitle = (): string => {
  switch (props.trackType) {
    case "iron-throne":
      return "Iron Throne Holder";
    case "fiefdoms":
      return "Valyrian Steel Blade";
    case "kings-court":
      return "Messenger Raven";
    default:
      return "";
  }
};

const getStarCount = (index: number): number => {
  if (props.trackType !== "kings-court") return 0;

  switch (index) {
    case 0:
      return 3; // 1st place gets 3 stars
    case 1:
      return 3; // 2nd place gets 3 stars
    case 2:
      return 2; // 3rd place gets 2 stars
    case 3:
      return 1; // 4th place gets 1 star
    default:
      return 0; // 5th+ place gets no stars
  }
};

// Drag and drop state
const draggedIndex = ref<number>(-1);

// Drag and drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  if (!props.allowReordering) return;

  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const handleDragOver = (event: DragEvent) => {
  if (!props.allowReordering) return;

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const handleDrop = (event: DragEvent, dropIndex: number) => {
  if (!props.allowReordering) return;

  event.preventDefault();

  if (draggedIndex.value === -1 || draggedIndex.value === dropIndex) return;

  // Create a copy of the houses array and reorder
  const reorderedHouses = [...props.houses];
  const draggedHouse = reorderedHouses[draggedIndex.value];
  reorderedHouses.splice(draggedIndex.value, 1);
  reorderedHouses.splice(dropIndex, 0, draggedHouse);

  // Emit the reordered houses
  emit("reorder-houses", reorderedHouses);

  draggedIndex.value = -1;
};
</script>
