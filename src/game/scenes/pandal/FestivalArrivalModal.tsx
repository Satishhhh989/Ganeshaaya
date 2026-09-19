import { useState, useEffect, useRef } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function FestivalArrivalModal() {
  const { currentScene, presentScenePhase, festivalArrivalStep, playerPos } =
    useGameState();

  const [stepTimer, setStepTimer] = useState(0);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [chantIndex, setChantIndex] = useState(0);

  const isActive = currentScene === 'PANDAL' && presentScenePhase === 'FESTIVAL_PREPARATION';

  // Distance from player to procession palanquin (around Z = 7.2)
  const distToProcession = Math.hypot(playerPos[0] - 0, playerPos[2] - 7.2);
  const isNearProcession = distToProcession < 3.8;

  // Distance from player to pandal altar (around Z = 0)
  const distToAltar = Math.hypot(playerPos[0] - 0, playerPos[2] - 0.2);
  const isNearAltar = distToAltar < 3.2;

  // Initial morning sunrise transition
  useEffect(() => {
    if (!isActive) return;

    audioManager.playTempleBell();
    audioManager.playFloralChime();
    gameStateStore.setFestivalTimeOfDay('MORNING');
    gameStateStore.setFestivalArrivalStep(0);

    // Fade in from dawn black
    let currentFade = 1;
    const fadeInterval = setInterval(() => {
      currentFade -= 0.05;
      if (currentFade <= 0) {
        setFadeOpacity(0);
        clearInterval(fadeInterval);
      } else {
        setFadeOpacity(currentFade);
      }
    }, 50);

    return () => clearInterval(fadeInterval);
  }, [isActive]);

  // Step timer & progression loop
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setStepTimer((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [isActive, festivalArrivalStep]);

  // Step 0: Sunrise sequence -> automatically progresses to Step 1 after 3.8 seconds
  useEffect(() => {
    if (!isActive) return;

    if (festivalArrivalStep === 0 && stepTimer > 3.8) {
      audioManager.playDholTashaBeat();
      audioManager.playShehnaiMelody();
      gameStateStore.setFestivalArrivalStep(1);
      setStepTimer(0);
    }
  }, [isActive, festivalArrivalStep, stepTimer]);

  // Step 1: Hear Procession -> camera swings, then unlocks player controls
  useEffect(() => {
    if (!isActive) return;

    if (festivalArrivalStep === 1 && stepTimer > 3.2) {
      // Unlock controls for player to walk to colony entrance!
      gameStateStore.advancePresentPhase('FESTIVAL_PREPARATION'); // maintains phase
      gameStateStore.setFestivalArrivalStep(2);
      setStepTimer(0);
    }
  }, [isActive, festivalArrivalStep, stepTimer]);

  // Step 3: Walking with procession toward pandal
  const walkTickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isActive || festivalArrivalStep !== 3) return;

    // Vinay walks synchronized with procession
    gameStateStore.setPlayerMotion(1.4, 'CARRY', false, true, false);

    // Cycle festive chants
    const chantInterval = setInterval(() => {
      setChantIndex((prev) => (prev + 1) % 3);
    }, 1800);

    // After ~4.5 seconds of joyful procession walking, arrive at the pandal altar!
    walkTickRef.current = setTimeout(() => {
      gameStateStore.setPlayerMotion(0, 'IDLE', false, false, false);
      gameStateStore.setFestivalArrivalStep(4);
      audioManager.playSacredArtiBell();
      audioManager.playShehnaiMelody();
    }, 4600);

    return () => {
      clearInterval(chantInterval);
      if (walkTickRef.current) clearTimeout(walkTickRef.current);
    };
  }, [isActive, festivalArrivalStep]);

  // Key listeners for in-world interactions
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        if (festivalArrivalStep === 2 && isNearProcession) {
          e.preventDefault();
          joinProcession();
        } else if (festivalArrivalStep === 4) {
          e.preventDefault();
          consecrateGanesha();
        } else if (festivalArrivalStep === 5 && !gameStateStore.playerMotion.isPraying) {
          e.preventDefault();
          offerPrayer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, festivalArrivalStep, isNearProcession]);

  if (!isActive) return null;

  const joinProcession = () => {
    audioManager.playUIClick();
    audioManager.playDholTashaBeat();
    audioManager.playShehnaiMelody();
    gameStateStore.setFestivalArrivalStep(3);
    setStepTimer(0);
  };

  const consecrateGanesha = () => {
    audioManager.playUIClick();
    gameStateStore.setPlayerMotion(0, 'INTERACT', false, false, true);
    // Triggers GaneshaProcession3D placement animation
    // Step 4 triggers murti elevation, then automatically sets step 5 upon touchdown
  };

  const offerPrayer = () => {
    audioManager.playUIClick();
    audioManager.playDevotionalChorus();
    gameStateStore.setPlayerMotion(0, 'PRAY', true, false, false);

    // After peaceful contemplative prayer, seamlessly transition into community celebration!
    setTimeout(() => {
      gameStateStore.setPlayerMotion(0, 'IDLE', false, false, false);
      audioManager.playSacredArtiBell();
      gameStateStore.advancePresentPhase('GANESH_CHATURTHI_CELEBRATION');
    }, 4500);
  };

  const CHANTS = [
    '“Ganpati Bappa Morya! Mangal Murti Morya!”',
    '“Pudhchya Varshi Lavkar Ya!”',
    'Balconies shower marigold petals across the courtyard...',
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 110,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* ─── Sunrise Black-to-Clear Fade Overlay ─── */}
      {fadeOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(30, 20, 10, 0.4), #080604)',
            opacity: fadeOpacity,
            transition: 'opacity 0.1s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ─── Subtle Top Status Indicator (No giant navbar) ─── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '24px',
        }}
      >
        <div
          style={{
            background: 'rgba(12, 9, 6, 0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 183, 3, 0.4)',
            borderRadius: '24px',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ color: '#ffb703', fontSize: '15px' }}>☀️</span>
          <span
            style={{
              color: '#fefae0',
              fontSize: '12px',
              letterSpacing: '2.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Ganesh Chaturthi Morning · Auspicious Arrival
          </span>
        </div>
      </div>

      {/* ─── STEP 0: Sunrise Cinematic Subtitle (Tiny, elegant, no card) ─── */}
      {festivalArrivalStep === 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '60px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(8, 6, 4, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 183, 3, 0.3)',
              borderRadius: '16px',
              padding: '16px 36px',
              animation: 'fadeIn 0.6s ease-out',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Dawn Breaks over the Colony Courtyard
            </div>
            <h1
              style={{
                color: '#fff',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '1px',
                margin: 0,
                textShadow: '0 2px 14px rgba(255, 183, 3, 0.5)',
              }}
            >
              Ganesh Chaturthi Morning
            </h1>
          </div>
        </div>
      )}

      {/* ─── STEP 1: Distant Dhol / Audio Announcement ─── */}
      {festivalArrivalStep === 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '60px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(8, 6, 4, 0.8)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 183, 3, 0.4)',
              borderRadius: '24px',
              padding: '14px 32px',
              animation: 'fadeIn 0.5s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🥁</span>
            <div>
              <div style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
                DISTANT DHOL & SHEHNAI
              </div>
              <div style={{ color: '#fefae0', fontSize: '15px', fontWeight: 600 }}>
                Distant dhol-tasha rhythms echo from the entrance... Bappa is arriving!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Player Walking to Procession with Contextual Prompt ─── */}
      {festivalArrivalStep === 2 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '54px',
          }}
        >
          {isNearProcession ? (
            <button
              onClick={joinProcession}
              style={{
                pointerEvents: 'auto',
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '30px',
                padding: '14px 36px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(255, 183, 3, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'pulse 1.8s infinite ease-in-out',
              }}
            >
              <span
                style={{
                  background: '#1a1005',
                  color: '#ffb703',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 900,
                }}
              >
                E
              </span>
              <span>Join the Procession</span>
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(10, 8, 6, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                borderRadius: '20px',
                padding: '10px 24px',
                color: '#fefae0',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ color: '#ffb703' }}>🚩</span>
              <span>Walk toward the colony street entrance [WASD] to welcome Lord Ganesha</span>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 3: Walking in Joyful Synchronized Procession ─── */}
      {festivalArrivalStep === 3 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '50px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(10, 8, 6, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 183, 3, 0.5)',
              borderRadius: '24px',
              padding: '14px 34px',
              boxShadow: '0 8px 32px rgba(255, 183, 3, 0.25)',
              animation: 'fadeIn 0.4s ease-out',
            }}
          >
            <div style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px' }}>
              JOINED IN CELEBRATION
            </div>
            <div
              style={{
                color: '#fff',
                fontSize: '17px',
                fontWeight: 800,
                marginTop: '4px',
                fontStyle: 'italic',
                textShadow: '0 2px 10px rgba(255, 183, 3, 0.4)',
              }}
            >
              {CHANTS[chantIndex]}
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Consecrate Sri Ganesha on Singhasan Prompt ─── */}
      {festivalArrivalStep === 4 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '54px',
            gap: '10px',
          }}
        >
          <button
            onClick={consecrateGanesha}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #2a9d8f, #264653)',
              color: '#fff',
              border: '2px solid #52b788',
              borderRadius: '32px',
              padding: '14px 38px',
              fontSize: '15.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(42, 157, 143, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'pulse 1.8s infinite ease-in-out',
            }}
          >
            <span
              style={{
                background: '#fff',
                color: '#264653',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 900,
              }}
            >
              E
            </span>
            <span>Consecrate Sri Ganesha on Singhasan</span>
          </button>
        </div>
      )}

      {/* ─── STEP 5: Consecrated & Devotional Prayer Payoff ─── */}
      {festivalArrivalStep === 5 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '54px',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          {gameStateStore.playerMotion.isPraying ? (
            <div
              style={{
                background: 'rgba(10, 8, 6, 0.88)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 183, 3, 0.45)',
                borderRadius: '20px',
                padding: '18px 38px',
                maxWidth: '620px',
                animation: 'fadeIn 0.5s ease-out',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ color: '#ffb703', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px' }}>
                SACRED PRANAM · VIGHNAHARTA HOME
              </div>
              <p style={{ color: '#f3e9dc', fontSize: '15px', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                Standing before Lord Ganesha with folded hands, all the sleepless nights, coding battles, and
                bamboo lashings dissolve into pure peace. Dada’s words echo in your soul — when your devotion is pure,
                the universe clears your path.
              </p>
            </div>
          ) : isNearAltar ? (
            <button
              onClick={offerPrayer}
              style={{
                pointerEvents: 'auto',
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '30px',
                padding: '14px 40px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(255, 183, 3, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'pulse 1.8s infinite ease-in-out',
              }}
            >
              <span
                style={{
                  background: '#1a1005',
                  color: '#ffb703',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 900,
                }}
              >
                E
              </span>
              <span>Offer Pranam (Pray)</span>
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(10, 8, 6, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                borderRadius: '20px',
                padding: '10px 24px',
                color: '#fefae0',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Approach the altar steps to offer your prayers to Lord Ganesha
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '20px' }} />
    </div>
  );
}
