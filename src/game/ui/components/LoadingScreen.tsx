import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { useGameState } from '../../core/GameState';

export function LoadingScreen() {
  const { active, progress } = useProgress();
  const { currentScene } = useGameState();
  const [isDone, setIsDone] = useState(false);

  const sceneText =
    currentScene === 'SHIVA_SEQUENCE'
      ? { title: 'Mount Kailash', subtitle: 'Preparing 3D peaks & sacred threshold...' }
      : currentScene === 'NIAT_COMPETITION'
      ? { title: 'NIAT Championship', subtitle: 'Preparing 3D auditorium & stage...' }
      : currentScene === 'PANDAL'
      ? { title: 'Ganesh Chaturthi Pandal', subtitle: 'Preparing community courtyard & sacred altar...' }
      : { title: 'Entering Home', subtitle: 'Preparing 3D living room & family environment...' };

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setIsDone(true), 350);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (isDone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0c0907',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        opacity: active ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
        pointerEvents: active ? 'auto' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Diya / Lotus Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(224, 106, 32, 0.15)',
          border: '1px solid rgba(245, 195, 56, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          animation: 'pulseEmblem 2s infinite ease-in-out',
        }}
      >
        <span style={{ fontSize: '28px', color: '#f5c338' }}>🪔</span>
      </div>

      <h2
        style={{
          fontFamily: "'Cinzel', 'Marcellus', serif",
          color: '#fdf3e2',
          fontSize: '1.4rem',
          letterSpacing: '0.14em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        {sceneText.title}
      </h2>

      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: 'rgba(245, 238, 220, 0.65)',
          fontSize: '0.85rem',
          letterSpacing: '0.06em',
          marginBottom: '28px',
        }}
      >
        {sceneText.subtitle}
      </p>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '260px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.max(12, Math.round(progress))}%`,
            background: 'linear-gradient(90deg, #df6920, #f5c338)',
            transition: 'width 0.25s ease-out',
            boxShadow: '0 0 10px rgba(224, 106, 32, 0.8)',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
          marginTop: '10px',
        }}
      >
        {Math.round(progress)}%
      </span>

      <style>{`
        @keyframes pulseEmblem {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(224, 106, 32, 0.3); }
          50% { transform: scale(1.08); box-shadow: 0 0 28px rgba(245, 195, 56, 0.6); }
        }
      `}</style>
    </div>
  );
}
