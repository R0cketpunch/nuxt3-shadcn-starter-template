export const useGameAudio = () => {
  let audioContext: AudioContext | null = null;

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

    // Force resume if suspended (common in browsers due to autoplay policy)
    if (audioContext && audioContext.state === "suspended") {
      console.log("Audio context suspended, attempting to resume...");
      try {
        await audioContext.resume();
        console.log(
          `Audio context resumed successfully, state: ${audioContext.state}`
        );
      } catch (error) {
        console.warn("Failed to resume audio context:", error);
        return false;
      }
    }

    const isReady = audioContext?.state === "running";
    console.log(
      `Audio ready check: ${isReady}, context state: ${audioContext?.state}`
    );
    return isReady;
  };

  // Simple audio file player using HTML5 Audio (more reliable)
  const playAudioFile = async (url: string, volume: number = 0.7) => {
    try {
      console.log(`🔊 Playing audio: ${url} at volume ${volume}`);

      const audio = new Audio(url);
      audio.volume = volume;

      // Handle audio events
      audio.addEventListener("canplaythrough", () => {
        console.log(`✅ Audio ready: ${url}`);
      });

      audio.addEventListener("ended", () => {
        console.log(`🏁 Audio finished: ${url}`);
      });

      audio.addEventListener("error", (e) => {
        console.warn(`❌ Audio error for ${url}:`, e);
      });

      // Play the audio
      await audio.play();
      console.log(`▶️ Audio started: ${url}`);
    } catch (error) {
      console.warn(`Failed to play audio file: ${url}`, error);
      // Fallback to tone
      console.log("🎵 Falling back to tone...");
      await playTone(600, 300, volume);
    }
  };

  // Test audio with immediate feedback
  const testAudio = async () => {
    console.log("🔊 Testing audio system...");

    // Try to ensure audio is ready
    const isReady = await ensureAudioReady();
    console.log(`Audio ready status: ${isReady}`);

    // Try playing a test tone first
    console.log("Playing test tone...");
    await playTone(800, 500, 0.5);

    // Then try playing a test audio file
    setTimeout(async () => {
      console.log("Playing test audio file...");
      await playAudioFile("/sounds/subphase.ogg", 0.8);
    }, 600);
  };

  // Generate tone (simplified)
  const playTone = async (
    frequency: number = 800,
    duration: number = 200,
    volume: number = 0.3
  ) => {
    try {
      console.log(
        `Playing tone: ${frequency}Hz for ${duration}ms at volume ${volume}`
      );
      await initAudioContext();
      if (!audioContext) {
        console.warn("No audio context for tone");
        return;
      }

      if (audioContext.state === "suspended") {
        console.log("Audio context suspended for tone, resuming...");
        await audioContext.resume();
      }

      if (audioContext.state !== "running") {
        console.warn(
          `Audio context not running for tone (state: ${audioContext.state})`
        );
        return;
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

      console.log(`Tone started successfully: ${frequency}Hz`);
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

  // Custom sound file paths
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
    wildlingAttack: "/sounds/wildling-attack.ogg",
  };

  // Play custom timer sound with fallback to generated tone
  const playTimerSound = async (type: "start" | "halfway" | "complete") => {
    const soundUrl = soundFiles.timer[type];

    // Try to play custom sound file first
    if (typeof window !== "undefined") {
      try {
        await playAudioFile(soundUrl);
        return;
      } catch (error) {
        console.warn(`Failed to play timer sound ${soundUrl}, using fallback`);
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
      try {
        await playAudioFile(soundUrl, 0.6);
        return;
      } catch (error) {
        console.warn(`Failed to play phase sound ${soundUrl}, using fallback`);
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
      try {
        await playAudioFile(soundUrl, 0.5);
        return;
      } catch (error) {
        console.warn(
          `Failed to play subphase sound ${soundUrl}, using fallback`
        );
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
      try {
        await playAudioFile(soundUrl, 0.7);
        return;
      } catch (error) {
        console.warn(
          `Failed to play game end sound ${soundUrl}, using fallback`
        );
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
      try {
        await playAudioFile(soundUrl, 0.4);
        return;
      } catch (error) {
        console.warn(
          `Failed to play influence sound ${soundUrl}, using fallback`
        );
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
    ensureAudioReady,
    testAudio,
  };
};
