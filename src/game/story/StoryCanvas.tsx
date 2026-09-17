import { useEffect, useState, useRef, useCallback } from 'react';
import type { StoryScene, StoryState } from './storyTypes';
import { STORY_SCENES } from './storySequenceData';
import { StoryParticles } from './StoryParticles';
import { audioManager } from '../audio/AudioManager';

interface StoryCanvasProps {
  currentStoryState: StoryState;
  onAdvanceState: (nextState: StoryState) => void;
  onSkipStory: () => void;
}

export function StoryCanvas({
  currentStoryState,
  onAdvanceState,
  onSkipStory,
}: StoryCanvasProps) {
  const scene: StoryScene | undefined = STORY_SCENES[currentStoryState];

  // Mouse Parallax coordinates (-1 to 1)
  const mousePos = useRef({ x: 0, y: 0 });
  const currentParallax = useRef({ x: 0, y: 0 });
  const [renderOffset, setRenderOffset] = useState({ x: 0, y: 0 });

  // Camera Zoom & Pan progression
  const [cameraProgress, setCameraProgress] = useState(0);

  // Subtitle typewriter state
  const [displayedNarration, setDisplayedNarration] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  // Awakening flash state
  const [showFlash, setShowFlash] = useState(false);

  // Smooth mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x: normX, y: normY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax animation & camera drift loop
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const updateLoop = (now: number) => {
      // Smooth lerp mouse parallax
      const lerpFactor = 0.04;
      currentParallax.current.x += (mousePos.current.x - currentParallax.current.x) * lerpFactor;
      currentParallax.current.y += (mousePos.current.y - currentParallax.current.y) * lerpFactor;

      setRenderOffset({
        x: currentParallax.current.x,
        y: currentParallax.current.y,
      });

      // Update camera progression
      if (scene) {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(1, elapsed / scene.camera.duration);
        setCameraProgress(progress);
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [scene]);

  // Handle scene entrance, audio cues, and effects
  useEffect(() => {
    if (!scene) return;

    // Trigger audio hooks
    if (scene.audio) {
      audioManager.playStoryAudioHooks(scene.audio);
    }
    if (scene.narration?.audio) {
      audioManager.playNarrationAudio(scene.narration.audio);
    }

    // Trigger special scene sound effects
    if (scene.stateId === 'GANESHA_AWAKENING') {
      setShowFlash(true);
      audioManager.playDivineAwakeningPulse();
      const flashTimer = setTimeout(() => setShowFlash(false), 900);
      return () => clearTimeout(flashTimer);
    } else if (scene.stateId === 'SHIVA_SETUP') {
      audioManager.playDistantThunderDamru();
    }
  }, [scene]);

  // Subtitle typewriter animation
  useEffect(() => {
    if (!scene) return;

    const fullText = scene.narration.text;
    setDisplayedNarration('');
    setIsTyping(true);
    let charIdx = 0;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = window.setInterval(() => {
      charIdx++;
      setDisplayedNarration(fullText.slice(0, charIdx));

      // Subtle vocal blip if external audio is not supplied
      if (!scene.narration.audio && charIdx % 3 === 0) {
        audioManager.playSpeechBlip('Old Man');
      }

      if (charIdx >= fullText.length) {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 24);

    return () => {
      audioManager.stopVoiceLine();
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [scene]);

  // Advance to next scene handler
  const handleAdvance = useCallback(() => {
    if (!scene) return;

    if (isTyping) {
      // If typing, immediately show the complete line
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedNarration(scene.narration.text);
      setIsTyping(false);
    } else {
      audioManager.playUIClick();
      if (scene.nextScene) {
        onAdvanceState(scene.nextScene);
      }
    }
  }, [scene, isTyping, onAdvanceState]);

  // Keyboard navigation: Space or Enter to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  if (!scene) {
    return null;
  }

  // Calculate current camera zoom and pan
  const currentZoom =
    scene.camera.initialZoom +
    (scene.camera.targetZoom - scene.camera.initialZoom) * cameraProgress;
  const currentPanX = scene.camera.panX * cameraProgress;
  const currentPanY = scene.camera.panY * cameraProgress;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#050302',
        overflow: 'hidden',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Visual Canvas Container with Camera Transform */}
      <div
        style={{
          position: 'absolute',
          inset: '-5%',
          width: '110%',
          height: '110%',
          transform: `scale(${currentZoom}) translate(${currentPanX}%, ${currentPanY}%)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Render Layers */}
        {scene.layers.map((layer) => {
          if (layer.type === 'particles') {
            return null; // Rendered via dedicated particle overlay
          }

          // Subtle parallax offset based on layer depth
          const parallaxX = renderOffset.x * layer.depth * 28;
          const parallaxY = renderOffset.y * layer.depth * 20;

          return (
            <div
              key={layer.id}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: layer.src ? `url("${layer.src}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `translate(${parallaxX}px, ${parallaxY}px) scale(${layer.scale || 1})`,
                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                mixBlendMode: layer.blendMode || 'normal',
                transition: 'transform 0.12s ease-out, opacity 0.8s ease-in-out',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Ambient Color Tone Overlay */}
        {scene.effects?.ambientLightColor && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: scene.effects.ambientLightColor,
              pointerEvents: 'none',
              mixBlendMode: 'color-dodge',
            }}
          />
        )}
      </div>

      {/* Procedural Atmospheric Particles */}
      <StoryParticles type={scene.effects?.particleType || 'golden_prana'} />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, transparent 40%, rgba(5, 3, 2, 0.65) 85%, rgba(2, 1, 1, 0.95) 100%)',
          pointerEvents: 'none',
          zIndex: 25,
        }}
      />

      {/* Awakening Light Flash Effect for Scene 4 */}
      {showFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#fffbe6',
            opacity: 0.9,
            zIndex: 35,
            pointerEvents: 'none',
            animation: 'flashFadeOut 0.85s ease-out forwards',
          }}
        />
      )}

      {/* Top Cinematic Letterbox Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '7.5vh',
          backgroundColor: '#050302',
          zIndex: 40,
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Story Title & Chapter Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#f5ca75',
              fontSize: '15px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {scene.title}
          </span>
          {scene.subtitle && (
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'rgba(240, 220, 190, 0.45)',
                fontSize: '13px',
                letterSpacing: '0.04em',
              }}
            >
              • {scene.subtitle}
            </span>
          )}
        </div>

        {/* Discreet Skip Button */}
        <button
          onClick={onSkipStory}
          style={{
            background: 'none',
            border: '1px solid rgba(220, 180, 120, 0.2)',
            borderRadius: '16px',
            color: 'rgba(230, 210, 180, 0.45)',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            letterSpacing: '0.08em',
            padding: '4px 14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f5ca75';
            e.currentTarget.style.borderColor = 'rgba(245, 202, 117, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(230, 210, 180, 0.45)';
            e.currentTarget.style.borderColor = 'rgba(220, 180, 120, 0.2)';
          }}
        >
          Skip Story ↷
        </button>
      </div>

      {/* Bottom Cinematic Letterbox Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '7.5vh',
          backgroundColor: '#050302',
          zIndex: 40,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      />

      {/* Cinematic Narration Subtitle Frame */}
      <div
        onClick={handleAdvance}
        style={{
          position: 'absolute',
          bottom: '9vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(860px, 92vw)',
          backgroundColor: 'rgba(10, 7, 5, 0.88)',
          border: '1px solid rgba(220, 160, 60, 0.32)',
          borderRadius: '18px',
          padding: '22px 32px',
          boxShadow: '0 14px 44px rgba(0, 0, 0, 0.85), 0 0 28px rgba(220, 160, 60, 0.14)',
          backdropFilter: 'blur(16px)',
          cursor: 'pointer',
          zIndex: 45,
          userSelect: 'none',
        }}
      >
        {/* Speaker Name Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(216, 150, 52, 0.16)',
            border: '1px solid rgba(216, 150, 52, 0.5)',
            borderRadius: '20px',
            padding: '3px 14px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#f5b041',
              boxShadow: '0 0 6px #f5b041',
            }}
          />
          <span
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#f5ca75',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {scene.narration.speaker}
          </span>
        </div>

        {/* Narration Text */}
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.24rem',
            lineHeight: 1.6,
            color: '#faf4e8',
            minHeight: '44px',
            margin: 0,
            fontWeight: 400,
            textShadow: '0 2px 6px rgba(0,0,0,0.7)',
          }}
        >
          {displayedNarration}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                height: '1.1em',
                backgroundColor: '#e06a20',
                marginLeft: '4px',
                verticalAlign: 'middle',
                animation: 'blink 0.8s infinite',
              }}
            />
          )}
        </p>

        {/* Subtle Continue Prompt */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            color: 'rgba(245, 238, 219, 0.55)',
            fontSize: '13px',
            letterSpacing: '0.04em',
          }}
        >
          <span>
            {isTyping
              ? 'Click to show all'
              : scene.nextScene === 'SHIVA_SEQUENCE_READY'
              ? 'Prepare for Mahadev [Space] →'
              : 'Next Scene [Space] →'}
          </span>
          <span
            style={{
              fontSize: '13px',
              color: '#e06a20',
              animation: 'bounceIndicator 1.2s infinite ease-in-out',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounceIndicator {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes flashFadeOut {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
