<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Settings</h1>
            <p class="text-sm text-muted-foreground">Customize your Game Master experience</p>
          </div>
          
          <Button as-child variant="ghost">
            <NuxtLink to="/">← Back to Dashboard</NuxtLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Settings Content -->
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="space-y-8">
        
        <!-- Audio Settings -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Audio Settings</h2>
          
          <div class="space-y-4 p-6 border rounded-lg bg-card">
            <!-- Audio Enabled -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Enable Audio Alerts</label>
                <p class="text-sm text-muted-foreground">Play sound notifications for timer warnings and phase changes</p>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  id="audio-enabled"
                  v-model="localSettings.audioEnabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border"
                />
                <label for="audio-enabled" class="text-sm">{{ localSettings.audioEnabled ? 'Enabled' : 'Disabled' }}</label>
              </div>
            </div>
            
            <!-- Test Audio Button -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Test Audio</label>
                <p class="text-sm text-muted-foreground">Test the timer warning sounds</p>
              </div>
              <div class="flex space-x-2">
                <Button @click="testAudio('warning')" size="sm" variant="outline">
                  <Volume2 class="w-4 h-4 mr-2" />
                  Test Warning
                </Button>
                <Button @click="testAudio('urgent')" size="sm" variant="outline">
                  <VolumeX class="w-4 h-4 mr-2" />
                  Test Urgent
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Settings -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Visual Settings</h2>
          
          <div class="space-y-4 p-6 border rounded-lg bg-card">
            <!-- Visual Alerts -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Visual Alerts</label>
                <p class="text-sm text-muted-foreground">Show color-coded warnings and notifications</p>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  id="visual-alerts"
                  v-model="localSettings.visualAlertsEnabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border"
                />
                <label for="visual-alerts" class="text-sm">{{ localSettings.visualAlertsEnabled ? 'Enabled' : 'Disabled' }}</label>
              </div>
            </div>
            
            <!-- Theme Selection -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Theme</label>
                <p class="text-sm text-muted-foreground">Choose between light and dark themes</p>
              </div>
              <div class="flex space-x-2">
                <Button
                  @click="setTheme('light')"
                  :variant="!localSettings.darkTheme ? 'default' : 'outline'"
                  size="sm"
                >
                  <Sun class="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button
                  @click="setTheme('dark')"
                  :variant="localSettings.darkTheme ? 'default' : 'outline'"
                  size="sm"
                >
                  <Moon class="w-4 h-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Timer Defaults -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Default Timer Durations</h2>
          
          <div class="space-y-4 p-6 border rounded-lg bg-card">
            <p class="text-sm text-muted-foreground mb-4">
              Set default timer durations for each phase. These will be used for all new games unless overridden during setup.
            </p>
            
            <div class="space-y-4">
              <div
                v-for="phase in gamePhases"
                :key="phase.id"
                class="flex items-center justify-between p-4 border rounded-lg bg-background"
              >
                <div>
                  <div class="font-semibold">{{ phase.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ phase.description }}</div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-muted-foreground">
                    Built-in: {{ formatDuration(phase.defaultDuration) }}
                  </span>
                  <input
                    :value="getPhaseDurationValue(phase.id)"
                    @input="setPhaseDurationValue(phase.id, ($event.target as HTMLInputElement).value)"
                    type="number"
                    :placeholder="Math.floor(phase.defaultDuration / 60).toString()"
                    class="w-20 px-3 py-2 border rounded-md text-center"
                    min="1"
                    max="60"
                    step="1"
                  />
                  <span class="text-sm text-muted-foreground">min</span>
                  <Button
                    @click="resetPhaseDuration(phase.id)"
                    size="sm"
                    variant="ghost"
                    class="p-1"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Data Management</h2>
          
          <div class="space-y-4 p-6 border rounded-lg bg-card">
            <!-- Export Settings -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Export Settings</label>
                <p class="text-sm text-muted-foreground">Download your current settings as a JSON file</p>
              </div>
              <Button @click="exportSettings" variant="outline">
                <Download class="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <!-- Import Settings -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Import Settings</label>
                <p class="text-sm text-muted-foreground">Load settings from a previously exported file</p>
              </div>
              <div>
                <input
                  ref="importFileInput"
                  type="file"
                  accept=".json"
                  class="hidden"
                  @change="handleImportSettings"
                />
                <Button @click="$refs.importFileInput?.click()" variant="outline">
                  <Upload class="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            
            <!-- Reset Settings -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Reset Settings</label>
                <p class="text-sm text-muted-foreground">Restore all settings to their default values</p>
              </div>
              <Button @click="resetAllSettings" variant="destructive">
                <Trash2 class="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </div>

        <!-- Save Changes -->
        <div class="flex justify-center pt-6">
          <Button @click="saveSettings" size="lg" class="px-12">
            <Save class="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
        
        <!-- Success Message -->
        <div v-if="showSaveMessage" class="text-center">
          <div class="text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
            Settings saved successfully!
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  RotateCcw 
} from 'lucide-vue-next'
import { GAME_PHASES } from '~/types/game'
import type { GameSettings } from '~/types/game'

