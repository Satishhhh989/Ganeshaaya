/**
 * ResultScreen — Clean cinematic result display shown after every mini-game.
 */
import type { MiniGameConfig } from '../ArcadeTypes';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface ResultScreenProps {
  config: MiniGameConfig;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onReplay: () => void;
  onExit: () => void;
}

export function ResultScreen({ config, score, bestScore, isNewBest, onReplay, onExit }: ResultScreenProps) {
  const { primary, accent } = config.colors;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 140,
      background: 'rgba(6, 3, 2, 0.95)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'resultSlideIn 0.6s ease',
    }}>
      {/* Game icon */}
      <div style={{
        fontSize: '48px',
        marginBottom: '12px',
        filter: `drop-shadow(0 0 12px ${accent})`,
      }}>
        {config.icon}
      </div>

      {/* Complete label */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '12px',
        color: 'rgba(254, 240, 138, 0.6)',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}>
        Game Complete
      </div>

      <h2 style={{
        margin: '0 0 24px 0',
        fontFamily: "'Cinzel', 'Marcellus', serif",
        fontSize: 'clamp(20px, 3.5vw, 28px)',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '0.08em',
        textShadow: `0 2px 12px ${primary}44`,
      }}>
        {config.title}
      </h2>

      {/* Score display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          Score
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(36px, 6vw, 52px)',
          fontWeight: 800,
          color: accent,
          textShadow: `0 0 20px ${accent}44`,
          lineHeight: 1,
        }}>
          {scoreManager.formatScore(score)}
        </div>

        {/* New best indicator */}
        {isNewBest && score > 0 && (
          <div style={{
            marginTop: '8px',
            padding: '4px 16px',
            borderRadius: '12px',
            background: 'rgba(250, 204, 21, 0.15)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            fontWeight: 700,
            color: '#fde047',
            letterSpacing: '0.2em',
            animation: 'newBestPulse 1s ease infinite',
          }}>
            ★ NEW BEST! ★
          </div>
        )}

        {/* Previous best */}
        {!isNewBest && bestScore > 0 && (
          <div style={{
            marginTop: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            Best: {scoreManager.formatScore(bestScore)}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
      }}>
        <button
          onClick={() => {
            arcadeAudio.playClick();
            onReplay();
          }}
          style={{
            padding: '10px 32px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${primary}, ${accent}88)`,
            border: `1px solid ${accent}44`,
            color: '#000',
            fontFamily: "'Cinzel', serif",
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Play Again
        </button>

        <button
          onClick={() => {
            arcadeAudio.playClick();
            onExit();
          }}
          style={{
            padding: '10px 32px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Cinzel', serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          Return to Arcade
        </button>
      </div>

      <style>{`
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes newBestPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
