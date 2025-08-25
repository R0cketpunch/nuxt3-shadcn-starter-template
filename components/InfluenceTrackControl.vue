<template>
  <div class="space-y-2">
    <div
      v-for="(house, index) in localHouses"
      :key="house.id"
      class="flex justify-between items-center p-3 rounded-lg border bg-background"
      :style="{ backgroundColor: house.color + '20', borderColor: house.color }"
    >
      asd
      <div class="flex items-center space-x-3">
        <div class="text-lg font-bold text-foreground">
          {{ index + 1 }}
        </div>
        <div class="flex items-center space-x-2">
          <div
            class="w-4 h-4 rounded-full border-2"
            :style="{ backgroundColor: house.color, borderColor: house.color }"
          ></div>
          <span class="font-medium">{{ house.name }}</span>
          <span v-if="house.playerName" class="text-sm text-muted-foreground">
            ({{ house.playerName }})
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-1">
        <Button
          @click="moveUp(index)"
          :disabled="index === 0"
          variant="ghost"
          size="sm"
        >
          <ChevronUp class="w-4 h-4" />
        </Button>
        <Button
          @click="moveDown(index)"
          :disabled="index === localHouses.length - 1"
          variant="ghost"
          size="sm"
        >
          <ChevronDown class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronUp, ChevronDown } from "lucide-vue-next";
import type { House } from "~/types/game";

interface Props {
  houses: House[];
}

interface Emits {
  (e: "reorder", houses: House[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localHouses = ref<House[]>([]);

// Initialize local houses when props change
watch(
  () => props.houses,
  (newHouses) => {
    localHouses.value = [...newHouses];
  },
  { immediate: true }
);

const moveUp = (index: number) => {
  if (index === 0) return;

  const newHouses = [...localHouses.value];
  [newHouses[index - 1], newHouses[index]] = [
    newHouses[index],
    newHouses[index - 1],
  ];

  localHouses.value = newHouses;
  emit("reorder", newHouses);
};

const moveDown = (index: number) => {
  if (index === localHouses.value.length - 1) return;

  const newHouses = [...localHouses.value];
  [newHouses[index], newHouses[index + 1]] = [
    newHouses[index + 1],
    newHouses[index],
  ];

  localHouses.value = newHouses;
  emit("reorder", newHouses);
};
</script>
