import { useState, useEffect, useCallback } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function PostCompetitionTransition() {
  const { currentScene, presentScenePhase } = useGameState();
  const [inspectingBlueprint, setInspectingBlueprint] = useState(false);
  const [fadeOpacity, setFadeOpacity] = useState(0);

  const isPostComp =
    currentScene === 'PRESENT_HOME' &&
    (presentScenePhase === 'PRIZE_RECEIVED' || presentScenePhase === 'PANDAL_READY');

  useEffect(() => {
    if (isPostComp) {
      audioManager.playTempleBell();
    }
  }, [isPostComp]);

  // Handle player interaction: inspecting physical blueprint on desk
  const handleInspectBlueprint = useCallback(() => {
    if (inspectingBlueprint) return;
    audioManager.playFabricRustle();
    audioManager.playUIClick();
    setInspectingBlueprint(true);

    // After brief 2.8s cinematic inspection of the physical blueprint, transition to courtyard
    setTimeout(() => {
      setFadeOpacity(1);
    }, 2200);

    setTimeout(() => {
      audioManager.playTransitionSwell();
      audioManager.playWoodCraft();
      gameStateStore.setPandalPlanningDone(true);
      gameStateStore.advancePresentPhase('PANDAL_BUILDING');
    }, 2900);
  }, [inspectingBlueprint]);

  // Keyboard navigation (E, Space, Enter)
  useEffect(() => {
    if (!isPostComp) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleInspectBlueprint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPostComp, handleInspectBlueprint]);

  if (!isPostComp) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 100,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* ─── 2.39:1 CINEMATIC TOP LETTERBOX BAR ─── */}
      <div
        style={{
          width: '100%',
          height: '7vh',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffb703', fontSize: '15px' }}>🕉</span>
          <span
            style={{
              color: '#f1f5f9',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Morning in the Family Home · A Sacred Promise
          </span>
        </div>

        {/* Minimal Fund Indicator */}
        <div
          style={{
            border: '1px solid rgba(42, 157, 143, 0.5)',
            borderRadius: '16px',
            padding: '3px 14px',
            color: '#2a9d8f',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            background: 'rgba(42, 157, 143, 0.12)',
          }}
        >
          Festival Grant: ₹15,000
        </div>
      </div>

      {/* ─── CENTER: UNOBSTRUCTED CINEMATIC VIEW OR BLUEPRINT CLOSE-UP ─── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        {inspectingBlueprint && (
          <div
            style={{
              position: 'relative',
              maxWidth: '620px',
              width: '85%',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255, 183, 3, 0.25)',
              border: '2px solid rgba(255, 183, 3, 0.5)',
              animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <img
              src="/assets/props/pandal_notebook_blueprint.jpg"
              alt="Hand-drawn Pandal Blueprint on Desk"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(10, 8, 6, 0.95), transparent)',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#ffb703', fontSize: '13px', fontWeight: 700 }}>
                Dada's Sketchbook · Traditional Pandal Blueprint
              </span>
              <span style={{ color: '#6ee7b7', fontSize: '14px', fontWeight: 800 }}>
                Budget: ₹15,000
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2.39:1 CINEMATIC BOTTOM LETTERBOX BAR & SUBTITLES ─── */}
      <div
        style={{
          width: '100%',
          minHeight: '11vh',
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          cursor: inspectingBlueprint ? 'default' : 'pointer',
        }}
        onClick={handleInspectBlueprint}
      >
        {/* Minimal Bottom Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div
            style={{
              color: '#ffb703',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            VINAY
          </div>
          <p
            style={{
              color: '#f8fafc',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: 0,
              fontWeight: 500,
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              fontStyle: 'italic',
            }}
          >
            {inspectingBlueprint
              ? '“Everything is planned. With our ₹15,000 grant, let’s build Bappa’s pandal with our own hands.”'
              : '“Dada... we won. With this ₹15,000 grant, we can finally build Bappa’s pandal for our colony.”'}
          </p>
        </div>

        {/* In-World Interaction Hint */}
        {!inspectingBlueprint && (
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '12px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                backgroundColor: '#ffb703',
                color: '#1a1005',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 800,
              }}
            >
              E
            </span>
            <span style={{ color: '#ffedd5', fontWeight: 600 }}>
              Inspect Blueprint & Head to Courtyard
            </span>
            <span style={{ color: '#475569' }}>·</span>
            <span style={{ color: '#64748b' }}>[Space / Click]</span>
          </div>
        )}
      </div>

      {/* ─── SMOOTH WARM GOLDEN MORNING TRANSITION FADE ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#fffbeb',
          opacity: fadeOpacity,
          pointerEvents: 'none',
          transition: 'opacity 0.85s ease-in-out',
        }}
      />
    </div>
  );
}
