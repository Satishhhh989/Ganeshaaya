import { useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function PostCompetitionTransition() {
  const { currentScene, presentScenePhase, gameBudget } = useGameState();

  const isPostComp =
    currentScene === 'PRESENT_HOME' &&
    (presentScenePhase === 'PRIZE_RECEIVED' || presentScenePhase === 'PANDAL_READY');

  useEffect(() => {
    if (isPostComp && presentScenePhase === 'PRIZE_RECEIVED') {
      audioManager.playTempleBell();
    }
  }, [isPostComp, presentScenePhase]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPostComp) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isPostComp) return null;

  const handleAdvance = () => {
    audioManager.playUIClick();

    if (presentScenePhase === 'PRIZE_RECEIVED') {
      gameStateStore.advancePresentPhase('PANDAL_READY');
      audioManager.playTempleBell();
    } else if (presentScenePhase === 'PANDAL_READY') {
      audioManager.playTransitionSwell();
      audioManager.playWoodCraft();
      gameStateStore.setPandalPlanningDone(true);
      gameStateStore.advancePresentPhase('PANDAL_BUILDING');
    }
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
        zIndex: 100,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          width: '100%',
          height: '60px',
          background: 'linear-gradient(to bottom, rgba(7, 5, 4, 0.95), rgba(7, 5, 4, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffb703', fontSize: '18px' }}>🕉</span>
          <span
            style={{
              color: '#f0e6d2',
              fontSize: '13px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Dawn in the Family Home · Tradition Alive
          </span>
        </div>

        {/* Budget HUD Indicator */}
        <div
          style={{
            background: 'rgba(42, 157, 143, 0.2)',
            border: '1px solid #2a9d8f',
            borderRadius: '20px',
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#83c5be', fontSize: '12px', fontWeight: 700 }}>
            Festival Funds Secured:
          </span>
          <span style={{ color: '#2a9d8f', fontSize: '15px', fontWeight: 800 }}>
            ₹{gameBudget.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Center Cinematic Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          pointerEvents: 'auto',
        }}
      >
        {presentScenePhase === 'PRIZE_RECEIVED' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(42, 157, 143, 0.5)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '640px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(42, 157, 143, 0.2)',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div
              style={{
                color: '#2a9d8f',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Morning After the Victory
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              Holding the Festival Fund
            </h2>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                margin: '16px 0 20px 0',
              }}
            >
              <div style={{ color: '#aaa', fontSize: '12px' }}>Personal Earnings for Ganesh Chaturthi</div>
              <div style={{ color: '#ffb703', fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>
                ₹15,000
              </div>
            </div>

            <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
              Standing before the brass Ganesha on your desk and the warm photograph of Dada, the
              weight of the challenge transforms into quiet gratitude.
              <br />
              <br />
              <em>
                “With this money, we will build the pandal frame, bring the eco-friendly clay Bappa,
                string the fragrant marigolds, and illuminate the entire street.”
              </em>
            </p>

            <button
              onClick={handleAdvance}
              style={{
                background: 'linear-gradient(135deg, #2a9d8f, #264653)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px 34px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(42, 157, 143, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Look Toward the Pandal →</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
            </button>
          </div>
        )}

        {presentScenePhase === 'PANDAL_READY' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 183, 3, 0.5)',
              borderRadius: '16px',
              padding: '28px 36px',
              maxWidth: '680px',
              width: '92%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 183, 3, 0.25)',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Phase 6 · Pandal Project Planning
            </div>
            <h2 style={{ color: '#fff', fontSize: '22px', margin: '0 0 14px 0' }}>
              Drafting the Pandal Blueprint
            </h2>

            {/* Notebook Blueprint Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 183, 3, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                marginBottom: '16px',
                maxHeight: '220px',
              }}
            >
              <img
                src="/assets/props/pandal_notebook_blueprint.jpg"
                alt="Pandal Blueprint & Budget Breakdown"
                style={{
                  width: '100%',
                  height: '220px',
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                  padding: '8px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700 }}>
                  Architectural Sketch & Budget Plan
                </span>
                <span style={{ color: '#a7f3d0', fontSize: '11px', fontWeight: 800 }}>
                  Total: ₹15,000
                </span>
              </div>
            </div>

            {/* Quick 8-Stage Itemized Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px',
                textAlign: 'left',
                fontSize: '11px',
              }}
            >
              <div>
                <span style={{ color: '#888' }}>1. Bamboo Rig</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹3,000</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>2. Tarpaulin Roof</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹1,800</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>3. Festive Cloth</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹2,200</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>4. Marigolds</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹1,500</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>5. Sacred Rangoli</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹500</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>6. Fairy Lights</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹1,500</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>7. Altar & Diyas</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹1,500</div>
              </div>
              <div>
                <span style={{ color: '#888' }}>8. Sacred Clay Idol</span>
                <div style={{ color: '#ffb703', fontWeight: 700 }}>₹3,000</div>
              </div>
            </div>

            <p style={{ color: '#e0d6c8', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              <em>
                “Dada always taught me that faith and devotion shine brightest when built with honest effort.
                With our ₹15,000 prize from NIAT, every single rupee is dedicated to Bappa's celebration in our colony courtyard.”
              </em>
            </p>

            <button
              onClick={handleAdvance}
              style={{
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '24px',
                padding: '13px 36px',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 25px rgba(255, 183, 3, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <span>Head Down to Colony Courtyard & Begin Construction →</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '60px' }} />
    </div>
  );
}
