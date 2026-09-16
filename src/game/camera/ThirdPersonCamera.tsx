import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../core/GameState';
import { ASSET_CONFIG } from '../core/assetConfig';

interface ThirdPersonCameraProps {
  targetPosition: THREE.Vector3;
  targetRotation: number;
}

export function ThirdPersonCamera({ targetPosition }: ThirdPersonCameraProps) {
  const { camera, gl } = useThree();
  const { gameState, presentScenePhase } = useGameState();

  // Initial yaw pointing along the child's line of sight towards Dada
  const initialYaw = Math.atan2(
    ASSET_CONFIG.staging.oldManStanding[0] - ASSET_CONFIG.staging.childSpawn[0],
    ASSET_CONFIG.staging.oldManStanding[2] - ASSET_CONFIG.staging.childSpawn[2]
  );
  const yaw = useRef<number>(initialYaw);
  const pitch = useRef<number>(0.22); // gentle cinematic angle for clear character & room view
  const distance = useRef<number>(2.6); // comfortable framing for ~1.20m child
  const minDistance = 1.3;
  const maxDistance = 3.8;

  const currentCamPos = useRef(new THREE.Vector3(
    targetPosition.x - Math.sin(initialYaw) * Math.cos(0.22) * 2.6,
    targetPosition.y + 0.80 + Math.sin(0.22) * 2.6,
    targetPosition.z - Math.cos(initialYaw) * Math.cos(0.22) * 2.6
  ));
  const currentLookAt = useRef(new THREE.Vector3(targetPosition.x, 0.80, targetPosition.z));
  const isPointerLocked = useRef(false);

  // Mouse / Pointer Lock listener - Natural Non-Inverted axes
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (e: MouseEvent) => {
      if (gameState !== 'PLAYING' || presentScenePhase !== 'APPROACH') return;
      if (e.button === 0 || e.button === 2) {
        if (!isPointerLocked.current && document.pointerLockElement !== canvas) {
          try {
            const promise = canvas.requestPointerLock?.();
            if (promise && typeof (promise as Promise<void>).catch === 'function') {
              (promise as Promise<void>).catch(() => {});
            }
          } catch {
            // Ignore pointer lock permission errors
          }
        }
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'PLAYING' || presentScenePhase !== 'APPROACH') return;

      const sensitivity = 0.0022;
      // Mouse look active when pointer locked or dragging
      if (isPointerLocked.current || e.buttons === 1 || e.buttons === 2) {
        yaw.current += e.movementX * sensitivity;
        pitch.current = Math.max(0.06, Math.min(0.72, pitch.current + e.movementY * sensitivity));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (gameState !== 'PLAYING' || presentScenePhase !== 'APPROACH') return;
      distance.current = Math.max(minDistance, Math.min(maxDistance, distance.current + e.deltaY * 0.002));
    };

    window.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [gl, gameState, presentScenePhase]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Target point at child chest/neck level (~0.80m above ground for a ~1.20m child)
    const targetPoint = targetPosition.clone().add(new THREE.Vector3(0, 0.80, 0));

    if (gameState === 'MENU') {
      // Sweeping high cinematic drifting camera for main menu overlooking the entire warm living room
      const time = state.clock.getElapsedTime();
      const menuCamPos = new THREE.Vector3(
        2.2 + Math.sin(time * 0.12) * 0.5,
        1.9 + Math.cos(time * 0.15) * 0.12,
        6.8 + Math.cos(time * 0.10) * 0.5
      );
      const menuLookAt = new THREE.Vector3(-0.35, 0.85, 3.8);

      currentCamPos.current.lerp(menuCamPos, 2.0 * dt);
      currentLookAt.current.lerp(menuLookAt, 2.5 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    if (presentScenePhase === 'INITIAL_DIALOGUE') {
      // Natural third-person cinematic composition framing both standing characters without back blocking
      const dialogueCamPos = new THREE.Vector3(1.75, 1.25, 4.3);
      const dialogueLookAt = new THREE.Vector3(-0.05, 0.95, 4.0);

      currentCamPos.current.lerp(dialogueCamPos, 3.5 * dt);
      currentLookAt.current.lerp(dialogueLookAt, 4.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    if (presentScenePhase === 'OLD_MAN_WALKING_SOFA' || presentScenePhase === 'OLD_MAN_SITTING') {
      // Tracking shot: Dada walking to the sofa, with Child watching in the foreground
      const trackCamPos = new THREE.Vector3(1.7, 1.35, 4.8);
      const trackLookAt = new THREE.Vector3(-0.25, 0.85, 3.2);

      currentCamPos.current.lerp(trackCamPos, 2.8 * dt);
      currentLookAt.current.lerp(trackLookAt, 3.2 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    if (presentScenePhase === 'CHILD_WALKING_SOFA' || presentScenePhase === 'CHILD_SITTING') {
      // Child walking to and sitting on the sofa beside Dada
      const childTrackPos = new THREE.Vector3(1.5, 1.30, 4.6);
      const childTrackLookAt = new THREE.Vector3(-0.15, 0.80, 2.9);

      currentCamPos.current.lerp(childTrackPos, 2.8 * dt);
      currentLookAt.current.lerp(childTrackLookAt, 3.2 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    if (presentScenePhase === 'STORY_MODE') {
      // Warm story mode camera framing both characters seated together on the sofa
      const storyCamPos = new THREE.Vector3(-0.17, 1.25, 4.85);
      const storyLookAt = new THREE.Vector3(-0.17, 0.88, 2.75);

      currentCamPos.current.lerp(storyCamPos, 2.5 * dt);
      currentLookAt.current.lerp(storyLookAt, 3.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // Normal Gameplay Third-Person follow
    const currentDist = distance.current;

    // Camera forward vector on horizontal plane:
    // forward = (sin(yaw), 0, cos(yaw))
    // Camera is positioned behind the player opposite to forward:
    const cosPitch = Math.cos(pitch.current);
    const sinPitch = Math.sin(pitch.current);
    const sinYaw = Math.sin(yaw.current);
    const cosYaw = Math.cos(yaw.current);

    const camOffset = new THREE.Vector3(
      -sinYaw * cosPitch * currentDist,
      sinPitch * currentDist,
      -cosYaw * cosPitch * currentDist
    );

    let desiredPos = targetPoint.clone().add(camOffset);

    // Wall collision prevention: Clamp camera to stay inside the room bounds
    const bounds = ASSET_CONFIG.environments.home.bounds;
    const margin = 0.35;
    desiredPos.x = Math.max(bounds.minX + margin, Math.min(bounds.maxX - margin, desiredPos.x));
    desiredPos.z = Math.max(bounds.minZ + margin, Math.min(bounds.maxZ - margin, desiredPos.z));
    desiredPos.y = Math.max(0.3, Math.min(3.2, desiredPos.y));

    // Smooth lerp camera position and lookAt
    currentCamPos.current.lerp(desiredPos, 9.0 * dt);
    currentLookAt.current.lerp(targetPoint, 11.0 * dt);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
