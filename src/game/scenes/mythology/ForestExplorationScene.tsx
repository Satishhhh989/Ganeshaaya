/**
 * ForestExplorationScene - Master Chapter 4 Exploration & Discovery System
 * 
 * Replaces the old dark tunnel & placeholder image with:
 * - Real playable 3D tracking gameplay through a sunlit Himalayan cedar forest
 * - 3 interactive environmental clues: Massive Footprints -> Broken Cedar Branches -> Sacred Threshold
 * - Auditory guidance: distant elephant trumpet calls, breathing, and foliage rustle
 * - Fully 3D articulated Sacred Elephant (Sri Gajaraj) with living animations
 * - Player-driven approach into the sunlit clearing
 * - Cinematic sacred communion with mutual reverence
 * - Smooth atmospheric mist transition into Ganesha Restoration
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStateStore } from '../../core/GameState';
import type { ForestTrackingPhase } from '../../core/types';
import { ForestEnvironment } from './ForestEnvironment';
import { LivingSacredElephant3D } from '../../characters/LivingSacredElephant3D';
import { ForestClues3D, CLUES } from './ForestClues3D';
import { ForestShivaController } from './ForestShivaController';
import { audioManager } from '../../audio/AudioManager';
import { virtualInputStore } from '../../ui/mobile/virtualInputStore';

const ELEPHANT_POSITION: [number, number, number] = [0, 0, -20.5];

// ─── Reactive Store for Sharing Forest State Across Canvas & DOM ───
interface ForestTrackingState {
  trackingPhase: ForestTrackingPhase;
  nearbyClueId: string | null;
  completedClues: Set<string>;
  isExamining: boolean;
  subtitleText: string | null;
  isNearElephant: boolean;
  playerPos: [number, number, number];
  distanceToElephant: number;
}

class ForestTrackingStore {
  private state: ForestTrackingState = {
    trackingPhase: 'FOREST_INTRO',
    nearbyClueId: null,
    completedClues: new Set<string>(),
    isExamining: false,
    subtitleText: null,
    isNearElephant: false,
    playerPos: [0, 0, 7.5],
    distanceToElephant: 28,
  };

  private listeners = new Set<() => void>();

  getState() {
    return this.state;
  }

  setState(partial: Partial<ForestTrackingState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset() {
    this.state = {
      trackingPhase: 'FOREST_INTRO',
      nearbyClueId: null,
      completedClues: new Set<string>(),
      isExamining: false,
      subtitleText: null,
      isNearElephant: false,
      playerPos: [0, 0, 7.5],
      distanceToElephant: 28,
    };
    this.listeners.forEach((l) => l());
  }

  triggerCommunion() {
    if (this.state.trackingPhase === 'ELEPHANT_CINEMATIC' || this.state.trackingPhase === 'RESTORATION_READY') return;

    audioManager.playTransitionSwell();
    audioManager.playTempleBell();

    this.setState({
      trackingPhase: 'ELEPHANT_CINEMATIC',
      subtitleText: '“Beyond the ancient trees, Shiva found a creature of great strength and wisdom.”',
    });

    setTimeout(() => {
      this.setState({
        subtitleText: '“In quiet understanding, the noble Gajaraj offered its sacred spirit for the child.”',
      });
      audioManager.playElephantBreath();
    }, 3800);

    setTimeout(() => {
      audioManager.playDivineAwakeningPulse();
      setTimeout(() => {
        this.setState({ trackingPhase: 'RESTORATION_READY' });
        gameStateStore.setShivaPhase('DIVINE_TRANSITION');
      }, 1200);
    }, 7200);
  }

  examineClue(clueId: string) {
    if (this.state.isExamining) return;
    const clue = CLUES.find((c) => c.id === clueId);
    if (!clue) return;

    audioManager.playClueDiscovered();

    if (clue.id === 'CLUE_ONE') {
      audioManager.playFoliageRustle();
    } else if (clue.id === 'CLUE_TWO') {
      setTimeout(() => audioManager.playElephantCall(0.35), 450);
    } else if (clue.id === 'CLUE_THREE') {
      setTimeout(() => audioManager.playElephantCall(0.75), 350);
    }

    const nextCompleted = new Set(this.state.completedClues);
    nextCompleted.add(clue.id);

    let nextPhase: ForestTrackingPhase = this.state.trackingPhase;
    if (clue.id === 'CLUE_ONE') nextPhase = 'CLUE_ONE';
    else if (clue.id === 'CLUE_TWO') nextPhase = 'CLUE_TWO';
    else if (clue.id === 'CLUE_THREE') nextPhase = 'CLUE_THREE';

    this.setState({
      isExamining: true,
      completedClues: nextCompleted,
      subtitleText: clue.narration,
      trackingPhase: nextPhase,
    });

    setTimeout(() => {
      this.setState({
        isExamining: false,
        subtitleText: null,
      });
    }, 3800);
  }
}

export const forestTrackingStore = new ForestTrackingStore();

export function useForestTracking() {
  const [state, setState] = useState(forestTrackingStore.getState());

  useEffect(() => {
    return forestTrackingStore.subscribe(() => {
      setState(forestTrackingStore.getState());
    });
  }, []);

  return state;
}

/**
 * 3D Scene Elements for Forest Exploration (Rendered inside R3F Canvas)
 */
