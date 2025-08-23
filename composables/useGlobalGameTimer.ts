// Global singleton timer that can be shared across components
let globalTimerInstance: ReturnType<typeof useGameTimer> | null = null

export const useGlobalGameTimer = () => {
  if (!globalTimerInstance) {
    globalTimerInstance = useGameTimer()
  }
  return globalTimerInstance
}