import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, gameStateStore } from '../core/GameState';
import { ASSET_CONFIG } from '../core/assetConfig';
import { virtualInputStore } from '../ui/mobile/virtualInputStore';

interface ThirdPersonCameraProps {
  targetPosition: THREE.Vector3;
  targetRotation: number;
}

export function ThirdPersonCamera({ targetPosition }: ThirdPersonCameraProps) {
  const { camera, gl } = useThree();
  const { gameState, presentScenePhase, activeDialogue, dialogueIndex, timePassageStage } = useGameState();

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
  const devSequenceTimer = useRef<number>(0);

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

      // Do NOT engage pointer lock or hijack cursor when clicking on HTML UI buttons or prompts
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.closest('button') ||
          target.closest('[data-ui]') ||
          target.closest('[data-interactive="true"]') ||
          target.getAttribute?.('data-ui'))
      ) {
        return;
      }

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

    // ESC key cleanly releases pointer lock
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
      }
    };

    // Auto release pointer lock if entering dialogue or cinematic
    if (gameState !== 'PLAYING' || presentScenePhase === 'INITIAL_DIALOGUE') {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }

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
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
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

    // ─── DIALOGUE camera: Dynamic cinematic two-shot with speaker emphasis ───
    if (presentScenePhase === 'INITIAL_DIALOGUE' || (gameState === 'DIALOGUE' && presentScenePhase === 'APPROACH')) {
      const currentSpeaker = activeDialogue?.lines[dialogueIndex]?.speaker?.toLowerCase();
      const isVinaySpeaking = currentSpeaker === 'child' || currentSpeaker === 'vinay';

      let dialogueCamPos: THREE.Vector3;
      let dialogueLookAt: THREE.Vector3;

      if (isVinaySpeaking) {
        // Subtle framing with emphasis on Vinay asking his question (both characters remain in two-shot)
        dialogueCamPos = new THREE.Vector3(1.68, 1.25, 4.55);
        dialogueLookAt = new THREE.Vector3(0.08, 0.98, 4.08);
      } else {
        // Subtle framing with emphasis on Dada sharing wisdom (both characters remain in two-shot)
        dialogueCamPos = new THREE.Vector3(1.88, 1.34, 4.35);
        dialogueLookAt = new THREE.Vector3(-0.12, 1.05, 3.92);
      }

      currentCamPos.current.lerp(dialogueCamPos, 2.4 * dt);
      currentLookAt.current.lerp(dialogueLookAt, 2.8 * dt);

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
      const childTrackPos = new THREE.Vector3(1.5, 1.45, 4.8);
      const childTrackLookAt = new THREE.Vector3(-0.1, 1.05, 2.78);

      currentCamPos.current.lerp(childTrackPos, 2.5 * dt);
      currentLookAt.current.lerp(childTrackLookAt, 3.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── STORY MODE camera: Warm two-shot of both seated on sofa with subtle speaker emphasis ───
    if (presentScenePhase === 'STORY_MODE') {
      const currentSpeaker = activeDialogue?.lines[dialogueIndex]?.speaker?.toLowerCase();
      const isVinaySpeaking = currentSpeaker === 'child' || currentSpeaker === 'vinay';

      let storyCamPos: THREE.Vector3;
      let storyLookAt: THREE.Vector3;

      if (isVinaySpeaking) {
        // Slight shift towards Vinay on the right of the sofa
        storyCamPos = new THREE.Vector3(-0.04, 1.35, 4.75);
        storyLookAt = new THREE.Vector3(0.04, 1.05, 2.78);
      } else {
        // Slight shift towards Dada on the left of the sofa
        storyCamPos = new THREE.Vector3(-0.18, 1.25, 4.85);
        storyLookAt = new THREE.Vector3(-0.24, 0.88, 2.96);
      }

      currentCamPos.current.lerp(storyCamPos, 2.0 * dt);
      currentLookAt.current.lerp(storyLookAt, 2.5 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── TRANSITION TO MYTHOLOGY camera: Slow emotional push-in towards Dada ───
    if (presentScenePhase === 'TRANSITION_TO_MYTHOLOGY') {
      const transCamPos = new THREE.Vector3(0.25, 1.22, 3.65);
      const transLookAt = new THREE.Vector3(-0.25, 0.92, 2.96);

      currentCamPos.current.lerp(transCamPos, 1.4 * dt);
      currentLookAt.current.lerp(transLookAt, 1.8 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── TIME PASSAGE & GROWING UP SEQUENCE: Dynamic cinematic room path ───
    if (presentScenePhase === 'TIME_PASSAGE') {
      const stage = timePassageStage ?? 0;
      const time = state.clock.getElapsedTime();
      const driftY = Math.sin(time * 0.4) * 0.02;
      const driftX = Math.cos(time * 0.3) * 0.025;

      let targetCamPos: THREE.Vector3;
      let targetLookAt: THREE.Vector3;

      if (stage === 0) {
        // Stage 0: Childhood - Intimate two-shot near sofa where child Vinay & Dada sat
        targetCamPos = new THREE.Vector3(0.52 + driftX, 1.28 + driftY, 4.65);
        targetLookAt = new THREE.Vector3(-0.12, 0.92, 2.85);
      } else if (stage === 1) {
        // Stage 1: School Years - Camera slowly pulls back and glides upwards/across room
        targetCamPos = new THREE.Vector3(1.35 + driftX, 1.58 + driftY, 5.15);
        targetLookAt = new THREE.Vector3(0.45, 1.05, 3.2);
      } else if (stage === 2) {
        // Stage 2: College Years - Glides toward study window, framing warm desk lamp & framed photo
        targetCamPos = new THREE.Vector3(1.65 + driftX, 1.45 + driftY, 4.6);
        targetLookAt = new THREE.Vector3(2.25, 1.05, 3.4);
      } else {
        // Stage 3: Young Adult - Returns smoothly to center, panning up to Adult Vinay
        targetCamPos = new THREE.Vector3(0.38 + driftX, 1.38 + driftY, 4.8);
        targetLookAt = new THREE.Vector3(0.0, 1.25, 3.0);
      }

      currentCamPos.current.lerp(targetCamPos, 1.8 * dt);
      currentLookAt.current.lerp(targetLookAt, 2.2 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── ADULT PROTAGONIST REVEAL: Settle on Adult Vinay standing tall in room ───
    if (presentScenePhase === 'ADULT_PROTAGONIST') {
      const time = state.clock.getElapsedTime();
      const adultCamPos = new THREE.Vector3(
        0.38 + Math.cos(time * 0.3) * 0.02,
        1.38 + Math.sin(time * 0.35) * 0.015,
        4.8
      );
      const adultLookAt = new THREE.Vector3(0.0, 1.25, 3.0);

      currentCamPos.current.lerp(adultCamPos, 2.2 * dt);
      currentLookAt.current.lerp(adultLookAt, 2.6 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── ANNUAL FESTIVAL MONTAGE: Gentle sweeping pan across the festive living room ───
    if (presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE') {
      const time = state.clock.getElapsedTime();
      const panX = Math.sin(time * 0.28) * 0.45;
      const panY = Math.cos(time * 0.32) * 0.06;
      const montageCamPos = new THREE.Vector3(-0.35 + panX, 1.52 + panY, 4.85);
      const montageLookAt = new THREE.Vector3(0.15, 1.15, 2.9);

      currentCamPos.current.lerp(montageCamPos, 1.6 * dt);
      currentLookAt.current.lerp(montageLookAt, 2.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── CURRENT YEAR 2024: Calm daytime shot of Adult Vinay looking toward calendar ───
    if (presentScenePhase === 'CURRENT_YEAR') {
      const yearCamPos = new THREE.Vector3(0.85, 1.45, 4.85);
      const yearLookAt = new THREE.Vector3(1.35, 1.35, 3.6);

      currentCamPos.current.lerp(yearCamPos, 2.2 * dt);
      currentLookAt.current.lerp(yearLookAt, 2.6 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── FINANCIAL PROBLEM: Over-the-shoulder medium shot of Vinay looking at desk notebook ───
    if (presentScenePhase === 'FINANCIAL_PROBLEM') {
      const problemCamPos = new THREE.Vector3(1.05, 1.45, 4.25);
      const problemLookAt = new THREE.Vector3(2.05, 1.05, 3.4);

      currentCamPos.current.lerp(problemCamPos, 2.4 * dt);
      currentLookAt.current.lerp(problemLookAt, 2.8 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── COMPETITION DISCOVERY: Intimate push-in toward the glowing laptop desk ───
    if (presentScenePhase === 'COMPETITION_DISCOVERY') {
      const compCamPos = new THREE.Vector3(1.25, 1.35, 3.82);
      const compLookAt = new THREE.Vector3(2.35, 0.96, 3.4);

      currentCamPos.current.lerp(compCamPos, 2.5 * dt);
      currentLookAt.current.lerp(compLookAt, 3.0 * dt);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ─── GAME DEVELOPMENT WORKSPACE camera: Establishing shot then push-in ───
    if (presentScenePhase === 'GAME_DEVELOPMENT_READY' || presentScenePhase === 'GAME_DEVELOPMENT') {
      devSequenceTimer.current += dt;
      const t = devSequenceTimer.current;

      const devCamPos = new THREE.Vector3();
      const devLookAt = new THREE.Vector3();

      if (t < 2.8) {
        // Establishing wide: Vinay seated in chair at his desk, room, lamp, personal details
        devCamPos.set(0.92, 1.48, 4.35);
        devLookAt.set(2.05, 1.05, 3.4);
        currentCamPos.current.lerp(devCamPos, 2.2 * dt);
        currentLookAt.current.lerp(devLookAt, 2.6 * dt);
      } else {
        // Smooth push-in over right shoulder toward laptop monitor
        const pushT = Math.min(1, (t - 2.8) / 3.0);
        const ease = pushT * pushT * (3 - 2 * pushT);
        devCamPos.lerpVectors(
          new THREE.Vector3(0.92, 1.48, 4.35),
          new THREE.Vector3(1.28, 1.26, 3.75),
          ease
        );
        devLookAt.lerpVectors(
          new THREE.Vector3(2.05, 1.05, 3.4),
          new THREE.Vector3(2.35, 0.95, 3.4),
          ease
        );
        currentCamPos.current.lerp(devCamPos, 3.2 * dt);
        currentLookAt.current.lerp(devLookAt, 3.4 * dt);
      }

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);
      return;
    } else {
      devSequenceTimer.current = 0;
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

    // ─── FESTIVAL PREPARATION: Ganesh Chaturthi Morning & Auspicious Arrival Choreography ───
    if (presentScenePhase === 'FESTIVAL_PREPARATION') {
      const step = gameStateStore.getState().festivalArrivalStep;

      if (step === 0) {
        // Sunrise Reveal: Smooth crane up revealing finished pandal in warm morning light
        const sunriseCamPos = new THREE.Vector3(0, 1.9, 5.5);
        const sunriseLookAt = new THREE.Vector3(0, 1.4, -1.8);
        currentCamPos.current.lerp(sunriseCamPos, 2.0 * dt);
        currentLookAt.current.lerp(sunriseLookAt, 2.4 * dt);
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentLookAt.current);
        return;
      } else if (step === 1) {
        // Hear Procession / Colony Entrance Reveal: Camera swings toward colony street entrance
        const entranceCamPos = new THREE.Vector3(1.2, 1.75, 4.0);
        const entranceLookAt = new THREE.Vector3(0, 1.2, 10.5);
        currentCamPos.current.lerp(entranceCamPos, 2.5 * dt);
        currentLookAt.current.lerp(entranceLookAt, 2.8 * dt);
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentLookAt.current);
        return;
      } else if (step === 3) {
        // Procession March: Dynamic traveling side tracking shot alongside Vinay & palanquin
        const marchCamPos = new THREE.Vector3(targetPosition.x + 2.4, targetPosition.y + 1.6, targetPosition.z + 1.8);
        const marchLookAt = new THREE.Vector3(targetPosition.x, targetPosition.y + 1.1, targetPosition.z - 0.6);
        currentCamPos.current.lerp(marchCamPos, 3.2 * dt);
        currentLookAt.current.lerp(marchLookAt, 3.4 * dt);
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentLookAt.current);
        return;
      } else if (step === 4) {
        // Singhasan Placement: Close-up elevation on altar singhasan
        const altarCamPos = new THREE.Vector3(0.7, 1.6, 0.4);
        const altarLookAt = new THREE.Vector3(0, 1.4, -1.3);
        currentCamPos.current.lerp(altarCamPos, 2.8 * dt);
        currentLookAt.current.lerp(altarLookAt, 3.0 * dt);
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentLookAt.current);
        return;
      } else if (step === 5 && gameStateStore.playerMotion.isPraying) {
        // Namaste Prayer: Intimate reverent shot framing Vinay and Bappa
        const prayCamPos = new THREE.Vector3(0.4, 1.35, 1.2);
        const prayLookAt = new THREE.Vector3(0, 1.3, -1.1);
        currentCamPos.current.lerp(prayCamPos, 2.6 * dt);
        currentLookAt.current.lerp(prayLookAt, 2.8 * dt);
        camera.position.copy(currentCamPos.current);
        camera.lookAt(currentLookAt.current);
        return;
      }
      // When walking to procession (step 2 or 5 free roam), standard third person camera follows player
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

    // Mobile touch camera delta integration
    const touchDelta = virtualInputStore.consumeCameraDelta();
    if (Math.abs(touchDelta.dx) > 0.001 || Math.abs(touchDelta.dy) > 0.001) {
      const touchSensitivity = 0.0035;
      yaw.current += touchDelta.dx * touchSensitivity;
      pitch.current = Math.max(0.05, Math.min(0.75, pitch.current + touchDelta.dy * touchSensitivity));
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