export function ForestExploration3D({
  shivaModel,
  shivaAnimations,
}: {
  shivaModel: THREE.Group | null;
  shivaAnimations: THREE.AnimationClip[];
}) {
  const { trackingPhase, completedClues, isExamining, nearbyClueId } = useForestTracking();
  const { camera } = useThree();
  const cinematicStartTime = useRef<number | null>(null);

  // Cinematic Camera Target Vectors
  const cinematicCamPos = useRef(new THREE.Vector3());
  const cinematicLookAt = useRef(new THREE.Vector3());

  // Track Shiva position & evaluate proximity to clues and elephant
  const handlePositionUpdate = useCallback(
    (pos: THREE.Vector3) => {
      if (trackingPhase === 'ELEPHANT_CINEMATIC' || trackingPhase === 'RESTORATION_READY') return;

      // 1. Proximity to Clues (within 2.4m of uncompleted clue)
      let foundClue: string | null = null;
      for (const clue of CLUES) {
        if (!completedClues.has(clue.id)) {
          const dx = pos.x - clue.position[0];
          const dz = pos.z - clue.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= 2.4) {
            foundClue = clue.id;
            break;
          }
        }
      }
      forestTrackingStore.setState({ nearbyClueId: foundClue });

      // 2. Proximity to Sacred Clearing & Elephant
      const distToElephant = Math.sqrt(
        pos.x * pos.x + (pos.z - ELEPHANT_POSITION[2]) * (pos.z - ELEPHANT_POSITION[2])
      );

      forestTrackingStore.setState({
        playerPos: [pos.x, pos.y, pos.z],
        distanceToElephant: Math.round(distToElephant),
      });

      // Enter clearing detection (Z <= -14)
      // When player follows the clear forest path into the clearing, natural discovery triggers
      if (
        pos.z <= -14 &&
        trackingPhase !== 'ELEPHANT_NEAR' &&
        trackingPhase !== 'ELEPHANT_APPROACH'
      ) {
        forestTrackingStore.setState({ trackingPhase: 'ELEPHANT_NEAR' });
        audioManager.playElephantBreath();
      }

      const nearElephant = distToElephant <= 4.4;
      forestTrackingStore.setState({ isNearElephant: nearElephant });
      if (nearElephant && (trackingPhase === 'ELEPHANT_NEAR' || pos.z <= -16)) {
        forestTrackingStore.setState({ trackingPhase: 'ELEPHANT_APPROACH' });
      }
    },
    [completedClues, trackingPhase]
  );

  // Set up cinematic start time
  useEffect(() => {
    if (trackingPhase === 'ELEPHANT_CINEMATIC') {
      cinematicStartTime.current = performance.now();
      // Release any pointer lock so cursor is free
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // Safe
        }
      }
    }
  }, [trackingPhase]);

  // Cinematic Camera Choreography Loop
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.08);

    if (trackingPhase === 'ELEPHANT_CINEMATIC') {
      if (cinematicStartTime.current) {
        const elapsed = (performance.now() - cinematicStartTime.current) / 1000;

        if (elapsed < 3.8) {
          // SHOT 1: Low-angle wide glade framing Shiva looking up at the celestial elephant under god rays
          const p = Math.min(1, elapsed / 3.8);
          cinematicCamPos.current.set(
            THREE.MathUtils.lerp(3.2, 2.6, p),
            THREE.MathUtils.lerp(1.4, 1.6, p),
            THREE.MathUtils.lerp(-15.5, -16.2, p)
          );
          cinematicLookAt.current.set(
            0,
            THREE.MathUtils.lerp(1.8, 2.2, p),
            -20.5
          );
        } else if (elapsed < 7.2) {
          // SHOT 2: Close framing of Sri Gajaraj gently bowing its head in reverence
          const p = Math.min(1, (elapsed - 3.8) / 3.4);
          cinematicCamPos.current.set(
            THREE.MathUtils.lerp(-1.8, -1.2, p),
            THREE.MathUtils.lerp(1.7, 1.85, p),
            THREE.MathUtils.lerp(-17.2, -18.0, p)
          );
          cinematicLookAt.current.set(
            0,
            THREE.MathUtils.lerp(2.2, 1.95, p),
            -20.5
          );
        } else {
          // SHOT 3: Camera smoothly tilts up toward sunbeams as mist fills the screen
          const p = Math.min(1, (elapsed - 7.2) / 1.5);
          cinematicCamPos.current.set(
            0,
            THREE.MathUtils.lerp(1.85, 3.2, p),
            THREE.MathUtils.lerp(-18.0, -17.5, p)
          );
          cinematicLookAt.current.set(
            0,
            THREE.MathUtils.lerp(2.0, 7.5, p),
            -22.0
          );
        }

        camera.position.lerp(cinematicCamPos.current, dt * 4.0);
        camera.lookAt(cinematicLookAt.current);
      }
    }
  });

  const isElephantAware =
    trackingPhase === 'ELEPHANT_NEAR' ||
    trackingPhase === 'ELEPHANT_APPROACH' ||
    trackingPhase === 'ELEPHANT_CINEMATIC' ||
    trackingPhase === 'RESTORATION_READY';

  const isElephantCommuning =
    trackingPhase === 'ELEPHANT_CINEMATIC' || trackingPhase === 'RESTORATION_READY';

  return (
    <group name="ForestExploration3D">
      {/* ─── Rebuilt Mythological Himalayan Cedar Forest Environment ─── */}
      <ForestEnvironment />

      {/* ─── 3 Environmental Tracking Clues ─── */}
      <ForestClues3D
        completedClues={completedClues}
        activeClueId={nearbyClueId}
      />

      {/* ─── Real 3D Articulated Sacred Elephant (Sri Gajaraj) in Sunlit Clearing ─── */}
      <LivingSacredElephant3D
        position={ELEPHANT_POSITION}
        rotationY={0}
        isAware={isElephantAware}
        isCommuning={isElephantCommuning}
      />

      {/* ─── Third-Person Shiva Controller & Camera ─── */}
      <ForestShivaController
        model={shivaModel}
        animations={shivaAnimations}
        isCinematic={trackingPhase === 'ELEPHANT_CINEMATIC' || trackingPhase === 'RESTORATION_READY'}
        isExamining={isExamining}
        onPositionUpdate={handlePositionUpdate}
      />
    </group>
  );
}

