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

  // ─── CONTINUOUS 18-SECOND GROWING-UP TIME PASSAGE ENGINE ───
  // Child Vinay -> School Years -> College Youth -> Adult Vinay (hold 2s) -> 3 short lines -> Financial Problem
  const stageRef = useRef(timePassageStage);
  stageRef.current = timePassageStage;

  useEffect(() => {
    if (presentScenePhase !== 'TIME_PASSAGE') return;

    const interval = setInterval(() => {
      setPassageElapsed((prev) => {
        const next = prev + 0.2;

        // t = 4.0s: Transition from Child to School Years
        if (prev < 4.0 && next >= 4.0) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(1);
          });
        }
        // t = 8.0s: Transition from School Years to College Youth
        else if (prev < 8.0 && next >= 8.0) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(2);
          });
        }
        // t = 12.0s: Transition to Adult Vinay
        else if (prev < 12.0 && next >= 12.0) {
          triggerLightSweep(() => {
            gameStateStore.setTimePassageStage(3);
            gameStateStore.setAdultProtagonist(true);
          });
        }
        // t = 24.5s: Auto-advance to Financial Problem after narration
        else if (prev < 24.5 && next >= 24.5) {
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
    currentChapter = "VINAY'S JOURNEY";
    // 0s to 12.0s: Visual memory flow (no text, room and Vinay transform)
    // 12.0s to 14.0s: Camera settles on Adult Vinay (hold 2s with silence)
    // 14.0s to 17.5s: Line 1
    // 17.5s to 21.0s: Line 2
    // 21.0s to 24.5s: Line 3
    if (passageElapsed >= 14.0 && passageElapsed < 17.5) {
      currentSubtitle = 'Years passed.';
    } else if (passageElapsed >= 17.5 && passageElapsed < 21.0) {
      currentSubtitle = 'But every Ganesh Chaturthi, he returned to the same tradition.';
    } else if (passageElapsed >= 21.0) {
      currentSubtitle = 'This year was different.';
    }
  } else if (presentScenePhase === 'FINANCIAL_PROBLEM') {
    currentChapter = 'AN UNEXPECTED HURDLE';
    const problemLines = [
      'Vinay had promised to build the community pandal himself.',
      'After college graduation fees, his savings were depleted... ₹15,000 was needed.',
      '“How can we welcome Bappa without a proper pandal? I cannot give up.”',
    ];
    currentSubtitle = problemLines[beatIndex] || problemLines[0];
  } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
    currentChapter = 'THE TURNING POINT';
    const compLines = [
      'A sudden notification illuminated his desk: The NIAT National Game Challenge.',
      'Theme: Indian Heritage & Ancient Legends... First Prize: Exactly ₹15,000!',
      '“Vinay had one chance. Build something worth remembering.”',
    ];
    currentSubtitle = compLines[beatIndex] || compLines[0];
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
      // Allow player to fast-forward through montage stages or lines
      if (passageElapsed < 4.0) {
        setPassageElapsed(4.0);
        triggerLightSweep(() => gameStateStore.setTimePassageStage(1));
      } else if (passageElapsed < 8.0) {
        setPassageElapsed(8.0);
        triggerLightSweep(() => gameStateStore.setTimePassageStage(2));
      } else if (passageElapsed < 12.0) {
        setPassageElapsed(12.0);
        triggerLightSweep(() => {
          gameStateStore.setTimePassageStage(3);
          gameStateStore.setAdultProtagonist(true);
        });
      } else if (passageElapsed < 14.0) {
        setPassageElapsed(14.0);
      } else if (passageElapsed < 17.5) {
        setPassageElapsed(17.5);
      } else if (passageElapsed < 21.0) {
        setPassageElapsed(21.0);
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
      if (beatIndex < 2) {
        setBeatIndex((prev) => prev + 1);
        setAnimKey((prev) => prev + 1);
      } else {
        triggerLightSweep(() => {
          gameStateStore.advancePresentPhase('COMPETITION_DISCOVERY');
        });
      }
    } else if (presentScenePhase === 'COMPETITION_DISCOVERY') {
      if (beatIndex < 2) {
        setBeatIndex((prev) => prev + 1);
        setAnimKey((prev) => prev + 1);
      } else {
        // Launch directly into interactive game creation sequence
        triggerLightSweep(() => {
          gameStateStore.advancePresentPhase('GAME_DEVELOPMENT');
        });
      }
    }
  }, [isLightSweeping, presentScenePhase, passageElapsed, beatIndex, triggerLightSweep]);

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
