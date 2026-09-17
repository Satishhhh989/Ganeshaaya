import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useGameState, gameStateStore } from '../../core/GameState';
import { shivaAssetManager } from '../../characters/ShivaLazyAsset';
import { MythologyEnvironment } from './MythologyEnvironment';
import { ForestEnvironment } from './ForestEnvironment';
import { GaneshaGuardian3D } from '../../characters/GaneshaGuardian3D';
import { SacredElephant3D } from '../../characters/SacredElephant3D';
import { ShivaController } from '../../player/ShivaController';
import { ConfrontationDialogue } from './ConfrontationDialogue';
import { TrishulCinematicOverlay } from './TrishulCinematicOverlay';
import { RestorationCinematic } from './RestorationCinematic';
import { audioManager } from '../../audio/AudioManager';

/**
 * 3D Scene Elements for Mount Kailash and Forest Exploration
 * Rendered inside the React Three Fiber Canvas
 */
export function MythologyShiva3D() {
  const { shivaPhase } = useGameState();
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const hasTriggeredLoad = useRef(false);

  useEffect(() => {
    if (hasTriggeredLoad.current) return;
    hasTriggeredLoad.current = true;

    // Start mountain ambience
    audioManager.startAmbientMusic();

    // Lazy load the Shiva master asset on entering this scene
    const status = shivaAssetManager.getStatus();
    if (status.loaded && status.model) {
      setModel(status.model);
      setAnimations(status.animations);
    } else {
      shivaAssetManager
        .loadShivaModel()
        .then((fbx) => {
          setModel(fbx);
          setAnimations(shivaAssetManager.getStatus().animations);
        })
        .catch((err) => {
          console.warn('Failed to lazy load Shiva model, using procedural fallback:', err);
        });
    }
  }, []);

  const handleNearGaneshaChange = (isNear: boolean) => {
    if (shivaPhase === 'SHIVA_GAMEPLAY' && isNear) {
      gameStateStore.setShivaPhase('SHIVA_APPROACH');
    } else if (shivaPhase === 'SHIVA_APPROACH' && !isNear) {
      gameStateStore.setShivaPhase('SHIVA_GAMEPLAY');
    }
  };

  const handleTriggerConfrontation = () => {
    audioManager.playUIClick();
    gameStateStore.setShivaPhase('CONFRONTATION');
  };

  const handleNearElephantChange = (isNear: boolean) => {
    gameStateStore.setNearElephant(isNear);
  };

  const handleTriggerElephantEncounter = () => {
    audioManager.playUIClick();
    gameStateStore.setShivaPhase('ELEPHANT_ENCOUNTER');
  };

  const isForestScene =
    shivaPhase === 'SHIVA_SEARCH' || shivaPhase === 'ELEPHANT_ENCOUNTER';

  const isGaneshaFallen =
    shivaPhase === 'GANESHA_AFTERMATH' ||
    shivaPhase === 'RESTORATION_READY' ||
    shivaPhase === 'SHIVA_SEARCH';

  return (
    <group name="MythologyShiva3D">
      {/* ─── Dynamically Alternate Between Mountain Path and Sacred Forest ─── */}
      {isForestScene ? (
        <>
          <ForestEnvironment />
          <SacredElephant3D
            position={[0, 0, -8.5]}
            isCommuning={shivaPhase === 'ELEPHANT_ENCOUNTER'}
          />
        </>
      ) : (
        <>
          <MythologyEnvironment />
          <GaneshaGuardian3D position={[0, 0, -8.6]} isFallen={isGaneshaFallen} />
        </>
      )}

      {/* ─── Third-Person Shiva Player Controller & Camera System ─── */}
      <ShivaController
        shivaPhase={shivaPhase}
        model={model}
        animations={animations}
        onTriggerConfrontation={handleTriggerConfrontation}
        onNearGaneshaChange={handleNearGaneshaChange}
        onNearElephantChange={handleNearElephantChange}
        onTriggerElephantEncounter={handleTriggerElephantEncounter}
      />
    </group>
  );
}

/**
 * 2D DOM Overlays, HUD, Dialogue, and Cinematic Screens for Shiva Gameplay
 * Rendered outside Canvas in HTML DOM
 */
