import { useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import {
  competitionCeremonyStore,
  useCompetitionCeremony,
  CEREMONY_SUBTITLES,
} from './competitionState';

export function CompetitionUI() {
  const { currentScene } = useGameState();
  const currentBeat = useCompetitionCeremony();

  const isCompetition = currentScene === 'NIAT_COMPETITION';

  // Handle player advance interaction (Space, Enter, E, or Click)
  const handleInteraction = () => {
    audioManager.playUIClick();

    if (currentBeat === 'CEREMONY_COMPLETE') {
      // Seamlessly transition back to family home
      gameStateStore.advancePresentPhase('PRIZE_RECEIVED');
    } else {
      const advanced = competitionCeremonyStore.advanceBeat();
      if (!advanced) {
        gameStateStore.advancePresentPhase('PRIZE_RECEIVED');
      }
    }
  };

  // Auto-advance when ceremony finishes its breathing beat
  useEffect(() => {
    if (!isCompetition) return;

    if (currentBeat === 'CEREMONY_COMPLETE') {
      const timer = setTimeout(() => {
        gameStateStore.advancePresentPhase('PRIZE_RECEIVED');
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [isCompetition, currentBeat]);

  // Keyboard navigation
  useEffect(() => {
    if (!isCompetition) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isCompetition) return null;

  const subtitle = CEREMONY_SUBTITLES[currentBeat];

  return (
    <div
      onClick={handleInteraction}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 100,
        cursor: 'pointer',
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        userSelect: 'none',
      }}
    >
      {/* ─── TOP CINEMATIC 2.39:1 LETTERBOX BAR ─── */}
      <div
        style={{
          width: '100%',
          height: '7.5vh',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Live Broadcast Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#e63946',
              boxShadow: '0 0 10px #e63946',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <span
            style={{
              color: '#e63946',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            LIVE
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span
            style={{
              color: '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            NIAT Championship 2024 · Grand Finale
          </span>
        </div>

        {/* Minimal Theme Badge */}
        <div
          style={{
            border: '1px solid rgba(255, 183, 3, 0.35)',
            borderRadius: '16px',
            padding: '3px 14px',
            color: '#ffb703',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            background: 'rgba(255, 183, 3, 0.08)',
          }}
        >
          Theme: Indian Heritage & Ancient Lore
        </div>
      </div>

      {/* ─── CENTER: UNOBSTRUCTED 3D WORLD (No giant cards or website modals!) ─── */}
      <div style={{ flex: 1, pointerEvents: 'none' }} />

      {/* ─── BOTTOM CINEMATIC 2.39:1 LETTERBOX BAR & SUBTITLES ─── */}
      <div
        style={{
          width: '100%',
          minHeight: '11vh',
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Minimal Bottom Subtitle */}
        {subtitle && (
          <div
            key={currentBeat}
            style={{
              maxWidth: '820px',
              textAlign: 'center',
              animation: 'fadeIn 0.35s ease-out',
            }}
          >
            <div
              style={{
                color: '#ffb703',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {subtitle.speaker}
            </div>
            <p
              style={{
                color: '#f8fafc',
                fontSize: '16px',
                lineHeight: '1.5',
                margin: 0,
                fontWeight: 500,
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                fontStyle: 'italic',
              }}
            >
              {subtitle.text}
            </p>
          </div>
        )}

        {/* Player Interaction Hint */}
        {currentBeat === 'AUDITORIUM_ESTABLISHING' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '12px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <span>Look around with mouse</span>
            <span style={{ color: '#475569' }}>·</span>
            <span style={{ color: '#ffb703', fontWeight: 700 }}>
              [Space / Click] Focus on Stage
            </span>
          </div>
        )}

        {currentBeat === 'CEREMONY_COMPLETE' && (
          <div
            style={{
              marginTop: '8px',
              color: '#2a9d8f',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              animation: 'pulse 2s infinite',
            }}
          >
            [Space / Click to Return to Family Home]
          </div>
        )}

        {/* Subtle Next Indicator */}
        {currentBeat !== 'AUDITORIUM_ESTABLISHING' && currentBeat !== 'CEREMONY_COMPLETE' && (
          <div
            style={{
              position: 'absolute',
              right: '32px',
              bottom: '16px',
              color: 'rgba(255, 255, 255, 0.25)',
              fontSize: '11px',
              letterSpacing: '1px',
            }}
          >
            [Space / Click to advance]
          </div>
        )}
      </div>
    </div>
  );
}
