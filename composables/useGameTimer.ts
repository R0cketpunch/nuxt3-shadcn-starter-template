export const useGameTimer = () => {
  const timeRemaining = ref(0);
  const isActive = ref(false);
  const isPaused = ref(false);
  const intervalId = ref<NodeJS.Timeout | null>(null);

  let audioContext: AudioContext | null = null;

  const initAudioContext = () => {
    if (!audioContext && typeof window !== "undefined") {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  };

  const playAlert = (frequency: number = 800, duration: number = 200) => {
    try {
      initAudioContext();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Audio alert failed:", error);
    }
  };

  const startTimer = (
    duration: number,
    shouldCountdown = true,
    gameStartTime?: number
  ) => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
    }

    if (shouldCountdown) {
      timeRemaining.value = duration;
    } else {
      // Show total game time when not actively timing
      if (gameStartTime) {
        timeRemaining.value = Math.floor((Date.now() - gameStartTime) / 1000);
      } else {
        timeRemaining.value = 0;
      }
    }

    isActive.value = true;
    isPaused.value = false;

    intervalId.value = setInterval(() => {
      if (!isPaused.value) {
        if (shouldCountdown && timeRemaining.value > 0) {
          timeRemaining.value--;

          // Audio alerts at 60 and 30 seconds
          if (timeRemaining.value === 60) {
            playAlert(600, 300); // Lower pitch, longer duration
          } else if (timeRemaining.value === 30) {
            playAlert(800, 200); // Higher pitch, shorter duration
          } else if (timeRemaining.value === 10) {
            playAlert(1000, 100); // Urgent beep
          } else if (timeRemaining.value === 0) {
            playAlert(400, 500); // Low completion tone
            isActive.value = false;
          }
        } else if (!shouldCountdown && gameStartTime) {
          // Count up total game time
          timeRemaining.value = Math.floor((Date.now() - gameStartTime) / 1000);
        }
      }
    }, 1000);
  };

  const pauseTimer = () => {
    isPaused.value = true;
  };

  const resumeTimer = () => {
    if (isActive.value && timeRemaining.value > 0) {
      isPaused.value = false;
    }
  };

  const resetTimer = (
    duration?: number,
    shouldCountdown = true,
    gameStartTime?: number
  ) => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }

    if (duration !== undefined) {
      if (shouldCountdown) {
        timeRemaining.value = duration;
      } else {
        // Show current total game time
        if (gameStartTime) {
          timeRemaining.value = Math.floor((Date.now() - gameStartTime) / 1000);
        } else {
          timeRemaining.value = 0;
        }
      }
    }
    isActive.value = false;
    isPaused.value = false;
  };

  const addTime = (seconds: number) => {
    // Defensive check - ensure seconds is a reasonable number
    if (typeof seconds !== 'number' || isNaN(seconds) || Math.abs(seconds) > 3600) {
      console.error('❌ addTime called with invalid seconds:', seconds);
      return;
    }
    
    timeRemaining.value = Math.max(0, timeRemaining.value + seconds);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeComponents = (seconds: number) => {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = seconds % 60;
    return { hh, mm, ss };
  };

  const getTimerColor = (): string => {
    if (timeRemaining.value > 120) return "text-green-500";
    if (timeRemaining.value > 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getTimerBackground = (): string => {
    if (timeRemaining.value > 120) return "bg-green-500";
    if (timeRemaining.value > 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
    }
  });

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
    getTimeComponents,
    getTimerColor,
    getTimerBackground,
  };
};
