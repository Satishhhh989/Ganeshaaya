import { useState, useEffect, useCallback } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
// PlayablePrototypeMiniGame replaced by full GameArcade system

export function WorkspaceDevConsole() {
  const { presentScenePhase } = useGameState();

  // Development Challenge Steps:
  // 0: Establishing shot (Vinay at desk, determining to create a masterpiece)
  // 1: Choose Concept
  // 2: Choose Environment
  // 3: Choose Core Mechanic
  // 4: Assemble Systems (Connect Nodes)
  // 5: Fix Bug (Rebind physics / collision node)
  // 6: Playtest Prototype (Interactive playable canvas game)
  // 7: Build Complete & Submit to N-I-A-T
  const [devStep, setDevStep] = useState(0);

  // Selected options
  const [selectedConcept, setSelectedConcept] = useState('THE_LEGEND_OF_GANESHA');
  const [selectedEnv, setSelectedEnv] = useState('SACRED_KAILASH_AND_GROVE');
  const [selectedMechanic, setSelectedMechanic] = useState('SACRED_OFFERINGS');
  const [systemsConnected, setSystemsConnected] = useState(false);
  const [bugFixed, setBugFixed] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const isDevActive =
    presentScenePhase === 'GAME_DEVELOPMENT_READY' ||
    presentScenePhase === 'GAME_DEVELOPMENT';

  // Establishing shot timer: automatically transitions to Step 1 after 2.4s
  useEffect(() => {
    if (!isDevActive) return;

    setDevStep(0);
    setSystemsConnected(false);
    setBugFixed(false);
    audioManager.playKeyboardClick();

    const establishingTimer = setTimeout(() => {
      setDevStep(1);
      setAnimKey((prev) => prev + 1);
    }, 2400);

    return () => clearTimeout(establishingTimer);
  }, [isDevActive]);

  // Step 7: Auto-advance to competition after final reflection
  useEffect(() => {
    if (devStep !== 7) return;

    const finishTimer = setTimeout(() => {
      audioManager.playCelebrationChime();
      gameStateStore.advancePresentPhase('COMPETITION');
    }, 3800);

    return () => clearTimeout(finishTimer);
  }, [devStep]);

  // Keyboard navigation helper
  const handleNextStep = useCallback(() => {
    audioManager.playKeyboardClick();

    if (devStep === 0) {
      setDevStep(1);
      setAnimKey((k) => k + 1);
    } else if (devStep === 1) {
      audioManager.playTempleBell();
      setDevStep(2);
      setAnimKey((k) => k + 1);
    } else if (devStep === 2) {
      audioManager.playTempleBell();
      setDevStep(3);
      setAnimKey((k) => k + 1);
    } else if (devStep === 3) {
      audioManager.playFloralChime();
      setDevStep(4);
      setAnimKey((k) => k + 1);
    } else if (devStep === 4) {
      setSystemsConnected(true);
      audioManager.playLightsIgnite();
      setTimeout(() => {
        setDevStep(5);
        setAnimKey((k) => k + 1);
      }, 700);
    } else if (devStep === 5) {
      setBugFixed(true);
      audioManager.playSacredArtiBell();
      setTimeout(() => {
        setDevStep(6);
        setAnimKey((k) => k + 1);
      }, 800);
    } else if (devStep === 7) {
      audioManager.playCelebrationChime();
      gameStateStore.advancePresentPhase('COMPETITION');
    }
  }, [devStep]);

  // Global keydown listeners for E, Space, Enter
  useEffect(() => {
    if (!isDevActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (devStep === 6) return; // In playable mini-game, WASD and arrows are used

      if (
        e.code === 'Space' ||
        e.code === 'Enter' ||
        e.code === 'KeyE' ||
        e.key === 'e' ||
        e.key === 'E'
      ) {
        e.preventDefault();
        handleNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevActive, devStep, handleNextStep]);

  if (!isDevActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* ─── CINEMATIC WIDESCREEN LETTERBOX BARS (2.39:1 FILM RATIO) ─── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6vh',
          backgroundColor: '#050304',
          zIndex: 96,
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6vh',
          backgroundColor: '#050304',
          zIndex: 96,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      />

      {/* ─── UNOBTRUSIVE TOP CONTEXT LABEL ─── */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(14px, 2.5vh, 22px)',
          left: 'clamp(20px, 3.5vw, 44px)',
          zIndex: 97,
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.35em',
          color: 'rgba(254, 240, 138, 0.78)',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
          pointerEvents: 'none',
        }}
      >
        NIIT GAME MAKING CHAMPIONSHIP · ₹15,000 PRIZE
      </div>

      {/* ─── INTERACTIVE WORKSTATION MONITOR INTERFACE ─── */}
      {devStep >= 1 && devStep <= 5 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '92%',
            maxWidth: '660px',
            background: 'rgba(12, 10, 15, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(254, 240, 138, 0.35)',
            borderRadius: '12px',
            padding: '24px 28px',
            boxSizing: 'border-box',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 40px rgba(251, 191, 36, 0.12)',
            zIndex: 94,
            animation: 'fadeIn 0.4s ease forwards',
          }}
        >
          {/* STEP 1: CHOOSE CONCEPT */}
          {devStep === 1 && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '11px',
                  letterSpacing: '0.25em',
                  color: 'rgba(254, 240, 138, 0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Step 1 of 5 · Game Concept
              </div>
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 16px 0',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '20px',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                Choose Narrative Vision
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {[
                  { id: 'THE_LEGEND_OF_GANESHA', icon: '🕉️', title: 'The First Prayer', desc: 'Ganesha’s divine awakening & devotion' },
                  { id: 'MOUNTAIN_STANDSTILL', icon: '⛰️', title: 'Kailash Standstill', desc: 'The encounter with Lord Shiva' },
                  { id: 'FOREST_PILGRIMAGE', icon: '🌿', title: 'Sacred Grove', desc: 'The celestial journey with Sri Gajaraj' },
                ].map((c) => {
                  const isSel = selectedConcept === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedConcept(c.id);
                        audioManager.playUIClick();
                      }}
                      style={{
                        background: isSel ? 'rgba(245, 176, 65, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSel ? '1.5px solid #fef08a' : '1px solid rgba(254, 240, 138, 0.25)',
                        borderRadius: '8px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transform: isSel ? 'scale(1.02)' : 'scale(1.0)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{c.icon}</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 700, color: isSel ? '#fef08a' : '#ffffff', marginBottom: '4px' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3 }}>{c.desc}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNextStep}
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Concept ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE ENVIRONMENT */}
          {devStep === 2 && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '11px',
                  letterSpacing: '0.25em',
                  color: 'rgba(254, 240, 138, 0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Step 2 of 5 · World Environment
              </div>
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 16px 0',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '20px',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                Select World Atmosphere
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {[
                  { id: 'SACRED_KAILASH_AND_GROVE', icon: '🏔️', title: 'Himalayan Grove', desc: 'Sunlit cedar trees and ancient stones' },
                  { id: 'COLONY_COURTYARD', icon: '🪔', title: 'Community Pandal', desc: 'Festive marigolds and glowing diyas' },
                  { id: 'COSMIC_THRESHOLD', icon: '🌌', title: 'Sacred Threshold', desc: 'Radiant prabhavali and lotus shrine' },
                ].map((env) => {
                  const isSel = selectedEnv === env.id;
                  return (
                    <div
                      key={env.id}
                      onClick={() => {
                        setSelectedEnv(env.id);
                        audioManager.playUIClick();
                      }}
                      style={{
                        background: isSel ? 'rgba(245, 176, 65, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSel ? '1.5px solid #fef08a' : '1px solid rgba(254, 240, 138, 0.25)',
                        borderRadius: '8px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transform: isSel ? 'scale(1.02)' : 'scale(1.0)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{env.icon}</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 700, color: isSel ? '#fef08a' : '#ffffff', marginBottom: '4px' }}>
                        {env.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3 }}>{env.desc}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNextStep}
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Select Environment ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE GAMEPLAY MECHANIC */}
          {devStep === 3 && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '11px',
                  letterSpacing: '0.25em',
                  color: 'rgba(254, 240, 138, 0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Step 3 of 5 · Gameplay Mechanics
              </div>
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 16px 0',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '20px',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                Select Core Interactive Loop
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {[
                  { id: 'SACRED_OFFERINGS', icon: '🥟', title: 'Sacred Offerings', desc: 'Gather golden modaks & offer at shrine' },
                  { id: 'TRISHUL_PRECISION', icon: '🔱', title: 'Trishul Aiming', desc: 'Focus divine charge & projectile release' },
                  { id: 'TRACKING_CLUES', icon: '🐾', title: 'Mythic Tracking', desc: 'Follow elephant footprints through grove' },
                ].map((mech) => {
                  const isSel = selectedMechanic === mech.id;
                  return (
                    <div
                      key={mech.id}
                      onClick={() => {
                        setSelectedMechanic(mech.id);
                        audioManager.playUIClick();
                      }}
                      style={{
                        background: isSel ? 'rgba(245, 176, 65, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSel ? '1.5px solid #fef08a' : '1px solid rgba(254, 240, 138, 0.25)',
                        borderRadius: '8px',
                        padding: '14px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transform: isSel ? 'scale(1.02)' : 'scale(1.0)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{mech.icon}</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 700, color: isSel ? '#fef08a' : '#ffffff', marginBottom: '4px' }}>
                        {mech.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3 }}>{mech.desc}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNextStep}
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Configure Mechanics ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ASSEMBLE SYSTEMS (NODE CONNECTION) */}
          {devStep === 4 && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '11px',
                  letterSpacing: '0.25em',
                  color: 'rgba(254, 240, 138, 0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Step 4 of 5 · System Pipeline
              </div>
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 16px 0',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '20px',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                Connect System Modules
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '18px 10px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(254, 240, 138, 0.3)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ padding: '10px 14px', background: '#1e293b', borderRadius: '6px', border: '1px solid #38bdf8', fontSize: '11px', color: '#bae6fd', fontWeight: 600 }}>
                  🎮 Player Input
                </div>
                <div style={{ color: systemsConnected ? '#22c55e' : '#94a3b8', fontSize: '18px' }}>➔</div>
                <div style={{ padding: '10px 14px', background: '#1e293b', borderRadius: '6px', border: '1px solid #eab308', fontSize: '11px', color: '#fef08a', fontWeight: 600 }}>
                  ⚖️ Sacred Physics
                </div>
                <div style={{ color: systemsConnected ? '#22c55e' : '#94a3b8', fontSize: '18px' }}>➔</div>
                <div style={{ padding: '10px 14px', background: '#1e293b', borderRadius: '6px', border: '1px solid #a855f7', fontSize: '11px', color: '#f3e8ff', fontWeight: 600 }}>
                  ✨ Altar Renderer
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNextStep}
                  style={{
                    background: systemsConnected
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #d97706, #b45309)',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {systemsConnected ? '✓ Pipeline Connected!' : 'Connect System Pipeline ➔'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FIX BUG */}
          {devStep === 5 && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '11px',
                  letterSpacing: '0.25em',
                  color: 'rgba(254, 240, 138, 0.75)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Step 5 of 5 · Quality Assurance
              </div>
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 16px 0',
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '20px',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                Resolve Collision Disconnect
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  background: bugFixed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: bugFixed ? '1px solid #22c55e' : '1px solid #ef4444',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{bugFixed ? '✅' : '⚠️'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: bugFixed ? '#86efac' : '#fca5a5' }}>
                    {bugFixed ? 'All Checks Passed: Collision Bounds Verified' : 'Warning: Sacred Altar Trigger Unbound'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '3px' }}>
                    {bugFixed ? 'Player can now gather offerings and approach the lotus shrine.' : 'The modaks cannot register without the active trigger listener.'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNextStep}
                  style={{
                    background: bugFixed
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #d97706, #b45309)',
                    border: '1px solid #fef08a',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {bugFixed ? '✓ Fixed! Launching Playtest...' : 'Fix Collision Node & Launch Sandbox ➔'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 6: PLAYTEST GAME ARCADE (10 GANESHA-THEMED MINI-GAMES) ─── */}
      {devStep === 6 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '92%',
            maxWidth: '500px',
            zIndex: 95,
            animation: 'fadeIn 0.5s ease forwards',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(12, 10, 15, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(254, 240, 138, 0.35)',
              borderRadius: '14px',
              padding: '32px 28px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 40px rgba(251, 191, 36, 0.12)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🕉️</div>
            <div
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'rgba(254, 240, 138, 0.75)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Step 6 of 7 · Playtest
            </div>
            <h2
              style={{
                margin: '0 0 8px 0',
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.06em',
              }}
            >
              Your Game Arcade is Ready
            </h2>
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.5,
              }}
            >
              10 Ganesha-themed mini-games await inside your arcade.
              <br />
              Play, explore, and test your creation.
            </p>
            <button
              onClick={() => {
                audioManager.playCelebrationChime();
                gameStateStore.enterArcade();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(217,119,6,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(217,119,6,0.25)';
              }}
              style={{
                padding: '12px 40px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #d97706, #fbbf24aa)',
                border: '1px solid #fef08a66',
                color: '#000',
                fontFamily: "'Cinzel', serif",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(217,119,6,0.25)',
                transition: 'all 0.2s ease',
                marginBottom: '12px',
              }}
            >
              ▶ Enter Arcade
            </button>
            <br />
            <button
              onClick={() => {
                setDevStep(7);
                setAnimKey((k) => k + 1);
              }}
              style={{
                padding: '8px 24px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(254,240,138,0.4)';
                e.currentTarget.style.color = 'rgba(254,240,138,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              Skip → Submit to NIIT
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 7: BUILD SUBMITTED & VICTORY REFLECTION ─── */}
      {devStep === 7 && (
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 95,
            animation: 'fadeInUp 0.6s ease forwards',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '14px',
              letterSpacing: '0.35em',
              color: '#fef08a',
              textTransform: 'uppercase',
              marginBottom: '14px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
            }}
          >
            N · I · I · T   G A M E   M A K I N G   C H A M P I O N S H I P
          </div>
          <h1
            style={{
              margin: '0 0 14px 0',
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(2.0rem, 3.4vw, 2.8rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.08em',
              textShadow: '0 2px 14px rgba(254, 240, 138, 0.5)',
            }}
          >
            The Legend of Vinayaka
          </h1>
          <p
            style={{
              margin: '0 0 18px 0',
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '15px',
              color: '#bae6fd',
              fontStyle: 'italic',
            }}
          >
            ✓ Build Compiled & Submitted to National Grand Finale
          </p>
        </div>
      )}

      {/* ─── CINEMATIC LOWER SUBTITLE OVERLAY ─── */}
      <div
        key={animKey}
        style={{
          position: 'absolute',
          bottom: 'clamp(44px, 8.5vh, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '860px',
          textAlign: 'center',
          zIndex: 95,
          pointerEvents: 'none',
        }}
      >
        {devStep === 0 && (
          <p
            style={{
              margin: 0,
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(1.22rem, 1.85vw, 1.58rem)',
              lineHeight: 1.65,
              color: '#fcf8f0',
              fontWeight: 500,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.98)',
              animation: 'fadeInUp 0.6s ease forwards',
            }}
          >
            Vinay had one chance. Build something worth remembering.
          </p>
        )}

        {devStep === 7 && (
          <p
            style={{
              margin: 0,
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(1.28rem, 1.9vw, 1.62rem)',
              lineHeight: 1.65,
              color: '#fef08a',
              fontStyle: 'italic',
              fontWeight: 500,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.98)',
              animation: 'fadeInUp 0.6s ease forwards',
            }}
          >
            “Maybe this will be enough to bring Bappa home.”
          </p>
        )}
      </div>

      {/* ─── BOTTOM CONTROL HINT (Hidden during mini-game playtest) ─── */}
      {devStep !== 6 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(14px, 2.8vh, 26px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 97,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              padding: '2px 7px',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              borderRadius: '3px',
              color: '#ffffff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            SPACE / ENTER / E
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              color: devStep === 7 ? '#ffd700' : 'rgba(254, 240, 138, 0.82)',
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
            }}
          >
            {devStep === 7 ? 'ENTERING GRAND FINALE AUDITORIUM →' : 'ADVANCE'}
          </span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -46%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
