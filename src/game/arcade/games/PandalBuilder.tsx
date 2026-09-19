/**
 * GAME 03: PANDAAL BUILDER — Construction puzzle
 * Place components in the correct locations to build a pandal.
 */
import { useState, useCallback, useEffect } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface PandalPart {
  id: string;
  name: string;
  icon: string;
  placed: boolean;
  slotX: number;
  slotY: number;
  slotW: number;
  slotH: number;
  color: string;
}

const PARTS: PandalPart[] = [
  { id: 'base', name: 'Foundation', icon: '🧱', placed: false, slotX: 15, slotY: 75, slotW: 70, slotH: 8, color: '#8B4513' },
  { id: 'pillars', name: 'Bamboo Pillars', icon: '🎋', placed: false, slotX: 18, slotY: 40, slotW: 8, slotH: 35, color: '#6B8E23' },
  { id: 'roof', name: 'Roof', icon: '🏠', placed: false, slotX: 10, slotY: 28, slotW: 80, slotH: 14, color: '#CD853F' },
  { id: 'cloth', name: 'Fabric Drapes', icon: '🧵', placed: false, slotX: 20, slotY: 42, slotW: 60, slotH: 20, color: '#DC143C' },
  { id: 'stage', name: 'Stage Platform', icon: '📦', placed: false, slotX: 30, slotY: 68, slotW: 40, slotH: 10, color: '#DAA520' },
  { id: 'marigolds', name: 'Marigold Garlands', icon: '🌼', placed: false, slotX: 12, slotY: 30, slotW: 76, slotH: 6, color: '#FFA500' },
  { id: 'lights', name: 'Festival Lights', icon: '💡', placed: false, slotX: 15, slotY: 35, slotW: 70, slotH: 4, color: '#FFD700' },
  { id: 'rangoli', name: 'Rangoli Design', icon: '🎨', placed: false, slotX: 35, slotY: 82, slotW: 30, slotH: 8, color: '#FF6347' },
];

export default function PandalBuilder() {
  const { gameState, isPaused, addScore, completeGame } = useMiniGame();
  const [parts, setParts] = useState<PandalPart[]>(PARTS.map(p => ({ ...p })));
  const [selected, setSelected] = useState<string | null>(null);
  const [placedCount, setPlacedCount] = useState(0);
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      setParts(PARTS.map(p => ({ ...p, placed: false })));
      setPlacedCount(0);
      setSelected(null);
      setCelebration(false);
      scoreManager.resetCombo();
    }
  }, [gameState]);

  const handleSelectPart = useCallback((id: string) => {
    if (isPaused || celebration) return;
    const part = parts.find(p => p.id === id);
    if (part?.placed) return;
    arcadeAudio.playClick();
    setSelected(id);
  }, [parts, isPaused, celebration]);

  const handlePlaceClick = useCallback((slotId: string) => {
    if (!selected || isPaused || celebration) return;

    if (selected === slotId) {
      // Correct placement
      setParts(prev => prev.map(p =>
        p.id === slotId ? { ...p, placed: true } : p
      ));
      const newCount = placedCount + 1;
      setPlacedCount(newCount);
      setSelected(null);

      scoreManager.incrementCombo();
      addScore(50);
      arcadeAudio.playPlaceSnap();

      if (newCount >= PARTS.length) {
        setCelebration(true);
        addScore(200); // Completion bonus
        setTimeout(() => completeGame(), 2000);
      }
    } else {
      // Wrong placement
      scoreManager.breakCombo();
      arcadeAudio.playWrong();
    }
  }, [selected, placedCount, isPaused, celebration, addScore, completeGame]);

  if (gameState !== 'PLAYING') return null;

  const availableParts = parts.filter(p => !p.placed);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Progress */}
      <div style={{
        padding: '8px 16px',
        textAlign: 'center',
        fontFamily: "'Cinzel', serif",
        fontSize: '12px',
        color: 'rgba(254,240,138,0.7)',
        letterSpacing: '0.15em',
      }}>
        Building Progress: {placedCount}/{PARTS.length}
      </div>

      {/* Pandal Preview Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        {/* Pandal frame */}
        <div style={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          aspectRatio: '1.3',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          {/* Placement slots */}
          {parts.map(part => (
            <div
              key={part.id}
              onClick={() => handlePlaceClick(part.id)}
              style={{
                position: 'absolute',
                left: `${part.slotX}%`,
                top: `${part.slotY}%`,
                width: `${part.slotW}%`,
                height: `${part.slotH}%`,
                borderRadius: '4px',
                cursor: selected && !part.placed ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                ...(part.placed
                  ? {
                      background: part.color,
                      opacity: 0.9,
                      boxShadow: `0 2px 8px ${part.color}44`,
                    }
                  : {
                      background: selected === part.id ? `${part.color}44` : 'rgba(255,255,255,0.05)',
                      border: `1px dashed ${selected ? 'rgba(254,240,138,0.4)' : 'rgba(255,255,255,0.15)'}`,
                      animation: selected === part.id ? 'slotPulse 1s ease infinite' : undefined,
                    }
                ),
              }}
            >
              {part.placed && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(14px, 2vw, 22px)',
                }}>
                  {part.icon}
                </div>
              )}
            </div>
          ))}

          {/* Celebration overlay */}
          {celebration && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(251,191,36,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'celebFlash 0.5s ease',
            }}>
              <div style={{
                textAlign: 'center',
                fontFamily: "'Cinzel', serif",
                color: '#fef08a',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.15em' }}>
                  PANDAL COMPLETE!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Palette */}
      <div style={{
        padding: '12px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: '0.1em',
        }}>
          {selected ? `Click the highlighted slot to place ${parts.find(p => p.id === selected)?.name}` : 'Select a component below'}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {availableParts.map(part => (
            <button
              key={part.id}
              onClick={() => handleSelectPart(part.id)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: selected === part.id ? `${part.color}33` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${selected === part.id ? part.color : 'rgba(255,255,255,0.15)'}`,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selected === part.id ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {part.icon} {part.name}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slotPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes celebFlash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
