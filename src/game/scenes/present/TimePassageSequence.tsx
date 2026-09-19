import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function TimePassageSequence() {
  const { presentScenePhase, timePassageStage = 0 } = useGameState();

  // Internal beat index for multi-line cinematic pacing in FINANCIAL_PROBLEM and COMPETITION_DISCOVERY
  const [beatIndex, setBeatIndex] = useState(0);

  // Soft cinematic light sweep effect during time transition
  const [isLightSweeping, setIsLightSweeping] = useState(false);

  // Subtitle animation key to trigger clean fade-ins
  const [animKey, setAnimKey] = useState(0);

  // Continuous timer for the shortened 15-25s growing-up sequence
  const [passageElapsed, setPassageElapsed] = useState(0);

  // Reset beat index when narrative phase changes
  useEffect(() => {
    setBeatIndex(0);
    setAnimKey((prev) => prev + 1);
  }, [presentScenePhase]);

  // Audio triggers for key emotional beats
  useEffect(() => {
    if (presentScenePhase === 'TIME_PASSAGE') {
      audioManager.playTransitionSwell();
      setPassageElapsed(0);
    } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
      audioManager.playClueDiscovered();
    }
  }, [presentScenePhase]);

  // Trigger cinematic light transition wash across the 3D room
  const triggerLightSweep = useCallback((onMidpoint: () => void) => {
    setIsLightSweeping(true);
    audioManager.playFootstep();

    setTimeout(() => {
      onMidpoint();
    }, 380);

    setTimeout(() => {
      setIsLightSweeping(false);
    }, 850);
  }, []);

  // ─── CONTINUOUS 12-SECOND GROWING-UP TIME PASSAGE ENGINE ───
  // Child Vinay -> Passing Seasons / College -> Adult Vinay (10-12s max) -> Problem -> Notification
  const stageRef = useRef(timePassageStage);
  stageRef.current = timePassageStage;

  useEffect(() => {
    if (presentScenePhase !== 'TIME_PASSAGE') return;

    const interval = setInterval(() => {
      setPassageElapsed((prev) => {
        const next = prev + 0.2;

        // t = 2.5s: Transition from Child to School Years
        if (prev < 2.5 && next >= 2.5) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(1);
          });
        }
        // t = 5.5s: Transition from School Years to College Youth
        else if (prev < 5.5 && next >= 5.5) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(2);
          });
        }
        // t = 8.5s: Transition to Adult Vinay
        else if (prev < 8.5 && next >= 8.5) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(3);
            gameStateStore.setAdultProtagonist(true);
          });
        }
        // t = 12.0s: Auto-advance to Financial Problem
        else if (prev < 12.0 && next >= 12.0) {
          triggerLightSweep(() => {
            gameStateStore.advancePresentPhase('FINANCIAL_PROBLEM');
          });
        }

        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [presentScenePhase, triggerLightSweep]);

  // Current subtitle text calculation
  let currentSubtitle: string | null = null;
  let currentChapter = "VINAY'S JOURNEY";

  if (presentScenePhase === 'TIME_PASSAGE') {
    currentChapter = "AFTER A FEW YEARS...";
    if (passageElapsed < 6.0) {
      currentSubtitle = 'Years passed. Vinay grew up.';
    } else if (passageElapsed < 12.0) {
      currentSubtitle = 'Ganesh Chaturthi was approaching... but something weighed on his mind.';
    }
  } else if (presentScenePhase === 'FINANCIAL_PROBLEM') {
    currentChapter = 'A FINANCIAL HURDLE';
    // Single short beat
    currentSubtitle = "“I don't have enough money. How am I going to celebrate Ganesh Chaturthi?”";
  } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
    currentChapter = 'AN OPPORTUNITY';
    currentSubtitle = 'This could be his opportunity to bring Bappa home.';
  }

  // Active check
  const isSequenceActive =
    presentScenePhase === 'TIME_PASSAGE' ||
    presentScenePhase === 'ADULT_PROTAGONIST' ||
    presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE' ||
    presentScenePhase === 'CURRENT_YEAR' ||
    presentScenePhase === 'FINANCIAL_PROBLEM' ||
    presentScenePhase === 'COMPETITION_DISCOVERY';

  // Progression handler on click / Space
  const handleAdvance = useCallback(() => {
    if (isLightSweeping) return;

    audioManager.playUIClick();

    if (presentScenePhase === 'TIME_PASSAGE') {
      if (passageElapsed < 2.5) {
        setPassageElapsed(2.5);
        triggerLightSweep(() => gameStateStore.setTimePassageStage(1));
      } else if (passageElapsed < 5.5) {
        setPassageElapsed(5.5);
        triggerLightSweep(() => gameStateStore.setTimePassageStage(2));
      } else if (passageElapsed < 8.5) {
        setPassageElapsed(8.5);
        triggerLightSweep(() => {
          gameStateStore.setTimePassageStage(3);
          gameStateStore.setAdultProtagonist(true);
        });
      } else {
        triggerLightSweep(() => {
          gameStateStore.advancePresentPhase('FINANCIAL_PROBLEM');
        });
      }
    } else if (
      presentScenePhase === 'ADULT_PROTAGONIST' ||
      presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE' ||
      presentScenePhase === 'CURRENT_YEAR'
    ) {
      triggerLightSweep(() => {
        gameStateStore.advancePresentPhase('FINANCIAL_PROBLEM');
      });
    } else if (presentScenePhase === 'FINANCIAL_PROBLEM') {
      // 1 single short beat -> immediately trigger laptop notification
      triggerLightSweep(() => {
        gameStateStore.advancePresentPhase('COMPETITION_DISCOVERY');
      });
    } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
      // Launch directly into game creation
      triggerLightSweep(() => {
        gameStateStore.advancePresentPhase('GAME_DEVELOPMENT');
      });
    }
  }, [isLightSweeping, presentScenePhase, passageElapsed, triggerLightSweep]);

  // Skip directly to game creation
  const handleSkip = useCallback(() => {
    audioManager.playUIClick();
    gameStateStore.advancePresentPhase('GAME_DEVELOPMENT');
  }, []);

  // Keyboard navigation: Space, Enter, or KeyE
  useEffect(() => {
    if (!isSequenceActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.code === 'Enter' ||
        e.code === 'KeyE' ||
        e.key === 'e' ||
        e.key === 'E'
      ) {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSequenceActive, handleAdvance, handleSkip]);

  if (!isSequenceActive) return null;

  const isFinalAction =
    presentScenePhase === 'COMPETITION_DISCOVERY' && beatIndex >= 2;

  return (
    <div
      onClick={handleAdvance}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
        cursor: 'pointer',
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

      {/* ─── UNOBTRUSIVE TOP CHAPTER INDICATOR ─── */}
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
        {currentChapter}
      </div>

      {/* ─── DISCREET SKIP CONTROL ─── */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        style={{
          position: 'absolute',
          top: 'clamp(14px, 2.5vh, 22px)',
          right: 'clamp(20px, 3.5vw, 44px)',
          zIndex: 97,
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '12px',
          letterSpacing: '0.22em',
          color: 'rgba(250, 245, 235, 0.45)',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '4px 8px',
          transition: 'color 0.2s ease, transform 0.2s ease',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fef08a';
          e.currentTarget.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(250, 245, 235, 0.45)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Skip →
      </div>

      {/* ─── FULL-WIDTH LOWER ATMOSPHERIC GRADIENT (NO BOX / DIRECT OVER 3D WORLD) ─── */}
      {currentSubtitle && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '32vh',
            background:
              'linear-gradient(to top, rgba(7, 4, 6, 0.92) 0%, rgba(18, 10, 16, 0.52) 48%, rgba(7, 4, 6, 0.12) 80%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 93,
          }}
        />
      )}

      {/* ─── NATURAL LAPTOP NOTIFICATION POPUP (DISCOVERY - ENLARGED & NIAT) ─── */}
      {presentScenePhase === 'COMPETITION_DISCOVERY' && (
        <div
          style={{
            position: 'absolute',
            top: 'clamp(32px, 7vh, 60px)',
            right: 'clamp(24px, 4.5vw, 64px)',
            zIndex: 96,
            width: 'clamp(360px, 34vw, 460px)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 46, 0.94) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(254, 240, 138, 0.65)',
            borderRadius: '16px',
            padding: '22px 26px',
            boxShadow:
              '0 20px 48px rgba(0, 0, 0, 0.88), 0 0 36px rgba(251, 191, 36, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            animation: 'notificationSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#fef08a',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Laptop Notification
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.45)',
                fontWeight: 600,
              }}
            >
              Just now
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(16px, 1.8vw, 19px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.04em',
              lineHeight: 1.35,
              marginBottom: '10px',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            NIAT Game Making Championship
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(254, 240, 138, 0.14)',
              border: '1px solid rgba(254, 240, 138, 0.45)',
              borderRadius: '8px',
              padding: '6px 14px',
            }}
          >
            <span style={{ fontSize: '15px' }}>🏆</span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: '#ffd700',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textShadow: '0 0 12px rgba(251, 191, 36, 0.5)',
              }}
            >
              Grand Prize: ₹15,000
            </span>
          </div>
        </div>
      )}

      {/* ─── FLOATING CINEMATIC SUBTITLE NARRATION ─── */}
      {currentSubtitle && (
        <div
          key={`${animKey}-${currentSubtitle}`}
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
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <p
            style={{
              margin: 0,
              padding: 0,
              fontFamily: "'Cinzel', 'Marcellus', 'Georgia', serif",
              fontSize: 'clamp(1.22rem, 1.85vw, 1.58rem)',
              lineHeight: 1.65,
              letterSpacing: '0.025em',
              color: '#fcf8f0',
              fontWeight: 500,
              textShadow:
                '0 2px 14px rgba(0, 0, 0, 0.98), 0 0 28px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(254, 240, 138, 0.25)',
            }}
          >
            {currentSubtitle}
          </p>
        </div>
      )}

      {/* ─── SUBTLE DISCREET CONTINUE PROMPT ─── */}
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
          animation: 'subtlePromptPulse 3.2s ease-in-out infinite alternate',
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
          SPACE / CLICK
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: isFinalAction ? '#ffd700' : 'rgba(254, 240, 138, 0.82)',
            textTransform: 'uppercase',
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
          }}
        >
          {isFinalAction ? 'BEGIN CREATING GAME →' : 'CONTINUE'}
        </span>
      </div>

      {/* ─── SOFT CINEMATIC LIGHT SWEEP OVERLAY (TIME-OF-DAY TRANSITION WASH) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.35) 45%, rgba(12, 7, 10, 0.85) 100%)',
          mixBlendMode: 'screen',
          opacity: isLightSweeping ? 0.92 : 0,
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 98,
        }}
      />

      <style>{`
        @keyframes notificationSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes subtlePromptPulse {
          0% {
            opacity: 0.55;
          }
          100% {
            opacity: 0.92;
          }
        }
      `}</style>
    </div>
  );
}
