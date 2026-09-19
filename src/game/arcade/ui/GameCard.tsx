/**
 * GameCard — Individual game station/cabinet in the arcade.
 * Each card has unique visual identity, hover effects, and animated presentation.
 */
import { useState } from 'react';
import type { MiniGameConfig } from '../ArcadeTypes';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface GameCardProps {
  config: MiniGameConfig;
  bestScore: number;
  completed: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
  delay: number;
}

export function GameCard({
  config,
  bestScore,
  completed,
  isHovered,
  onHover,
  onLeave,
  onSelect,
  delay,
}: GameCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Staggered entrance animation
  useState(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  });

  const { primary, secondary, accent } = config.colors;

  return (
    <div
      onMouseEnter={() => {
        onHover();
        arcadeAudio.playHover();
      }}
      onMouseLeave={() => {
        onLeave();
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onSelect}
      style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? isPressed
            ? 'translateY(2px) scale(0.98)'
            : isHovered
            ? 'translateY(-6px) scale(1.02)'
            : 'translateY(0) scale(1)'
          : 'translateY(30px) scale(0.9)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered
          ? `0 12px 40px rgba(0,0,0,0.6), 0 0 30px ${primary}33, 0 2px 0 ${accent}44`
          : '0 4px 16px rgba(0,0,0,0.4)',
        userSelect: 'none',
      }}
    >
      {/* Card background with gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(145deg, ${secondary}ee 0%, ${primary}dd 50%, ${secondary}ee 100%)`,
        zIndex: 0,
      }} />

      {/* Decorative border frame */}
      <div style={{
        position: 'absolute',
        inset: '3px',
        borderRadius: '12px',
        border: `1px solid ${accent}44`,
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Corner ornaments */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
        const [vert, horiz] = pos.split('-');
        return (
          <div
            key={pos}
            style={{
              position: 'absolute',
              [vert]: '8px',
              [horiz]: '8px',
              width: '12px',
              height: '12px',
              borderTop: vert === 'top' ? `2px solid ${accent}66` : 'none',
              borderBottom: vert === 'bottom' ? `2px solid ${accent}66` : 'none',
              borderLeft: horiz === 'left' ? `2px solid ${accent}66` : 'none',
              borderRight: horiz === 'right' ? `2px solid ${accent}66` : 'none',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: '20px 18px 16px',
      }}>
        {/* Game number badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: `${accent}22`,
          border: `1px solid ${accent}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Cinzel', serif",
          fontSize: '11px',
          fontWeight: 700,
          color: accent,
        }}>
          {String(config.number).padStart(2, '0')}
        </div>

        {/* Icon */}
        <div style={{
          fontSize: '36px',
          marginBottom: '10px',
          filter: isHovered ? `drop-shadow(0 0 8px ${accent})` : 'none',
          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
          transition: 'all 0.3s ease',
        }}>
          {config.icon}
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 4px 0',
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '16px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.06em',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {config.title}
        </h3>

        {/* Subtitle */}
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          {config.subtitle}
        </p>

        {/* Meta row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 600,
            color: accent,
            background: `${accent}15`,
            border: `1px solid ${accent}33`,
            letterSpacing: '0.05em',
          }}>
            {config.genre}
          </span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 600,
            color: config.difficulty === 'Hard' ? '#fca5a5' : config.difficulty === 'Medium' ? '#fde68a' : '#86efac',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {config.difficulty}
          </span>
        </div>

        {/* Score / Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {bestScore > 0 ? (
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Inter', sans-serif",
            }}>
              Best: <span style={{ color: accent, fontWeight: 600 }}>
                {scoreManager.formatScore(bestScore)}
              </span>
            </div>
          ) : (
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'Inter', sans-serif",
            }}>
              Not played yet
            </div>
          )}

          {completed && (
            <div style={{
              fontSize: '10px',
              color: '#86efac',
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}>
              ✓ COMPLETED
            </div>
          )}
        </div>

        {/* Play button (appears on hover) */}
        <div style={{
          marginTop: '12px',
          textAlign: 'center',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.25s ease',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 28px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${primary}, ${accent}88)`,
            color: '#000',
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            boxShadow: `0 4px 16px ${primary}44`,
          }}>
            ▶ PLAY
          </div>
        </div>
      </div>

      {/* Hover glow overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center bottom, ${accent}10 0%, transparent 70%)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 4,
      }} />
    </div>
  );
}
