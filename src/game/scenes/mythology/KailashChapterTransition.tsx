import { useEffect, useState, useRef, useCallback } from 'react';
import { gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { StoryParticles } from '../../story/StoryParticles';

interface KailashChapterTransitionProps {
  onReplayStory: () => void;
}

export function KailashChapterTransition({ onReplayStory }: KailashChapterTransitionProps) {
  // Phase progression:
  // 0: Initial fade in (0 - 1.2s)
  // 1: Title reveals (1.2s - 5.5s)
  // 2: Title dissolves, continue prompt becomes ready (5.5s+)
  // 3: Transitioning out to 3D Shiva sequence
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const startTimeRef = useRef<number>(performance.now());
  const [cameraProgress, setCameraProgress] = useState(0);

  // Audio setup: Himalayan wind and distant thunder damru
  useEffect(() => {
    audioManager.playDistantThunderDamru();
    audioManager.fadeAmbientVolume(0.25, 2.0);

    const titleTimer = setTimeout(() => setPhase(1), 1200);
    const readyTimer = setTimeout(() => setPhase(2), 5800);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  // Majestic slow camera push loop (8 - 12 seconds establishing shot)
  useEffect(() => {
    let animId: number;

    const cameraLoop = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // Smooth continuous push over 12 seconds
      const p = Math.min(1, elapsed / 12);
      setCameraProgress(p);

      animId = requestAnimationFrame(cameraLoop);
    };

    animId = requestAnimationFrame(cameraLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Advance to Mount Kailash gameplay (3D Shiva sequence)
  const handleContinue = useCallback(() => {
    if (isTransitioningOut) return;

    if (phase < 2) {
      // If clicked early, immediately transition title and make ready
      setPhase(2);
      return;
    }

    setIsTransitioningOut(true);
    setPhase(3);

    audioManager.playTransitionSwell();
    audioManager.playTempleBell();

    // Smooth forward push into the mountain mist before opening Shiva sequence
    setTimeout(() => {
      gameStateStore.startShivaSequence();
    }, 1200);
  }, [phase, isTransitioningOut]);

  // Keyboard navigation: E, Space, Enter advance; R replays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'KeyE' ||
        e.key === 'e' ||
        e.key === 'E' ||
        e.code === 'Space' ||
        e.code === 'Enter'
      ) {
        e.preventDefault();
        handleContinue();
      } else if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReplayStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue, onReplayStory]);

  // Calculate subtle camera scale and drift
  // Starts at scale 1.02 -> drifts to scale 1.10, panning gently upward toward the sacred peak
  const currentScale = 1.02 + cameraProgress * (isTransitioningOut ? 0.12 : 0.08);
  const currentPanY = cameraProgress * (isTransitioningOut ? -3.5 : -1.8);

  return (
    <div
      data-ui="kailash-chapter-transition"
      onClick={handleContinue}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0d16',
        overflow: 'hidden',
        zIndex: 70,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ─── FULL-SCREEN MOUNT KAILASH ARTWORK (HERO OF THE SCENE) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: '-6%',
          width: '112%',
          height: '112%',
          backgroundImage: 'url("/assets/story/mythology/backgrounds/kailash_abode.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
          transform: `scale(${currentScale}) translateY(${currentPanY}%)`,
          transition: isTransitioningOut
            ? 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s ease-out'
            : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: isTransitioningOut ? 'brightness(1.2) blur(2px)' : 'brightness(1.0)',
        }}
      />

      {/* ─── SECONDARY MIST LAYER (Subtle cosmic indigo atmosphere) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: '-4%',
          width: '108%',
          height: '108%',
          backgroundImage: 'url("/assets/story/mythology/backgrounds/shiva_arrival_sky.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          opacity: 0.32,
          mixBlendMode: 'screen',
          transform: `scale(${1.04 + cameraProgress * 0.04})`,
          pointerEvents: 'none',
        }}
      />

      {/* ─── DIVINE SUMMIT ILLUMINATION (Subtle sacred crest glow) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 34%, rgba(255, 235, 195, 0.24) 0%, rgba(160, 190, 240, 0.12) 40%, transparent 70%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* ─── HIMALAYAN DRIFTING SNOW PARTICLES ─── */}
      <StoryParticles type="himalayan_snow" />

      {/* ─── ATMOSPHERIC SLATE / COOL MIST VIGNETTE ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, transparent 45%, rgba(18, 22, 34, 0.45) 80%, rgba(10, 13, 22, 0.88) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ─── CINEMATIC CHAPTER TITLE (DIRECTLY OVER THE ENVIRONMENT, ZERO CARDS) ─── */}
      <div
        data-ui="chapter-title"
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 80,
          pointerEvents: 'none',
          maxWidth: '840px',
          width: '90%',
          opacity: phase === 1 ? 1 : phase >= 2 ? 0.22 : 0,
          transformOrigin: 'center center',
          transition:
            'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Subtle Decorative Diamond */}
        <div
          style={{
            width: '6px',
            height: '6px',
            background: '#eed7a1',
            transform: 'rotate(45deg)',
            margin: '0 auto 16px',
            boxShadow: '0 0 10px rgba(238, 215, 161, 0.8)',
            opacity: phase >= 1 ? 0.9 : 0,
            transition: 'opacity 0.8s ease',
          }}
        />

        {/* Small Chapter Marker */}
        <div
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: 'clamp(11px, 1.4vw, 13px)',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#eed7a1',
            textTransform: 'uppercase',
            marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 16px rgba(229, 192, 123, 0.4)',
          }}
        >
          The Sacred Threshold
        </div>

        {/* Main Chapter Title */}
        <h1
          style={{
            margin: 0,
            padding: 0,
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: 'clamp(2.0rem, 4.8vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow:
              '0 3px 24px rgba(0, 0, 0, 0.95), 0 0 32px rgba(229, 192, 123, 0.35)',
          }}
        >
          Herald of Mahadev
        </h1>

        {/* Delicate Ornamental Hairline */}
        <div
          style={{
            width: '48px',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(229, 192, 123, 0.8), transparent)',
            margin: '20px auto 0',
          }}
        />
      </div>

      {/* ─── FULL-WIDTH SUBTLE BOTTOM ATMOSPHERIC WASH ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28vh',
          background:
            'linear-gradient(to top, rgba(8, 11, 18, 0.92) 0%, rgba(14, 18, 28, 0.45) 55%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 75,
        }}
      />

      {/* ─── MINIMAL GAMEPLAY CONTINUATION INTERACTION ─── */}
      <div
        data-ui="continue-prompt"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          bottom: 'clamp(28px, 6vh, 52px)',
          left: '50%',
          transform: `translateX(-50%) translateY(${phase >= 2 ? '0px' : '10px'}) scale(${
            isHovered ? 1.04 : 1.0
          })`,
          zIndex: 85,
          opacity: phase >= 2 && !isTransitioningOut ? 1 : 0,
          transition:
            'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 18px',
          borderRadius: '4px',
          background: isHovered ? 'rgba(24, 30, 48, 0.65)' : 'rgba(14, 18, 30, 0.45)',
          border: isHovered
            ? '1px solid rgba(229, 192, 123, 0.6)'
            : '1px solid rgba(229, 192, 123, 0.25)',
          boxShadow: isHovered ? '0 0 16px rgba(229, 192, 123, 0.3)' : 'none',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '22px',
            height: '20px',
            padding: '0 6px',
            background: 'rgba(229, 192, 123, 0.2)',
            border: '1px solid rgba(229, 192, 123, 0.65)',
            borderRadius: '3px',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
          }}
        >
          E
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: isHovered ? '#ffffff' : '#f8f4ec',
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
            transition: 'color 0.2s ease',
          }}
        >
          CONTINUE →
        </span>
      </div>

      {/* ─── DISCREET SECONDARY REPLAY SHORTCUT (CORNER ONLY) ─── */}
      <button
        type="button"
        data-ui="replay-shortcut"
        onClick={(e) => {
          e.stopPropagation();
          onReplayStory();
        }}
        style={{
          position: 'absolute',
          top: '22px',
          right: '26px',
          zIndex: 85,
          background: 'none',
          border: 'none',
          color: 'rgba(245, 238, 225, 0.35)',
          fontFamily: "'Cinzel', serif",
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '6px 10px',
          cursor: 'pointer',
          transition: 'color 0.25s ease, opacity 0.25s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#eed7a1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(245, 238, 225, 0.35)';
        }}
      >
        ↺ REPLAY STORY
      </button>

      {/* ─── FULL-SCREEN TRANSITION-OUT DISSOLVE OVERLAY ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0a0e18',
          opacity: isTransitioningOut ? 1 : 0,
          transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 95,
        }}
      />
    </div>
  );
}
