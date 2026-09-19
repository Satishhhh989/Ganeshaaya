import { useProgress } from '@react-three/drei';
import { useEffect, useState, useMemo } from 'react';
import { useGameState } from '../../core/GameState';
import { AmbientParticles } from './AmbientParticles';

export function LoadingScreen() {
  const { active, progress } = useProgress();
  const { currentScene } = useGameState();
  const [isDone, setIsDone] = useState(false);
  const [fadeState, setFadeState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  // Short, poetic cinematic chapter title (no technical terminology)
  const chapterTitle = useMemo(() => {
    if (currentScene === 'SHIVA_SEQUENCE') {
      return 'THE AWAKENING';
    }
    if (currentScene === 'NIAT_COMPETITION') {
      return 'THE ARENA';
    }
    if (currentScene === 'PANDAL') {
      return 'THE UTSAV';
    }
    return 'VINAYAK';
  }, [currentScene]);

  const chapterSubtitle = useMemo(() => {
    if (currentScene === 'SHIVA_SEQUENCE') {
      return 'MOUNT KAILASH';
    }
    if (currentScene === 'NIAT_COMPETITION') {
      return 'NIAT CHAMPIONSHIP';
    }
    if (currentScene === 'PANDAL') {
      return 'THE SACRED MANDAP';
    }
    return 'A STORY OF FAITH & NEW BEGINNINGS';
  }, [currentScene]);

  useEffect(() => {
    // When assets finish loading or are almost complete
    if (!active || progress >= 98) {
      const fadeTimer = setTimeout(() => {
        setFadeState('fading');
      }, 500);

      const doneTimer = setTimeout(() => {
        setFadeState('hidden');
        setIsDone(true);
      }, 1200);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(doneTimer);
      };
    } else {
      setFadeState('visible');
    }
  }, [active, progress]);

  // Safety watchdog: ensures cinematic loading smoothly yields within 2.8s
  useEffect(() => {
    const watchdog = setTimeout(() => {
      setFadeState('fading');
      setTimeout(() => {
        setFadeState('hidden');
        setIsDone(true);
      }, 700);
    }, 2800);
    return () => clearTimeout(watchdog);
  }, []);

  if (isDone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: fadeState === 'fading' || fadeState === 'hidden' ? 'none' : 'auto',
        opacity: fadeState === 'fading' ? 0 : 1,
        transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: '#0c070e',
      }}
    >
      {/* Background Artwork Gradually Appearing with Slow Cinematic Push-in */}
      <div
        style={{
          position: 'absolute',
          inset: '-4%',
          backgroundImage: 'url(/assets/ui/ganesha_hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '84% 42%',
          transformOrigin: '82% 44%',
          transform: 'scale(1.08)',
          animation: 'slowZoom 9s ease-out forwards',
          filter: 'brightness(0.85) contrast(1.05)',
        }}
      />

      {/* Atmospheric Vignette & Soft Golden Light Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 75% 38%, rgba(254, 240, 138, 0.16) 0%, transparent 55%),
            radial-gradient(circle at 25% 70%, rgba(217, 119, 36, 0.15) 0%, transparent 60%),
            linear-gradient(180deg, rgba(12, 7, 14, 0.55) 0%, rgba(12, 7, 14, 0.8) 70%, rgba(12, 7, 14, 0.98) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Floating Gold & Rose Particles */}
      <AmbientParticles count={16} />

      {/* Center Cinematic Presentation (Zero percentages, Zero tech bars) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '640px',
          width: '90%',
          padding: '0 20px',
          animation: 'fadeInUp 1s ease-out',
        }}
      >
        {/* Sacred Geometry Lotus Emblem */}
        <div
          style={{
            width: '44px',
            height: '44px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'divineBreathe 4s ease-in-out infinite alternate',
          }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 14px rgba(254, 240, 138, 0.6))' }}
          >
            <circle cx="24" cy="24" r="21" stroke="rgba(254, 240, 138, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="24" cy="24" r="18" stroke="rgba(244, 167, 185, 0.45)" strokeWidth="1" />
            <path
              d="M24 10C24 10 28 17 28 23C28 26.5 26 29 24 29C22 29 20 26.5 20 23C20 17 24 10 24 10Z"
              fill="rgba(254, 240, 138, 0.85)"
            />
            <path
              d="M17 14C17 14 22 19 21 25C20.5 27.5 18 29 16 28C14 27 13.5 24.5 14.5 22C15.5 18.5 17 14 17 14Z"
              fill="rgba(244, 167, 185, 0.75)"
            />
            <path
              d="M31 14C31 14 26 19 27 25C27.5 27.5 30 29 32 28C34 27 34.5 24.5 33.5 22C32.5 18.5 31 14 31 14Z"
              fill="rgba(244, 167, 185, 0.75)"
            />
            <circle cx="24" cy="24" r="2.5" fill="#fffbe6" />
          </svg>
        </div>

        {/* Short Cinematic Chapter Title */}
        <h1
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            lineHeight: 1.2,
            margin: '0 0 10px 0',
            color: '#ffffff',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 0 30px rgba(254, 240, 138, 0.4)',
            textTransform: 'uppercase',
          }}
        >
          {chapterTitle}
        </h1>

        {/* Subtle Subtitle */}
        <p
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: 'clamp(0.76rem, 1.3vw, 0.92rem)',
            color: 'rgba(254, 240, 138, 0.8)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin: '0 0 18px 0',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          {chapterSubtitle}
        </p>

        {/* Minimal Golden Accent Line */}
        <div
          style={{
            width: '42px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(254, 240, 138, 0.8), transparent)',
          }}
        />
      </div>

      <style>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1.0);
          }
          100% {
            transform: scale(1.08);
          }
        }
        @keyframes divineBreathe {
          0% {
            transform: scale(0.96);
            filter: drop-shadow(0 0 8px rgba(254, 240, 138, 0.35));
          }
          100% {
            transform: scale(1.06);
            filter: drop-shadow(0 0 20px rgba(254, 240, 138, 0.65));
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
