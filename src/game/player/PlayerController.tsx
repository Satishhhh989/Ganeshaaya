import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerPhysics } from './playerPhysics';
import { PlayerModel } from './PlayerModel';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { gameStateStore, useGameState } from '../core/GameState';
import { interactionManager } from '../interaction/useInteraction';
import { audioManager } from '../audio/AudioManager';
import { ASSET_CONFIG } from '../core/assetConfig';
import { virtualInputStore } from '../ui/mobile/virtualInputStore';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export function PlayerController() {
  const { camera } = useThree();
  const {
    gameState,
    currentScene,
    presentScenePhase,
    controlsLocked,
    isChildSitting,
    isAdultProtagonist,
    activeDialogue,
    dialogueIndex,
    timePassageStage,
  } = useGameState();

  const initialSpawn: [number, number, number] = ASSET_CONFIG.staging.childSpawn;
  const physicsRef = useRef(new PlayerPhysics(initialSpawn));
  const groupRef = useRef<THREE.Group>(null);

  // Initial facing: look towards old man
  const initialFacingAngle = Math.atan2(
    ASSET_CONFIG.staging.oldManStanding[0] - initialSpawn[0],
    ASSET_CONFIG.staging.oldManStanding[2] - initialSpawn[2]
  );
  const currentRotation = useRef<number>(initialFacingAngle);
  const currentSpeed = useRef(0);
  const isRunning = useRef(false);
  const playerPos = useRef(new THREE.Vector3(...initialSpawn));
  const sittingTimer = useRef<number>(0);

  // Sync colliders and positioning when scene changes (e.g. entering PANDAL)
  useEffect(() => {
    physicsRef.current.setCollidersForScene(currentScene);
    if (currentScene === 'PANDAL') {
      physicsRef.current.setPosition(0, 0, 6.8);
      playerPos.current.set(0, 0, 6.8);
      currentRotation.current = 0;
    }
  }, [currentScene]);

  // Predefined child sofa sitting marker
  const childSeatPos = useRef(new THREE.Vector3(...ASSET_CONFIG.staging.childSittingMarker));

  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const lastFootstepTime = useRef<number>(0);

  // Force re-render trigger for animation state changes
  const animSpeedRef = useRef(0);
  const animRunningRef = useRef(false);
  const animSittingRef = useRef(false);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlsLocked || gameState !== 'PLAYING') return;

      switch (e.code) {
        case 'KeyW': case 'ArrowUp':
          keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown':
          keys.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft':
          keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight':
          keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight':
          keys.current.run = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':
          keys.current.forward = false; break;
        case 'KeyS': case 'ArrowDown':
          keys.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft':
          keys.current.left = false; break;
        case 'KeyD': case 'ArrowRight':
          keys.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight':
          keys.current.run = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlsLocked, gameState]);

  // Smooth angle lerp helper
  const lerpAngle = useCallback((from: number, to: number, t: number): number => {
    let diff = to - from;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return from + diff * t;
  }, []);

  // Main Controller Frame Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const physics = physicsRef.current;
    const isFreeRoam =
      (presentScenePhase === 'APPROACH' ||
        presentScenePhase === 'PANDAL_BUILDING' ||
        presentScenePhase === 'FESTIVAL_PREPARATION' ||
        presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION') &&
      gameState === 'PLAYING' &&
      !controlsLocked;

    if (isFreeRoam) {
      // ─── Free movement: camera-relative WASD ───
      const moveDir = new THREE.Vector3(0, 0, 0);

      // Camera forward on XZ plane
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      // Camera right vector: cross(forward, up) gives RIGHT in Three.js
      const camRight = new THREE.Vector3();
      camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

      if (keys.current.forward)  moveDir.add(camForward);
      if (keys.current.backward) moveDir.sub(camForward);
      if (keys.current.right)    moveDir.add(camRight);
      if (keys.current.left)     moveDir.sub(camRight);

      // Mobile touch virtual joystick input integration
      const joy = virtualInputStore.getMoveVector();
      if (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05) {
        moveDir.addScaledVector(camForward, joy.y);
        moveDir.addScaledVector(camRight, joy.x);
      }

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
      }

      const running = (keys.current.run || joy.isRunning) && moveDir.lengthSq() > 0.001;
      isRunning.current = running;

      // Update physics
      const { position: newPos, speed } = physics.update(moveDir, running, dt);
      const actualSpeed = moveDir.lengthSq() > 0.001 ? speed : 0;
      currentSpeed.current = actualSpeed;
      playerPos.current.copy(newPos);

      // Strict velocity-based motion state: velocity ≈ 0 -> IDLE
      gameStateStore.setPlayerMotion(
        actualSpeed,
        actualSpeed < 0.08 ? 'IDLE' : (running ? 'RUN' : 'WALK')
      );

      if (groupRef.current) {
        groupRef.current.position.copy(newPos);

        // Smooth rotation towards movement direction
        if (moveDir.lengthSq() > 0.001) {
          const targetRotation = Math.atan2(moveDir.x, moveDir.z);
          const turnSpeed = Math.min(1, 12 * dt);
          currentRotation.current = lerpAngle(currentRotation.current, targetRotation, turnSpeed);
          groupRef.current.rotation.y = currentRotation.current;
        }
      }

      // Footstep audio
      if (speed > 0.3) {
        const now = state.clock.getElapsedTime();
        const footstepInterval = running ? 0.28 : 0.42;
        if (now - lastFootstepTime.current > footstepInterval) {
          audioManager.playFootstep(running);
          lastFootstepTime.current = now;
        }
      }

      // Update game state (directly, no React setState thrash)
      gameStateStore.setPlayerTransform(
        [newPos.x, newPos.y, newPos.z],
        currentRotation.current,
        speed > 0.15,
        running
      );

      interactionManager.update([newPos.x, newPos.y, newPos.z], currentRotation.current);

    } else if (presentScenePhase === 'INITIAL_DIALOGUE') {
      // Face Old Man during dialogue
      currentSpeed.current = 0;
      isRunning.current = false;

      const oldManPos = ASSET_CONFIG.staging.oldManStanding;
      const targetRot = Math.atan2(
        oldManPos[0] - playerPos.current.x,
        oldManPos[2] - playerPos.current.z
      );
      currentRotation.current = lerpAngle(currentRotation.current, targetRot, Math.min(1, 8 * dt));

      if (groupRef.current) {
        groupRef.current.rotation.y = currentRotation.current;
      }

    } else if (presentScenePhase === 'OLD_MAN_WALKING_SOFA' || presentScenePhase === 'OLD_MAN_SITTING') {
      // Watch Dada walk to sofa
      currentSpeed.current = 0;
      isRunning.current = false;

      const sofaMarker = ASSET_CONFIG.staging.oldManSittingMarker;
      const targetRot = Math.atan2(
        sofaMarker[0] - playerPos.current.x,
        sofaMarker[2] - playerPos.current.z
      );
      currentRotation.current = lerpAngle(currentRotation.current, targetRot, Math.min(1, 6 * dt));

      if (groupRef.current) {
        groupRef.current.rotation.y = currentRotation.current;
      }

    } else if (presentScenePhase === 'CHILD_WALKING_SOFA') {
      // Child walks to sofa seat at floor level
      const seat = childSeatPos.current;
      const toSeat = new THREE.Vector3(seat.x - playerPos.current.x, 0, seat.z - playerPos.current.z);
      const dist = toSeat.length();

      if (dist > 0.08) {
        const walkDir = toSeat.clone().normalize();
        const walkSpeed = 1.05;
        playerPos.current.addScaledVector(walkDir, walkSpeed * dt);
        playerPos.current.y = 0.0; // Stay grounded on carpet while walking
        physics.setPosition(playerPos.current.x, 0, playerPos.current.z);

        const targetRot = Math.atan2(walkDir.x, walkDir.z);
        currentRotation.current = lerpAngle(currentRotation.current, targetRot, Math.min(1, 8 * dt));
        currentSpeed.current = walkSpeed;
        isRunning.current = false;

        // Footsteps
        const now = state.clock.getElapsedTime();
        if (now - lastFootstepTime.current > 0.42) {
          audioManager.playFootstep();
          lastFootstepTime.current = now;
        }
      } else {
        // Reached seat
        playerPos.current.x = seat.x;
        playerPos.current.z = seat.z;
        currentSpeed.current = 0;
        sittingTimer.current = 0;
        gameStateStore.setPresentScenePhase('CHILD_SITTING');
      }

      if (groupRef.current) {
        groupRef.current.position.copy(playerPos.current);
        groupRef.current.rotation.y = currentRotation.current;
      }

    } else if (presentScenePhase === 'CHILD_SITTING') {
      // Settle gently into sitting pose on sofa cushion
      currentSpeed.current = 0;
      isRunning.current = false;

      sittingTimer.current += dt;
      const progress = Math.min(1, sittingTimer.current / 0.8);
      const ease = progress * progress * (3 - 2 * progress);
      const seatY = THREE.MathUtils.lerp(0.0, childSeatPos.current.y, ease);
      playerPos.current.y = seatY;

      if (groupRef.current) {
        // Turn to face forward into the room (yaw = 0)
        currentRotation.current = lerpAngle(currentRotation.current, 0, Math.min(1, 6 * dt));
        groupRef.current.rotation.y = currentRotation.current;
        groupRef.current.position.set(childSeatPos.current.x, seatY, childSeatPos.current.z);
      }

      if (sittingTimer.current > 1.4) {
        gameStateStore.startStoryMode();
      }

    } else if (presentScenePhase === 'STORY_MODE') {
      // Comfortably seated on sofa cushion next to Dada during storytelling
      currentSpeed.current = 0;
      isRunning.current = false;
      playerPos.current.copy(childSeatPos.current);

      if (groupRef.current) {
        // Face forward with subtle natural head tilt towards Dada
        currentRotation.current = lerpAngle(currentRotation.current, -0.15, Math.min(1, 4 * dt));
        groupRef.current.rotation.y = currentRotation.current;
        groupRef.current.position.copy(childSeatPos.current);
      }

    } else if (presentScenePhase === 'TIME_PASSAGE') {
      currentSpeed.current = 0;
      isRunning.current = false;
      const stage = timePassageStage ?? 0;
      let targetPos: THREE.Vector3;
      let targetRot = 0;

      if (stage === 0) {
        // Little child seated on sofa cushion next to Dada
        targetPos = new THREE.Vector3(childSeatPos.current.x, childSeatPos.current.y, childSeatPos.current.z);
        targetRot = 0;
      } else if (stage === 1) {
        // School years: standing in room, studying
        targetPos = new THREE.Vector3(0.65, 0.0, 3.65);
        targetRot = -0.3;
      } else if (stage === 2) {
        // College years: standing near study desk / window
        targetPos = new THREE.Vector3(1.75, 0.0, 3.8);
        targetRot = -Math.PI / 2;
      } else {
        // Young adult: standing proudly in center of living room
        targetPos = new THREE.Vector3(0.4, 0.0, 3.5);
        targetRot = -0.15;
      }

      playerPos.current.lerp(targetPos, Math.min(1, 4 * dt));
      currentRotation.current = lerpAngle(currentRotation.current, targetRot, Math.min(1, 4 * dt));

      if (groupRef.current) {
        groupRef.current.position.copy(playerPos.current);
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (
      presentScenePhase === 'ADULT_PROTAGONIST' ||
      presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE' ||
      presentScenePhase === 'CURRENT_YEAR'
    ) {
      currentSpeed.current = 0;
      isRunning.current = false;
      const targetPos = new THREE.Vector3(0.4, 0.0, 3.5);
      playerPos.current.lerp(targetPos, Math.min(1, 4 * dt));
      currentRotation.current = lerpAngle(currentRotation.current, -0.15, Math.min(1, 4 * dt));

      if (groupRef.current) {
        groupRef.current.position.copy(playerPos.current);
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (presentScenePhase === 'FINANCIAL_PROBLEM' || presentScenePhase === 'COMPETITION_DISCOVERY') {
      currentSpeed.current = 0;
      isRunning.current = false;
      const deskChairPos = new THREE.Vector3(1.85, 0.0, 3.4);
      playerPos.current.lerp(deskChairPos, Math.min(1, 6 * dt));
      currentRotation.current = lerpAngle(currentRotation.current, Math.PI / 2, Math.min(1, 6 * dt));

      if (groupRef.current) {
        groupRef.current.position.copy(playerPos.current);
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (presentScenePhase === 'GAME_DEVELOPMENT_READY' || presentScenePhase === 'GAME_DEVELOPMENT') {
      // Seated directly on the ergonomic office chair facing the desk & laptop
      currentSpeed.current = 0;
      isRunning.current = false;
      const deskSeatPos = new THREE.Vector3(1.85, 0.0, 3.4);
      playerPos.current.copy(deskSeatPos);
      physics.setPosition(deskSeatPos.x, deskSeatPos.y, deskSeatPos.z);

      if (groupRef.current) {
        groupRef.current.position.copy(deskSeatPos);
        // Facing positive X directly towards the laptop monitor & desk
        currentRotation.current = lerpAngle(currentRotation.current, Math.PI / 2, Math.min(1, 6 * dt));
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else if (presentScenePhase === 'FINAL_CINEMATIC') {
      // Standing on sacred stage with Dada for the final cinematic
      currentSpeed.current = 0;
      isRunning.current = false;
      const finalStagePos = new THREE.Vector3(-0.2, 0.7, -0.2);
      playerPos.current.copy(finalStagePos);
      physics.setPosition(finalStagePos.x, finalStagePos.y, finalStagePos.z);

      if (groupRef.current) {
        groupRef.current.position.copy(finalStagePos);
        // Turn gently towards congregation and Ganesha
        currentRotation.current = lerpAngle(currentRotation.current, 0.2, Math.min(1, 6 * dt));
        groupRef.current.rotation.y = currentRotation.current;
      }
    } else {
      physics.resetVelocity();
      if (
        gameStateStore.playerMotion.state !== 'CINEMATIC_WALK' &&
        gameStateStore.playerMotion.state !== 'PRAY'
      ) {
        currentSpeed.current = 0;
        isRunning.current = false;
        gameStateStore.setPlayerMotion(0, 'IDLE');
      }
    }

    // Update animation refs for PlayerModel
    const isDeskWork =
      presentScenePhase === 'GAME_DEVELOPMENT_READY' || presentScenePhase === 'GAME_DEVELOPMENT';
    animSpeedRef.current = currentSpeed.current;
    animRunningRef.current = isRunning.current;
    animSittingRef.current = isAdultProtagonist
      ? isDeskWork
      : (presentScenePhase === 'CHILD_SITTING' || presentScenePhase === 'STORY_MODE' || isChildSitting);
  });

  const isDeskWork =
    presentScenePhase === 'GAME_DEVELOPMENT_READY' || presentScenePhase === 'GAME_DEVELOPMENT';

  const speakerName = activeDialogue?.lines[dialogueIndex]?.speaker?.toLowerCase();
  const isSpeaking =
    (gameState === 'DIALOGUE' || presentScenePhase === 'INITIAL_DIALOGUE') &&
    (speakerName === 'child' || speakerName === 'vinay');

  return (
    <>
      <group ref={groupRef} position={[playerPos.current.x, playerPos.current.y, playerPos.current.z]}>
        <PlayerModel
          speed={animSpeedRef.current}
          isRunning={animRunningRef.current}
          isSitting={animSittingRef.current}
          isWorking={isDeskWork}
          isTalking={isSpeaking}
          isPraying={gameStateStore.playerMotion.isPraying}
          isCarrying={gameStateStore.playerMotion.isCarrying}
          isInteracting={gameStateStore.playerMotion.isInteracting}
        />
      </group>
      <ThirdPersonCamera targetPosition={playerPos.current} targetRotation={currentRotation.current} />
    </>
  );
}
