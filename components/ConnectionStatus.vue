<template>
  <div class="flex items-center gap-2 text-sm">
    <div 
      class="h-2 w-2 rounded-full transition-colors"
      :class="statusClasses"
    />
    <span class="text-muted-foreground">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  isConnected: boolean
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  switch (props.connectionStatus) {
    case 'connected':
      return 'bg-green-500'
    case 'connecting':
      return 'bg-yellow-500 animate-pulse'
    case 'error':
      return 'bg-red-500'
    case 'disconnected':
    default:
      return 'bg-gray-400'
  }
})

const statusText = computed(() => {
  switch (props.connectionStatus) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'error':
      return 'Connection Error'
    case 'disconnected':
    default:
      return 'Offline'
  }
})
</script>