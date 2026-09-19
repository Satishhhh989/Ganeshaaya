import { useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

/**
 * PandalRevealCinematic has been replaced by the in-world, cinematic
 * seamless morning sunrise and colony procession gameplay.
 * Automatically advances smoothly into FESTIVAL_PREPARATION with zero UI modals.
 */
export function PandalRevealCinematic() {
  const { currentScene, presentScenePhase } = useGameState();

  useEffect(() => {
    if (
      currentScene === 'PANDAL' &&
      (presentScenePhase === 'PANDAL_COMPLETE' || presentScenePhase === 'GANESH_CHATURTHI_READY')
    ) {
      audioManager.playSacredArtiBell();
      gameStateStore.advancePresentPhase('FESTIVAL_PREPARATION');
    }
  }, [currentScene, presentScenePhase]);

  return null;
}
