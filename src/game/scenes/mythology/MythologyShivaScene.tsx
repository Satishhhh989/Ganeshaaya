/**
 * MythologyShivaScene - Phase 0.7 & Phase 0.8 Rebuild
 * Playable First-Person Trishul Throwing Sequence + Cinematic Aftermath Transition + Forest Search
 * 
 * - Full-screen 3D world: zero website cards, zero modals, zero giant buttons
 * - First-Person Trishul Throwing with real aiming and physical projectile trajectory
 * - Immediate impact sequence: 250ms freeze-frame, divine white-gold bloom, drop to silence
 * - Multi-shot cinematic camera sequence:
 *     SHOT 1: Shiva standing still on the path, slowly lowering his weapon in shock
 *     SHOT 2: Tracking down the path to the sacred entrance, showing peaceful non-graphic rest
 *     SHOT 3: Shiva gazing toward the Himalayan peaks in quiet resolve
 * - Restrained cinematic subtitles with instant skip/advance via [E] or click
 * - Minimal [E] CONTINUE prompt appearing at decision beat
 * - Atmospheric mist roll transition seamlessly into the forest search (SHIVA_SEARCH)
 * - Third-person Shiva exploration in the sacred cedar grove to find the divine elephant
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, gameStateStore } from '../../core/GameState';
import { MythologyEnvironment } from './MythologyEnvironment';
import { HumanGanesha3D } from '../../characters/HumanGanesha3D';
import { ShivaCharacter } from '../../characters/ShivaCharacter';
import { shivaAssetManager } from '../../characters/ShivaLazyAsset';
import { TrishulFirstPersonRig } from './TrishulFirstPersonRig';
import { TrishulProjectile } from './TrishulProjectile';
import { ForestExploration3D, ForestExplorationUI, forestTrackingStore } from './ForestExplorationScene';
import { RestorationCinematic } from './RestorationCinematic';
import { audioManager } from '../../audio/AudioManager';

// Shared sacred doorway target transform
const GANESHA_POSITION: [number, number, number] = [0, 0, -8.0];
// Intended target is specifically around Ganesha's head: X=0, Y=0.96, Z=-8.0
const GANESHA_TARGET_CENTER = new THREE.Vector3(0, 0.96, -8.0);
const GANESHA_HIT_RADIUS = 0.85;

// Shared reactive state for synchronization between R3F 3D canvas and 2D UI overlay
interface TrishulAimSyncState {
  isTargetLocked: boolean;
  distanceToTarget: number;
}

let aimSyncListeners: Array<(state: TrishulAimSyncState) => void> = [];
let currentAimSyncState: TrishulAimSyncState = { isTargetLocked: false, distanceToTarget: 999 };

function setAimSyncState(newState: Partial<TrishulAimSyncState>) {
  currentAimSyncState = { ...currentAimSyncState, ...newState };
  aimSyncListeners.forEach((fn) => fn(currentAimSyncState));
}

function useAimSync() {
  const [state, setState] = useState<TrishulAimSyncState>(currentAimSyncState);
  useEffect(() => {
    aimSyncListeners.push(setState);
    return () => {
      aimSyncListeners = aimSyncListeners.filter((fn) => fn !== setState);
    };
  }, []);
  return state;
}

/**
 * 3D Scene rendered inside R3F Canvas
 */
