import { useState, useEffect } from 'react';
import { useGameState } from '../../core/GameState';
import { useVirtualInputState, virtualInputStore } from './virtualInputStore';
import { interactionManager } from '../../interaction/useInteraction';
import { audioManager } from '../../audio/AudioManager';
import { useForestTracking, forestTrackingStore } from '../../scenes/mythology/ForestExplorationScene';
import { CLUES, type ClueDefinition } from '../../scenes/mythology/ForestClues3D';

/**
 * MobileActionButtons:
 * Minimal, translucent, rounded context-sensitive buttons for mobile devices.
 * 
 * - ONLY rendered on mobile/touch devices.
 * - [ INTERACT ] button:
 *     - Only visible when an active interaction is available (in range & facing target).
 *     - Triggers Dada conversation, Pandal task, Celebration talk, or Forest clue inspection.
 * - [ THROW TRISHUL ] button:
 *     - Only visible strictly during `TRISHUL_AIMING` phase in Mount Kailash scene.
 *     - Launches the sacred Trishul with high-fidelity tactile feedback.
 */
export function MobileActionButtons() {
  const { isTouchDevice, isPortrait } = useVirtualInputState();
  const { currentScene, gameState, shivaPhase, activeInteraction } = useGameState();
  const forestTracking = useForestTracking();

  // Local state to track if an interactable object is within range
  const [canInteract, setCanInteract] = useState(false);
  const [interactLabel, setInteractLabel] = useState('INTERACT');

  const activeClue = forestTracking.nearbyClueId
    ? CLUES.find((c: ClueDefinition) => c.id === forestTracking.nearbyClueId)
    : null;

  useEffect(() => {
    // 1. Check home/pandal global interaction manager
    if (activeInteraction) {
      setCanInteract(true);
      setInteractLabel(activeInteraction.prompt || 'INTERACT');
      return;
    }

    // 2. Check forest exploration scene clues & elephant proximity
    if (currentScene === 'SHIVA_SEQUENCE' && (shivaPhase === 'SHIVA_SEARCH' || shivaPhase === 'ELEPHANT_ENCOUNTER')) {
      if (forestTracking.isNearElephant && forestTracking.trackingPhase !== 'ELEPHANT_CINEMATIC') {
        setCanInteract(true);
        setInteractLabel('COMMUNE');
        return;
      }
      if (activeClue && !forestTracking.isExamining) {
        setCanInteract(true);
        setInteractLabel('EXAMINE');
        return;
      }
    }

    setCanInteract(false);
  }, [activeInteraction, currentScene, shivaPhase, forestTracking, activeClue]);

  // Don't render on desktop, or while portrait orientation overlay is masking the game
  if (!isTouchDevice || isPortrait) {
    return null;
  }

  const isAimingTrishul =
    currentScene === 'SHIVA_SEQUENCE' &&
    (shivaPhase === 'TRISHUL_AIMING' || shivaPhase === 'SHIVA_GAMEPLAY');

  const handleInteractClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    audioManager.playUIClick();

    // Trigger home/pandal interaction
    if (activeInteraction) {
      interactionManager.triggerCurrentInteraction();
      return;
    }

    // Trigger forest interaction
    if (currentScene === 'SHIVA_SEQUENCE') {
      if (forestTracking.isNearElephant) {
        forestTrackingStore.triggerCommunion();
        return;
      }
      if (activeClue) {
        forestTrackingStore.examineClue(activeClue.id);
        return;
      }
    }

    // Inform input store
    virtualInputStore.triggerInteract();
  };

  const handleThrowClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    virtualInputStore.triggerThrow();
  };

  return (
    <div
      data-ui="mobile-actions-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 85,
      }}
    >
      {/* ─── 1. CONTEXTUAL INTERACTION BUTTON ─── */}
      {canInteract && gameState === 'PLAYING' && (
        <div
          data-ui="mobile-interact-btn-container"
          style={{
            position: 'absolute',
            bottom: 'clamp(24px, 6vh, 48px)',
            right: 'clamp(28px, 6vw, 64px)',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          <button
            type="button"
            data-action="true"
            onTouchStart={handleInteractClick}
            onClick={handleInteractClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '32px',
              backgroundColor: 'rgba(22, 16, 12, 0.75)',
              border: '1.5px solid rgba(245, 202, 117, 0.65)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(245, 202, 117, 0.25)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            {/* Minimal Icon Badge */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 202, 117, 0.25)',
                border: '1px solid rgba(245, 202, 117, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fffbeb',
                fontSize: '13px',
              }}
            >
              ✦
            </div>

            {/* Action Label */}
            <span
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: '#f8f4ec',
                textTransform: 'uppercase',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.85)',
              }}
            >
              {interactLabel}
            </span>
          </button>
        </div>
      )}

      {/* ─── 2. CONTEXTUAL TRISHUL THROW BUTTON (AIMING PHASE ONLY) ─── */}
      {isAimingTrishul && (
        <div
          data-ui="mobile-throw-btn-container"
          style={{
            position: 'absolute',
            bottom: 'clamp(28px, 8vh, 56px)',
            right: 'clamp(32px, 8vw, 72px)',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <button
            type="button"
            data-action="true"
            onTouchStart={handleThrowClick}
            onClick={handleThrowClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: 'rgba(32, 20, 14, 0.78)',
              border: '2px solid rgba(254, 240, 138, 0.85)',
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.85), 0 0 24px rgba(250, 204, 21, 0.35), inset 0 0 14px rgba(250, 204, 21, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              cursor: 'pointer',
              outline: 'none',
              gap: '3px',
              transition: 'transform 0.12s ease',
            }}
          >
            <span style={{ fontSize: '18px', color: '#fef08a' }}>⚡</span>
            <span
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '0.16em',
                color: '#ffffff',
                textTransform: 'uppercase',
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.9)',
              }}
            >
              THROW
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
