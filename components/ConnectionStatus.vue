<template>
  <div class="flex items-center space-x-2">
    <div :class="[
      'h-2 w-2 rounded-full',
      statusColors[status]
    ]" />
    <span class="text-xs font-medium">
      {{ statusLabels[status] }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
}

const props = defineProps<Props>()

const statusColors = {
  connecting: 'bg-yellow-500 animate-pulse',
  connected: 'bg-green-500',
  disconnected: 'bg-gray-500',
  error: 'bg-red-500'
}

const statusLabels = {
  connecting: 'Connecting...',
  connected: 'Synced',
  disconnected: 'Offline',
  error: 'Connection Error'
}
</script>