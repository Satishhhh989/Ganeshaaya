import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShivaStoryPhase } from '../core/types';
import { ShivaCharacter } from '../characters/ShivaCharacter';
import { audioManager } from '../audio/AudioManager';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

interface ShivaControllerProps {
  shivaPhase: ShivaStoryPhase;
  model: THREE.Group | null;
  animations?: THREE.AnimationClip[];
  onTriggerConfrontation: () => void;
  onNearGaneshaChange: (isNear: boolean) => void;
  onNearElephantChange?: (isNear: boolean) => void;
  onTriggerElephantEncounter?: () => void;
}

export function ShivaController({
  shivaPhase,
  model,
  animations = [],
  onTriggerConfrontation,
  onNearGaneshaChange,
  onNearElephantChange,
  onTriggerElephantEncounter,
}: ShivaControllerProps) {
  const { camera, gl } = useThree();

  // Shiva starting spawn position on the mountain path
  const playerPos = useRef(new THREE.Vector3(0, 0, 6.8));
  const currentRotation = useRef<number>(Math.PI); // Facing North (-Z)
  const currentSpeed = useRef(0);
  const isRunning = useRef(false);
  const hasResetForSearch = useRef(false);

  // Camera settings
  const yaw = useRef<number>(0);
  const pitch = useRef<number>(0.22);
  const distance = useRef<number>(3.6);
  const currentCamPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const isCamInit = useRef(false);
  const isPointerLocked = useRef(false);

  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const lastFootstep = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Controls are active in mountain gameplay, approach, and forest search
  const canMove =
    shivaPhase === 'SHIVA_GAMEPLAY' ||
    shivaPhase === 'SHIVA_APPROACH' ||
    shivaPhase === 'SHIVA_SEARCH';

  // Smooth angle lerp helper
  const lerpAngle = useCallback((from: number, to: number, t: number): number => {
    let diff = to - from;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return from + diff * t;
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canMove) return;

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.run = true; break;
        case 'KeyE':
          if (shivaPhase === 'SHIVA_APPROACH') {
            onTriggerConfrontation();
          } else if (shivaPhase === 'SHIVA_SEARCH') {
            onTriggerElephantEncounter?.();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = false; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.run = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canMove, shivaPhase, onTriggerConfrontation, onTriggerElephantEncounter]);

  // Mouse look controls
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (!canMove) return;
      if (e.button === 0 || e.button === 2) {
        if (!isPointerLocked.current && document.pointerLockElement !== canvas) {
          try {
            canvas.requestPointerLock?.();
          } catch {
            // Ignore
          }
        }
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canMove) return;
      const sensitivity = 0.0022;
      if (isPointerLocked.current || e.buttons === 1 || e.buttons === 2) {
        yaw.current += e.movementX * sensitivity;
        pitch.current = Math.max(0.08, Math.min(0.65, pitch.current + e.movementY * sensitivity));
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, canMove]);

  // Main Shiva Frame Update Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const pos = playerPos.current;

    // ─── 1. Movement Physics (When Active) ───
    if (canMove) {
      const moveDir = new THREE.Vector3();
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

      if (keys.current.forward)  moveDir.add(camForward);
      if (keys.current.backward) moveDir.sub(camForward);
      if (keys.current.right)    moveDir.add(camRight);
      if (keys.current.left)     moveDir.sub(camRight);

      const isMoving = moveDir.lengthSq() > 0.001;
      if (isMoving) {
        moveDir.normalize();
      }

      const running = keys.current.run && isMoving;
      isRunning.current = running;

      // When starting SHIVA_SEARCH, place Shiva at the beginning of the forest path
      if (shivaPhase === 'SHIVA_SEARCH' && !hasResetForSearch.current) {
        pos.set(0, 0, 6.8);
        currentRotation.current = Math.PI;
        hasResetForSearch.current = true;
      }

      const walkSpeed = running ? 3.4 : 2.0;
      const targetSpeed = isMoving ? walkSpeed : 0;
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, dt * 8);

      if (currentSpeed.current > 0.05) {
        pos.addScaledVector(moveDir, currentSpeed.current * dt);

        // Clamp to path bounds (mythology or forest corridor)
        pos.x = Math.max(-2.6, Math.min(2.6, pos.x));
        pos.z = Math.max(-7.4, Math.min(7.5, pos.z));

        // Smoothly rotate Shiva toward movement direction
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        currentRotation.current = lerpAngle(currentRotation.current, targetRot, dt * 10);
      }

      // Footstep sound
      if (currentSpeed.current > 0.4) {
        const now = state.clock.getElapsedTime();
        const interval = running ? 0.35 : 0.52;
        if (now - lastFootstep.current > interval) {
          audioManager.playFootstep();
          lastFootstep.current = now;
        }
      }

      // Proximity checks:
      if (shivaPhase === 'SHIVA_SEARCH') {
        const distToElephant = Math.sqrt(pos.x * pos.x + (pos.z - (-8.5)) * (pos.z - (-8.5)));
        onNearElephantChange?.(distToElephant <= 4.2);
      } else {
        const distToGanesha = Math.sqrt(pos.x * pos.x + (pos.z - (-8.6)) * (pos.z - (-8.6)));
        onNearGaneshaChange(distToGanesha <= 3.8);
      }
    } else {
      currentSpeed.current = 0;
      isRunning.current = false;
    }

    // In confrontation, cinematic, or elephant encounter, Shiva directly faces target
    if (
      shivaPhase === 'CONFRONTATION' ||
      shivaPhase === 'TRISHUL_CINEMATIC' ||
      shivaPhase === 'GANESHA_AFTERMATH' ||
      shivaPhase === 'ELEPHANT_ENCOUNTER' ||
      shivaPhase === 'DIVINE_TRANSITION'
    ) {
      currentRotation.current = lerpAngle(currentRotation.current, Math.PI, dt * 6);
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      groupRef.current.rotation.y = currentRotation.current;
    }

    // ─── 2. Camera Management for the Camera Modes ───
    const shivaChest = pos.clone().add(new THREE.Vector3(0, 1.4, 0));

    if (!isCamInit.current) {
      currentCamPos.current.set(pos.x, pos.y + 2, pos.z + 3.5);
      currentLookAt.current.copy(shivaChest);
      isCamInit.current = true;
    }

    if (shivaPhase === 'SHIVA_INTRO') {
      // ─── SHIVA_INTRO: Slow cinematic reveal sweeping in front of Shiva ───
      const time = state.clock.getElapsedTime();
      const introCamPos = new THREE.Vector3(
        pos.x + Math.sin(time * 0.4) * 1.5,
        pos.y + 1.8,
        pos.z - 3.2
      );
      currentCamPos.current.lerp(introCamPos, dt * 1.5);
      currentLookAt.current.lerp(shivaChest, dt * 2.5);

    } else if (shivaPhase === 'CONFRONTATION') {
      // ─── CONVERSATION_CAMERA: Two-shot framing Shiva and Ganesha ───
      const convCamPos = new THREE.Vector3(2.4, 1.6, -6.5);
      const convLookAt = new THREE.Vector3(-0.2, 1.35, -8.0);
      currentCamPos.current.lerp(convCamPos, dt * 3.0);
      currentLookAt.current.lerp(convLookAt, dt * 3.5);

    } else if (shivaPhase === 'ELEPHANT_ENCOUNTER' || shivaPhase === 'DIVINE_TRANSITION') {
      // ─── CONVERSATION_CAMERA: Two-shot framing Shiva and the Sacred Elephant ───
      const elephantCamPos = new THREE.Vector3(2.8, 1.8, -5.6);
      const elephantLookAt = new THREE.Vector3(0, 1.2, -8.5);
      currentCamPos.current.lerp(elephantCamPos, dt * 2.8);
      currentLookAt.current.lerp(elephantLookAt, dt * 3.2);

    } else if (shivaPhase === 'TRISHUL_CINEMATIC') {
      // ─── CINEMATIC_CAMERA: Dramatic low-angle looking up at Shiva lifting Trishul ───
      const trishulCamPos = new THREE.Vector3(-1.4, 0.7, pos.z - 1.6);
      const trishulLookAt = pos.clone().add(new THREE.Vector3(0, 1.8, 0));
      currentCamPos.current.lerp(trishulCamPos, dt * 4.0);
      currentLookAt.current.lerp(trishulLookAt, dt * 5.0);

    } else if (shivaPhase === 'GANESHA_AFTERMATH') {
      // ─── AFTERMATH_CAMERA: High solemn angle looking down at Ganesha & Shiva ───
      const afterCamPos = new THREE.Vector3(1.2, 2.8, -5.8);
      const afterLookAt = new THREE.Vector3(0, 0.6, -8.6);
      currentCamPos.current.lerp(afterCamPos, dt * 1.8);
      currentLookAt.current.lerp(afterLookAt, dt * 2.2);

    } else {
      // ─── GAMEPLAY_CAMERA: Third-Person Follow Camera Behind Shiva ───
      const d = distance.current;
      const cosP = Math.cos(pitch.current);
      const sinP = Math.sin(pitch.current);
      const sinY = Math.sin(yaw.current);
      const cosY = Math.cos(yaw.current);

      const camOffset = new THREE.Vector3(
        -sinY * cosP * d,
        sinP * d + 0.3,
        -cosY * cosP * d
      );

      const desiredCamPos = shivaChest.clone().add(camOffset);
      currentCamPos.current.lerp(desiredCamPos, dt * 8.0);
      currentLookAt.current.lerp(shivaChest, dt * 10.0);
    }

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <group ref={groupRef}>
      <ShivaCharacter
        speed={currentSpeed.current}
        isRunning={isRunning.current}
        isConfronting={shivaPhase === 'CONFRONTATION'}
        isRaisingTrishul={shivaPhase === 'TRISHUL_CINEMATIC'}
        model={model}
        animations={animations}
      />
    </group>
  );
}
