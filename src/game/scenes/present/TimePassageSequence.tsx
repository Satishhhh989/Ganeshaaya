import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function TimePassageSequence() {
  const { presentScenePhase, gameBudget } = useGameState();

  // Sub-step index for multi-step phases (like time passage years or dev milestones)
  const [subStep, setSubStep] = useState(0);
  // Reset sub-step when phase changes
  useEffect(() => {
    setSubStep(0);
  }, [presentScenePhase]);

  // Sound effect triggers on key phases
  useEffect(() => {
    if (presentScenePhase === 'TIME_PASSAGE') {
      audioManager.playTransitionSwell();
    } else if (presentScenePhase === 'COMPETITION_WIN') {
      audioManager.playCelebrationChime();
    } else if (presentScenePhase === 'PRIZE_RECEIVED') {
      audioManager.playTempleBell();
    }
  }, [presentScenePhase]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        // Prevent default only if we are in an active sequence phase
        const activePhases = [
          'TIME_PASSAGE',
          'ADULT_PROTAGONIST',
          'ANNUAL_FESTIVAL_MONTAGE',
          'CURRENT_YEAR',
          'FINANCIAL_PROBLEM',
          'COMPETITION_DISCOVERY',
          'COMPETITION_READY',
        ];
        if (activePhases.includes(presentScenePhase)) {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentScenePhase, subStep]);

  // Only render during the present-day post-mythology storyline
  const isSequenceActive = [
    'TIME_PASSAGE',
    'ADULT_PROTAGONIST',
    'ANNUAL_FESTIVAL_MONTAGE',
    'CURRENT_YEAR',
    'FINANCIAL_PROBLEM',
    'COMPETITION_DISCOVERY',
    'COMPETITION_READY',
  ].includes(presentScenePhase);

  if (!isSequenceActive) return null;

  const handleNext = () => {
    audioManager.playUIClick();

    if (presentScenePhase === 'TIME_PASSAGE') {
      if (subStep < 3) {
        setSubStep(subStep + 1);
        audioManager.playFootstep();
      } else {
        gameStateStore.advancePresentPhase('ADULT_PROTAGONIST');
      }
    } else if (presentScenePhase === 'ADULT_PROTAGONIST') {
      gameStateStore.advancePresentPhase('ANNUAL_FESTIVAL_MONTAGE');
    } else if (presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE') {
      if (subStep < 2) {
        setSubStep(subStep + 1);
      } else {
        gameStateStore.advancePresentPhase('CURRENT_YEAR');
      }
    } else if (presentScenePhase === 'CURRENT_YEAR') {
      gameStateStore.advancePresentPhase('FINANCIAL_PROBLEM');
    } else if (presentScenePhase === 'FINANCIAL_PROBLEM') {
      gameStateStore.advancePresentPhase('COMPETITION_DISCOVERY');
    } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
      // Transition directly to playable game development workspace
      gameStateStore.advancePresentPhase('GAME_DEVELOPMENT');
    } else if (presentScenePhase === 'COMPETITION_READY') {
      // Transition to dedicated NIAT Competition auditorium scene
      gameStateStore.advancePresentPhase('COMPETITION');
    }
  };

  // ─── RENDERERS FOR EACH NARRATIVE PHASE ──────────────────────────

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 100,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* Cinematic Top Letterbox Bar */}
      <div
        style={{
          width: '100%',
          height: '64px',
          background: 'linear-gradient(to bottom, rgba(7, 5, 4, 0.95), rgba(7, 5, 4, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxSizing: 'border-box',
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
            Vinay's Journey · Continuing the Tradition
          </span>
        </div>

        {/* Budget HUD Indicator when unlocked */}
        {gameBudget > 0 && (
          <div
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '20px',
              padding: '4px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#d4af37', fontSize: '13px', fontWeight: 700 }}>
              Festival Budget:
            </span>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800 }}>
              ₹{gameBudget.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Center Cinematic Card / Storytelling Stage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        {/* PHASE 1: TIME PASSAGE (2012 → 2024) */}
        {presentScenePhase === 'TIME_PASSAGE' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 169, 109, 0.35)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '680px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 183, 3, 0.15)',
              animation: 'fadeIn 0.6s ease-out',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Passage of Time
            </div>
            <h2
              style={{
                color: '#fff',
                fontSize: '28px',
                margin: '0 0 16px 0',
                fontFamily: "'Georgia', serif",
                letterSpacing: '1px',
              }}
            >
              YEARS HAVE PASSED
            </h2>

            {/* Timeline Stepper */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '28px 0',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  zIndex: 1,
                }}
              />
              {[
                { year: '2012', desc: 'Childhood wonder with Dada' },
                { year: '2016', desc: 'School days & first code' },
                { year: '2020', desc: 'College years & game design' },
                { year: '2024', desc: 'Present Day · Young Adult' },
              ].map((item, idx) => (
                <div
                  key={item.year}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: idx <= subStep ? 1 : 0.35,
                    transition: 'all 0.5s ease',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: idx <= subStep ? '#ffb703' : '#221c17',
                      color: idx <= subStep ? '#1a1005' : '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      border: '2px solid rgba(255, 183, 3, 0.4)',
                      marginBottom: '8px',
                      boxShadow: idx <= subStep ? '0 0 16px rgba(255, 183, 3, 0.6)' : 'none',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ color: '#ffb703', fontWeight: 700, fontSize: '15px' }}>
                    {item.year}
                  </div>
                  <div
                    style={{
                      color: '#c4b5a2',
                      fontSize: '11px',
                      maxWidth: '120px',
                      marginTop: '4px',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                color: '#e0d6c8',
                fontSize: '15px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                margin: '20px 0 0 0',
              }}
            >
              {subStep === 0 &&
                '“The warmth of grandfather’s living room embraced you as a boy, fascinated by the celestial legend of Sri Ganesha.”'}
              {subStep === 1 &&
                '“Seasons turned outside the window. As you grew, your curiosity led you to computers, sketches, and the wonder of video games.”'}
              {subStep === 2 &&
                '“College days arrived. You learned to program game worlds, always remembering Dada’s lessons about overcoming life’s hurdles.”'}
              {subStep === 3 &&
                '“Today, Vinay stands tall as a passionate young adult game developer. But the sacred promise made to Dada remains as bright as ever.”'}
            </p>
          </div>
        )}

        {/* PHASE 2: ADULT PROTAGONIST INTRO */}
        {presentScenePhase === 'ADULT_PROTAGONIST' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 169, 109, 0.35)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '620px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              A Grown Protagonist
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              Twelve Years of Devotion & Dreams
            </h2>
            <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7' }}>
              “I am no longer that little boy on the sofa asking questions. I have grown, studied,
              and learned to create interactive worlds of my own. Yet every autumn, my heart yearns
              for that same joy — the arrival of Sri Ganesha.”
            </p>
          </div>
        )}

        {/* PHASE 3: ANNUAL FESTIVAL MONTAGE */}
        {presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 169, 109, 0.35)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '640px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Annual Tradition Montage · Year {subStep + 1} of 3
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 14px 0' }}>
              {subStep === 0 && 'The Sacred Family Ritual'}
              {subStep === 1 && 'Rangoli, Modaks & Chants'}
              {subStep === 2 && 'Carrying the Torch Forward'}
            </h2>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 183, 3, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                margin: '16px 0',
                color: '#f4ede2',
                fontSize: '15px',
                lineHeight: '1.6',
              }}
            >
              {subStep === 0 &&
                'Every single autumn, Vinay helped bring clay Bappa home. Together with Dada, he lit the fragrant brass diyas and offered sweet steamed modaks.'}
              {subStep === 1 &&
                'As years went by, Vinay began organizing the neighborhood rangoli competitions, drawing vibrant lotus patterns in vibrant vermilion and saffron.'}
              {subStep === 2 &&
                'Now, organizing the neighborhood community pandal has become Vinay’s personal devotion — a promise kept to the grandfather who raised him.'}
            </div>
          </div>
        )}

        {/* PHASE 4: CURRENT YEAR 2024 */}
        {presentScenePhase === 'CURRENT_YEAR' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 169, 109, 0.35)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '620px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Present Day · Bhadrapada Month
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              Ganesh Chaturthi 2024 Arrives
            </h2>
            <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7' }}>
              The calendar on the wall marks the festive date. In just two weeks, the neighborhood
              will gather to welcome Bappa. Vinay sits down at his desk to draft the celebration
              budget.
            </p>
          </div>
        )}

        {/* PHASE 5: FINANCIAL PROBLEM */}
        {presentScenePhase === 'FINANCIAL_PROBLEM' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(230, 57, 70, 0.45)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '640px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(230, 57, 70, 0.15)',
            }}
          >
            <div
              style={{
                color: '#e63946',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              An Unexpected Hurdle
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              The Pandal Funds Dilemma
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                margin: '20px 0',
              }}
            >
              <div
                style={{
                  background: 'rgba(230, 57, 70, 0.12)',
                  border: '1px solid rgba(230, 57, 70, 0.35)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ color: '#aaa', fontSize: '12px' }}>Current Savings</div>
                <div style={{ color: '#e63946', fontSize: '22px', fontWeight: 800 }}>₹450</div>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
                  (After college graduation fees)
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 183, 3, 0.12)',
                  border: '1px solid rgba(255, 183, 3, 0.35)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ color: '#aaa', fontSize: '12px' }}>Pandal Target Budget</div>
                <div style={{ color: '#ffb703', fontSize: '22px', fontWeight: 800 }}>₹15,000</div>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
                  (Idol, bamboo frame, flowers, lights)
                </div>
              </div>
            </div>

            <p style={{ color: '#e0d6c8', fontSize: '14px', lineHeight: '1.6' }}>
              “My savings are nearly empty after paying my final semester expenses... How can I let
              the community down? How can we welcome Bappa without a proper pandal? I cannot give
              up. There must be a way to earn this.”
            </p>
          </div>
        )}

        {/* PHASE 6: COMPETITION DISCOVERY */}
        {presentScenePhase === 'COMPETITION_DISCOVERY' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 183, 3, 0.5)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '650px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 183, 3, 0.2)',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              The Turning Point
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              “Wait... The NIAT Competition!”
            </h2>

            {/* In-game Competition Announcement Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(29, 53, 87, 0.7), rgba(15, 23, 42, 0.8))',
                border: '1px solid #457b9d',
                borderRadius: '12px',
                padding: '20px',
                margin: '18px 0',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span style={{ color: '#ffb703', fontWeight: 800, fontSize: '15px' }}>
                  🎮 NIAT National Game Challenge
                </span>
                <span
                  style={{
                    background: '#e63946',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Deadline: Tonight
                </span>
              </div>
              <div style={{ color: '#a8dadc', fontSize: '13px', marginBottom: '6px' }}>
                Theme: <strong>Indian Heritage & Ancient Legends</strong>
              </div>
              <div
                style={{
                  color: '#f1faee',
                  fontSize: '16px',
                  fontWeight: 700,
                  marginTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '8px',
                }}
              >
                First Place Cash Prize:{' '}
                <span style={{ color: '#2a9d8f', fontSize: '18px' }}>₹15,000</span>
              </div>
            </div>

            <p style={{ color: '#f0e6d2', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
              “Exactly ₹15,000! Just what we need for the pandal! Dada taught me how Ganesha faced
              every trial with courage and wisdom. I have the skills — I will build a game honoring
              His legend!”
            </p>
          </div>
        )}

        {/* PHASE: COMPETITION READY (FINAL BUILD REVIEW & DEEP BREATH) */}
        {presentScenePhase === 'COMPETITION_READY' && (
          <div
            style={{
              background: 'rgba(15, 12, 9, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 180, 216, 0.45)',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '640px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 180, 216, 0.2)',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div
              style={{
                color: '#00b4d8',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Submission Confirmed · Reviewing Build
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
              “The Legend of Vinayaka” Is Complete
            </h2>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(0, 180, 216, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                margin: '16px 0 20px 0',
                textAlign: 'left',
                fontFamily: "'Courier New', monospace",
                fontSize: '12px',
                color: '#90e0ef',
                lineHeight: '1.6',
              }}
            >
              <div>✓ Package: TheLegendOfVinayaka_v1.0.pkg (42.8 MB)</div>
              <div>✓ Target: NIAT National Championship Jury</div>
              <div>✓ Status: Successfully Registered & Verified</div>
            </div>

            <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
              At 11:58 PM, you sit back from your keyboard and take a deep, calm breath.
              Every ounce of devotion, artistic care, and technical effort you possessed has been poured into this project.
              Now, the auditorium doors open for the Grand Finale...
            </p>
          </div>
        )}
      </div>

      {/* Cinematic Bottom Controls Bar */}
      <div
        style={{
          width: '100%',
          height: '80px',
          background: 'linear-gradient(to top, rgba(7, 5, 4, 0.95), rgba(7, 5, 4, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={handleNext}
          style={{
            background: 'linear-gradient(135deg, #ffb703, #fb8500)',
            color: '#1a1005',
            border: 'none',
            borderRadius: '28px',
            padding: '12px 36px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 183, 3, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 183, 3, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 183, 3, 0.4)';
          }}
        >
          <span>
            {presentScenePhase === 'TIME_PASSAGE'
              ? subStep < 3
                ? 'Advance Years →'
                : 'Meet Adult Vinay →'
              : presentScenePhase === 'ADULT_PROTAGONIST'
              ? 'View Festival Memories →'
              : presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE'
              ? subStep < 2
                ? 'Next Year →'
                : 'To Present Day (2024) →'
              : presentScenePhase === 'CURRENT_YEAR'
              ? 'Check Festival Budget →'
              : presentScenePhase === 'FINANCIAL_PROBLEM'
              ? 'Seek a Solution →'
              : presentScenePhase === 'COMPETITION_DISCOVERY'
              ? 'Open Dev Workspace & Build Game →'
              : 'Enter Championship Auditorium →'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 600 }}>[Space / Enter]</span>
        </button>
      </div>
    </div>
  );
}
