/**
 * Score Manager — Persistent score storage and combo tracking for the arcade.
 */
import type { ArcadeScores } from './ArcadeTypes';

const STORAGE_KEY = 'vinayaka_arcade_scores';

class ScoreManagerClass {
  private scores: ArcadeScores = {};
  private combo: number = 0;
  private maxCombo: number = 0;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.scores = JSON.parse(raw);
    } catch {
      this.scores = {};
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
    } catch {
      /* localStorage unavailable */
    }
  }

  getBestScore(gameId: string): number {
    return this.scores[gameId]?.best ?? 0;
  }

  getAttempts(gameId: string): number {
    return this.scores[gameId]?.attempts ?? 0;
  }

  isCompleted(gameId: string): boolean {
    return this.scores[gameId]?.completed ?? false;
  }

  getAllScores(): ArcadeScores {
    return { ...this.scores };
  }

  submitScore(gameId: string, score: number, completed: boolean = true): boolean {
    const existing = this.scores[gameId];
    const isNewBest = !existing || score > existing.best;

    this.scores[gameId] = {
      best: isNewBest ? score : (existing?.best ?? 0),
      attempts: (existing?.attempts ?? 0) + 1,
      completed: completed || (existing?.completed ?? false),
      lastPlayed: Date.now(),
    };

    this.save();
    return isNewBest;
  }

  // Combo tracking (reset per game session)
  resetCombo() {
    this.combo = 0;
    this.maxCombo = 0;
  }

  incrementCombo(): number {
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    return this.combo;
  }

  breakCombo() {
    this.combo = 0;
  }

  getCombo(): number {
    return this.combo;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getMultiplier(): number {
    if (this.combo >= 20) return 4;
    if (this.combo >= 10) return 3;
    if (this.combo >= 5) return 2;
    return 1;
  }

  /** Calculate score with current combo multiplier */
  calcPoints(base: number): number {
    return base * this.getMultiplier();
  }

  /** Format score for display */
  formatScore(score: number): string {
    return score.toLocaleString('en-IN');
  }
}

export const scoreManager = new ScoreManagerClass();
