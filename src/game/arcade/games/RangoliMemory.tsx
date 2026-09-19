/**
 * GAME 04: RANGOLI MEMORY — Pattern memorization puzzle
 * A rangoli pattern appears briefly, then must be recreated from memory.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

const COLORS = ['#DC2626', '#F97316', '#FBBF24', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

interface Level {
  gridSize: number;
  colorCount: number;
  showTime: number;
}

const LEVELS: Level[] = [
  { gridSize: 3, colorCount: 3, showTime: 3000 },
  { gridSize: 3, colorCount: 4, showTime: 2500 },
  { gridSize: 4, colorCount: 5, showTime: 3000 },
  { gridSize: 4, colorCount: 6, showTime: 2500 },
  { gridSize: 5, colorCount: 7, showTime: 3000 },
];

export default function RangoliMemory() {
  const { gameState, isPaused, addScore, completeGame, failGame } = useMiniGame();
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<'SHOWING' | 'HIDING' | 'INPUT' | 'FEEDBACK'>('SHOWING');
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCells, setCorrectCells] = useState<Set<number>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<number>>(new Set());
  const startTimeRef = useRef(Date.now());

  const generatePattern = useCallback((lvl: Level) => {
    const size = lvl.gridSize * lvl.gridSize;
    const newPattern: number[] = [];
    for (let i = 0; i < size; i++) {
      newPattern.push(Math.floor(Math.random() * lvl.colorCount));
    }
    return newPattern;
  }, []);

  const startLevel = useCallback(() => {
    const lvl = LEVELS[level];
    const newPattern = generatePattern(lvl);
    setPattern(newPattern);
    setPlayerPattern(new Array(newPattern.length).fill(-1));
    setSelectedColor(0);
    setCorrectCells(new Set());
    setWrongCells(new Set());
    setPhase('SHOWING');
    startTimeRef.current = Date.now();

    setTimeout(() => setPhase('HIDING'), 500);
    setTimeout(() => setPhase('INPUT'), 500 + lvl.showTime);
  }, [level, generatePattern]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      setLevel(0);
      setLives(3);
      scoreManager.resetCombo();
      startLevel();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING' && phase === 'SHOWING') {
      startLevel();
    }
  }, [level]);

  const handleCellClick = useCallback((index: number) => {
    if (phase !== 'INPUT' || isPaused) return;

    const newPlayerPattern = [...playerPattern];
    newPlayerPattern[index] = selectedColor;
    setPlayerPattern(newPlayerPattern);

    if (selectedColor === pattern[index]) {
      setCorrectCells(prev => new Set([...prev, index]));
      scoreManager.incrementCombo();
      arcadeAudio.playCorrect();
    } else {
      setWrongCells(prev => new Set([...prev, index]));
      scoreManager.breakCombo();
      arcadeAudio.playWrong();
    }

    // Check if all cells are filled
    const filledCount = newPlayerPattern.filter(c => c >= 0).length;
    if (filledCount >= pattern.length) {
      setPhase('FEEDBACK');

      // Calculate accuracy
      let correct = 0;
      for (let i = 0; i < pattern.length; i++) {
        if (newPlayerPattern[i] === pattern[i]) correct++;
      }
      const accuracy = correct / pattern.length;
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      const timeBonus = Math.max(0, Math.floor((30 - timeTaken) * 5));
      const levelScore = Math.floor(accuracy * 100) + timeBonus;
      addScore(levelScore);

      setTimeout(() => {
        if (accuracy < 0.5) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              failGame();
            } else {
              startLevel(); // Retry same level
            }
            return newLives;
          });
        } else if (level >= LEVELS.length - 1) {
          addScore(500); // Completion bonus
          completeGame();
        } else {
          setLevel(prev => prev + 1);
        }
      }, 1500);
    }
  }, [phase, isPaused, selectedColor, playerPattern, pattern, level, addScore, completeGame, failGame, startLevel]);

  if (gameState !== 'PLAYING') return null;

  const currentLevel = LEVELS[Math.min(level, LEVELS.length - 1)];
  const gridSize = currentLevel.gridSize;
  const showingPattern = phase === 'SHOWING' || phase === 'HIDING';
  const cellSize = Math.min(60, (Math.min(window.innerWidth, window.innerHeight) - 200) / gridSize);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #1a0e20 0%, #2d1028 50%, #1a0e20 100%)',
      padding: '16px',
      gap: '16px',
    }}>
      {/* Level indicator */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '14px',
        color: 'rgba(254,240,138,0.7)',
        letterSpacing: '0.15em',
      }}>
        Level {level + 1} of {LEVELS.length} · ❤️ ×{lives}
      </div>

      {/* Phase indicator */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '12px',
        color: showingPattern ? '#fbbf24' : phase === 'FEEDBACK' ? '#86efac' : 'rgba(255,255,255,0.5)',
        letterSpacing: '0.1em',
        minHeight: '20px',
      }}>
        {showingPattern ? 'Memorize the pattern...' : phase === 'INPUT' ? 'Recreate the pattern!' : 'Checking...'}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: '4px',
      }}>
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const isCorrect = correctCells.has(i);
          const isWrong = wrongCells.has(i);
          const displayColor = showingPattern
            ? COLORS[pattern[i]]
            : playerPattern[i] >= 0
            ? COLORS[playerPattern[i]]
            : 'rgba(255,255,255,0.06)';

          return (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: '6px',
                backgroundColor: displayColor,
                border: isCorrect
                  ? '2px solid #22c55e'
                  : isWrong
                  ? '2px solid #ef4444'
                  : showingPattern
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(255,255,255,0.1)',
                cursor: phase === 'INPUT' ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                transform: isCorrect ? 'scale(1.05)' : isWrong ? 'scale(0.95)' : 'scale(1)',
                opacity: phase === 'HIDING' ? 0 : 1,
                boxShadow: showingPattern ? `0 2px 8px ${displayColor}44` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Color palette (only during INPUT) */}
      {phase === 'INPUT' && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
        }}>
          {COLORS.slice(0, currentLevel.colorCount).map((color, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedColor(i);
                arcadeAudio.playClick();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === i ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transform: selectedColor === i ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.2s ease',
                boxShadow: selectedColor === i ? `0 0 12px ${color}88` : undefined,
              }}
            />
          ))}
        </div>
      )}

      {/* Feedback during showing */}
      {phase === 'FEEDBACK' && (
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '16px',
          color: '#fef08a',
          animation: 'resultSlideIn 0.3s ease',
        }}>
          {correctCells.size === pattern.length ? '✨ Perfect!' : `${correctCells.size}/${pattern.length} correct`}
        </div>
      )}

      <style>{`
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
