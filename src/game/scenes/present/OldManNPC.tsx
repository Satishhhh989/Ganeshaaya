import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASSET_CONFIG } from '../../core/assetConfig';
import { InteractionTrigger } from '../../interaction/InteractionTrigger';
import { gameStateStore, useGameState } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function OldManNPC() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(ASSET_CONFIG.characters.oldMan.url);
  const { actions } = useAnimations(gltf.animations, groupRef);
  const { gameState, presentScenePhase, playerPos } = useGameState();

  // Staging Positions:
  // Dedicated initial standing position:
  const standingPos = useRef(new THREE.Vector3(...ASSET_CONFIG.staging.oldManStanding));
  // Predefined scripted sofa sitting marker:
  const oldManSittingMarker = new THREE.Vector3(...ASSET_CONFIG.staging.oldManSittingMarker);

  const currentPos = useRef(standingPos.current.clone());
  const initialYaw = Math.atan2(
    ASSET_CONFIG.staging.childSpawn[0] - ASSET_CONFIG.staging.oldManStanding[0],
    ASSET_CONFIG.staging.childSpawn[2] - ASSET_CONFIG.staging.oldManStanding[2]
  );
  const currentYaw = useRef<number>(initialYaw); // Initially facing child
  const sittingTimer = useRef<number>(0);
  const currentAction = useRef<string>('talk');

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [gltf]);

  // Initial animation: start with standing talk/idle gestures
  useEffect(() => {
    if (!actions) return;

    const talkAction = actions['talk'] || actions['talk.001'] || actions['idle'];
    if (talkAction) {
      talkAction.reset().setEffectiveWeight(1).fadeIn(0.3).play();
      currentAction.current = 'talk';
    }
  }, [actions]);

  // Frame loop: manage standing, facing child, walking to sofa, and sitting
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);

    if (presentScenePhase === 'APPROACH' || presentScenePhase === 'INITIAL_DIALOGUE') {
      // 1. Standing naturally facing the Child
      let targetYaw = currentYaw.current;

      if (playerPos) {
        const dx = playerPos[0] - currentPos.current.x;
        const dz = playerPos[2] - currentPos.current.z;
        targetYaw = Math.atan2(dx, dz);
      }

      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw, dt * 5.0);
      groupRef.current.rotation.y = currentYaw.current;
      groupRef.current.position.copy(currentPos.current);
    } else if (presentScenePhase === 'OLD_MAN_WALKING_SOFA') {
      // 2. Physical walking to the sofa
      if (currentAction.current !== 'walk' && actions) {
        const walkAction = actions['walk'] || actions['walk.001'];
        const prev = actions[currentAction.current];
        if (walkAction) {
          walkAction.reset().setEffectiveTimeScale(0.95);
          if (prev) prev.crossFadeTo(walkAction, 0.25, true);
          else walkAction.fadeIn(0.25);
          walkAction.play();
          currentAction.current = 'walk';
        }
      }

      // Move towards dedicated sofa sitting marker
      const toSofa = new THREE.Vector3().subVectors(oldManSittingMarker, currentPos.current);
      toSofa.y = 0;
      const dist = toSofa.length();

      if (dist > 0.06) {
        const walkDir = toSofa.clone().normalize();
        const walkSpeed = 0.95; // m/s
        currentPos.current.addScaledVector(walkDir, walkSpeed * dt);

        const targetYaw = Math.atan2(walkDir.x, walkDir.z);
        currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw, dt * 8.0);
      } else {
        // Reached sofa sitting marker!
        currentPos.current.copy(oldManSittingMarker);
        gameStateStore.setPresentScenePhase('OLD_MAN_SITTING');
      }

      groupRef.current.position.copy(currentPos.current);
      groupRef.current.rotation.y = currentYaw.current;
    } else if (presentScenePhase === 'OLD_MAN_SITTING') {
      // 3. Reached sofa, transition to sitting animation and orient forward
      if (currentAction.current !== 'sit' && actions) {
        const sitAction = actions['sit'] || actions['sit.001'];
        const prev = actions[currentAction.current];
        if (sitAction) {
          sitAction.reset();
          if (prev) prev.crossFadeTo(sitAction, 0.35, true);
          else sitAction.fadeIn(0.35);
          sitAction.play();
          currentAction.current = 'sit';
        }
      }

      // Face forward into the living room (yaw = 0)
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, 0, dt * 6.0);
      groupRef.current.position.copy(oldManSittingMarker);
      groupRef.current.rotation.y = currentYaw.current;

      // Allow 1.3s for sitting animation to settle, then trigger Child's walk to sofa
      sittingTimer.current += dt;
      if (sittingTimer.current > 1.3) {
        gameStateStore.setPresentScenePhase('CHILD_WALKING_SOFA');
      }
    } else {
      // 4. Seated naturally on the sofa during Child's transition and Story Mode
      currentPos.current.copy(oldManSittingMarker);
      groupRef.current.position.copy(oldManSittingMarker);

      // In story mode, turn slightly towards the child sitting beside him
      const targetYaw = presentScenePhase === 'STORY_MODE' ? 0.22 : 0;
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw, dt * 4.0);
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
      <group
        ref={groupRef}
        scale={ASSET_CONFIG.characters.oldMan.scale}
      >
        <primitive object={gltf.scene} />
      </group>

      {/* Proximity Interaction Trigger while standing */}
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

useGLTF.preload(ASSET_CONFIG.characters.oldMan.url);