export function MythologyShiva3D() {
  const { shivaPhase } = useGameState();
  const { camera, gl } = useThree();

  // Lazy loaded Shiva model for third-person aftermath shots and forest search
  const [shivaModel, setShivaModel] = useState<THREE.Group | null>(null);
  const [shivaAnimations, setShivaAnimations] = useState<THREE.AnimationClip[]>([]);

  // Internal Gameplay Phase Machine
  // INTRO -> AIMING -> THROWING -> PROJECTILE_FLIGHT -> MISS / HIT -> IMPACT -> SHIVA_REALIZES -> SHIVA_AFTERMATH -> SHIVA_DECISION -> FOREST_TRANSITION
  const [internalPhase, setInternalPhase] = useState<
    | 'INTRO'
    | 'AIMING'
    | 'THROWING'
    | 'PROJECTILE_FLIGHT'
    | 'MISS'
    | 'HIT'
    | 'IMPACT'
    | 'SHIVA_REALIZES'
    | 'SHIVA_AFTERMATH'
    | 'SHIVA_DECISION'
    | 'FOREST_TRANSITION'
  >('INTRO');

  // Aiming angles & mouse tracking with smooth camera lerping
  const targetYaw = useRef(0);
  const targetPitch = useRef(0.04);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0.04);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);
  const hasPlayedAimSound = useRef(false);

  // Throw animation & projectile state
  const [throwProgress, setThrowProgress] = useState(0);
  const [isRigWeaponVisible, setIsRigWeaponVisible] = useState(true);
  const [projectileActive, setProjectileActive] = useState(false);
  const projectileOrigin = useRef(new THREE.Vector3(0.25, 1.45, 2.7));
  const projectileDirection = useRef(new THREE.Vector3(0, 0, -1));

  // Telemetry for projectile-following camera
  const projectilePos = useRef(new THREE.Vector3(0, 0, 0));
  const projectileVel = useRef(new THREE.Vector3(0, 0, -14));

  // Camera choreography state
  const shivaEyePos = useRef(new THREE.Vector3(0, 1.72, 3.4));
  const cameraPos = useRef(new THREE.Vector3(0, 1.85, 5.8));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1.2, -8.0));
  const introStartTime = useRef<number | null>(null);
  const throwStartTime = useRef<number | null>(null);
  const cameraRecoil = useRef(0);

  // Timers ref for cancellable aftermath sequence
  const aftermathTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAftermathTimers = useCallback(() => {
    aftermathTimers.current.forEach(clearTimeout);
    aftermathTimers.current = [];
  }, []);

  // 1. Initial Scene Setup & Asset Loading
  useEffect(() => {
    audioManager.startAmbientMusic();
    audioManager.fadeAmbientVolume(0.35, 2.0);
    introStartTime.current = performance.now();

    // Lazy load Shiva FBX asset in background for aftermath shots & forest search
    const status = shivaAssetManager.getStatus();
    if (status.loaded && status.model) {
      setShivaModel(status.model);
      setShivaAnimations(status.animations);
    } else {
      shivaAssetManager
        .loadShivaModel()
        .then((fbx) => {
          setShivaModel(fbx);
          setShivaAnimations(shivaAssetManager.getStatus().animations);
        })
        .catch(() => {
          // Fallback procedural model in ShivaCharacter will be used seamlessly
        });
    }

    return () => {
      clearAftermathTimers();
    };
  }, [clearAftermathTimers]);

  // 2. Synchronize external store phase
  useEffect(() => {
    if (shivaPhase === 'TRISHUL_AIMING') {
      setInternalPhase('AIMING');
      setIsRigWeaponVisible(true);
      setProjectileActive(false);
    } else if (shivaPhase === 'SHIVA_REALIZES') {
      setInternalPhase('SHIVA_REALIZES');
    } else if (shivaPhase === 'SHIVA_AFTERMATH') {
      setInternalPhase('SHIVA_AFTERMATH');
    } else if (shivaPhase === 'SHIVA_DECISION') {
      setInternalPhase('SHIVA_DECISION');
    } else if (shivaPhase === 'FOREST_TRANSITION') {
      setInternalPhase('FOREST_TRANSITION');
    }
  }, [shivaPhase]);

  // 3. Mouse Look & Aim Controls (Only active during AIMING)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (internalPhase !== 'AIMING') return;

      const sensitivity = 0.0018; // Smooth, balanced sensitivity
      mouseDelta.current = { x: e.movementX, y: e.movementY };

      targetYaw.current -= e.movementX * sensitivity;
      targetPitch.current -= e.movementY * sensitivity;

      // Clamped pitch and yaw so player cannot look outside sacred doorway context
      targetYaw.current = THREE.MathUtils.clamp(targetYaw.current, -0.42, 0.42);
      targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, -0.16, 0.22);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (internalPhase !== 'AIMING') return;
      if (!isPointerLocked.current && document.pointerLockElement !== canvas) {
        try {
          canvas.requestPointerLock?.();
        } catch {
          // Safe
        }
      }
      if (e.button === 0) {
        triggerThrow();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (internalPhase !== 'AIMING') return;
      if (e.code === 'KeyE' || e.code === 'Space') {
        e.preventDefault();
        triggerThrow();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl, internalPhase]);

  // 4. Trigger Throw Sequence
  const triggerThrow = useCallback(() => {
    if (internalPhase !== 'AIMING') return;

    setInternalPhase('THROWING');
    throwStartTime.current = performance.now();
    gameStateStore.setShivaPhase('TRISHUL_THROWING');
  }, [internalPhase]);

  // Telemetry callback receiving position from projectile in flight
  const handleProjectileTelemetry = useCallback((pos: THREE.Vector3, vel: THREE.Vector3) => {
    projectilePos.current.copy(pos);
    projectileVel.current.copy(vel);
  }, []);

  // 5. Handle Projectile Hit -> Start Cinematic Aftermath Sequence
  const handleHit = useCallback((_hitPoint: THREE.Vector3) => {
    setProjectileActive(false);
    setInternalPhase('HIT');
    audioManager.playTrishulImpact();
    cameraRecoil.current = 0.16;

    // Release mouse pointer lock immediately on hit
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock?.();
      } catch {
        // Safe
      }
    }

    // Immediately cut ambient sound into stillness
    audioManager.fadeAmbientVolume(0.02, 0.4);

    clearAftermathTimers();

    // 250ms freeze-frame holding impact moment before divine flash & camera takeover
    const t0 = setTimeout(() => {
      setInternalPhase('IMPACT');
      gameStateStore.setShivaPhase('TRISHUL_IMPACT');

      // 320ms impact flash duration before camera takeover
      const t1 = setTimeout(() => {
        setInternalPhase('SHIVA_REALIZES');
        gameStateStore.setShivaPhase('SHIVA_REALIZES');

        // Audio Progression:
        // 1.2s: distant sacred bell rings once
        const t2 = setTimeout(() => {
          audioManager.playTempleBell();
        }, 1200);

        // 1.8s: soft meditative tanpura & emotional ambience returns
        const t3 = setTimeout(() => {
          audioManager.fadeAmbientVolume(0.24, 2.5);
        }, 1800);

        // 2.4s: Advance to SHIVA_AFTERMATH (Camera tracks down stone path to Ganesha)
        const t4 = setTimeout(() => {
          setInternalPhase('SHIVA_AFTERMATH');
          gameStateStore.setShivaPhase('SHIVA_AFTERMATH');
        }, 2400);

        // 4.6s: Advance to SHIVA_DECISION (Camera reframes Shiva's resolve + shows minimal Continue)
        const t5 = setTimeout(() => {
          setInternalPhase('SHIVA_DECISION');
          gameStateStore.setShivaPhase('SHIVA_DECISION');
        }, 4600);

        aftermathTimers.current = [t2, t3, t4, t5];
      }, 320);

      aftermathTimers.current.push(t1);
    }, 250);

    aftermathTimers.current.push(t0);
  }, [clearAftermathTimers]);

  // 6. Handle Projectile Miss & Seamless Retry Loop
  const handleMiss = useCallback((_missPoint: THREE.Vector3) => {
    setProjectileActive(false);
    setInternalPhase('MISS');
    audioManager.playTrishulMiss();
    cameraRecoil.current = 0.05;

    // 1.2s recovery delay -> new Trishul materializes in hand
    setTimeout(() => {
      setThrowProgress(0);
      setIsRigWeaponVisible(true);
      setInternalPhase('AIMING');
      gameStateStore.setShivaPhase('TRISHUL_AIMING');
    }, 1200);
  }, []);

  const isForestScene =
    shivaPhase === 'SHIVA_SEARCH' || shivaPhase === 'ELEPHANT_ENCOUNTER';

  // 7. Main Frame Simulation & Projectile Camera Tracking Loop
  useFrame((_state, delta) => {
    // When in the forest scene, ShivaController has full control of camera and movement
    if (isForestScene) return;

    const dt = Math.min(delta, 0.08);
    const now = performance.now();

    mouseDelta.current.x = THREE.MathUtils.lerp(mouseDelta.current.x, 0, dt * 10);
    mouseDelta.current.y = THREE.MathUtils.lerp(mouseDelta.current.y, 0, dt * 10);
    cameraRecoil.current = THREE.MathUtils.lerp(cameraRecoil.current, 0, dt * 8);

    // ─── STAGE A: INTRO CAMERA APPROACH ───
    if (internalPhase === 'INTRO') {
      if (introStartTime.current) {
        const elapsed = (now - introStartTime.current) / 1000;
        const p = Math.min(1, elapsed / 2.6);
        const ease = p * (2 - p);

        cameraPos.current.set(
          0,
          THREE.MathUtils.lerp(1.85, 1.72, ease),
          THREE.MathUtils.lerp(5.8, 3.4, ease)
        );
        cameraLookAt.current.set(
          0,
          THREE.MathUtils.lerp(1.1, 1.15, ease),
          -8.0
        );

        if (p >= 1) {
          setInternalPhase('AIMING');
          gameStateStore.setShivaPhase('TRISHUL_AIMING');
        }
      }
    }

    // ─── STAGE B: FIRST-PERSON AIMING (Smooth Lerp + Exact Central Raycast) ───
    else if (internalPhase === 'AIMING') {
      // Smooth camera interpolation for natural aim feel
      currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, dt * 14.0);
      currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, dt * 14.0);

      cameraPos.current.copy(shivaEyePos.current);

      const cosP = Math.cos(currentPitch.current);
      const sinP = Math.sin(currentPitch.current);
      const sinY = Math.sin(currentYaw.current);
      const cosY = Math.cos(currentYaw.current);

      // Exact forward ray through the center of the reticle
      const forward = new THREE.Vector3(-sinY * cosP, sinP, -cosY * cosP).normalize();
      cameraLookAt.current.copy(cameraPos.current).add(forward.clone().multiplyScalar(10));

      // Calculate distance from center ray to Ganesha's head target point
      const aimRay = new THREE.Ray(cameraPos.current, forward);
      const closestPoint = new THREE.Vector3();
      aimRay.closestPointToPoint(GANESHA_TARGET_CENTER, closestPoint);
      const dist = closestPoint.distanceTo(GANESHA_TARGET_CENTER);

      // Target lock feedback when crosshair is centered over Ganesha's head area
      const isLocked = dist <= GANESHA_HIT_RADIUS * 1.15;
      setAimSyncState({ isTargetLocked: isLocked, distanceToTarget: dist });

      if (isLocked && !hasPlayedAimSound.current) {
        audioManager.playAimFocus();
        hasPlayedAimSound.current = true;
      } else if (!isLocked) {
        hasPlayedAimSound.current = false;
      }
    }

    // ─── STAGE C: THROW MOTION & PROJECTILE LAUNCH ───
    else if (internalPhase === 'THROWING') {
      if (throwStartTime.current) {
        const elapsed = (now - throwStartTime.current) / 1000;
        const progress = Math.min(1, elapsed / 0.32);
        setThrowProgress(progress);

        if (progress >= 0.65 && !projectileActive && isRigWeaponVisible) {
          setIsRigWeaponVisible(false);

          const cosP = Math.cos(currentPitch.current);
          const sinP = Math.sin(currentPitch.current);
          const sinY = Math.sin(currentYaw.current);
          const cosY = Math.cos(currentYaw.current);

          let dir = new THREE.Vector3(-sinY * cosP, sinP, -cosY * cosP).normalize();

          // Synchronized raycast trajectory:
          // If aimed close to Ganesha's head target, guide trajectory smoothly toward head center
          const ray = new THREE.Ray(cameraPos.current, dir);
          const closest = new THREE.Vector3();
          ray.closestPointToPoint(GANESHA_TARGET_CENTER, closest);
          if (closest.distanceTo(GANESHA_TARGET_CENTER) <= GANESHA_HIT_RADIUS * 1.45) {
            const assistedDir = GANESHA_TARGET_CENTER.clone().sub(cameraPos.current).normalize();
            dir.lerp(assistedDir, 0.48).normalize();
          }

          // Calculate world-space launch origin matching the first-person weapon's release point:
          // Right offset +0.20m, down -0.22m, forward -0.65m relative to camera orientation
          const right = new THREE.Vector3(cosY, 0, -sinY).normalize();
          const upVec = new THREE.Vector3(0, 1, 0);
          const origin = cameraPos.current.clone()
            .add(right.clone().multiplyScalar(0.18))
            .add(upVec.clone().multiplyScalar(-0.20))
            .add(dir.clone().multiplyScalar(0.65));

          projectileOrigin.current.copy(origin);
          projectileDirection.current.copy(dir);
          projectilePos.current.copy(origin);
          projectileVel.current.copy(dir.clone().multiplyScalar(14.5));

          setProjectileActive(true);
          setInternalPhase('PROJECTILE_FLIGHT');
          audioManager.playTrishulWhoosh();
          cameraRecoil.current = 0.08;
        }
      }
    }

    // ─── STAGE C2: CINEMATIC CAMERA FOLLOWING THE FLYING TRISHUL ───
    else if (internalPhase === 'PROJECTILE_FLIGHT' || (internalPhase === 'HIT' && projectileActive)) {
      const pPos = projectilePos.current;
      const pVel = projectileVel.current;
      const fwd = pVel.clone().normalize();

      // Camera sits slightly behind and to the right/above the flying Trishul,
      // keeping the Trishul prominent in foreground and Ganesha clearly visible ahead
      const desiredCamPos = pPos.clone()
        .sub(fwd.clone().multiplyScalar(1.28)) // 1.28m behind weapon
        .add(new THREE.Vector3(0.24, 0.32, 0)); // slightly offset right & above

      // Camera looks directly along trajectory toward Ganesha's sacred threshold
      const desiredLookAt = pPos.clone().add(fwd.clone().multiplyScalar(4.5));

      // Fast, smooth interpolation to travel seamlessly WITH the projectile
      cameraPos.current.lerp(desiredCamPos, dt * 18.0);
      cameraLookAt.current.lerp(desiredLookAt, dt * 20.0);
    }

    // ─── STAGE D: MULTI-SHOT CINEMATIC AFTERMATH SEQUENCE ───
    else if (internalPhase === 'SHIVA_REALIZES') {
      // SHOT 1: Over-The-Shoulder / Medium Shot of Shiva lowering his weapon in silence
      const targetPos = new THREE.Vector3(1.25, 1.82, 4.8);
      const targetLookAt = new THREE.Vector3(0, 1.35, -2.5);

      cameraPos.current.lerp(targetPos, dt * 2.2);
      cameraLookAt.current.lerp(targetLookAt, dt * 2.5);
    } else if (internalPhase === 'SHIVA_AFTERMATH') {
      // SHOT 2: Slow camera tracking forward down stone path to Ganesha at the sacred threshold
      const targetPos = new THREE.Vector3(0.35, 1.32, -3.2);
      const targetLookAt = new THREE.Vector3(0, 0.75, -8.0);

      cameraPos.current.lerp(targetPos, dt * 1.6);
      cameraLookAt.current.lerp(targetLookAt, dt * 1.8);
    } else if (internalPhase === 'SHIVA_DECISION') {
      // SHOT 3: Lower-angle shot reframing Lord Shiva gazing toward the Himalayan peaks in resolve
      const targetPos = new THREE.Vector3(-1.1, 1.55, 1.4);
      const targetLookAt = new THREE.Vector3(0, 2.1, 3.2);

      cameraPos.current.lerp(targetPos, dt * 1.8);
      cameraLookAt.current.lerp(targetLookAt, dt * 2.0);
    } else if (internalPhase === 'FOREST_TRANSITION') {
      // Camera tilts upward toward mountain mists as scene transitions
      const targetPos = new THREE.Vector3(-1.1, 2.8, 1.0);
      const targetLookAt = new THREE.Vector3(0, 8.0, -12.0);

      cameraPos.current.lerp(targetPos, dt * 1.8);
      cameraLookAt.current.lerp(targetLookAt, dt * 1.8);
    }

    // Apply camera position with recoil damping
    const finalCamPos = cameraPos.current.clone();
    if (cameraRecoil.current > 0.001) {
      finalCamPos.y += (Math.random() - 0.5) * cameraRecoil.current;
      finalCamPos.x += (Math.random() - 0.5) * cameraRecoil.current;
    }

    camera.position.copy(finalCamPos);
    camera.lookAt(cameraLookAt.current);
  });

  const isAftermathState =
    internalPhase === 'SHIVA_REALIZES' ||
    internalPhase === 'SHIVA_AFTERMATH' ||
    internalPhase === 'SHIVA_DECISION' ||
    internalPhase === 'FOREST_TRANSITION' ||
    shivaPhase === 'SHIVA_REALIZES' ||
    shivaPhase === 'SHIVA_AFTERMATH' ||
    shivaPhase === 'SHIVA_DECISION';

  const isGaneshaFallen =
    internalPhase === 'HIT' ||
    internalPhase === 'IMPACT' ||
    isAftermathState ||
    shivaPhase === 'GANESHA_AFTERMATH' ||
    shivaPhase === 'RESTORATION_READY' ||
    shivaPhase === 'SHIVA_SEARCH';

  return (
    <group name="MythologyShiva3D">
      {/* ─── Dynamically Alternate Between Mount Kailash and Forest Exploration ─── */}
      {isForestScene ? (
        <ForestExploration3D
          shivaModel={shivaModel}
          shivaAnimations={shivaAnimations}
        />
      ) : (
        <>
          {/* Mount Kailash Sacred Abode Environment */}
          <MythologyEnvironment />

          {/* 3D Human-Form Lord Ganesha Standing / Resting at Sacred Entrance */}
          <HumanGanesha3D
            position={GANESHA_POSITION}
            isFallen={isGaneshaFallen}
          />

          {/* 3D Lord Shiva Standing on the Path during Aftermath */}
          {isAftermathState && (
            <group position={[0, 0, 3.2]} rotation={[0, Math.PI, 0]}>
              <ShivaCharacter
                speed={0}
                isRunning={false}
                isAftermath={true}
                model={shivaModel}
                animations={shivaAnimations}
              />
            </group>
          )}

          {/* First-Person Held Trishul Rig (Visible while aiming & throwing) */}
          <group
            position={[camera.position.x, camera.position.y, camera.position.z]}
            rotation={[camera.rotation.x, camera.rotation.y, camera.rotation.z]}
          >
            <TrishulFirstPersonRig
              isAiming={internalPhase === 'AIMING'}
              isThrowing={internalPhase === 'THROWING'}
              throwProgress={throwProgress}
              isVisible={isRigWeaponVisible && !isForestScene && !isAftermathState}
              mouseDelta={mouseDelta.current}
            />
          </group>

          {/* Active 3D Thrown Trishul Projectile in Flight */}
          {projectileActive && (
            <TrishulProjectile
              origin={projectileOrigin.current}
              direction={projectileDirection.current}
              targetCenter={GANESHA_TARGET_CENTER}
              targetRadius={GANESHA_HIT_RADIUS}
              onHit={handleHit}
              onMiss={handleMiss}
              onPositionUpdate={handleProjectileTelemetry}
            />
          )}
        </>
      )}
    </group>
  );
}

