import { useState } from 'react';
import { gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function MainMenu() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleBegin = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    audioManager.playTempleBell();
    audioManager.startAmbientMusic();

    // Cinematic fade into gameplay
    setTimeout(() => {
      gameStateStore.startGame();
    }, 900);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
    gameStateStore.updateAudioSettings({ muted });
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6vh 6vw',
          // Subtle cinematic vignette, preserving the live 3D living room view
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(10, 8, 6, 0.25) 0%, rgba(6, 4, 3, 0.85) 85%)',
          pointerEvents: isTransitioning ? 'none' : 'auto',
          zIndex: 90,
          userSelect: 'none',
          transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        {/* Top Auspicious Invocation */}
        <div style={{ textAlign: 'center', opacity: 0.75, transform: 'translateY(10px)' }}>
          <p
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#d4af37',
              fontSize: '13px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              margin: 0,
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
            }}
          >
            ॥ श्री गणेशाय नमः ॥
          </p>
        </div>

        {/* Center Title Branding */}
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(3.4rem, 8vw, 5.8rem)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              background: 'linear-gradient(180deg, #ffffff 0%, #f7d486 55%, #c87a28 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 8px 32px rgba(200, 122, 40, 0.3)',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            विनायक
          </h1>

          <p
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: 'clamp(1.0rem, 2.2vw, 1.35rem)',
              color: 'rgba(245, 230, 205, 0.88)',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              margin: 0,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            The First Prayer
          </p>

          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent)',
              marginTop: '4px',
            }}
          />
        </div>

        {/* Bottom Minimal Interactive Action */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '4vh',
          }}
        >
          <button
            onClick={handleBegin}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              outline: 'none',
            }}
          >
            <span
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.32em',
                color: '#fdf7ea',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                textShadow: '0 2px 12px rgba(224, 106, 32, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f5c338';
                e.currentTarget.style.letterSpacing = '0.36em';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fdf7ea';
                e.currentTarget.style.letterSpacing = '0.32em';
              }}
            >
              Begin Story
            </span>
            <div
              style={{
                width: '32px',
                height: '1px',
                backgroundColor: 'rgba(224, 106, 32, 0.65)',
                boxShadow: '0 0 8px rgba(245, 195, 56, 0.5)',
                animation: 'breatheLine 3s infinite ease-in-out',
              }}
            />
          </button>
        </div>

        {/* Discreet Corner Sound Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '28px',
            background: 'none',
            border: 'none',
            color: 'rgba(235, 220, 195, 0.45)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '6px',
            outline: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(235, 220, 195, 0.85)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(235, 220, 195, 0.45)')}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Cinematic Full-Screen Black Fade Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#070504',
          zIndex: 150,
          pointerEvents: 'none',
          transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isTransitioning ? 1 : 0,
        }}
      />

      <style>{`
        @keyframes breatheLine {
          0%, 100% {
            width: 28px;
            opacity: 0.5;
          }
          50% {
            width: 56px;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
