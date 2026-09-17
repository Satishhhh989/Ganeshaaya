import { useEffect, useRef, useCallback } from 'react';
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

  // Initial yaw: looking from behind the child towards Dada
  const initialYaw = Math.atan2(
    ASSET_CONFIG.staging.oldManStanding[0] - ASSET_CONFIG.staging.childSpawn[0],
    ASSET_CONFIG.staging.oldManStanding[2] - ASSET_CONFIG.staging.childSpawn[2]
  );
  const yaw = useRef<number>(initialYaw);
  const pitch = useRef<number>(0.25); // Gentle downward angle
  const distance = useRef<number>(2.8);
  const minDistance = 1.4;
  const maxDistance = 4.0;

  const currentCamPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const isInitialized = useRef(false);
  const isPointerLocked = useRef(false);

  // Initialize camera position
  const initCamera = useCallback(() => {
    const d = distance.current;
    const p = pitch.current;
    const y = yaw.current;

    const targetPoint = targetPosition.clone().add(new THREE.Vector3(0, 0.85, 0));
    const offset = new THREE.Vector3(
      -Math.sin(y) * Math.cos(p) * d,
      Math.sin(p) * d,
      -Math.cos(y) * Math.cos(p) * d
    );

    currentCamPos.current.copy(targetPoint).add(offset);
    currentLookAt.current.copy(targetPoint);
    isInitialized.current = true;
  }, [targetPosition]);

  const finalCinematicTimer = useRef<number>(0);

  // Mouse / Pointer Lock
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (e: MouseEvent) => {
      const isFreeLook =
        gameState === 'PLAYING' &&
        (presentScenePhase === 'APPROACH' ||
          presentScenePhase === 'PANDAL_BUILDING' ||
          presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION');

      if (!isFreeLook) return;
      if (e.button === 0 || e.button === 2) {
        if (!isPointerLocked.current && document.pointerLockElement !== canvas) {
          try {
            const promise = canvas.requestPointerLock?.();
            if (promise && typeof (promise as Promise<void>).catch === 'function') {
              (promise as Promise<void>).catch(() => {});
            }
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
      const isFreeLook =
        gameState === 'PLAYING' &&
        (presentScenePhase === 'APPROACH' ||
          presentScenePhase === 'PANDAL_BUILDING' ||
          presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION');

      if (!isFreeLook) return;

      const sensitivity = 0.002;
      if (isPointerLocked.current || e.buttons === 1 || e.buttons === 2) {
        // Natural mouse look: moving mouse right rotates camera right
        yaw.current += e.movementX * sensitivity;
        // Moving mouse up looks up (decrease pitch), down looks down (increase pitch)
        pitch.current = Math.max(0.05, Math.min(0.75, pitch.current + e.movementY * sensitivity));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const isFreeLook =
        gameState === 'PLAYING' &&
        (presentScenePhase === 'APPROACH' ||
          presentScenePhase === 'PANDAL_BUILDING' ||
          presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION');

      if (!isFreeLook) return;
      distance.current = Math.max(minDistance, Math.min(maxDistance, distance.current + e.deltaY * 0.003));
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

    if (!isInitialized.current) {
      initCamera();
    }

    // Target: child's chest/neck level
    const targetHeight = 0.85;
    const targetPoint = targetPosition.clone().add(new THREE.Vector3(0, targetHeight, 0));

    // ─── MENU camera: Slow cinematic drift over the room ───
    if (gameState === 'MENU') {
      const time = state.clock.getElapsedTime();
      const menuCamPos = new THREE.Vector3(
        2.0 + Math.sin(time * 0.1) * 0.6,
        2.0 + Math.cos(time * 0.12) * 0.15,
        7.0 + Math.cos(time * 0.08) * 0.6
      );
      const menuLookAt = new THREE.Vector3(-0.2, 0.9, 3.5);

      currentCamPos.current.lerp(menuCamPos, 2.0 * dt);
      currentLookAt.current.lerp(menuLookAt, 2.5 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── DIALOGUE camera: Two-shot framing both characters ───
    if (presentScenePhase === 'INITIAL_DIALOGUE') {
      const dialogueCamPos = new THREE.Vector3(1.8, 1.3, 4.4);
      const dialogueLookAt = new THREE.Vector3(0.0, 1.0, 4.0);

      currentCamPos.current.lerp(dialogueCamPos, 3.0 * dt);
      currentLookAt.current.lerp(dialogueLookAt, 3.5 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── WALKING TO SOFA camera: Track Dada walking ───
    if (presentScenePhase === 'OLD_MAN_WALKING_SOFA' || presentScenePhase === 'OLD_MAN_SITTING') {
      const trackCamPos = new THREE.Vector3(1.8, 1.4, 5.0);
      const trackLookAt = new THREE.Vector3(-0.2, 0.9, 3.0);

      currentCamPos.current.lerp(trackCamPos, 2.5 * dt);
      currentLookAt.current.lerp(trackLookAt, 3.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── CHILD WALKING TO SOFA camera ───
    if (presentScenePhase === 'CHILD_WALKING_SOFA' || presentScenePhase === 'CHILD_SITTING') {
      const childTrackPos = new THREE.Vector3(1.5, 1.35, 4.8);
      const childTrackLookAt = new THREE.Vector3(-0.1, 0.85, 2.8);

      currentCamPos.current.lerp(childTrackPos, 2.5 * dt);
      currentLookAt.current.lerp(childTrackLookAt, 3.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── STORY MODE camera: Warm two-shot of both seated ───
    if (presentScenePhase === 'STORY_MODE') {
      const storyCamPos = new THREE.Vector3(-0.1, 1.3, 5.0);
      const storyLookAt = new THREE.Vector3(-0.15, 0.9, 2.75);

      currentCamPos.current.lerp(storyCamPos, 2.2 * dt);
      currentLookAt.current.lerp(storyLookAt, 2.8 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── TRANSITION TO MYTHOLOGY camera: Slow emotional push-in towards Dada ───
    if (presentScenePhase === 'TRANSITION_TO_MYTHOLOGY') {
      const transCamPos = new THREE.Vector3(0.3, 1.15, 3.5);
      const transLookAt = new THREE.Vector3(-0.25, 0.95, 2.85);

      currentCamPos.current.lerp(transCamPos, 1.4 * dt);
      currentLookAt.current.lerp(transLookAt, 1.8 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── GAME DEVELOPMENT WORKSPACE camera: Intimate over-the-shoulder workstation view ───
    if (presentScenePhase === 'GAME_DEVELOPMENT_READY' || presentScenePhase === 'GAME_DEVELOPMENT') {
      const devCamPos = new THREE.Vector3(1.68, 1.25, 4.45);
      const devLookAt = new THREE.Vector3(2.38, 0.95, 3.42);

      currentCamPos.current.lerp(devCamPos, 2.8 * dt);
      currentLookAt.current.lerp(devLookAt, 3.2 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── PANDAL REVEAL camera: Majestic cinematic wide view of completed pandal ───
    if (presentScenePhase === 'PANDAL_COMPLETE' || presentScenePhase === 'GANESH_CHATURTHI_READY') {
      const pandalRevealCam = new THREE.Vector3(0, 1.85, 4.2);
      const pandalRevealLookAt = new THREE.Vector3(0, 1.25, -2.4);

      currentCamPos.current.lerp(pandalRevealCam, 1.8 * dt);
      currentLookAt.current.lerp(pandalRevealLookAt, 2.2 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── FINAL CINEMATIC: Majestic 5-phase camera choreography ───
    if (presentScenePhase === 'FINAL_CINEMATIC' || presentScenePhase === 'GAME_COMPLETE') {
      finalCinematicTimer.current += dt;
      const t = finalCinematicTimer.current;

      const cinCamPos = new THREE.Vector3();
      const cinLookAt = new THREE.Vector3();

      if (t < 4.5) {
        // Phase 1: Intimate two-shot close-up of Vinay and Grandfather by the sacred altar
        cinCamPos.set(-0.65, 1.45, 1.0);
        cinLookAt.set(-0.65, 1.35, -0.2);
        currentCamPos.current.lerp(cinCamPos, 3.0 * dt);
        currentLookAt.current.lerp(cinLookAt, 3.5 * dt);
      } else if (t < 11.0) {
        // Phase 2: Slow dolly away from protagonist and grandfather, revealing the entire illuminated pandal
        const p = (t - 4.5) / 6.5;
        const ease = p * p * (3 - 2 * p); // smoothstep
        cinCamPos.lerpVectors(
          new THREE.Vector3(-0.65, 1.45, 1.0),
          new THREE.Vector3(0.0, 3.4, 7.2),
          ease
        );
        cinLookAt.lerpVectors(
          new THREE.Vector3(-0.65, 1.35, -0.2),
          new THREE.Vector3(0.0, 1.35, -1.0),
          ease
        );
        currentCamPos.current.lerp(cinCamPos, 4.0 * dt);
        currentLookAt.current.lerp(cinLookAt, 4.0 * dt);
      } else if (t < 16.5) {
        // Phase 3: Glide forward smoothly and HOLD ON GANESHA on the raised singhasan
        const p = (t - 11.0) / 5.5;
        const ease = p * p * (3 - 2 * p);
        cinCamPos.lerpVectors(
          new THREE.Vector3(0.0, 3.4, 7.2),
          new THREE.Vector3(0.0, 1.82, 0.45),
          ease
        );
        cinLookAt.lerpVectors(
          new THREE.Vector3(0.0, 1.35, -1.0),
          new THREE.Vector3(0.0, 1.75, -0.95),
          ease
        );
        currentCamPos.current.lerp(cinCamPos, 4.0 * dt);
        currentLookAt.current.lerp(cinLookAt, 4.0 * dt);
      } else if (t < 22.0) {
        // Phase 4: Slowly tilt and dolly upward toward the starry night sky
        const p = (t - 16.5) / 5.5;
        const ease = p * p * (3 - 2 * p);
        cinCamPos.lerpVectors(
          new THREE.Vector3(0.0, 1.82, 0.45),
          new THREE.Vector3(0.0, 2.3, 0.8),
          ease
        );
        cinLookAt.lerpVectors(
          new THREE.Vector3(0.0, 1.75, -0.95),
          new THREE.Vector3(0.0, 14.0, -1.0),
          ease
        );
        currentCamPos.current.lerp(cinCamPos, 4.0 * dt);
        currentLookAt.current.lerp(cinLookAt, 4.0 * dt);
      } else {
        // Phase 5: Gazing serenely into the starry night sky with gentle atmospheric floating lights
        const breathe = Math.sin(t * 0.4) * 0.05;
        cinCamPos.set(0.0, 2.3 + breathe, 0.8);
        cinLookAt.set(0.0, 14.0, -1.0);
        currentCamPos.current.lerp(cinCamPos, 2.0 * dt);
        currentLookAt.current.lerp(cinLookAt, 2.0 * dt);
      }

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    } else {
      finalCinematicTimer.current = 0;
    }

    // ─── Normal Gameplay: Third-Person follow camera ───
    const d = distance.current;
    const cosPitch = Math.cos(pitch.current);
    const sinPitch = Math.sin(pitch.current);
    const sinYaw = Math.sin(yaw.current);
    const cosYaw = Math.cos(yaw.current);

    // Camera offset: positioned behind the player
    const camOffset = new THREE.Vector3(
      -sinYaw * cosPitch * d,
      sinPitch * d,
      -cosYaw * cosPitch * d
    );

    const desiredPos = targetPoint.clone().add(camOffset);

    // Clamp camera to scene bounds with margin
    const isPandalScene = presentScenePhase === 'PANDAL_BUILDING' || presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION';
    const bounds = isPandalScene
      ? { minX: -7.5, maxX: 7.5, minZ: -4.0, maxZ: 9.2, minY: 0.8, maxY: 5.2 }
      : { ...ASSET_CONFIG.environments.home.bounds, minY: 0.35, maxY: 3.5 };
    const margin = 0.35;
    desiredPos.x = Math.max(bounds.minX + margin, Math.min(bounds.maxX - margin, desiredPos.x));
    desiredPos.z = Math.max(bounds.minZ + margin, Math.min(bounds.maxZ - margin, desiredPos.z));
    desiredPos.y = Math.max(bounds.minY, Math.min(bounds.maxY, desiredPos.y));

    // Smooth camera follow with responsive lerp
    const followSpeed = 8.0;
    currentCamPos.current.lerp(desiredPos, followSpeed * dt);
    currentLookAt.current.lerp(targetPoint, 10.0 * dt);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
