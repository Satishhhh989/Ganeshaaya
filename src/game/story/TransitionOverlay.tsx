import { useEffect, useState, useRef } from 'react';
import { useGameState, gameStateStore } from '../core/GameState';
import { audioManager } from '../audio/AudioManager';

interface SceneTransitionInfo {
  title: string;
  subtitle: string;
}

const SCENE_INFO: Record<string, SceneTransitionInfo> = {
  MYTHOLOGY_CREATION: {
    title: 'The Sacred Memory',
    subtitle: 'The Creation of Lord Ganesha',
  },
  SHIVA_SEQUENCE: {
    title: 'Mount Kailash',
    subtitle: 'The Celestial Peaks of Mahadev',
  },
  NIAT_COMPETITION: {
    title: 'National Innovation Arena',
    subtitle: 'Vinay’s Championship Showcase',
  },
  PANDAL: {
    title: 'Ganesh Chaturthi Mahotsav',
    subtitle: 'Dedicated to Vighnaharta',
  },
};

export function TransitionOverlay() {
  const { currentScene, presentScenePhase } = useGameState();
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [goldenGlowOpacity, setGoldenGlowOpacity] = useState(0);
  const [info, setInfo] = useState<SceneTransitionInfo | null>(null);
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const prevSceneRef = useRef(currentScene);

  // 1. Transition into Mythology from Grandpa's Living Room Tale
  useEffect(() => {
    if (presentScenePhase !== 'TRANSITION_TO_MYTHOLOGY') return;

    setIsTransitionActive(true);
    setInfo(SCENE_INFO.MYTHOLOGY_CREATION);

    audioManager.fadeAmbientVolume(0.08, 2.0);
    audioManager.playTransitionSwell();

    const glowTimer = setTimeout(() => {
      setGoldenGlowOpacity(0.95);
    }, 400);

    const fadeTimer = setTimeout(() => {
      setFadeOpacity(1);
    }, 1100);

    const switchTimer = setTimeout(() => {
      gameStateStore.enterMythologyScene();
    }, 2400);

    setTimeout(() => {
      setGoldenGlowOpacity(0);
      setFadeOpacity(0);
    }, 3100);

    setTimeout(() => {
      setIsTransitionActive(false);
      setInfo(null);
    }, 4000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(fadeTimer);
      clearTimeout(switchTimer);
      // Notice: revealTimer and cleanupTimer are allowed to complete so that
      // when enterMythologyScene() changes presentScenePhase to STORY_MODE,
      // the screen fade-in and overlay dismiss are guaranteed to happen!
    };
  }, [presentScenePhase]);

  // Safety fallback: if in MYTHOLOGY_CREATION story mode, guarantee overlay unmounts
  useEffect(() => {
    if (currentScene === 'MYTHOLOGY_CREATION' && isTransitionActive) {
      const fallbackTimer = setTimeout(() => {
        setGoldenGlowOpacity(0);
        setFadeOpacity(0);
        setIsTransitionActive(false);
        setInfo(null);
      }, 2000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [currentScene, isTransitionActive]);

  // 2. Universal Scene Transitions
  useEffect(() => {
    if (currentScene === prevSceneRef.current) return;
    const oldScene = prevSceneRef.current;
    prevSceneRef.current = currentScene;

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
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: fadeOpacity > 0.4 ? 'auto' : 'none',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Warm Divine Golden Bloom Pulse */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 205, 88, 0.4) 0%, rgba(190, 80, 24, 0.25) 45%, transparent 75%)',
          opacity: goldenGlowOpacity,
          transition: 'opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Deep Ethereal Plum Fade (Never cold black) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#120710',
          opacity: fadeOpacity,
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Contextual Narrative Title Memory */}
      {info && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#f8f4ec',
            opacity: goldenGlowOpacity,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            userSelect: 'none',
            maxWidth: '680px',
            width: '90%',
          }}
        >
          {/* Subtle Decorative Diamond Accent */}
          <div
            style={{
              width: '6px',
              height: '6px',
              background: '#eed7a1',
              transform: 'rotate(45deg)',
              margin: '0 auto 16px',
              boxShadow: '0 0 10px rgba(238, 215, 161, 0.8)',
            }}
          />

          <div
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(1.5rem, 3.8vw, 2.4rem)',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.95), 0 0 30px rgba(229, 192, 123, 0.5)',
              marginBottom: '10px',
              color: '#ffffff',
            }}
          >
            {info.title}
          </div>

          <div
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
              letterSpacing: '0.14em',
              color: '#eed7a1',
              textTransform: 'uppercase',
              opacity: 0.9,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
            }}
          >
            {info.subtitle}
          </div>

          <div
            style={{
              width: '48px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(229, 192, 123, 0.75), transparent)',
              margin: '18px auto 0',
            }}
          />
        </div>
      )}
    </div>
  );
}
