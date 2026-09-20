import { useEffect, useState } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { virtualInputStore } from '../mobile/virtualInputStore';

export function GameHUD() {
  const { gameState, audioSettings, presentScenePhase } = useGameState();
  const [showHint, setShowHint] = useState(true);
  const [hintOpacity, setHintOpacity] = useState(0);

  const [musicMuted, setMusicMuted] = useState(audioSettings.musicMuted ?? audioManager.getMusicMuted());
  const [sfxMuted, setSfxMuted] = useState(audioSettings.sfxMuted ?? audioManager.getSfxMuted());

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

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowMuted = audioManager.toggleMusic();
    setMusicMuted(isNowMuted);
    gameStateStore.updateAudioSettings({ musicMuted: isNowMuted });
  };

  const handleToggleSfx = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowMuted = audioManager.toggleSfx();
    setSfxMuted(isNowMuted);
    gameStateStore.updateAudioSettings({ sfxMuted: isNowMuted });
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
      {/* Top Right Utility Bar: Dedicated MUSIC & SFX Game Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* MUSIC TOGGLE BUTTON */}
        <button
          onClick={handleToggleMusic}
          title={musicMuted ? 'Enable Music' : 'Mute Music'}
          style={{
            background: 'rgba(24, 12, 18, 0.65)',
            border: musicMuted
              ? '1px solid rgba(250, 238, 219, 0.18)'
              : '1px solid rgba(247, 212, 134, 0.45)',
            borderRadius: '2px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none',
            color: musicMuted ? 'rgba(250, 238, 219, 0.45)' : '#faeedb',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.07)';
            e.currentTarget.style.borderColor = 'rgba(247, 212, 134, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = musicMuted
              ? 'rgba(250, 238, 219, 0.18)'
              : 'rgba(247, 212, 134, 0.45)';
          }}
        >
          {/* Music Note SVG */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={musicMuted ? 'currentColor' : '#f7d486'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            MUSIC {musicMuted ? 'OFF' : 'ON'}
          </span>
        </button>

        {/* SFX TOGGLE BUTTON */}
        <button
          onClick={handleToggleSfx}
          title={sfxMuted ? 'Enable Sound Effects' : 'Mute Sound Effects'}
          style={{
            background: 'rgba(24, 12, 18, 0.65)',
            border: sfxMuted
              ? '1px solid rgba(250, 238, 219, 0.18)'
              : '1px solid rgba(247, 212, 134, 0.45)',
            borderRadius: '2px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            outline: 'none',
            color: sfxMuted ? 'rgba(250, 238, 219, 0.45)' : '#faeedb',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.07)';
            e.currentTarget.style.borderColor = 'rgba(247, 212, 134, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = sfxMuted
              ? 'rgba(250, 238, 219, 0.18)'
              : 'rgba(247, 212, 134, 0.45)';
          }}
        >
          {/* Speaker SVG */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={sfxMuted ? 'currentColor' : '#f7d486'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {!sfxMuted && (
              <>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </>
            )}
            {sfxMuted && (
              <line x1="23" y1="9" x2="17" y2="15" />
            )}
          </svg>
          <span
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            SFX {sfxMuted ? 'OFF' : 'ON'}
          </span>
        </button>
      </div>

      {/* Brief initial movement reminder - fades in and completely disappears */}
      {showHint && presentScenePhase === 'APPROACH' && (
        <div
          style={{
            alignSelf: 'center',
            marginBottom: '3vh',
            color: 'rgba(250, 238, 219, 0.65)',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.85)',
            transition: 'opacity 1.4s ease-in-out',
            opacity: hintOpacity,
            pointerEvents: 'none',
          }}
        >
          <span>
            {virtualInputStore.getState().isTouchDevice
              ? 'Use Left Joystick to Move · Drag Right to Look'
              : 'WASD to move · Shift to run'}
          </span>
        </div>
      )}
    </div>
  );
}
