<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="flex fixed inset-0 z-50 justify-start items-end p-20 backdrop-blur-sm bg-black/50"
    >
      <div
        class="text-center duration-300 border-border animate-in fade-in-0 zoom-in-95"
      >
        <h1 class="mb-4 text-8xl font-bold text-foreground">
          {{ displayTitle }}
        </h1>
        <p v-if="displaySubtitle" class="text-2xl text-muted-foreground">
          {{ displaySubtitle }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
});

const isVisible = ref(false);
const displayTitle = ref("");
const displaySubtitle = ref("");

const show = (title?: string, subtitle?: string) => {
  displayTitle.value = title || props.title;
  displaySubtitle.value = subtitle || props.subtitle || "";
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
};

defineExpose({
  show,
});
</script>