const gameStateManager = useGameState()
const colorMode = useColorMode()

const gamePhases = GAME_PHASES
const importFileInput = ref<HTMLInputElement | null>(null)
const showSaveMessage = ref(false)

// Local settings copy for editing  
const localSettings = ref<GameSettings>({
  audioEnabled: true,
  visualAlertsEnabled: true,
  darkTheme: false,
  customPhaseDurations: {}
})

// Initialize custom phase durations object with all phase IDs
const initializeCustomDurations = () => {
  const durations: Record<string, number> = {}
  gamePhases.forEach(phase => {
    durations[phase.id] = localSettings.value.customPhaseDurations[phase.id] || 0
  })
  localSettings.value.customPhaseDurations = durations
}

// Get phase duration value for display (shows empty string if 0)
const getPhaseDurationValue = (phaseId: string): string => {
  const value = localSettings.value.customPhaseDurations[phaseId]
  return value > 0 ? value.toString() : ''
}

// Set phase duration value from input
const setPhaseDurationValue = (phaseId: string, value: string) => {
  const numValue = parseInt(value) || 0
  localSettings.value.customPhaseDurations[phaseId] = numValue
}

// Initialize local settings from store
onMounted(() => {
  localSettings.value = { ...gameStateManager.settings.value }
  
  // Convert stored seconds to minutes for display
  Object.keys(localSettings.value.customPhaseDurations).forEach(key => {
    const value = localSettings.value.customPhaseDurations[key]
    if (value && value >= 60) {
      localSettings.value.customPhaseDurations[key] = Math.floor(value / 60)
    }
  })
  
  // Ensure all phase IDs exist in customPhaseDurations for proper reactivity
  initializeCustomDurations()
})

const setTheme = (theme: 'light' | 'dark') => {
  localSettings.value.darkTheme = theme === 'dark'
  colorMode.preference = theme
}

const testAudio = (type: 'warning' | 'urgent') => {
  if (!localSettings.value.audioEnabled) {
    alert('Audio is currently disabled. Enable it first to test sounds.')
    return
  }
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'warning') {
      oscillator.frequency.value = 600
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } else {
      oscillator.frequency.value = 1000
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  } catch (error) {
    console.warn('Audio test failed:', error)
    alert('Unable to test audio. Please check your browser settings.')
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m`
}

const resetPhaseDuration = (phaseId: string) => {
  localSettings.value.customPhaseDurations[phaseId] = 0
}

const saveSettings = () => {
  // Create a copy of settings to save
  const settingsToSave = { ...localSettings.value }
  
  // Convert minutes to seconds for storage and clean up empty values
  const cleanedDurations: Record<string, number> = {}
  Object.keys(settingsToSave.customPhaseDurations).forEach(key => {
    const value = settingsToSave.customPhaseDurations[key]
    if (value && value > 0) {
      cleanedDurations[key] = value * 60  // Convert minutes to seconds
    }
  })
  settingsToSave.customPhaseDurations = cleanedDurations
  
  // Update the store with converted values
  gameStateManager.updateSettings(settingsToSave)
  
  // Show success message
  showSaveMessage.value = true
  setTimeout(() => {
    showSaveMessage.value = false
  }, 3000)
}

const exportSettings = () => {
  const settingsData = {
    settings: localSettings.value,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }
  
  const jsonString = JSON.stringify(settingsData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agot-gm-settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleImportSettings = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result as string
      const imported = JSON.parse(jsonString)
      
      if (imported.settings) {
        localSettings.value = { ...localSettings.value, ...imported.settings }
        alert('Settings imported successfully!')
      } else {
        alert('Invalid settings file format.')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import settings. Please check the file format.')
    }
  }
  reader.readAsText(file)
}

const resetAllSettings = () => {
  if (confirm('Are you sure you want to reset all settings to their default values? This cannot be undone.')) {
    localSettings.value = {
      audioEnabled: true,
      visualAlertsEnabled: true,
      darkTheme: false,
      customPhaseDurations: {}
    }
    
    // Also reset color mode
    colorMode.preference = 'light'
  }
}

</script>