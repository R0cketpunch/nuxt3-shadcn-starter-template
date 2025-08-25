import type { GameState } from "~/types/game";

export const useGameSounds = () => {
  const gameAudio = useGameAudio();

  // Track previous state to detect changes
  let previousState: GameState | null = null;
  let lastWildlingAttackThreat = 0;

  // Check if audio is enabled in settings
  const isAudioEnabled = () => {
    // This will be checked when needed, ensuring we get the latest settings
    const { settings } = useGameState();
    return settings.value.audioEnabled;
  };

  // Main function to process state changes and trigger sounds
  const processStateChange = (newState: GameState) => {
    if (!isAudioEnabled()) {
      previousState = newState;
      return;
    }

    if (!previousState) {
      previousState = newState;
      return;
    }

    // Check for round changes
    if (newState.currentRound > previousState.currentRound) {
      console.log("🎵 Playing round transition sound");
      gameAudio.playPhaseSound("round").catch(console.warn);
    }

    // Check for phase changes
    if (newState.currentPhase.id !== previousState.currentPhase.id) {
      console.log(
        `🎵 Playing phase transition sound: ${newState.currentPhase.id}`
      );

      // Small delay to not overlap with round sound
      const delay =
        newState.currentRound > previousState.currentRound ? 1000 : 0;

      setTimeout(() => {
        switch (newState.currentPhase.id) {
          case "westeros":
            gameAudio.playPhaseSound("westeros").catch(console.warn);
            break;
          case "planning":
            gameAudio.playPhaseSound("planning").catch(console.warn);
            break;
          case "action":
            gameAudio.playPhaseSound("action").catch(console.warn);
            break;
        }
      }, delay);
    }

    // Check for sub-phase changes (but not initial sub-phase assignment)
    if (
      newState.currentSubPhase?.id !== previousState.currentSubPhase?.id &&
      previousState.currentSubPhase !== undefined
    ) {
      console.log(
        `🎵 Playing sub-phase transition sound: ${newState.currentSubPhase?.id}`
      );
      gameAudio.playSubPhaseSound().catch(console.warn);
    }

    // Check for wildling threat changes that trigger an attack
    if (newState.wildlingThreat >= 12 && previousState.wildlingThreat < 12) {
      console.log("🎵 Playing wildling attack sound");
      // Try to play wildling attack sound, fallback to phase sound
      gameAudio.playAudioFile("/sounds/wildling-attack.ogg", 0.8).catch(() => {
        // Fallback to a dramatic tone sequence
        gameAudio.playTone(200, 800, 0.6).catch(console.warn);
        setTimeout(
          () => gameAudio.playTone(180, 600, 0.7).catch(console.warn),
          300
        );
        setTimeout(
          () => gameAudio.playTone(160, 1000, 0.8).catch(console.warn),
          600
        );
      });
    }

    // Check for influence track changes
    const influenceTracksChanged = checkInfluenceTrackChanges(
      newState,
      previousState
    );
    if (influenceTracksChanged) {
      console.log("🎵 Playing influence track movement sound");
      gameAudio.playInfluenceTrackSound().catch(console.warn);
    }

    // Check if game has ended
    if (newState.currentRound > 10 && previousState.currentRound <= 10) {
      console.log("🎵 Playing game end sound");
      gameAudio.playGameEndSound().catch(console.warn);
    }

    // Update previous state
    previousState = { ...newState };
  };

  // Helper function to check if influence tracks have changed
  const checkInfluenceTrackChanges = (
    newState: GameState,
    oldState: GameState
  ): boolean => {
    // Check if Iron Throne order changed
    if (
      newState.ironThroneOrder.length !== oldState.ironThroneOrder.length ||
      !newState.ironThroneOrder.every(
        (house, index) => house.id === oldState.ironThroneOrder[index]?.id
      )
    ) {
      return true;
    }

    // Check if Fiefdoms order changed
    if (
      newState.fiefdomsOrder.length !== oldState.fiefdomsOrder.length ||
      !newState.fiefdomsOrder.every(
        (house, index) => house.id === oldState.fiefdomsOrder[index]?.id
      )
    ) {
      return true;
    }

    // Check if King's Court order changed
    if (
      newState.kingsCourtOrder.length !== oldState.kingsCourtOrder.length ||
      !newState.kingsCourtOrder.every(
        (house, index) => house.id === oldState.kingsCourtOrder[index]?.id
      )
    ) {
      return true;
    }

    return false;
  };

  // Function to reset the sound system (useful when game resets)
  const reset = () => {
    previousState = null;
    lastWildlingAttackThreat = 0;
  };

  return {
    processStateChange,
    reset,
  };
};
