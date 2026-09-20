import { useVirtualInputState } from './virtualInputStore';
import { VirtualJoystick } from './VirtualJoystick';
import { MobileTouchLookArea } from './MobileTouchLookArea';
import { MobileActionButtons } from './MobileActionButtons';
import { useGameState } from '../../core/GameState';

/**
 * MobileControlsManager:
 * High-level coordinator that activates virtual joystick, look gestures,
 * and contextual action buttons strictly on mobile devices in landscape.
 */
export function MobileControlsManager() {
  const { isTouchDevice, isPortrait } = useVirtualInputState();
  const { gameState, currentScene, presentScenePhase, shivaPhase } = useGameState();

  // On desktop or when device is portrait, do not mount controls
  if (!isTouchDevice || isPortrait) {
    return null;
  }

  // Determine if player movement is allowed
  const isFreeRoamScene =
    gameState === 'PLAYING' &&
    ((currentScene === 'PRESENT_HOME' &&
      (presentScenePhase === 'APPROACH' ||
        presentScenePhase === 'PANDAL_BUILDING' ||
        presentScenePhase === 'FESTIVAL_PREPARATION' ||
        presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION')) ||
      (currentScene === 'PANDAL' &&
        (presentScenePhase === 'PANDAL_BUILDING' ||
          presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION')) ||
      (currentScene === 'SHIVA_SEQUENCE' &&
        (shivaPhase === 'SHIVA_SEARCH' || shivaPhase === 'ELEPHANT_ENCOUNTER')));

  // Trishul aiming: movement is disabled, aiming swipe is enabled
  const isTrishulAiming =
    currentScene === 'SHIVA_SEQUENCE' &&
    (shivaPhase === 'TRISHUL_AIMING' || shivaPhase === 'SHIVA_GAMEPLAY');

  const enableLook = isFreeRoamScene || isTrishulAiming;
  const enableJoystick = isFreeRoamScene && !isTrishulAiming;

  return (
    <>
      {/* 1. Lower-Left Virtual Joystick for Player Movement */}
      <VirtualJoystick disabled={!enableJoystick} />

      {/* 2. Right-side touch drag for camera look & aiming */}
      <MobileTouchLookArea disabled={!enableLook} />

      {/* 3. Contextual action buttons (Interact, Throw) */}
      <MobileActionButtons />
    </>
  );
}
