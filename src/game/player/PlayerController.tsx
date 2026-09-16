import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerPhysics } from './playerPhysics';
import { PlayerModel } from './PlayerModel';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { gameStateStore, useGameState } from '../core/GameState';
import { interactionManager } from '../interaction/useInteraction';
import { audioManager } from '../audio/AudioManager';
import { ASSET_CONFIG } from '../core/assetConfig';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export function PlayerController() {
  const { camera } = useThree();
  const { gameState, presentScenePhase, controlsLocked, isChildSitting } = useGameState();

  // Initial spawn position standing in the living room facing towards Old Man
  const initialSpawn: [number, number, number] = ASSET_CONFIG.staging.childSpawn;
  const [physics] = useState(() => new PlayerPhysics(initialSpawn));
  const groupRef = useRef<THREE.Group>(null);
  const initialFacingAngle = Math.atan2(
    ASSET_CONFIG.staging.oldManStanding[0] - initialSpawn[0],
    ASSET_CONFIG.staging.oldManStanding[2] - initialSpawn[2]
  );
  const currentRotation = useRef<number>(initialFacingAngle);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(() => new THREE.Vector3(...initialSpawn));
  const sittingTimer = useRef<number>(0);

  // Predefined child sofa sitting marker
  const childSeatPos = new THREE.Vector3(...ASSET_CONFIG.staging.childSittingMarker);

  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const lastFootstepTime = useRef<number>(0);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlsLocked || gameState !== 'PLAYING') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.run = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.run = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlsLocked, gameState]);

  // Main Controller Frame Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Natural camera-relative directional vectors during free play
    const moveDir = new THREE.Vector3(0, 0, 0);

    if (presentScenePhase === 'APPROACH' && gameState === 'PLAYING' && !controlsLocked) {
      // Forward vector on horizontal plane
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      // Right vector on horizontal plane: in Three.js, (0,1,0) x camForward points RIGHT
      const camRight = new THREE.Vector3();
      camRight.crossVectors(new THREE.Vector3(0, 1, 0), camForward).normalize();

      // W moves forward, S moves backward, D moves right, A moves left
      if (keys.current.forward) moveDir.add(camForward);
      if (keys.current.backward) moveDir.sub(camForward);
      if (keys.current.right) moveDir.add(camRight);
      if (keys.current.left) moveDir.sub(camRight);

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
      }

      const running = keys.current.run && moveDir.lengthSq() > 0.001;
      setIsRunning(running);

      // Update physics simulation
      const { position: newPos, speed } = physics.update(moveDir, running, dt);
      setCurrentSpeed(speed);
      setPlayerPos(newPos.clone());

      if (groupRef.current) {
        groupRef.current.position.copy(newPos);

        // Smooth rotation towards movement direction (no abrupt snapping or moonwalking)
        if (moveDir.lengthSq() > 0.001) {
          const targetRotation = Math.atan2(moveDir.x, moveDir.z);
          let diff = targetRotation - currentRotation.current;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          currentRotation.current += diff * Math.min(1, 14 * dt);
          groupRef.current.rotation.y = currentRotation.current;
        }
      }

      // Footsteps audio integration
      if (speed > 0.25) {
        const now = state.clock.getElapsedTime();
        const footstepInterval = running ? 0.30 : 0.44;
        if (now - lastFootstepTime.current > footstepInterval) {
          audioManager.playFootstep();
          lastFootstepTime.current = now;
        }
      }

      gameStateStore.setPlayerTransform(
        [newPos.x, newPos.y, newPos.z],
        currentRotation.current,
        speed > 0.15,
        running
      );

      interactionManager.update([newPos.x, newPos.y, newPos.z]);
    } else if (presentScenePhase === 'INITIAL_DIALOGUE') {
      // During initial dialogue: face Old Man and maintain natural conversation distance
      setCurrentSpeed(0);
      setIsRunning(false);

      const oldManPos = ASSET_CONFIG.staging.oldManStanding;
      const targetRot = Math.atan2(oldManPos[0] - playerPos.x, oldManPos[2] - playerPos.z);
      let diff = targetRot - currentRotation.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      currentRotation.current += diff * Math.min(1, 8 * dt);

      if (groupRef.current) {
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (presentScenePhase === 'OLD_MAN_WALKING_SOFA' || presentScenePhase === 'OLD_MAN_SITTING') {
      // Watching Dada walk to the sofa
      setCurrentSpeed(0);
      setIsRunning(false);

      const sofaMarker = ASSET_CONFIG.staging.oldManSittingMarker;
      const targetRot = Math.atan2(sofaMarker[0] - playerPos.x, sofaMarker[2] - playerPos.z);
      let diff = targetRot - currentRotation.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      currentRotation.current += diff * Math.min(1, 6 * dt);

      if (groupRef.current) {
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (presentScenePhase === 'CHILD_WALKING_SOFA') {
      // Child physically walks to his designated sofa seat
      const toSeat = new THREE.Vector3().subVectors(childSeatPos, playerPos);
      toSeat.y = 0;
      const dist = toSeat.length();

      if (dist > 0.06) {
        const walkDir = toSeat.clone().normalize();
        const walkSpeed = 1.05;
        playerPos.addScaledVector(walkDir, walkSpeed * dt);
        physics.setPosition(playerPos.x, playerPos.y, playerPos.z);

        const targetRot = Math.atan2(walkDir.x, walkDir.z);
        let diff = targetRot - currentRotation.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        currentRotation.current += diff * Math.min(1, 10 * dt);

        setCurrentSpeed(walkSpeed);
        setIsRunning(false);

        // Footsteps while walking to sofa
        const now = state.clock.getElapsedTime();
        if (now - lastFootstepTime.current > 0.42) {
          audioManager.playFootstep();
          lastFootstepTime.current = now;
        }
      } else {
        // Reached seat!
        playerPos.copy(childSeatPos);
        physics.setPosition(childSeatPos.x, childSeatPos.y, childSeatPos.z);
        setCurrentSpeed(0);
        gameStateStore.setPresentScenePhase('CHILD_SITTING');
      }

      if (groupRef.current) {
        groupRef.current.position.copy(playerPos);
        groupRef.current.rotation.y = currentRotation.current;
      }
      setPlayerPos(playerPos.clone());
    } else if (presentScenePhase === 'CHILD_SITTING') {
      // Turn forward and transition to sitting animation
      setCurrentSpeed(0);
      setIsRunning(false);

      if (groupRef.current) {
        // Turn to face forward (+Z, yaw = 0)
        let diff = 0 - currentRotation.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        currentRotation.current += diff * Math.min(1, 6 * dt);
        groupRef.current.rotation.y = currentRotation.current;
        groupRef.current.position.copy(childSeatPos);
      }

      sittingTimer.current += dt;
      if (sittingTimer.current > 1.3) {
        // Both seated! Start Story Mode!
        gameStateStore.startStoryMode();
      }
    } else if (presentScenePhase === 'STORY_MODE') {
      // Seated peacefully beside Dada in Story Mode
      setCurrentSpeed(0);
      setIsRunning(false);

      if (groupRef.current) {
        groupRef.current.position.copy(childSeatPos);
        // Look slightly toward Dada
        const targetRot = -0.22;
        let diff = targetRot - currentRotation.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        currentRotation.current += diff * Math.min(1, 4 * dt);
        groupRef.current.rotation.y = currentRotation.current;
      }
    }
  });

  const isSitting = presentScenePhase === 'CHILD_SITTING' || presentScenePhase === 'STORY_MODE' || isChildSitting;

  return (
    <>
      <group ref={groupRef} position={[playerPos.x, playerPos.y, playerPos.z]}>
        <PlayerModel speed={currentSpeed} isRunning={isRunning} isSitting={isSitting} />
      </group>
      <ThirdPersonCamera targetPosition={playerPos} targetRotation={currentRotation.current} />
    </>
  );
}