/**
 * 2D DOM Overlay: Subtitles, Minimal Reticle, Divine Flash & Mountain Mist Transition
 * Completely zero cards, zero modals, zero giant buttons.
 */
export function MythologyShivaUI() {
  const { shivaPhase } = useGameState();
  const aimSync = useAimSync();
  const [showInstruction, setShowInstruction] = useState(true);
  const [mistOpacity, setMistOpacity] = useState(0);

  const isForestScene =
    shivaPhase === 'SHIVA_SEARCH' || shivaPhase === 'ELEPHANT_ENCOUNTER';

  // Auto-fade initial aiming prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 4800);
    return () => clearTimeout(timer);
  }, []);

  // Safety watchdog: if stuck in TRISHUL_IMPACT for more than 350ms, force advance to SHIVA_REALIZES
  useEffect(() => {
    if (shivaPhase === 'TRISHUL_IMPACT') {
      const safetyTimer = setTimeout(() => {
        gameStateStore.setShivaPhase('SHIVA_REALIZES');
      }, 350);
      return () => clearTimeout(safetyTimer);
    }
  }, [shivaPhase]);

  // Handle Skip / Fast-Forward through Aftermath
  const handleAdvanceAftermath = useCallback(() => {
    if (shivaPhase === 'SHIVA_REALIZES') {
      audioManager.playUIClick();
      gameStateStore.setShivaPhase('SHIVA_AFTERMATH');
    } else if (shivaPhase === 'SHIVA_AFTERMATH') {
      audioManager.playUIClick();
      gameStateStore.setShivaPhase('SHIVA_DECISION');
    }
  }, [shivaPhase]);

  // Handle Continue from Aftermath into Forest Quest
  const handleContinueToForest = useCallback(() => {
    if (mistOpacity > 0) return;

    audioManager.playTransitionSwell();
    audioManager.playUIClick();

    // Reset forest tracking game loop state
    forestTrackingStore.reset();

    // Trigger atmospheric mist wash across screen
    setMistOpacity(1);

    setTimeout(() => {
      gameStateStore.setShivaPhase('SHIVA_SEARCH');

      // Softly dissolve mist revealing the ancient cedar forest
      setTimeout(() => {
        setMistOpacity(0);
      }, 500);
    }, 1100);
  }, [mistOpacity]);

  // Keyboard shortcut: E, Space, Enter trigger advance or continue
  useEffect(() => {
    const isAftermath =
      shivaPhase === 'SHIVA_REALIZES' ||
      shivaPhase === 'SHIVA_AFTERMATH' ||
      shivaPhase === 'SHIVA_DECISION';

    if (!isAftermath) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (shivaPhase === 'SHIVA_DECISION') {
          handleContinueToForest();
        } else {
          handleAdvanceAftermath();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shivaPhase, handleAdvanceAftermath, handleContinueToForest]);

  // Auto-advance from elephant encounter to divine transition
  useEffect(() => {
    if (shivaPhase === 'ELEPHANT_ENCOUNTER') {
      const timer = setTimeout(() => {
        gameStateStore.setShivaPhase('DIVINE_TRANSITION');
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [shivaPhase]);

  const isAimingState =
    shivaPhase === 'TRISHUL_AIMING' || shivaPhase === 'SHIVA_GAMEPLAY';

  const isThrowingState = shivaPhase === 'TRISHUL_THROWING';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 65,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ─── CELESTIAL WHITE-GOLD IMPACT FLASH (NON-GRAPHIC BLOOM VIA CSS KEYFRAME) ─── */}
      {shivaPhase === 'TRISHUL_IMPACT' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, #ffffff 0%, #fef08a 45%, #b45309 85%)',
            animation: 'impactBloom 0.35s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 98,
          }}
        />
      )}

      {/* ─── ATMOSPHERIC MOUNTAIN MIST TRANSITION OVERLAY ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0c101a',
          opacity: mistOpacity,
          transition: 'opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 95,
        }}
      />

      {/* ─── MINIMAL CINEMATIC AIMING RETICLE WITH SUBTLE TARGET-LOCK FEEDBACK ─── */}
      {(isAimingState || isThrowingState) && (
        <div
          data-ui="trishul-reticle"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            opacity: isThrowingState ? 0.0 : 0.95,
            transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center center',
          }}
        >
          {/* Outer Thin Celestial Ring */}
          <div
            style={{
              position: 'absolute',
              width: aimSync.isTargetLocked ? '32px' : '38px',
              height: aimSync.isTargetLocked ? '32px' : '38px',
              borderRadius: '50%',
              border: aimSync.isTargetLocked
                ? '1px solid rgba(254, 240, 138, 0.85)'
                : '1px solid rgba(254, 240, 138, 0.35)',
              boxShadow: aimSync.isTargetLocked
                ? '0 0 14px rgba(250, 204, 21, 0.65), inset 0 0 6px rgba(250, 204, 21, 0.35)'
                : '0 0 6px rgba(234, 179, 8, 0.25)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Inner Target Circle (tightens and highlights when locked on Ganesha's head) */}
          <div
            style={{
              position: 'absolute',
              width: aimSync.isTargetLocked ? '16px' : '22px',
              height: aimSync.isTargetLocked ? '16px' : '22px',
              borderRadius: '50%',
              border: aimSync.isTargetLocked
                ? '1px dashed rgba(255, 255, 255, 0.9)'
                : '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'all 0.2s ease',
            }}
          />

          {/* Precision Center Dot */}
          <div
            style={{
              width: aimSync.isTargetLocked ? '4px' : '3px',
              height: aimSync.isTargetLocked ? '4px' : '3px',
              borderRadius: '50%',
              backgroundColor: aimSync.isTargetLocked ? '#ffffff' : '#fef08a',
              boxShadow: aimSync.isTargetLocked
                ? '0 0 8px #ffffff, 0 0 16px rgba(250, 204, 21, 0.8)'
                : '0 0 5px rgba(254, 240, 138, 0.8)',
              transition: 'all 0.15s ease',
            }}
          />

          {/* Four Thin Axis Crosshairs (Top, Bottom, Left, Right) */}
          <div
            style={{
              position: 'absolute',
              top: aimSync.isTargetLocked ? '-2px' : '-5px',
              width: '1px',
              height: '5px',
              backgroundColor: aimSync.isTargetLocked
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(254, 240, 138, 0.55)',
              transition: 'top 0.2s ease, background-color 0.2s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: aimSync.isTargetLocked ? '-2px' : '-5px',
              width: '1px',
              height: '5px',
              backgroundColor: aimSync.isTargetLocked
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(254, 240, 138, 0.55)',
              transition: 'bottom 0.2s ease, background-color 0.2s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: aimSync.isTargetLocked ? '-2px' : '-5px',
              width: '5px',
              height: '1px',
              backgroundColor: aimSync.isTargetLocked
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(254, 240, 138, 0.55)',
              transition: 'left 0.2s ease, background-color 0.2s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: aimSync.isTargetLocked ? '-2px' : '-5px',
              width: '5px',
              height: '1px',
              backgroundColor: aimSync.isTargetLocked
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(254, 240, 138, 0.55)',
              transition: 'right 0.2s ease, background-color 0.2s ease',
            }}
          />
        </div>
      )}

      {/* ─── EPHEMERAL GAMEPLAY INSTRUCTION ─── */}
      {isAimingState && showInstruction && (
        <div
          data-ui="aim-instruction"
          style={{
            position: 'absolute',
            bottom: 'clamp(28px, 6vh, 48px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            backgroundColor: 'rgba(10, 14, 24, 0.68)',
            border: '1px solid rgba(254, 240, 138, 0.3)',
            borderRadius: '24px',
            padding: '8px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.6s ease-out',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#eed7a1',
              textTransform: 'uppercase',
            }}
          >
            Aim with Mouse
          </span>
          <span style={{ color: 'rgba(238, 215, 161, 0.4)', fontSize: '10px' }}>•</span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            Left Click to Throw
          </span>
        </div>
      )}

      {/* ─── RESTRAINED CINEMATIC SUBTITLES WITH INSTANT ADVANCE ─── */}
      {(shivaPhase === 'SHIVA_REALIZES' || shivaPhase === 'SHIVA_AFTERMATH') && (
        <div
          data-ui="aftermath-subtitles"
          onClick={handleAdvanceAftermath}
          style={{
            position: 'absolute',
            bottom: 'clamp(36px, 9vh, 64px)',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            maxWidth: '680px',
            width: '90%',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'fadeInSubtitle 0.8s ease-out',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              padding: 0,
              fontFamily: "'Marcellus', serif",
              fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)',
              color: '#f8fafc',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              lineHeight: 1.6,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.8)',
            }}
          >
            {shivaPhase === 'SHIVA_REALIZES'
              ? '“Only then did Shiva realize what had happened.”'
              : '“His anger gave way to silence.”'}
          </p>
          <div
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'rgba(238, 215, 161, 0.7)',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            Press [E] or Click to Continue →
          </div>
        </div>
      )}

      {/* ─── MINIMAL CINEMATIC CONTINUE PROMPT (APPEARS IN SHIVA_DECISION) ─── */}
      {shivaPhase === 'SHIVA_DECISION' && (
        <div
          data-ui="cinematic-continue"
          onClick={handleContinueToForest}
          style={{
            position: 'absolute',
            bottom: 'clamp(28px, 6vh, 48px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 24px',
            borderRadius: '4px',
            background: 'rgba(14, 18, 30, 0.65)',
            border: '1px solid rgba(229, 192, 123, 0.5)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 16px rgba(229, 192, 123, 0.25)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'fadeInUp 0.6s ease-out',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(24, 30, 48, 0.85)';
            e.currentTarget.style.borderColor = 'rgba(229, 192, 123, 0.9)';
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(14, 18, 30, 0.65)';
            e.currentTarget.style.borderColor = 'rgba(229, 192, 123, 0.5)';
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)';
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '22px',
              height: '20px',
              padding: '0 6px',
              background: 'rgba(229, 192, 123, 0.25)',
              border: '1px solid rgba(229, 192, 123, 0.7)',
              borderRadius: '3px',
              color: '#ffffff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
            }}
          >
            E
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#f8f4ec',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
            }}
          >
            CONTINUE →
          </span>
        </div>
      )}

      {/* ─── CHAPTER 4: REAL PLAYABLE FOREST EXPLORATION & TRACKING UI ─── */}
      {isForestScene && <ForestExplorationUI />}

      {/* ─── RESTORATION CINEMATICS IN SUBSEQUENT SCENES ─── */}
      <RestorationCinematic
        phase={shivaPhase}
        onAdvance={(next) => gameStateStore.setShivaPhase(next)}
        onReturnHome={() => gameStateStore.returnToHomeScene()}
        onReplaySearch={() => gameStateStore.setShivaPhase('SHIVA_SEARCH')}
      />

      <style>{`
        @keyframes impactBloom {
          0% { opacity: 0; }
          25% { opacity: 0.92; }
          100% { opacity: 0; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translate(-50%, 12px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeInSubtitle {
          0% { opacity: 0; transform: translate(-50%, 8px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
