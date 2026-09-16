import { useEffect, useState } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function GameHUD() {
  const { gameState, audioSettings, presentScenePhase } = useGameState();
  // Show minimal control reminder briefly on first launch, then fade it away completely
  const [showHint, setShowHint] = useState(true);
  const [hintOpacity, setHintOpacity] = useState(0);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    // Fade in hint gently
    const timerIn = setTimeout(() => {
      setHintOpacity(1);
    }, 800);

    // Fade out hint after 3.5 seconds
    const timerOut = setTimeout(() => {
      setHintOpacity(0);
    }, 4500);

    // Remove from DOM
    const timerUnmount = setTimeout(() => {
      setShowHint(false);
    }, 6000);

    return () => {
      clearTimeout(timerIn);
      clearTimeout(timerOut);
      clearTimeout(timerUnmount);
    };
  }, [gameState]);

  if (gameState !== 'PLAYING') {
    return null;
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMuted = audioManager.toggleMute();
    gameStateStore.updateAudioSettings({ muted: isMuted });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 28px',
        userSelect: 'none',
      }}
    >
      {/* Top Bar: Ultra-discreet sound toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleToggleMute}
          title={audioSettings.muted ? 'Unmute Audio' : 'Mute Audio'}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(235, 220, 195, 0.35)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px',
            pointerEvents: 'auto',
            outline: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(235, 220, 195, 0.85)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(235, 220, 195, 0.35)')}
        >
          {audioSettings.muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Brief initial discovery hint - fades in and completely disappears */}
      {showHint && presentScenePhase === 'APPROACH' && (
        <div
          style={{
            alignSelf: 'center',
            marginBottom: '3vh',
            color: 'rgba(240, 230, 210, 0.65)',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            transition: 'opacity 1.4s ease-in-out',
            opacity: hintOpacity,
            pointerEvents: 'none',
          }}
        >
          <span>WASD to move</span>
        </div>
      )}
    </div>
  );
}

