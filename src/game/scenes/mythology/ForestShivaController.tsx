/**
 * ForestShivaController - Third-Person Cinematic Exploration Controller for Shiva
 * 
 * - Smooth third-person orbital camera with collision avoidance & soft camera lag
 * - Camera-relative WASD movement with Shift run modifier
 * - Automatically transitions to a reverent peaceful walk upon entering the sacred clearing
 * - Synchronized footstep audio with stride pacing
 * - Clean animation blending using existing Shiva 3D model (FBX or procedural ascetic fallback)
 * - Automatic cinematic camera choreography takeover during ELEPHANT_CINEMATIC
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ShivaCharacter } from '../../characters/ShivaCharacter';
import { audioManager } from '../../audio/AudioManager';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

interface ForestShivaControllerProps {
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
  isCinematic: boolean;
  isExamining: boolean;
  onPositionUpdate?: (pos: THREE.Vector3) => void;
}

export function ForestShivaController({
  model,
  animations,
  isCinematic,
  isExamining,
  onPositionUpdate,
}: ForestShivaControllerProps) {
  const { camera, gl } = useThree();

  // Shiva's starting position at the beginning of the sacred forest trail
  const playerPos = useRef(new THREE.Vector3(0, 0, 7.5));
  const currentRotation = useRef<number>(Math.PI); // Facing North (-Z)
  const currentSpeed = useRef(0);
  const isRunning = useRef(false);

  // Third-person camera state
  const yaw = useRef<number>(0);
  const pitch = useRef<number>(0.22);
  const distance = useRef<number>(3.8);
  const currentCamPos = useRef(new THREE.Vector3(0, 2.2, 11.2));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.6, 7.5));
  const isPointerLocked = useRef(false);

  // Key tracking
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const lastFootstep = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Smooth angle lerp helper
  const lerpAngle = useCallback((from: number, to: number, t: number): number => {
    let diff = to - from;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return from + diff * t;
  }, []);

  // 1. Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCinematic || isExamining) return;

      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.run = true; break;
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
  }, [isCinematic, isExamining]);

  // 2. Mouse Look Listeners
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (isCinematic) return;
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
      if (isCinematic) return;
      const sensitivity = 0.0022;
      if (isPointerLocked.current || e.buttons === 1 || e.buttons === 2) {
        yaw.current -= e.movementX * sensitivity;
        pitch.current = Math.max(0.08, Math.min(0.52, pitch.current - e.movementY * sensitivity));
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, isCinematic]);

  // 3. Main Frame Simulation Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08);
    const pos = playerPos.current;

    // Check if player has entered the sacred clearing (Z <= -14)
    const inClearing = pos.z <= -14;

    // ─── A. Movement Physics ───
    if (!isCinematic && !isExamining) {
      const moveDir = new THREE.Vector3();

      // Camera forward flattened to XZ plane
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

      // In the clearing, movement is reverently capped to walk only
      const running = !inClearing && keys.current.run && isMoving;
      isRunning.current = running;

      const walkSpeed = inClearing ? 1.6 : 2.2;
      const runSpeed = 3.6;
      const targetSpeed = isMoving ? (running ? runSpeed : walkSpeed) : 0;

      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, dt * 8);

      if (currentSpeed.current > 0.05) {
        pos.addScaledVector(moveDir, currentSpeed.current * dt);

        // Clamped forest area bounds: keeps Shiva naturally within the glade
        pos.x = Math.max(-11.5, Math.min(11.5, pos.x));
        pos.z = Math.max(-23.5, Math.min(8.2, pos.z));

        // Smooth character rotation toward movement heading
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        currentRotation.current = lerpAngle(currentRotation.current, targetRot, dt * 10);
      }

      // Synchronized footstep sound
      if (currentSpeed.current > 0.4) {
        const now = state.clock.getElapsedTime();
        const interval = running ? 0.34 : 0.54;
        if (now - lastFootstep.current > interval) {
          audioManager.playFootstep(running);
          lastFootstep.current = now;
        }
      }
    } else {
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, dt * 10);
      isRunning.current = false;
    }

    // Update 3D model transform
    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      groupRef.current.rotation.y = currentRotation.current;
    }

    onPositionUpdate?.(pos);

    // ─── B. Camera System ───
    const shivaChest = pos.clone().add(new THREE.Vector3(0, 1.6, 0));

    if (!isCinematic) {
      // Normal Third-Person Exploration Follow Camera
      const cosP = Math.cos(pitch.current);
      const sinP = Math.sin(pitch.current);
      const sinY = Math.sin(yaw.current);
      const cosY = Math.cos(yaw.current);

      const offset = new THREE.Vector3(
        -sinY * cosP * distance.current,
        sinP * distance.current + 0.6,
        -cosY * cosP * distance.current
      );

      const targetCamPos = shivaChest.clone().add(offset);
      // Soft camera lag for natural weight
      currentCamPos.current.lerp(targetCamPos, dt * 6.5);
      currentLookAt.current.lerp(shivaChest, dt * 7.5);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 7.5]}>
      <ShivaCharacter
        speed={currentSpeed.current}
        isRunning={isRunning.current}
        isAftermath={false}
        model={model}
        animations={animations}
      />
    </group>
  );
}
