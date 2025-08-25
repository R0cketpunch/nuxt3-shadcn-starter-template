export const useGameAudio = () => {
  let audioContext: AudioContext | null = null;
  const audioCache = new Map<string, AudioBuffer>();

  const initAudioContext = async () => {
    if (!audioContext && typeof window !== "undefined") {
      try {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        console.log(`Audio context created, state: ${audioContext.state}`);

        // Try to resume if suspended
        if (audioContext.state === "suspended") {
          await audioContext.resume();
          console.log(`Audio context resumed, state: ${audioContext.state}`);
        }
      } catch (error) {
        console.warn("Failed to initialize audio context:", error);
      }
    }
  };

  // Public function to ensure audio is ready (call on user interaction)
  const ensureAudioReady = async () => {
    await initAudioContext();
    return audioContext?.state === "running";
  };

  // Load and cache audio files
  const loadAudioFile = async (url: string): Promise<AudioBuffer | null> => {
    if (audioCache.has(url)) {
      console.log(`Audio file cached: ${url}`);
      return audioCache.get(url)!;
    }

    try {
      console.log(`Loading audio file: ${url}`);
      await initAudioContext();
      if (!audioContext) {
        console.warn(`Audio context not available for: ${url}`);
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch audio file: ${url} - ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      audioCache.set(url, audioBuffer);
      console.log(`Successfully loaded and cached audio: ${url}`);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load audio file: ${url}`, error);
      return null;
    }
  };

  // Play custom audio file
  const playAudioFile = async (url: string, volume: number = 0.7) => {
    try {
      console.log(`Attempting to play audio: ${url}`);
      await initAudioContext();
      if (!audioContext) {
        console.warn(`Audio context not available for playback: ${url}`);
        return;
      }

      if (audioContext.state === "suspended") {
        console.log("Audio context suspended, attempting to resume...");
        await audioContext.resume();
      }

      const audioBuffer = await loadAudioFile(url);
      if (!audioBuffer) {
        console.warn(`Audio buffer not available for: ${url}`);
        return;
      }

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = volume;

      source.start();
      console.log(`Successfully started playing: ${url}`);
    } catch (error) {
      console.warn(`Failed to play audio file: ${url}`, error);
    }
  };

  // Generate tone (existing functionality)
  const playTone = async (
    frequency: number = 800,
    duration: number = 200,
    volume: number = 0.3
  ) => {
    try {
      await initAudioContext();
      if (!audioContext) return;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Audio tone failed:", error);
    }
  };

  // Game-specific audio functions
  const playTimerAlert = async (type: "start" | "halfway" | "complete") => {
    switch (type) {
      case "start": // Timer started
        await playTone(500, 300, 0.4);
        break;
      case "halfway": // 50% remaining
        await playTone(700, 400, 0.5);
        break;
      case "complete": // Timer finished
        await playTone(400, 500, 0.6);
        break;
    }
  };

  const playPhaseTransition = async (
    phaseType: "westeros" | "planning" | "action" | "round"
  ) => {
    switch (phaseType) {
      case "westeros":
        // Deep, regal tone for Westeros
        await playTone(300, 800, 0.5);
        break;
      case "planning":
        // Mid-range strategic tone
        await playTone(500, 600, 0.4);
        break;
      case "action":
        // Higher, more urgent tone for action
        await playTone(700, 400, 0.5);
        break;
      case "round":
        // Special multi-tone for new rounds
        await playTone(400, 300, 0.4);
        setTimeout(() => playTone(500, 300, 0.4), 200);
        setTimeout(() => playTone(600, 400, 0.5), 400);
        break;
    }
  };

  // Custom sound file paths (these would be stored in public/sounds/)
  const soundFiles = {
    timer: {
      start: "/sounds/timer-start.ogg",
      halfway: "/sounds/timer-halfway.ogg",
      complete: "/sounds/timer-done.ogg",
    },
    phase: "/sounds/phase.ogg",
    subphase: "/sounds/subphase.ogg",
    round: "/sounds/round.ogg",
    gameEnd: "/sounds/game-end.ogg",
    influenceMove: "/sounds/influence-move.ogg",
  };

  // Play custom timer sound with fallback to generated tone
  const playTimerSound = async (type: "start" | "halfway" | "complete") => {
    const soundUrl = soundFiles.timer[type];

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      const audioBuffer = await loadAudioFile(soundUrl);
      if (audioBuffer) {
        await playAudioFile(soundUrl);
        return;
      }
    }

    // Fallback to generated tone
    await playTimerAlert(type);
  };

  // Play custom phase sound with fallback to generated tone
  const playPhaseSound = async (
    phaseType: "westeros" | "planning" | "action" | "round"
  ) => {
    let soundUrl: string;
    
    // Use specific round sound for round transitions, otherwise use phase sound
    if (phaseType === "round") {
      soundUrl = soundFiles.round;
    } else {
      soundUrl = soundFiles.phase;
    }

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      const audioBuffer = await loadAudioFile(soundUrl);
      if (audioBuffer) {
        await playAudioFile(soundUrl, 0.6);
        return;
      }
    }

    // Fallback to generated tone
    await playPhaseTransition(phaseType);
  };

  // Play subphase sound
  const playSubPhaseSound = async () => {
    const soundUrl = soundFiles.subphase;

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      const audioBuffer = await loadAudioFile(soundUrl);
      if (audioBuffer) {
        await playAudioFile(soundUrl, 0.5);
        return;
      }
    }

    // Fallback to generated tone
    await playTone(600, 300, 0.4);
  };

  // Play game end sound
  const playGameEndSound = async () => {
    const soundUrl = soundFiles.gameEnd;

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      const audioBuffer = await loadAudioFile(soundUrl);
      if (audioBuffer) {
        await playAudioFile(soundUrl, 0.7);
        return;
      }
    }

    // Fallback to generated tone sequence for game end
    await playTone(300, 400, 0.5);
    setTimeout(() => playTone(400, 400, 0.5), 300);
    setTimeout(() => playTone(500, 600, 0.6), 600);
  };

  // Play influence track position change sound
  const playInfluenceTrackSound = async () => {
    const soundUrl = soundFiles.influenceMove;

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      const audioBuffer = await loadAudioFile(soundUrl);
      if (audioBuffer) {
        await playAudioFile(soundUrl, 0.4);
        return;
      }
    }

    // Fallback to generated tone
    await playTone(800, 150, 0.3);
  };

  return {
    playAudioFile,
    playTone,
    playTimerAlert,
    playPhaseTransition,
    playTimerSound,
    playPhaseSound,
    playSubPhaseSound,
    playGameEndSound,
    playInfluenceTrackSound,
    loadAudioFile,
    ensureAudioReady,
  };
};
