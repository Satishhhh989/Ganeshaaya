import { useEffect, useState, useRef } from 'react';
import { useGameState, gameStateStore } from '../core/GameState';
import { audioManager } from '../audio/AudioManager';

interface SceneTransitionInfo {
  title: string;
  subtitle: string;
  icon: string;
}

const SCENE_INFO: Record<string, SceneTransitionInfo> = {
  MYTHOLOGY_CREATION: {
    title: 'The Legend of Lord Ganesha',
    subtitle: 'The Sacred Tale of Divine Creation',
    icon: '🕉️',
  },
  SHIVA_SEQUENCE: {
    title: 'Mount Kailash · The Threshold',
    subtitle: 'Lord Shiva Returns to the Celestial Peaks',
    icon: '🏔️',
  },
  NIAT_COMPETITION: {
    title: 'NIAT National Championship',
    subtitle: 'Grand Auditorium · The Championship Presentation',
    icon: '🏆',
  },
  PANDAL: {
    title: 'Ganesh Chaturthi Mahotsav',
    subtitle: 'The Community Grounds · Dedicated to Vighnaharta',
    icon: '🪔',
  },
};

export function TransitionOverlay() {
  const { currentScene, presentScenePhase } = useGameState();
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [goldenGlowOpacity, setGoldenGlowOpacity] = useState(0);
  const [info, setInfo] = useState<SceneTransitionInfo | null>(null);
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const prevSceneRef = useRef(currentScene);

  // 1. Transition into Mythology
  useEffect(() => {
    if (presentScenePhase !== 'TRANSITION_TO_MYTHOLOGY') return;

    setIsTransitionActive(true);
    setInfo(SCENE_INFO.MYTHOLOGY_CREATION);

    audioManager.fadeAmbientVolume(0.08, 2.0);
    audioManager.playTransitionSwell();

    const glowTimer = setTimeout(() => {
      setGoldenGlowOpacity(0.9);
    }, 400);

    const fadeTimer = setTimeout(() => {
      setFadeOpacity(1);
    }, 1200);

    const switchTimer = setTimeout(() => {
      gameStateStore.enterMythologyScene();
    }, 2600);

    const revealTimer = setTimeout(() => {
      setGoldenGlowOpacity(0);
      setFadeOpacity(0);
    }, 3000);

    const cleanupTimer = setTimeout(() => {
      setIsTransitionActive(false);
      setInfo(null);
    }, 4200);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(fadeTimer);
      clearTimeout(switchTimer);
      clearTimeout(revealTimer);
      clearTimeout(cleanupTimer);
    };
  }, [presentScenePhase]);

  // 2. Universal Scene Transitions (e.g. going to SHIVA_SEQUENCE, NIAT_COMPETITION, PANDAL)
  useEffect(() => {
    if (currentScene === prevSceneRef.current) return;
    const oldScene = prevSceneRef.current;
    prevSceneRef.current = currentScene;

    // Only show cinematic card for major distinct scene shifts
    if (
      (currentScene === 'SHIVA_SEQUENCE' ||
        currentScene === 'NIAT_COMPETITION' ||
        currentScene === 'PANDAL') &&
      oldScene !== 'PRESENT_HOME'
    ) {
      const sceneData = SCENE_INFO[currentScene];
      if (sceneData) {
        setIsTransitionActive(true);
        setInfo(sceneData);
        audioManager.playTransitionSwell();

        setFadeOpacity(1);
        setGoldenGlowOpacity(0.85);

        const fadeOutTimer = setTimeout(() => {
          setFadeOpacity(0);
          setGoldenGlowOpacity(0);
        }, 1800);

        const cleanupTimer = setTimeout(() => {
          setIsTransitionActive(false);
          setInfo(null);
        }, 2600);

        return () => {
          clearTimeout(fadeOutTimer);
          clearTimeout(cleanupTimer);
        };
      }
    }
  }, [currentScene]);

  const handleSkip = () => {
    if (presentScenePhase === 'TRANSITION_TO_MYTHOLOGY') {
      gameStateStore.enterMythologyScene();
    }
    setGoldenGlowOpacity(0);
    setFadeOpacity(0);
    setIsTransitionActive(false);
    setInfo(null);
  };

  if (!isTransitionActive) return null;

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        pointerEvents: fadeOpacity > 0.4 ? 'auto' : 'none',
        cursor: 'pointer',
      }}
    >
      {/* Warm Golden Divine Halo Pulse */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 195, 56, 0.35) 0%, rgba(220, 106, 32, 0.2) 45%, transparent 75%)',
          opacity: goldenGlowOpacity,
          transition: 'opacity 1.0s ease-in-out',
          pointerEvents: 'none',
        }}
      />

      {/* Deep Ethereal Dark Fade (Never blank white) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#070503',
          opacity: fadeOpacity,
          transition: 'opacity 0.9s ease-in-out',
          pointerEvents: 'none',
        }}
      />

      {/* Contextual Sanskrit / Narrative Title Card */}
      {info && (
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#f5ca75',
            opacity: goldenGlowOpacity,
            transition: 'opacity 0.8s ease-in-out',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{info.icon}</div>
          <div
            style={{
              fontFamily: "'Marcellus', 'Cinzel', serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textShadow: '0 0 28px rgba(245, 202, 117, 0.85)',
              marginBottom: '10px',
            }}
          >
            {info.title}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14.5px',
              letterSpacing: '0.18em',
              color: 'rgba(250, 240, 220, 0.85)',
              textTransform: 'uppercase',
              marginBottom: '22px',
            }}
          >
            {info.subtitle}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(245, 202, 117, 0.75)',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.12em',
            }}
          >
            [Click or Space to continue ➔]
          </div>
        </div>
      )}
    </div>
  );
}
