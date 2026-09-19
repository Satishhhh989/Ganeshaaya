/**
 * MiniGameManager — React context providing shared mini-game state machine.
 * Wraps any active mini-game with lifecycle management.
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { MiniGameId, MiniGameState, MiniGameConfig } from './ArcadeTypes';
import { getGameConfig } from './GameRegistry';
import { scoreManager } from './ScoreManager';
import { arcadeAudio } from './ArcadeAudioController';

interface MiniGameContextValue {
  activeGame: MiniGameConfig | null;
  gameState: MiniGameState;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  isPaused: boolean;
  timeRemaining: number;

  launchGame: (id: MiniGameId) => void;
  startPlaying: () => void;
  addScore: (points: number) => void;
  completeGame: () => void;
  failGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  exitToArcade: () => void;
  setTimeRemaining: (t: number) => void;
}

const MiniGameContext = createContext<MiniGameContextValue | null>(null);

export function useMiniGame(): MiniGameContextValue {
  const ctx = useContext(MiniGameContext);
  if (!ctx) throw new Error('useMiniGame must be used within MiniGameProvider');
  return ctx;
}

interface MiniGameProviderProps {
  children: React.ReactNode;
  onExitToArcade: () => void;
}

export function MiniGameProvider({ children, onExitToArcade }: MiniGameProviderProps) {
  const [activeGame, setActiveGame] = useState<MiniGameConfig | null>(null);
  const [gameState, setGameState] = useState<MiniGameState>('INTRO');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const scoreRef = useRef(0);

  const launchGame = useCallback((id: MiniGameId) => {
    const config = getGameConfig(id);
    if (!config) return;

    setActiveGame(config);
    setGameState('INTRO');
    setScore(0);
    scoreRef.current = 0;
    setBestScore(scoreManager.getBestScore(id));
    setIsNewBest(false);
    setIsPaused(false);
    setTimeRemaining(config.timerSeconds ?? 0);
    scoreManager.resetCombo();
  }, []);

  const startPlaying = useCallback(() => {
    setGameState('PLAYING');
    setIsPaused(false);
  }, []);

  const addScore = useCallback((points: number) => {
    const added = scoreManager.calcPoints(points);
    scoreRef.current += added;
    setScore(scoreRef.current);
  }, []);

  const completeGame = useCallback(() => {
    if (!activeGame) return;
    setGameState('RESULT');
    const finalScore = scoreRef.current;
    const newBest = scoreManager.submitScore(activeGame.id, finalScore, true);
    setIsNewBest(newBest);
    setBestScore(scoreManager.getBestScore(activeGame.id));
    arcadeAudio.playGameWin();
  }, [activeGame]);

  const failGame = useCallback(() => {
    if (!activeGame) return;
    setGameState('RESULT');
    const finalScore = scoreRef.current;
    const newBest = scoreManager.submitScore(activeGame.id, finalScore, finalScore > 0);
    setIsNewBest(newBest);
    setBestScore(scoreManager.getBestScore(activeGame.id));
    arcadeAudio.playGameOver();
  }, [activeGame]);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
    setGameState('PAUSED');
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setGameState('PLAYING');
  }, []);

  const restartGame = useCallback(() => {
    if (!activeGame) return;
    setScore(0);
    scoreRef.current = 0;
    setIsNewBest(false);
    setIsPaused(false);
    setTimeRemaining(activeGame.timerSeconds ?? 0);
    scoreManager.resetCombo();
    setGameState('INTRO');
    // Brief delay then auto-start
    setTimeout(() => setGameState('PLAYING'), 600);
  }, [activeGame]);

  const exitToArcade = useCallback(() => {
    setActiveGame(null);
    setGameState('INTRO');
    setScore(0);
    scoreRef.current = 0;
    setIsPaused(false);
    onExitToArcade();
  }, [onExitToArcade]);

  const value: MiniGameContextValue = {
    activeGame,
    gameState,
    score,
    bestScore,
    isNewBest,
    isPaused,
    timeRemaining,
    launchGame,
    startPlaying,
    addScore,
    completeGame,
    failGame,
    pauseGame,
    resumeGame,
    restartGame,
    exitToArcade,
    setTimeRemaining,
  };

  return (
    <MiniGameContext.Provider value={value}>
      {children}
    </MiniGameContext.Provider>
  );
}
