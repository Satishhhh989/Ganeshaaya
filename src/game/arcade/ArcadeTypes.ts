/**
 * Game Arcade — Core Type Definitions
 * Shared across all arcade infrastructure and mini-games.
 */

export type MiniGameId =
  | 'modak-catch'
  | 'mushak-dash'
  | 'pandal-builder'
  | 'rangoli-memory'
  | 'dhol-rhythm'
  | 'eco-murti'
  | 'vinayaka-quiz'
  | 'visarjan'
  | 'puja-collector'
  | 'obstacle-path';

export type MiniGameState =
  | 'INTRO'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'SUCCESS'
  | 'FAILED'
  | 'RESULT';

export type ArcadePhase =
  | 'ENTRANCE'
  | 'BROWSING'
  | 'GAME_ACTIVE'
  | 'EXITING';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface MiniGameConfig {
  id: MiniGameId;
  number: number;
  title: string;
  subtitle: string;
  genre: string;
  difficulty: Difficulty;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  instructions: string;
  controls: string;
  timerSeconds?: number;
}

export interface MiniGameSession {
  config: MiniGameConfig;
  state: MiniGameState;
  score: number;
  bestScore: number;
  startTime: number;
  elapsed: number;
  attempts: number;
  completed: boolean;
}

export interface ArcadeScores {
  [gameId: string]: {
    best: number;
    attempts: number;
    completed: boolean;
    lastPlayed: number;
  };
}

/** Props every mini-game component receives from MiniGameShell */
export interface MiniGameProps {
  onScore: (points: number) => void;
  onComplete: (finalScore: number) => void;
  onFail: (finalScore: number) => void;
  isPaused: boolean;
  gameState: MiniGameState;
}
