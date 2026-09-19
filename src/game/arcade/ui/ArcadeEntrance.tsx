/**
 * ArcadeEntrance — Short cinematic intro when entering the arcade.
 * Decorative lights turn on, game stations illuminate, title appears.
 */
import { useState, useEffect } from 'react';

interface ArcadeEntranceProps {
  onComplete: () => void;
}

export function ArcadeEntrance({ onComplete }: ArcadeEntranceProps) {
  const [step, setStep] = useState(0); // 0: dark, 1: lights, 2: title, 3: ready

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1200);
    const t3 = setTimeout(() => setStep(3), 2200);
    const t4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Allow skipping
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        onComplete();
      }
    };
    const handleClick = () => onComplete();

    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: '#0c0604',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background warm glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: step >= 1
            ? 'radial-gradient(ellipse at center, rgba(180, 83, 9, 0.12) 0%, transparent 70%)'
            : 'none',
          transition: 'background 1.5s ease',
        }}
      />

      {/* Decorative lights sequence */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              opacity: step >= 1 ? 0.8 : 0,
              transform: step >= 1 ? 'scale(1)' : 'scale(0)',
              transition: `all 0.4s ease ${i * 0.1}s`,
              boxShadow: step >= 1
                ? '0 0 12px #fbbf24, 0 0 24px rgba(251,191,36,0.3)'
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Hanging garlands */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        opacity: step >= 1 ? 0.5 : 0,
        transition: 'opacity 1s ease 0.5s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '120px',
            height: '40px',
            borderBottom: '3px solid rgba(217, 119, 6, 0.4)',
            borderRadius: '0 0 50% 50%',
          }} />
        ))}
      </div>

      {/* Title */}
      <div style={{
        textAlign: 'center',
        opacity: step >= 2 ? 1 : 0,
        transform: step >= 2 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: 'all 0.8s ease',
      }}>
        <div style={{
          fontSize: '40px',
          marginBottom: '12px',
          filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.5))',
        }}>
          🕉️
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          color: '#fef08a',
          letterSpacing: '0.2em',
          textShadow: '0 2px 20px rgba(251, 191, 36, 0.4), 0 4px 40px rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
        }}>
          Game Arcade
        </h1>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(12px, 1.8vw, 16px)',
          color: 'rgba(254, 240, 138, 0.5)',
          letterSpacing: '0.3em',
          marginTop: '8px',
          textTransform: 'uppercase',
        }}>
          10 Festival Games Await
        </div>
      </div>

      {/* Game station silhouettes */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        opacity: step >= 2 ? 0.3 : 0,
        transition: 'opacity 1s ease',
      }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: '60px',
            height: '80px',
            backgroundColor: 'rgba(139, 69, 19, 0.15)',
            borderRadius: '6px 6px 0 0',
            borderTop: '2px solid rgba(251, 191, 36, 0.2)',
          }} />
        ))}
      </div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.15em',
        opacity: step >= 1 ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        Press ENTER or click to skip
      </div>
    </div>
  );
}
