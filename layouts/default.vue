<template>
  <div class="default-layout min-h-screen bg-background text-foreground">
    <slot />
  </div>
</template>

<script setup>
// Enable color mode support
const colorMode = useColorMode()

// Set initial color mode based on settings
onMounted(() => {
  const gameStateManager = useGameState()
  if (gameStateManager.settings.value.darkTheme) {
    colorMode.preference = 'dark'
  }
})
</script>