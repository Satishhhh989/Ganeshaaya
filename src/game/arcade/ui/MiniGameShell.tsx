/**
 * MiniGameShell — Universal wrapper around every mini-game providing:
 * - Compact intro screen (title + objective + controls + START)
 * - Pause overlay (ESC → Resume / Restart / Exit)
 * - Score HUD during gameplay
 * - Auto-launches the MiniGameManager for the selected game
 */
import { useEffect } from 'react';
import type { MiniGameId } from '../ArcadeTypes';
import { useMiniGame } from '../MiniGameManager';
import { getGameConfig } from '../GameRegistry';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';
import { ResultScreen } from './ResultScreen';

interface MiniGameShellProps {
  gameId: MiniGameId;
  children: React.ReactNode;
}

export function MiniGameShell({ gameId, children }: MiniGameShellProps) {
  const {
    activeGame,
    gameState,
    score,
    bestScore,
    isNewBest,
    isPaused,
    timeRemaining,
    launchGame,
    startPlaying,
    pauseGame,
    resumeGame,
    restartGame,
    exitToArcade,
  } = useMiniGame();

  // Auto-launch on mount
  useEffect(() => {
    launchGame(gameId);
  }, [gameId, launchGame]);

  // ESC to pause/resume
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          pauseGame();
        } else if (gameState === 'PAUSED') {
          resumeGame();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, pauseGame, resumeGame]);

  const config = activeGame || getGameConfig(gameId);
  if (!config) return null;

  const { primary, secondary, accent } = config.colors;

  // INTRO screen
  if (gameState === 'INTRO') {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 110,
        background: `linear-gradient(135deg, ${secondary}f0 0%, #0c0a0fee 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'shellFadeIn 0.5s ease',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{config.icon}</div>
        <h2 style={{
          margin: '0 0 8px 0',
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.1em',
          textShadow: `0 2px 12px ${primary}44`,
          textAlign: 'center',
        }}>
          {config.title}
        </h2>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          "{config.instructions}"
        </p>

        {/* Controls */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            Controls
          </div>
          <div style={{
            fontSize: '14px',
            color: accent,
            fontFamily: "'Cinzel', serif",
            fontWeight: 600,
          }}>
            {config.controls}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => {
            arcadeAudio.playClick();
            startPlaying();
          }}
          style={{
            padding: '12px 48px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${primary}, ${accent}aa)`,
            border: `1px solid ${accent}66`,
            color: '#000',
            fontFamily: "'Cinzel', serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${primary}44`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 6px 28px ${primary}66`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${primary}44`;
          }}
        >
          Start Game
        </button>

        <div style={{
          marginTop: '16px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
        }}>
          Press ENTER or click to start
        </div>

        {/* Auto-start on Enter */}
        <AutoStartListener onStart={startPlaying} />

        <style>{`
          @keyframes shellFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // RESULT screen
  if (gameState === 'RESULT') {
    return (
      <ResultScreen
        config={config}
        score={score}
        bestScore={bestScore}
        isNewBest={isNewBest}
        onReplay={restartGame}
        onExit={exitToArcade}
      />
    );
  }

  // PLAYING / PAUSED — render game with HUD overlay
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 110,
      background: '#0c0a0f',
    }}>
      {/* Score HUD */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 120,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '13px',
          color: accent,
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}>
          {config.icon} {config.title}
        </div>

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          color: '#ffffff',
          textShadow: `0 0 8px ${accent}44`,
        }}>
          {scoreManager.formatScore(score)}
        </div>

        {config.timerSeconds && timeRemaining > 0 && (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: timeRemaining <= 10 ? '#ef4444' : 'rgba(255,255,255,0.7)',
          }}>
            {Math.ceil(timeRemaining)}s
          </div>
        )}
      </div>

      {/* Combo display */}
      {scoreManager.getCombo() >= 3 && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '16px',
          zIndex: 120,
          fontFamily: "'Cinzel', serif",
          fontSize: '14px',
          fontWeight: 700,
          color: accent,
          textShadow: `0 0 12px ${accent}66`,
          pointerEvents: 'none',
          animation: 'comboPulse 0.5s ease',
        }}>
          {scoreManager.getCombo()}× COMBO
          {scoreManager.getMultiplier() > 1 && (
            <span style={{ fontSize: '11px', marginLeft: '6px', color: '#fef08a' }}>
              ×{scoreManager.getMultiplier()}
            </span>
          )}
        </div>
      )}

      {/* Game content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 115,
      }}>
        {children}
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 130,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'shellFadeIn 0.2s ease',
        }}>
          <h2 style={{
            margin: '0 0 32px 0',
            fontFamily: "'Cinzel', serif",
            fontSize: '24px',
            color: accent,
            letterSpacing: '0.2em',
          }}>
            PAUSED
          </h2>

          {[
            { label: 'Resume', action: resumeGame },
            { label: 'Restart', action: restartGame },
            { label: 'Exit to Arcade', action: exitToArcade },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => {
                arcadeAudio.playClick();
                btn.action();
              }}
              style={{
                display: 'block',
                width: '200px',
                padding: '10px',
                margin: '6px 0',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontFamily: "'Cinzel', serif",
                fontSize: '13px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${primary}33`;
                e.currentTarget.style.borderColor = `${accent}66`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            >
              {btn.label}
            </button>
          ))}

          <div style={{
            marginTop: '20px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            ESC to resume
          </div>
        </div>
      )}

      <style>{`
        @keyframes comboPulse {
          0% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** Tiny helper: listen for Enter/Space to auto-start */
function AutoStartListener({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        arcadeAudio.playClick();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return null;
}
