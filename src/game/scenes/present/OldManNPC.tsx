import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASSET_CONFIG } from '../../core/assetConfig';
import { InteractionTrigger } from '../../interaction/InteractionTrigger';
import { gameStateStore, useGameState } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { DadaCharacter } from '../../characters/ProceduralCharacters';

export function OldManNPC() {
  const groupRef = useRef<THREE.Group>(null);
  const { gameState, presentScenePhase, playerPos, activeDialogue, dialogueIndex } = useGameState();

  // Staging Positions
  const standingPos = useRef(new THREE.Vector3(...ASSET_CONFIG.staging.oldManStanding));
  const sittingMarker = useRef(new THREE.Vector3(...ASSET_CONFIG.staging.oldManSittingMarker));

  const currentPos = useRef(standingPos.current.clone());
  const initialYaw = Math.atan2(
    ASSET_CONFIG.staging.childSpawn[0] - ASSET_CONFIG.staging.oldManStanding[0],
    ASSET_CONFIG.staging.childSpawn[2] - ASSET_CONFIG.staging.oldManStanding[2]
  );
  const currentYaw = useRef<number>(initialYaw);
  const sittingTimer = useRef<number>(0);
  const speedRef = useRef(0);
  const isSittingRef = useRef(false);
  const isTalkingRef = useRef(false);

  const lerpAngle = useCallback((from: number, to: number, t: number): number => {
    let diff = to - from;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return from + diff * t;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);

    if (presentScenePhase === 'APPROACH' || presentScenePhase === 'INITIAL_DIALOGUE') {
      // Standing and facing the player
      speedRef.current = 0;
      isSittingRef.current = false;
      const currentSpeaker = activeDialogue?.lines[dialogueIndex]?.speaker?.toLowerCase();
      const isDadaSpeaking =
        (presentScenePhase === 'INITIAL_DIALOGUE' || gameState === 'DIALOGUE') &&
        currentSpeaker !== 'child' &&
        currentSpeaker !== 'vinay';
      isTalkingRef.current = isDadaSpeaking;

      let targetYaw = currentYaw.current;
      if (playerPos) {
        const dx = playerPos[0] - currentPos.current.x;
        const dz = playerPos[2] - currentPos.current.z;
        targetYaw = Math.atan2(dx, dz);
      }

      currentYaw.current = lerpAngle(currentYaw.current, targetYaw, Math.min(1, dt * 5.0));
      groupRef.current.rotation.y = currentYaw.current;
      groupRef.current.position.copy(currentPos.current);

    } else if (presentScenePhase === 'OLD_MAN_WALKING_SOFA') {
      // Walking smoothly to predefined sofa marker at floor level
      speedRef.current = 0.85;
      isSittingRef.current = false;
      isTalkingRef.current = false;

      const target = sittingMarker.current;
      const toSofa = new THREE.Vector3(target.x - currentPos.current.x, 0, target.z - currentPos.current.z);
      const dist = toSofa.length();

      if (dist > 0.08) {
        const walkDir = toSofa.clone().normalize();
        currentPos.current.addScaledVector(walkDir, 0.85 * dt);
        currentPos.current.y = 0.0; // Keep feet firmly on carpet while walking
        const targetYaw = Math.atan2(walkDir.x, walkDir.z);
        currentYaw.current = lerpAngle(currentYaw.current, targetYaw, Math.min(1, dt * 7.0));
      } else {
        currentPos.current.x = target.x;
        currentPos.current.z = target.z;
        sittingTimer.current = 0;
        gameStateStore.setPresentScenePhase('OLD_MAN_SITTING');
      }

      groupRef.current.position.set(currentPos.current.x, currentPos.current.y, currentPos.current.z);
      groupRef.current.rotation.y = currentYaw.current;

    } else if (presentScenePhase === 'OLD_MAN_SITTING') {
      // Smoothly turn to face room and settle gently onto cushion
      speedRef.current = 0;
      isSittingRef.current = true;
      isTalkingRef.current = false;

      sittingTimer.current += dt;
      const progress = Math.min(1, sittingTimer.current / 0.9);
      const ease = progress * progress * (3 - 2 * progress);
      const seatY = THREE.MathUtils.lerp(0.0, sittingMarker.current.y, ease);

      currentYaw.current = lerpAngle(currentYaw.current, 0, Math.min(1, dt * 6.0));
      groupRef.current.position.set(sittingMarker.current.x, seatY, sittingMarker.current.z);
      groupRef.current.rotation.y = currentYaw.current;

      if (sittingTimer.current > 1.6) {
        gameStateStore.setPresentScenePhase('CHILD_WALKING_SOFA');
      }

    } else {
      // Comfortably seated on sofa cushion
      speedRef.current = 0;
      isSittingRef.current = true;
      const isDadaSpeaking =
        presentScenePhase === 'STORY_MODE' &&
        activeDialogue?.lines[dialogueIndex]?.speaker?.toLowerCase() !== 'child';
      isTalkingRef.current = isDadaSpeaking;

      groupRef.current.position.copy(sittingMarker.current);
      // Turn gently towards Vinay during storytelling
      const targetYaw = presentScenePhase === 'STORY_MODE' ? 0.22 : 0;
      currentYaw.current = lerpAngle(currentYaw.current, targetYaw, Math.min(1, dt * 4.0));
      groupRef.current.rotation.y = currentYaw.current;
    }
  });

  const handleInteract = () => {
    audioManager.playTempleBell();
    gameStateStore.setPresentScenePhase('INITIAL_DIALOGUE');
    gameStateStore.startDialogue();
  };

  const isStanding = presentScenePhase === 'APPROACH' || presentScenePhase === 'INITIAL_DIALOGUE';
  const triggerPos: [number, number, number] = isStanding
    ? [standingPos.current.x, standingPos.current.y, standingPos.current.z]
    : ASSET_CONFIG.staging.oldManSittingMarker;

  return (
    <group>
      <group ref={groupRef}>
        <DadaCharacter
          speed={speedRef.current}
          isSitting={isSittingRef.current}
          isTalking={isTalkingRef.current}
        />
      </group>

      {presentScenePhase === 'APPROACH' && (
        <InteractionTrigger
          id="npc_old_man"
          name="Dada"
          worldPosition={triggerPos}
          radius={ASSET_CONFIG.staging.interactionRadius}
          prompt="Talk"
          onInteract={handleInteract}
          showIndicator={gameState === 'PLAYING'}
        />
      )}
    </group>
  );
}