export function MythologyShivaUI() {
  const { shivaPhase, isNearElephant } = useGameState();
  const [modelLoaded, setModelLoaded] = useState(shivaAssetManager.getStatus().loaded);

  // Monitor loading status
  useEffect(() => {
    if (modelLoaded) return;

    const interval = window.setInterval(() => {
      const status = shivaAssetManager.getStatus();
      if (status.loaded) {
        setModelLoaded(true);
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [modelLoaded]);

  // Auto-advance from SHIVA_INTRO to SHIVA_GAMEPLAY after 3.4 seconds
  useEffect(() => {
    if (shivaPhase === 'SHIVA_INTRO') {
      const timer = window.setTimeout(() => {
        gameStateStore.setShivaPhase('SHIVA_GAMEPLAY');
      }, 3400);
      return () => clearTimeout(timer);
    } else if (shivaPhase === 'ELEPHANT_ENCOUNTER') {
      // Auto-advance from encounter to divine transition after 2.6 seconds
      const timer = window.setTimeout(() => {
        gameStateStore.setShivaPhase('DIVINE_TRANSITION');
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [shivaPhase]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 65,
        userSelect: 'none',
      }}
    >
      {/* ─── Seamless Mythological Loading Screen (Only if asset is downloading) ─── */}
      {!modelLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(7, 9, 15, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'auto',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Pulsing Sacred Emblem */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px solid rgba(96, 165, 250, 0.4)',
              borderTopColor: '#60a5fa',
              animation: 'spinAura 1.4s linear infinite',
              marginBottom: '24px',
              boxShadow: '0 0 30px rgba(96, 165, 250, 0.3)',
            }}
          />

          <h3
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '1.8rem',
              color: '#f8fafc',
              margin: '0 0 10px 0',
              letterSpacing: '0.08em',
              textShadow: '0 0 16px rgba(96, 165, 250, 0.5)',
            }}
          >
            Ascending Mount Kailash
          </h3>

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.05rem',
              color: '#93c5fd',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            Manifesting Lord Shiva in the Sacred Himalayan Abode...
          </p>
        </div>
      )}

      {/* ─── SHIVA_INTRO: Cinematic Reveal Title Card ─── */}
      {shivaPhase === 'SHIVA_INTRO' && (
        <div
          style={{
            position: 'absolute',
            top: '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            animation: 'fadeInSlide 1.2s ease-out',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#93c5fd',
              fontSize: '13px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            Sacred Mount Kailash • कैलास पर्वत
          </div>

          <h1
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '2.5rem',
              color: '#ffffff',
              margin: '0 0 12px 0',
              letterSpacing: '0.06em',
              textShadow: '0 2px 18px rgba(0, 0, 0, 0.9), 0 0 24px rgba(96, 165, 250, 0.5)',
            }}
          >
            Lord Shiva Arrives
          </h1>

          <button
            onClick={() => {
              audioManager.playUIClick();
              gameStateStore.setShivaPhase('SHIVA_GAMEPLAY');
            }}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              border: '1px solid rgba(96, 165, 250, 0.7)',
              borderRadius: '24px',
              color: '#ffffff',
              fontFamily: "'Marcellus', serif",
              fontSize: '14px',
              letterSpacing: '0.08em',
              padding: '10px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.45)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Take Control of Shiva [WASD] ➔
          </button>
        </div>
      )}

      {/* ─── SHIVA_GAMEPLAY & SHIVA_APPROACH: Elegant Minimal HUD ─── */}
      {(shivaPhase === 'SHIVA_GAMEPLAY' || shivaPhase === 'SHIVA_APPROACH') && (
        <>
          {/* Top Center Objective Banner */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(10, 14, 24, 0.85)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              borderRadius: '24px',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#60a5fa',
                boxShadow: '0 0 8px #60a5fa',
              }}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: '#f1f5f9',
                letterSpacing: '0.03em',
              }}
            >
              {shivaPhase === 'SHIVA_APPROACH'
                ? 'Guardian spotted ahead. Approach the portal to confront him.'
                : 'Explore the mountain path and approach the sacred cave portal.'}
            </span>
          </div>

          {/* Bottom Controls Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(10, 14, 24, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '6px 20px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              color: '#94a3b8',
              letterSpacing: '0.04em',
              display: 'flex',
              gap: '16px',
            }}
          >
            <span><strong style={{ color: '#e2e8f0' }}>W,A,S,D</strong> Move</span>
            <span><strong style={{ color: '#e2e8f0' }}>Shift</strong> Run</span>
            <span><strong style={{ color: '#e2e8f0' }}>Mouse</strong> Look</span>
          </div>
        </>
      )}

      {/* ─── SHIVA_APPROACH: Interactive Confrontation Prompt ─── */}
      {shivaPhase === 'SHIVA_APPROACH' && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            animation: 'pulseGlow 1.8s infinite alternate',
          }}
        >
          <button
            onClick={() => {
              audioManager.playUIClick();
              gameStateStore.setShivaPhase('CONFRONTATION');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(245, 176, 65, 0.25)',
              border: '1.5px solid #f5b041',
              borderRadius: '28px',
              padding: '12px 32px',
              color: '#ffffff',
              fontFamily: "'Marcellus', serif",
              fontSize: '15px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 176, 65, 0.4)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.backgroundColor = 'rgba(245, 176, 65, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(245, 176, 65, 0.25)';
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: '#f5b041',
                color: '#000000',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              E
            </span>
            <span>Confront Guardian at the Threshold ➔</span>
          </button>
        </div>
      )}

      {/* ─── CONFRONTATION: Escalating 4-Line Dialogue ─── */}
      {shivaPhase === 'CONFRONTATION' && (
        <div style={{ pointerEvents: 'auto' }}>
          <ConfrontationDialogue
            onComplete={() => {
              gameStateStore.setShivaPhase('TRISHUL_CINEMATIC');
            }}
          />
        </div>
      )}

      {/* ─── TRISHUL CINEMATIC & AFTERMATH & RESTORATION_READY ─── */}
      <TrishulCinematicOverlay
        phase={shivaPhase}
        onAdvanceToAftermath={() => {
          gameStateStore.setShivaPhase('GANESHA_AFTERMATH');
        }}
        onAdvanceToRestoration={() => {
          gameStateStore.setShivaPhase('RESTORATION_READY');
        }}
        onAdvanceToSearch={() => {
          gameStateStore.setShivaPhase('SHIVA_SEARCH');
        }}
        onReplaySequence={() => {
          gameStateStore.replayShivaSequence();
        }}
        onReturnHome={() => {
          gameStateStore.returnToHomeScene();
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 4: SHIVA_SEARCH (Forest Exploration & Elephant Quest)
          ═══════════════════════════════════════════════════════════════ */}
      {shivaPhase === 'SHIVA_SEARCH' && (
        <>
          {/* Top Center Forest Objective Banner */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(8, 20, 12, 0.88)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '24px',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
              }}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: '#f0fdf4',
                letterSpacing: '0.03em',
              }}
            >
              {isNearElephant
                ? 'Sacred Gajaraj discovered in the cedar clearing. Approach peacefully.'
                : 'Search the ancient Himalayan forest for the sacred being [WASD to Walk].'}
            </span>
          </div>

          {/* Bottom Controls Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(8, 20, 12, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '6px 20px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              color: '#86efac',
              letterSpacing: '0.04em',
              display: 'flex',
              gap: '16px',
            }}
          >
            <span><strong style={{ color: '#ffffff' }}>W,A,S,D</strong> Move</span>
            <span><strong style={{ color: '#ffffff' }}>Shift</strong> Run</span>
            <span><strong style={{ color: '#ffffff' }}>Mouse</strong> Look</span>
          </div>

          {/* Interactive Elephant Commune Prompt */}
          {isNearElephant && (
            <div
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
                animation: 'pulseGlow 1.8s infinite alternate',
              }}
            >
              <button
                onClick={() => {
                  audioManager.playUIClick();
                  gameStateStore.setShivaPhase('ELEPHANT_ENCOUNTER');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(253, 224, 71, 0.25)',
                  border: '1.5px solid #fde047',
                  borderRadius: '28px',
                  padding: '12px 34px',
                  color: '#ffffff',
                  fontFamily: "'Marcellus', serif",
                  fontSize: '15px',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(253, 224, 71, 0.4)',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.backgroundColor = 'rgba(253, 224, 71, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(253, 224, 71, 0.25)';
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: '#fde047',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  E
                </span>
                <span>Commune with Sacred Elephant ➔</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── ELEPHANT_ENCOUNTER: Brief peaceful commune banner ─── */}
      {shivaPhase === 'ELEPHANT_ENCOUNTER' && (
        <div
          style={{
            position: 'absolute',
            bottom: '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '680px',
            textAlign: 'center',
            backgroundColor: 'rgba(10, 20, 14, 0.9)',
            border: '1px solid rgba(253, 224, 71, 0.5)',
            borderRadius: '20px',
            padding: '18px 32px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.85)',
            backdropFilter: 'blur(14px)',
            animation: 'fadeInSlide 0.8s ease-out',
          }}
        >
          <p
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '1.24rem',
              color: '#fef08a',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            Lord Shiva approaches the sacred celestial elephant in mutual reverence...
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 4 CINEMATICS: Restoration, Awakening, Reunion, Blessing
          ═══════════════════════════════════════════════════════════════ */}
      <RestorationCinematic
        phase={shivaPhase}
        onAdvance={(next) => gameStateStore.setShivaPhase(next)}
        onReturnHome={() => gameStateStore.returnToHomeScene()}
        onReplaySearch={() => gameStateStore.setShivaPhase('SHIVA_SEARCH')}
      />

      <style>{`
        @keyframes spinAura {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInSlide {
          0% { opacity: 0; transform: translate(-50%, -10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes pulseGlow {
          0% { filter: drop-shadow(0 0 6px rgba(245, 176, 65, 0.3)); }
          100% { filter: drop-shadow(0 0 16px rgba(245, 176, 65, 0.7)); }
        }
      `}</style>
    </div>
  );
}
