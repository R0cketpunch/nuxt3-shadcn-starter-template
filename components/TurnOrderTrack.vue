<template>
  <!-- border-[${house.color}] -->
  <!-- Turn Order Display -->
  <div class="grid grid-cols-1 min-h-full bg-background" v-auto-animate>
    <div
      v-for="(house, index) in houses"
      :key="house.id"
      class="grid relative grid-cols-[auto_1fr] items-center transition-all duration-200"
      :class="[
        {
          'bg-foreground text-background':
            index === currentPlayerIndex && isActionPhase,
          'text-muted-foreground': !isCurrentPlayerTurn(index) && isActionPhase,
          'cursor-move': allowReordering,
          'cursor-pointer': !allowReordering && isActionPhase,
        },
      ]"
      :draggable="allowReordering"
      @click="!allowReordering && isActionPhase && setCurrentPlayer(index)"
      @dragstart="handleDragStart($event, index)"
      @dragover="handleDragOver($event)"
      @drop="handleDrop($event, index)"
    >
      <div
        class="grid place-items-center h-full text-6xl text-white aspect-square"
        :style="{
          backgroundColor: house.color + '20',
          color: house.color,
        }"
      >
        <!-- {{ house.name.slice(0, 1) }} -->
        <NumberFlow :value="index + 1" />
      </div>
      <!-- Crown for Iron Throne holder -->

      <!-- :style="{
          backgroundColor: house.color + '20',
          borderColor: house.color,
        }" -->
      <div class="p-10">
        <div class="text-4xl font-bold">
          {{ house.playerName || `Player ${index + 1}` }}
        </div>
        <div class="font-medium text-muted-foreground">
          House {{ house.name }}
        </div>
      </div>
      <!-- Drag handle when reordering is allowed -->
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
