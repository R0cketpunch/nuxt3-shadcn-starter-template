<template>
  <div class="space-y-4">
    <div>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Iron Throne Track</h3>
        <div class="flex space-x-2">
          <div
            v-if="allowReordering"
            class="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
          >
            EDITABLE
          </div>
          <div
            v-if="isActionPhase"
            class="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
          >
            ACTIVE
          </div>
        </div>
      </div>
      <p class="mt-1 text-xs text-muted-foreground">
        {{
          allowReordering
            ? "Drag and drop to reorder after Westeros card bidding"
            : isActionPhase
            ? `Resolving ${currentSubPhase || "orders"} in turn order`
            : "Determines turn order during Action Phase resolution"
        }}
      </p>
    </div>

    <!-- Turn Order Display -->
    <div class="grid grid-cols-1 gap-2" v-auto-animate>
      <div
        v-for="(house, index) in houses"
        :key="house.id"
        class="relative p-3 rounded-lg border-2 transition-all duration-200"
        :class="[
          `border-[${house.color}]`,
          {
            'ring-4 ring-yellow-400 ring-opacity-50 shadow-lg':
              index === currentPlayerIndex && isActionPhase,
            'opacity-50': !isCurrentPlayerTurn(index) && isActionPhase,
            'cursor-move': allowReordering,
            'cursor-pointer hover:scale-105': !allowReordering && isActionPhase,
          },
        ]"
        :style="{
          backgroundColor: house.color + '20',
          borderColor: house.color,
        }"
        :draggable="allowReordering"
        @click="!allowReordering && isActionPhase && setCurrentPlayer(index)"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event)"
        @drop="handleDrop($event, index)"
      >
        <!-- Crown for Iron Throne holder -->
        <Crown
          v-if="index === 0"
          class="absolute -top-2 -right-2 p-1 w-6 h-6 text-yellow-500 rounded-full bg-background"
        />

        <div class="text-center">
          <div class="text-sm font-bold" :style="{ color: house.color }">
            House {{ house.name }}
          </div>
          <div class="text-xs font-medium text-foreground">
            {{ house.playerName || `Player ${index + 1}` }}
          </div>
          <div class="text-xs text-muted-foreground">
            Position {{ index + 1 }}
          </div>
        </div>

        <!-- Drag handle when reordering is allowed -->
        <div v-if="allowReordering" class="absolute top-1 left-1">
          <GripVertical class="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>

    <!-- Current Player Indicator - only during Action Phase -->
    <div v-if="currentPlayer && isActionPhase" class="p-4 text-center rounded-lg border bg-card">
      <div class="text-sm text-muted-foreground">Current Player</div>
      <div class="text-xl font-bold" :style="{ color: currentPlayer.color }">
        {{ currentPlayer.name }}
      </div>
      <div class="text-sm font-medium text-muted-foreground">
        {{ currentPlayer.playerName || `Player ${currentPlayerIndex + 1}` }}
      </div>
    </div>

    <!-- Turn Controls - only available during Action Phase -->
    <div v-if="isActionPhase" class="flex justify-center space-x-2">
      <Button
        @click="previousPlayer"
        variant="outline"
        size="sm"
        :disabled="houses.length === 0"
      >
        <ChevronLeft class="mr-1 w-4 h-4" />
        Previous
      </Button>

      <Button
        @click="nextPlayerAction"
        size="sm"
        :disabled="houses.length === 0"
      >
        Next
        <ChevronRight class="ml-1 w-4 h-4" />
      </Button>
    </div>

    <!-- Next Player Preview - only during Action Phase -->
    <div v-if="nextPlayer && isActionPhase" class="text-sm text-center text-muted-foreground">
      Next:
      <span :style="{ color: nextPlayer.color }" class="font-semibold">{{
        nextPlayer.name
      }}</span>
      <span class="font-medium">({{ nextPlayer.playerName || "Player" }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Crown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-vue-next";
import type { House } from "~/types/game";

interface Props {
  houses: House[];
  currentPlayerIndex: number;
  isActionPhase?: boolean;
  currentSubPhase?: string;
  allowReordering?: boolean;
}

interface Emits {
  (e: "next-player"): void;
  (e: "previous-player"): void;
  (e: "set-current-player", index: number): void;
  (e: "reorder-houses", houses: House[]): void;
}
import NumberFlow from "@number-flow/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Drag and drop state
const draggedIndex = ref<number>(-1);

const currentPlayer = computed(() => {
  return props.houses[props.currentPlayerIndex] || null;
});

const nextPlayer = computed(() => {
  if (props.houses.length === 0) return null;
  const nextIndex = (props.currentPlayerIndex + 1) % props.houses.length;
  return props.houses[nextIndex] || null;
});

const isCurrentPlayerTurn = (index: number) => {
  return index === props.currentPlayerIndex;
};

const nextPlayerAction = () => {
  emit("next-player");
};

const previousPlayer = () => {
  emit("previous-player");
};

const setCurrentPlayer = (index: number) => {
  emit("set-current-player", index);
};

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
