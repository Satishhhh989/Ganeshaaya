import { useState, useEffect, useRef } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import type { GameDevState } from '../../core/types';

export function WorkspaceDevConsole() {
  const { presentScenePhase, gameDevState } = useGameState();

  // Mini-game playable prototype state for step 4
  const [prototypePos, setPrototypePos] = useState(120);
  const [isDefending, setIsDefending] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '> Project initialized: /workspace/the-legend-of-vinayaka',
    '> Target: NIAT National Game Championship 2024',
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Sync initial dev state when entering GAME_DEVELOPMENT
  useEffect(() => {
    if (presentScenePhase === 'GAME_DEVELOPMENT' && gameDevState === 'NOT_STARTED') {
      gameStateStore.setGameDevState('GAME_PROJECT_STARTED');
      audioManager.playKeyboardClick();
      setTerminalLogs((prev) => [
        ...prev,
        '> Initializing repository: git init vinayaka-legend',
        '> Installing core physics and audio modules... OK',
      ]);
    }
  }, [presentScenePhase, gameDevState]);

  // Keyboard handler for playable prototype (Arrow keys / A / D / Space)
  useEffect(() => {
    if (gameDevState !== 'GAME_PROTOTYPE_PLAYABLE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        setPrototypePos((prev) => Math.max(30, prev - 18));
        audioManager.playFootstep();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        setPrototypePos((prev) => Math.min(210, prev + 18));
        audioManager.playFootstep();
      } else if (e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        setIsDefending(true);
        setTestScore((prev) => prev + 10);
        audioManager.playTempleBell();
        setTimeout(() => setIsDefending(false), 350);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameDevState]);

  const isDevActive =
    presentScenePhase === 'GAME_DEVELOPMENT_READY' ||
    presentScenePhase === 'GAME_DEVELOPMENT';

  if (!isDevActive) return null;

  // Handle step progression
  const handleAdvanceStep = (nextStep: GameDevState, logMessage: string) => {
    audioManager.playKeyboardClick();
    audioManager.playCompileSuccess();

    setTerminalLogs((prev) => [...prev, logMessage]);
    gameStateStore.setGameDevState(nextStep);
  };

  const handleFinishDevelopment = () => {
    audioManager.playKeyboardClick();
    audioManager.playCompileSuccess();
    audioManager.playCelebrationChime();

    setTerminalLogs((prev) => [
      ...prev,
      '> Compiling standalone binary: TheLegendOfVinayaka_v1.0.pkg',
      '> MD5 Checksum verified. Zero compilation warnings.',
      '> Project ready for NIAT jury submission!',
    ]);

    gameStateStore.setGameDevState('GAME_SUBMITTED');

    setTimeout(() => {
      gameStateStore.advancePresentPhase('COMPETITION_READY');
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 90,
        fontFamily: "'Outfit', 'Segoe UI', monospace, sans-serif",
      }}
    >
      {/* Top Header Bar: In-world Workspace Status */}
      <div
        style={{
          width: '100%',
          height: '56px',
          background: 'linear-gradient(to bottom, rgba(5, 7, 12, 0.95), rgba(5, 7, 12, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#00b4d8',
              boxShadow: '0 0 10px #00b4d8',
            }}
          />
          <span
            style={{
              color: '#90e0ef',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Vinayaka Studio Engine v1.4 · Dev Workspace
          </span>
          <span
            style={{
              background: 'rgba(0, 180, 216, 0.15)',
              border: '1px solid rgba(0, 180, 216, 0.35)',
              color: '#caf0f8',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            Project: The Legend of Vinayaka
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: '#aaa', fontSize: '12px' }}>
            Submission Target:{' '}
            <strong style={{ color: '#ffb703' }}>NIAT Championship (₹15,000 Prize)</strong>
          </div>
          <div
            style={{
              background: 'rgba(230, 57, 70, 0.2)',
              border: '1px solid #e63946',
              color: '#ff6b6b',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
            }}
          >
            Deadline: Tonight
          </div>
        </div>
      </div>

      {/* Main Workspace Interactive Dock */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '24px 32px',
          gap: '24px',
          pointerEvents: 'none',
        }}
      >
        {/* Left Diegetic Terminal / Compiler Console */}
        <div
          style={{
            pointerEvents: 'auto',
            width: '380px',
            height: '210px',
            background: 'rgba(7, 10, 18, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 180, 216, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(0, 180, 216, 0.2)',
              paddingBottom: '6px',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: '#00b4d8', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
              TERMINAL & COMPILER OUTPUT
            </span>
            <span style={{ color: '#2a9d8f', fontSize: '10px' }}>● 60 FPS · 42.8 MB</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              color: '#8ecae6',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {terminalLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              color: '#666',
              fontSize: '10px',
            }}
          >
            <span>Branch: main</span>
            <span style={{ color: '#ffb703' }}>State: {gameDevState}</span>
          </div>
        </div>

        {/* Center / Right: Interactive Development Step Controller */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(12, 16, 26, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 183, 3, 0.35)',
            borderRadius: '16px',
            padding: '24px 28px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 180, 216, 0.15)',
          }}
        >
          {/* STEP 1: INITIALIZE */}
          {(gameDevState === 'NOT_STARTED' || gameDevState === 'GAME_PROJECT_STARTED') && (
            <div>
              <div style={{ color: '#00b4d8', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
                STAGE 1 / 5 · ARCHITECTURE
              </div>
              <h3 style={{ color: '#fff', margin: '6px 0 10px 0', fontSize: '18px' }}>
                Initialize Project & Scene Structure
              </h3>
              <p style={{ color: '#c4b5a2', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Vinay sits at his workstation. The goal is clear: create a game capturing the sacred tale
                of Lord Ganesha to win the ₹15,000 championship prize.
              </p>
              <button
                onClick={() =>
                  handleAdvanceStep(
                    'GAME_CONCEPT_CREATED',
                    '> Loading narrative design: "Vigil at Mount Kailash" ... OK'
                  )
                }
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>💻 Create Project "The Legend of Vinayaka"</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Click to Code]</span>
              </button>
            </div>
          )}

          {/* STEP 2: CONCEPT & LORE */}
          {gameDevState === 'GAME_CONCEPT_CREATED' && (
            <div>
              <div style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
                STAGE 2 / 5 · LORE & ENVIRONMENT
              </div>
              <h3 style={{ color: '#fff', margin: '6px 0 10px 0', fontSize: '18px' }}>
                Choose Concept & Mount Kailash Setting
              </h3>
              <p style={{ color: '#c4b5a2', fontSize: '13px', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                Drawing inspiration from Dada's story: Mata Parvati shapes a steadfast young guardian
                from sacred turmeric paste to stand vigil at the snow-capped Himalayan threshold.
              </p>
              <button
                onClick={() =>
                  handleAdvanceStep(
                    'GAME_PROTOTYPE_CREATED',
                    '> Rigging 3D Guardian character mesh ... OK\n> Building procedural Himalayan terrain ... OK'
                  )
                }
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f77f00, #fcbf49)',
                  color: '#1a1005',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>🏔 Rig 3D Guardian & Sacred Gate Environment</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Click to Build]</span>
              </button>
            </div>
          )}

          {/* STEP 3: PROTOTYPE CREATED */}
          {gameDevState === 'GAME_PROTOTYPE_CREATED' && (
            <div>
              <div style={{ color: '#2a9d8f', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
                STAGE 3 / 5 · CHARACTER MECHANICS
              </div>
              <h3 style={{ color: '#fff', margin: '6px 0 10px 0', fontSize: '18px' }}>
                Wire Controls & Gatekeeper Vigil
              </h3>
              <p style={{ color: '#c4b5a2', fontSize: '13px', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                The young guardian model is rigged with fluid walking, running, and staff-defending
                animations. Now let's test the prototype directly in the development sandbox!
              </p>
              <button
                onClick={() =>
                  handleAdvanceStep(
                    'GAME_PROTOTYPE_PLAYABLE',
                    '> Sandbox test mode active. Press Arrow Keys / Space to verify mechanics.'
                  )
                }
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2a9d8f, #264653)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>🎮 Launch Playable Test Sandbox</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Click to Test]</span>
              </button>
            </div>
          )}

          {/* STEP 4: PLAYABLE TEST (INTERACTIVE PROTOTYPE SANDBOX) */}
          {gameDevState === 'GAME_PROTOTYPE_PLAYABLE' && (
            <div>
              <div style={{ color: '#00b4d8', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
                STAGE 4 / 5 · PLAYABLE TESTING SANDBOX
              </div>
              <h3 style={{ color: '#fff', margin: '6px 0 8px 0', fontSize: '18px' }}>
                Testing Young Guardian Prototype
              </h3>

              {/* Integrated Mini Playable Viewport */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '110px',
                  background: 'linear-gradient(to bottom, #10192e, #1a2744)',
                  borderRadius: '8px',
                  border: '1px solid #00b4d8',
                  overflow: 'hidden',
                  margin: '10px 0',
                }}
              >
                {/* Snowy mountain backdrop silhouette */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '0',
                    height: '0',
                    borderLeft: '40px solid transparent',
                    borderRight: '40px solid transparent',
                    borderBottom: '50px solid rgba(255, 255, 255, 0.15)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '30px',
                    width: '0',
                    height: '0',
                    borderLeft: '50px solid transparent',
                    borderRight: '50px solid transparent',
                    borderBottom: '65px solid rgba(255, 255, 255, 0.2)',
                  }}
                />

                {/* Sacred Gate Posts */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '15px',
                    width: '14px',
                    height: '65px',
                    background: '#8b5a2b',
                    borderRadius: '2px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '15px',
                    width: '14px',
                    height: '65px',
                    background: '#8b5a2b',
                    borderRadius: '2px',
                  }}
                />

                {/* Ground */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '18px',
                    background: '#e9ecef',
                    borderTop: '2px solid #ced4da',
                  }}
                />

                {/* Young Guardian Test Sprite */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: `${prototypePos}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'left 0.1s ease-out',
                  }}
                >
                  {/* Golden aura when defending */}
                  {isDefending && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-10px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 183, 3, 0.5), transparent)',
                        animation: 'pulse 0.3s ease-out',
                      }}
                    />
                  )}
                  {/* Head */}
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#e8b88a',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        left: '0',
                        width: '14px',
                        height: '7px',
                        background: '#2c1810',
                        borderRadius: '7px 7px 0 0',
                      }}
                    />
                  </div>
                  {/* Saffron Kurta Body */}
                  <div
                    style={{
                      width: '12px',
                      height: '18px',
                      background: '#ff7733',
                      borderRadius: '2px',
                      position: 'relative',
                    }}
                  >
                    {/* Staff */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '-5px',
                        top: isDefending ? '-12px' : '-4px',
                        width: '3px',
                        height: '26px',
                        background: '#d4af37',
                        transform: isDefending ? 'rotate(-25deg)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Test Feedback Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '8px',
                    color: '#00b4d8',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  Controls: [A/D or Arrows to Move] · [Space/E to Defend]
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    color: '#ffb703',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  Score: {testScore}
                </div>
              </div>

              {/* On-screen control buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setPrototypePos((p) => Math.max(30, p - 25));
                    audioManager.playFootstep();
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#eee',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ◀ Walk Left
                </button>
                <button
                  onClick={() => {
                    setIsDefending(true);
                    setTestScore((s) => s + 10);
                    audioManager.playTempleBell();
                    setTimeout(() => setIsDefending(false), 350);
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 183, 3, 0.15)',
                    color: '#ffb703',
                    border: '1px solid rgba(255, 183, 3, 0.4)',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🛡 Defend Gate!
                </button>
                <button
                  onClick={() => {
                    setPrototypePos((p) => Math.min(210, p + 25));
                    audioManager.playFootstep();
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#eee',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Walk Right ▶
                </button>
              </div>

              <button
                onClick={() =>
                  handleAdvanceStep(
                    'GAME_POLISHED',
                    '> Gameplay mechanics verified: Zero input lag.\n> Adding Tanpura raga soundtrack & sacred lotus shaders...'
                  )
                }
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✓ Prototype Plays Smoothly! Proceed to Polish
              </button>
            </div>
          )}

          {/* STEP 5: POLISH & TANPURA AUDIO */}
          {gameDevState === 'GAME_POLISHED' && (
            <div>
              <div style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>
                STAGE 5 / 5 · SACRED POLISH & SHADERS
              </div>
              <h3 style={{ color: '#fff', margin: '6px 0 10px 0', fontSize: '18px' }}>
                Mastering Soundscapes & Golden Shaders
              </h3>
              <p style={{ color: '#c4b5a2', fontSize: '13px', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                The divine lotus bloom aura is tuned. The Tanpura drone and temple bell chimes are
                seamlessly balanced. The final build package is ready for export!
              </p>
              <button
                onClick={handleFinishDevelopment}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  color: '#1a1005',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 183, 3, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📦 Export Final Build & Submit to NIAT Jury</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Enter Competition]</span>
              </button>
            </div>
          )}

          {/* STEP 6: SUBMITTED CONFIRMATION */}
          {gameDevState === 'GAME_SUBMITTED' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚀</div>
              <h3 style={{ color: '#2a9d8f', margin: '0 0 6px 0', fontSize: '20px' }}>
                Submission Uploaded!
              </h3>
              <p style={{ color: '#e0d6c8', fontSize: '14px', margin: '0' }}>
                "The Legend of Vinayaka" has been officially registered. Transitioning to the NIAT
                National Championship stage...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
