import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { ASSET_CONFIG } from '../../core/assetConfig';
import { audioManager } from '../../audio/AudioManager';

export function InteractionPrompt() {
  const { gameState, presentScenePhase, activeInteraction } = useGameState();
  const [isHovered, setIsHovered] = useState(false);
  const [isProximityMet, setIsProximityMet] = useState(false);
  const isTriggeredRef = useRef(false);

  // High-frequency frame check for continuous proximity & orientation tracking
  useEffect(() => {
    if (gameState !== 'PLAYING' || presentScenePhase !== 'APPROACH') {
      setIsProximityMet(false);
      return;
    }

    let animId: number;
    const checkProximity = () => {
      const state = gameStateStore.getState();
      if (
        state.gameState === 'PLAYING' &&
        state.presentScenePhase === 'APPROACH' &&
        state.playerPos
      ) {
        const [px, , pz] = state.playerPos;
        const [dx, , dz] = ASSET_CONFIG.staging.oldManStanding;
        const diffX = dx - px;
        const diffZ = dz - pz;
        const dist = Math.hypot(diffX, diffZ);

        // Within interactionRadius (~2.5m)
        if (dist <= ASSET_CONFIG.staging.interactionRadius) {
          const rot = state.playerRot ?? 0;
          const forwardX = Math.sin(rot);
          const forwardZ = Math.cos(rot);
          const dirX = diffX / dist;
          const dirZ = diffZ / dist;
          const dot = forwardX * dirX + forwardZ * dirZ;

          // Forgiving cone: generally facing Dada (not walking backwards away)
          const isFacing = dot >= -0.25;
          setIsProximityMet(isFacing);
        } else {
          setIsProximityMet(false);
        }
      } else {
        setIsProximityMet(false);
      }
      animId = requestAnimationFrame(checkProximity);
    };

    animId = requestAnimationFrame(checkProximity);
    return () => cancelAnimationFrame(animId);
  }, [gameState, presentScenePhase]);

  const isVisible =
    gameState === 'PLAYING' &&
    presentScenePhase === 'APPROACH' &&
    (isProximityMet || Boolean(activeInteraction && activeInteraction.id === 'npc_old_man'));

  const triggerInteraction = useCallback(() => {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;

    audioManager.playTempleBell();
    gameStateStore.setActiveInteraction(null);
    gameStateStore.setPresentScenePhase('INITIAL_DIALOGUE');
    gameStateStore.startDialogue();

    setTimeout(() => {
      isTriggeredRef.current = false;
    }, 400);
  }, []);

  // Keyboard navigation [E] active strictly when within proximity
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        e.stopPropagation();
        triggerInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, triggerInteraction]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVisible) {
      triggerInteraction();
    }
  };

  return (
    <div
      data-ui="prompt-wrapper"
      style={{
        position: 'fixed',
        bottom: '22%',
        left: '50%',
        transform: `translateX(-50%) translateY(${isVisible ? '0px' : '12px'}) scale(${isVisible ? 1.0 : 0.92})`,
        zIndex: 65,
        pointerEvents: isVisible ? 'auto' : 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        data-ui="prompt"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: isHovered
            ? 'linear-gradient(180deg, rgba(46, 20, 36, 0.96) 0%, rgba(26, 10, 20, 0.98) 100%)'
            : 'linear-gradient(180deg, rgba(32, 14, 25, 0.88) 0%, rgba(18, 8, 15, 0.92) 100%)',
          border: isHovered
            ? '1.5px solid #ffde8a'
            : '1px solid rgba(229, 192, 123, 0.65)',
          borderRadius: '8px',
          padding: '10px 22px',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isHovered
            ? '0 0 20px rgba(229, 192, 123, 0.5), 0 8px 24px rgba(0, 0, 0, 0.8)'
            : '0 0 10px rgba(229, 192, 123, 0.2), 0 4px 16px rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transform: isHovered ? 'scale(1.04)' : 'scale(1.0)',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Minimal key badge: [ E ] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: 'rgba(229, 192, 123, 0.18)',
            border: '1px solid rgba(229, 192, 123, 0.65)',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          E
        </div>

        {/* Action Prompt Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: isHovered ? '#ffffff' : '#f5e8d2',
              textTransform: 'uppercase',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
              transition: 'color 0.15s ease',
            }}
          >
            TALK TO DADA
          </span>
          <div
            style={{
              width: '24px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(229, 192, 123, 0.7), transparent)',
            }}
          />
        </div>
      </button>
    </div>
  );
}
