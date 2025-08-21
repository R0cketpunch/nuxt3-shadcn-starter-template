export const useGameTimer = () => {
  const timeRemaining = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)
  const intervalId = ref<NodeJS.Timeout | null>(null)
  
  let audioContext: AudioContext | null = null
  
  const initAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }
  
  const playAlert = (frequency: number = 800, duration: number = 200) => {
    try {
      initAudioContext()
      if (!audioContext) return
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Audio alert failed:', error)
    }
  }
  
  const startTimer = (duration: number) => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
    }
    
    timeRemaining.value = duration
    isActive.value = true
    isPaused.value = false
    
    intervalId.value = setInterval(() => {
      if (!isPaused.value && timeRemaining.value > 0) {
        timeRemaining.value--
        
        // Audio alerts at 60 and 30 seconds
        if (timeRemaining.value === 60) {
          playAlert(600, 300) // Lower pitch, longer duration
        } else if (timeRemaining.value === 30) {
          playAlert(800, 200) // Higher pitch, shorter duration
        } else if (timeRemaining.value === 10) {
          playAlert(1000, 100) // Urgent beep
        } else if (timeRemaining.value === 0) {
          playAlert(400, 500) // Low completion tone
          isActive.value = false
        }
      }
    }, 1000)
  }
  
  const pauseTimer = () => {
    isPaused.value = true
  }
  
  const resumeTimer = () => {
    if (isActive.value && timeRemaining.value > 0) {
      isPaused.value = false
    }
  }
  
  const resetTimer = (duration?: number) => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    
    if (duration !== undefined) {
      timeRemaining.value = duration
    }
    isActive.value = false
    isPaused.value = false
  }
  
  const addTime = (seconds: number) => {
    timeRemaining.value = Math.max(0, timeRemaining.value + seconds)
  }
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const getTimerColor = (): string => {
    if (timeRemaining.value > 60) return 'text-green-600'
    if (timeRemaining.value > 30) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
    }
  })
  
  return {
    timeRemaining: readonly(timeRemaining),
    isActive: readonly(isActive),
    isPaused: readonly(isPaused),
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addTime,
    formatTime,
    getTimerColor
  }
}