/**
 * 2D DOM Overlay for Forest Exploration: Minimal Objectives, Clue Prompts, Subtitles
 */
export function ForestExplorationUI() {
  const {
    trackingPhase,
    nearbyClueId,
    completedClues,
    isExamining,
    subtitleText,
    isNearElephant,
    distanceToElephant,
  } = useForestTracking();

  const [mistOpacity, setMistOpacity] = useState(0);

  // Handle Clue Examination
  const handleExamineClue = useCallback(() => {
    if (!nearbyClueId || isExamining) return;

    const clue = CLUES.find((c) => c.id === nearbyClueId);
    if (!clue) return;

    audioManager.playClueDiscovered();

    // Sound cues by clue progression
    if (clue.id === 'CLUE_ONE') {
      audioManager.playFoliageRustle();
    } else if (clue.id === 'CLUE_TWO') {
      setTimeout(() => audioManager.playElephantCall(0.35), 450);
    } else if (clue.id === 'CLUE_THREE') {
      setTimeout(() => audioManager.playElephantCall(0.75), 350);
    }

    // Mark completed
    const nextCompleted = new Set(completedClues);
    nextCompleted.add(clue.id);

    let nextPhase: ForestTrackingPhase = trackingPhase;
    if (clue.id === 'CLUE_ONE') {
      nextPhase = 'CLUE_ONE';
    } else if (clue.id === 'CLUE_TWO') {
      nextPhase = 'CLUE_TWO';
    } else if (clue.id === 'CLUE_THREE') {
      nextPhase = 'CLUE_THREE';
    }

    forestTrackingStore.setState({
      isExamining: true,
      subtitleText: clue.narration,
      completedClues: nextCompleted,
      trackingPhase: nextPhase,
    });

    // Auto-dismiss examine lock and subtitle after 3.8s
    setTimeout(() => {
      forestTrackingStore.setState({
        isExamining: false,
        subtitleText: null,
      });
    }, 3800);
  }, [nearbyClueId, isExamining, completedClues, trackingPhase]);

  // Handle Triggering Sacred Elephant Communion
  const handleTriggerCommunion = useCallback(() => {
    if (trackingPhase === 'ELEPHANT_CINEMATIC' || trackingPhase === 'RESTORATION_READY') return;

    audioManager.playTransitionSwell();
    audioManager.playTempleBell();

    forestTrackingStore.setState({
      trackingPhase: 'ELEPHANT_CINEMATIC',
      subtitleText: '“Beyond the ancient trees, Shiva found a creature of great strength and wisdom.”',
    });

    setTimeout(() => {
      forestTrackingStore.setState({
        subtitleText: '“In quiet understanding, the noble Gajaraj offered its sacred spirit for the child.”',
      });
      audioManager.playElephantBreath();
    }, 3800);

    // Mist transition into Restoration scene at 7.2s
    setTimeout(() => {
      setMistOpacity(1);
      audioManager.playDivineAwakeningPulse();

      setTimeout(() => {
        forestTrackingStore.setState({ trackingPhase: 'RESTORATION_READY' });
        gameStateStore.setShivaPhase('DIVINE_TRANSITION');
      }, 1200);
    }, 7200);
  }, [trackingPhase]);

  // Keyboard shortcut listener: E, Space, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        if (isNearElephant && trackingPhase !== 'ELEPHANT_CINEMATIC' && trackingPhase !== 'RESTORATION_READY') {
          e.preventDefault();
          handleTriggerCommunion();
        } else if (nearbyClueId && !isExamining) {
          e.preventDefault();
          handleExamineClue();
        } else if (subtitleText) {
          // Skip subtitle early
          forestTrackingStore.setState({
            subtitleText: null,
            isExamining: false,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNearElephant, nearbyClueId, isExamining, subtitleText, trackingPhase, handleTriggerCommunion, handleExamineClue]);

  // Find active clue prompt text
  const activeClue = nearbyClueId ? CLUES.find((c) => c.id === nearbyClueId) : null;

  // Top objective string: Always clear, prominent, and instructive
  const objectiveTitle =
    trackingPhase === 'ELEPHANT_APPROACH'
      ? 'APPROACH THE SACRED ELEPHANT'
      : trackingPhase === 'ELEPHANT_NEAR'
      ? 'THE SACRED ELEPHANT IS NEAR'
      : 'OBJECTIVE: FIND THE SACRED ELEPHANT';

  const objectiveSubtitle =
    trackingPhase === 'ELEPHANT_APPROACH'
      ? 'Press [E] to commune with Sri Gajaraj'
      : trackingPhase === 'ELEPHANT_NEAR'
      ? 'Step into the sunlit clearing ahead'
      : 'Follow the glowing golden path through the grove';

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
      {/* ─── FULL-SCREEN TRANSITION MIST OVERLAY ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0c1218',
          opacity: mistOpacity,
          transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 95,
        }}
      />

      {/* ─── PROMINENT TOP OBJECTIVE & WAYPOINT INDICATOR ─── */}
      {trackingPhase !== 'ELEPHANT_CINEMATIC' && trackingPhase !== 'RESTORATION_READY' && (
        <div
          data-ui="forest-objective"
          style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            zIndex: 90,
            animation: 'fadeInUp 0.6s ease-out',
          }}
        >
          {/* Main Objective Header Badge */}
          <div
            style={{
              backgroundColor: 'rgba(10, 16, 12, 0.88)',
              border: '1.5px solid rgba(254, 240, 138, 0.65)',
              borderRadius: '24px',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.85), 0 0 20px rgba(251, 191, 36, 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#fde047',
                boxShadow: '0 0 10px #fde047, 0 0 16px #fbbf24',
                animation: 'pulseGlow 2s ease-in-out infinite alternate',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)',
              }}
            >
              {objectiveTitle}
            </span>
            {distanceToElephant > 0 && (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fde047',
                  background: 'rgba(254, 240, 138, 0.18)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  letterSpacing: '0.04em',
                }}
              >
                {distanceToElephant}m
              </span>
            )}
          </div>

          {/* Subtitle Hint: Glowing Trail Guidance */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(5, 8, 6, 0.75)',
              border: '1px solid rgba(254, 240, 138, 0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '13px' }}>✨</span>
            <span
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '11px',
                fontWeight: 600,
                color: '#fef08a',
                letterSpacing: '0.08em',
              }}
            >
              {objectiveSubtitle}
            </span>
          </div>
        </div>
      )}

      {/* ─── 360° LOOK & CONTROLS HELPER BADGE ─── */}
      {trackingPhase !== 'ELEPHANT_CINEMATIC' && trackingPhase !== 'RESTORATION_READY' && (
        <div
          data-ui="forest-controls-hint"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            zIndex: 88,
            backgroundColor: 'rgba(10, 16, 12, 0.85)',
            border: '1px solid rgba(254, 240, 138, 0.35)',
            borderRadius: '10px',
            padding: '10px 16px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px' }}>🔄</span>
            <span
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '11px',
                fontWeight: 700,
                color: '#fef08a',
                letterSpacing: '0.08em',
              }}
            >
              {virtualInputStore.getState().isTouchDevice ? 'SWIPE SCREEN · 360° VIEW' : 'MOUSE / DRAG · 360° VIEW'}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '0.02em',
            }}
          >
            {virtualInputStore.getState().isTouchDevice
              ? 'Left Joystick to Walk · Drag right side to look'
              : 'WASD to Walk · Shift to Run · Look around in all directions'}
          </div>
        </div>
      )}

      {/* ─── DISCREET CONTEXTUAL INTERACTION PROMPTS ─── */}
      {/* 1. Clue Examination Prompt */}
      {activeClue && !isExamining && !isNearElephant && trackingPhase !== 'ELEPHANT_CINEMATIC' && (
        <div
          data-ui="clue-examine-prompt"
          onClick={handleExamineClue}
          style={{
            position: 'absolute',
            bottom: 'clamp(32px, 8vh, 64px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 22px',
            borderRadius: '4px',
            background: 'rgba(12, 18, 14, 0.75)',
            border: '1px solid rgba(254, 240, 138, 0.6)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 16px rgba(254, 240, 138, 0.25)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'fadeInUp 0.35s ease-out',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
            e.currentTarget.style.borderColor = '#fef08a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)';
            e.currentTarget.style.borderColor = 'rgba(254, 240, 138, 0.6)';
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
              background: 'rgba(254, 240, 138, 0.25)',
              border: '1px solid rgba(254, 240, 138, 0.7)',
              borderRadius: '3px',
              color: '#ffffff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            E
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#fef08a',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
            }}
          >
            {activeClue.examinePrompt}
          </span>
        </div>
      )}

      {/* 2. Sacred Elephant Communion Prompt */}
      {isNearElephant && trackingPhase !== 'ELEPHANT_CINEMATIC' && trackingPhase !== 'RESTORATION_READY' && (
        <div
          data-ui="elephant-commune-prompt"
          onClick={handleTriggerCommunion}
          style={{
            position: 'absolute',
            bottom: 'clamp(32px, 8vh, 64px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 28px',
            borderRadius: '4px',
            background: 'rgba(16, 24, 18, 0.82)',
            border: '1.5px solid rgba(254, 240, 138, 0.75)',
            boxShadow: '0 6px 28px rgba(0, 0, 0, 0.85), 0 0 24px rgba(254, 240, 138, 0.35)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'fadeInUp 0.4s ease-out',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
            e.currentTarget.style.background = 'rgba(24, 36, 28, 0.92)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)';
            e.currentTarget.style.background = 'rgba(16, 24, 18, 0.82)';
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              height: '22px',
              padding: '0 6px',
              background: 'rgba(254, 240, 138, 0.3)',
              border: '1px solid rgba(254, 240, 138, 0.85)',
              borderRadius: '3px',
              color: '#ffffff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            E
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '12.5px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#fffbeb',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.95)',
            }}
          >
            Commune with Sacred Gajaraj ➔
          </span>
        </div>
      )}

      {/* ─── RESTRAINED CINEMATIC SUBTITLES (ZERO CARDS, IN-WORLD NARRATION) ─── */}
      {subtitleText && (
        <div
          data-ui="forest-subtitles"
          style={{
            position: 'absolute',
            bottom: 'clamp(38px, 9vh, 70px)',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            maxWidth: '720px',
            width: '90%',
            pointerEvents: 'none',
            animation: 'fadeInSubtitle 0.8s ease-out',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              padding: 0,
              fontFamily: "'Marcellus', serif",
              fontSize: 'clamp(1.15rem, 2.3vw, 1.45rem)',
              color: '#f8fafc',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              lineHeight: 1.6,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.85)',
            }}
          >
            {subtitleText}
          </p>
        </div>
      )}

      <style>{`
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
