<template>
  <div class="flex flex-col flex-1 bg-background" v-auto-animate>
    <!-- Houses in Order -->
    <div
      class="grid grid-cols-1 min-h-full divide-y bg-background"
      v-auto-animate
    >
      <div
        v-for="(house, index) in houses"
        :key="house.id"
        :data-row-index="index"
        class="grid relative items-center transition-all duration-200 min-h-24"
        :class="[
          allowReordering
            ? 'grid-cols-[auto_1fr_auto]'
            : 'grid-cols-[auto_1fr]',
          {
            'bg-foreground text-background':
              showCurrentPlayer && index === currentPlayerIndex,
            'text-muted-foreground':
              !isCurrentPlayerTurn(index) && showCurrentPlayer,
            'cursor-pointer': !allowReordering && showCurrentPlayer,
          },
        ]"
        :draggable="allowReordering"
        @click="!allowReordering && showCurrentPlayer && setCurrentPlayer()"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event)"
        @drop="handleDrop($event, index)"
      >
        <!-- Position Number -->
        <div
          class="grid relative place-items-center h-full font-bold text-white lg:text-6xl aspect-square"
          :style="{
            backgroundColor: house.color + '20',
            color: house.color,
          }"
          v-auto-animate
        >
          <img :src="house.image" :alt="house.name" class="size-24" />
          <img
            v-if="dominanceToken && index === 0"
            :src="dominanceToken.image"
            :alt="dominanceToken.name"
            class="absolute right-2 top-4 size-16"
          />
          <!-- <div v-if="index === 0" class="flex items-center mt-2">
            <Crown v-if="trackType === 'iron-throne'" class="size-12" />
            <Sword v-else-if="trackType === 'fiefdoms'" class="size-12" />
            <Bird v-else-if="trackType === 'kings-court'" class="size-12" />
            <span v-if="index === 0" class="text-sm font-medium"> </span>
          </div>

          <NumberFlow v-else :value="index + 1" /> -->
        </div>
        <!-- House Info -->
        <div class="px-10">
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

        <!-- Up/Down Buttons for Reordering -->
        <div
          v-if="allowReordering"
          class="grid grid-rows-2 gap-px h-full bg-muted"
        >
          <button
            @click.stop="moveUp(index)"
            :disabled="index === 0"
            class="grid place-items-center w-full h-full transition-colors aspect-square"
            :class="index === 0 ? 'opacity-20' : 'bg-background'"
          >
            <ChevronUp class="size-4" />
          </button>
          <button
            @click.stop="moveDown(index)"
            :disabled="index === houses.length - 1"
            class="grid place-items-center w-full h-full transition-colors aspect-square"
            :class="
              index === houses.length - 1 ? 'opacity-20' : 'bg-background'
            "
          >
            <ChevronDown class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Crown as Throne,
  Bird,
  Sword,
  Star,
  Crown,
  ChevronUp,
  ChevronDown,
} from "lucide-vue-next";
import type { House } from "~/types/game";
import { getInfluenceTrack, getTrackDominanceToken } from "~/types/game";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import NumberFlow from "@number-flow/vue";

interface Props {
  houses: House[];
  trackType: "iron-throne" | "fiefdoms" | "kings-court";
  allowReordering?: boolean;
  currentPlayerIndex?: number; // Index of currently active player (-1 or undefined means no highlighting)
  showCurrentPlayer?: boolean; // Whether to show current player highlighting
}

interface Emits {
  (e: "reorder-houses", houses: House[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get influence track and dominance token data
const influenceTrack = computed(() => getInfluenceTrack(props.trackType));
const dominanceToken = computed(() => {
  const track = influenceTrack.value;
  return track ? getTrackDominanceToken(track) : undefined;
});

// Track-specific icons
const trackIcons = {
  "iron-throne": Throne,
  fiefdoms: Sword,
  "kings-court": Bird,
};

const trackIcon = computed(() => trackIcons[props.trackType]);

// Computed properties for track information
const trackTitle = computed(() => influenceTrack.value?.name || "");
const trackDescription = computed(
  () => influenceTrack.value?.description || ""
);
const trackBenefits = computed(() => influenceTrack.value?.benefits || []);
const dominanceTokenName = computed(() => dominanceToken.value?.name || "");

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

// Simple move functions for up/down buttons
const moveUp = (index: number) => {
  if (index === 0) return; // Can't move up if already at top

  const reorderedHouses = [...props.houses];
  const house = reorderedHouses[index];
  reorderedHouses.splice(index, 1);
  reorderedHouses.splice(index - 1, 0, house);

  emit("reorder-houses", reorderedHouses);
};

const moveDown = (index: number) => {
  if (index === props.houses.length - 1) return; // Can't move down if already at bottom

  const reorderedHouses = [...props.houses];
  const house = reorderedHouses[index];
  reorderedHouses.splice(index, 1);
  reorderedHouses.splice(index + 1, 0, house);

  emit("reorder-houses", reorderedHouses);
};
</script>
