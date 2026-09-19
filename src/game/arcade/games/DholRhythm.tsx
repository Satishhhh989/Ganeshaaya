/**
 * GAME 05: DHOL RHYTHM — Rhythm game with 4-lane note hitting
 * Notes scroll down, player presses A/S/D/F or arrow keys in time.
 */
import { useEffect, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface Note {
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
  id: number;
  spawnTime: number;
}

interface HitFeedback {
  lane: number;
  text: string;
  color: string;
  alpha: number;
}

const LANE_KEYS = [
  ['a', 'KeyA'],
  ['s', 'KeyS'],
  ['d', 'KeyD'],
  ['f', 'KeyF'],
];
const LANE_COLORS = ['#dc2626', '#f59e0b', '#22c55e', '#3b82f6'];
const LANE_LABELS = ['A', 'S', 'D', 'F'];
const HIT_Y = 0.85; // Normalized hit zone position

export default function DholRhythm() {
  const { gameState, isPaused, addScore, completeGame } = useMiniGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Generate rhythm pattern
    const BPM_PHASES = [90, 120, 150]; // Slow → Medium → Fast
    const SONG_DURATION = 45; // seconds

    const state = {
      notes: [] as Note[],
      feedbacks: [] as HitFeedback[],
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      greatCount: 0,
      goodCount: 0,
      missCount: 0,
      elapsed: 0,
      lastTime: performance.now(),
      nextId: 0,
      spawnTimer: 0,
      bpmPhase: 0,
      keysPressed: new Set<string>(),
      laneFlash: [0, 0, 0, 0],
      gameOver: false,
    };

    // Pre-generate notes from rhythm pattern
    const generateNotes = () => {
      let t = 1; // Start after 1 second
      while (t < SONG_DURATION) {
        const phase = t < 15 ? 0 : t < 30 ? 1 : 2;
        const bpm = BPM_PHASES[phase];
        const beatInterval = 60 / bpm;

        // Simple rhythm patterns
        const lane = Math.floor(Math.random() * 4);
        state.notes.push({
          lane,
          y: -0.1, // Will be calculated based on time
          hit: false,
          missed: false,
          id: state.nextId++,
          spawnTime: t,
        });

        // Sometimes add double notes
        if (Math.random() < 0.2 && phase > 0) {
          let lane2 = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
          state.notes.push({
            lane: lane2,
            y: -0.1,
            hit: false,
            missed: false,
            id: state.nextId++,
            spawnTime: t,
          });
        }

        t += beatInterval * (0.5 + Math.random() * 0.5);
      }
    };

    generateNotes();
    scoreManager.resetCombo();

    const checkHit = (lane: number) => {
      const h = H();
      const hitZone = HIT_Y * h;
      const tolerance = h * 0.12;

      let bestNote: Note | null = null;
      let bestDist = Infinity;

      for (const note of state.notes) {
        if (note.lane !== lane || note.hit || note.missed) continue;
        const noteY = note.y * h;
        const dist = Math.abs(noteY - hitZone);
        if (dist < tolerance && dist < bestDist) {
          bestNote = note;
          bestDist = dist;
        }
      }

      if (bestNote) {
        const targetNote: Note = bestNote;
        targetNote.hit = true;
        const dist = bestDist;
        let accuracy: 'PERFECT' | 'GREAT' | 'GOOD';
        let points: number;
        let color: string;

        if (dist < tolerance * 0.25) {
          accuracy = 'PERFECT';
          points = 100;
          color = '#fde047';
          state.perfectCount++;
        } else if (dist < tolerance * 0.55) {
          accuracy = 'GREAT';
          points = 60;
          color = '#86efac';
          state.greatCount++;
        } else {
          accuracy = 'GOOD';
          points = 30;
          color = '#93c5fd';
          state.goodCount++;
        }

        state.combo++;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;
        scoreManager.incrementCombo();
        addScore(points);
        arcadeAudio.playRhythmHit(accuracy);
        arcadeAudio.playDholBeat();

        state.feedbacks.push({ lane, text: accuracy, color, alpha: 1.5 });
        state.laneFlash[lane] = 1;
      } else {
        // Miss (pressed key with no note)
        state.laneFlash[lane] = 0.5;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.keysPressed.has(e.code)) return;
      state.keysPressed.add(e.code);
      state.keysPressed.add(e.key.toLowerCase());

      for (let lane = 0; lane < 4; lane++) {
        if (LANE_KEYS[lane].includes(e.key.toLowerCase()) || LANE_KEYS[lane].includes(e.code)) {
          checkHit(lane);
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      state.keysPressed.delete(e.code);
      state.keysPressed.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch controls
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const x = e.changedTouches[i].clientX - rect.left;
        const lane = Math.floor((x / rect.width) * 4);
        if (lane >= 0 && lane < 4) checkHit(lane);
      }
    };
    canvas.addEventListener('touchstart', handleTouch, { passive: true });

    const SCROLL_SPEED = 0.35; // normalized units per second

    let animId = 0;
    const loop = (now: number) => {
      if (state.gameOver) return;
      if (isPaused) { state.lastTime = now; animId = requestAnimationFrame(loop); return; }

      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;
      state.elapsed += dt;

      const w = W();
      const h = H();
      const laneW = w / 4;
      const hitZone = HIT_Y * h;

      // Update note positions based on elapsed time
      state.notes.forEach(note => {
        if (note.hit || note.missed) return;
        const timeToHit = note.spawnTime - state.elapsed;
        note.y = HIT_Y - timeToHit * SCROLL_SPEED;

        // Check if missed
        if (note.y > HIT_Y + 0.15) {
          note.missed = true;
          state.combo = 0;
          state.missCount++;
          scoreManager.breakCombo();
          arcadeAudio.playRhythmHit('MISS');
          state.feedbacks.push({ lane: note.lane, text: 'MISS', color: '#ef4444', alpha: 1.2 });
        }
      });

      // Update feedbacks
      state.feedbacks = state.feedbacks.filter(f => {
        f.alpha -= dt * 2;
        return f.alpha > 0;
      });

      // Lane flash decay
      for (let i = 0; i < 4; i++) {
        state.laneFlash[i] *= 0.92;
      }

      // End of song
      if (state.elapsed >= SONG_DURATION + 2) {
        state.gameOver = true;
        completeGame();
        return;
      }

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#0c0614';
      ctx.fillRect(0, 0, w, h);

      // Lane backgrounds
      for (let i = 0; i < 4; i++) {
        const x = i * laneW;
        ctx.fillStyle = `rgba(${i === 0 ? '220,38,38' : i === 1 ? '245,158,11' : i === 2 ? '34,197,94' : '59,130,246'},${0.03 + state.laneFlash[i] * 0.15})`;
        ctx.fillRect(x, 0, laneW, h);

        // Lane separator
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      }

      // Hit zone line
      ctx.strokeStyle = 'rgba(254,240,138,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, hitZone);
      ctx.lineTo(w, hitZone);
      ctx.stroke();

      // Hit zone circles
      for (let i = 0; i < 4; i++) {
        const cx = i * laneW + laneW / 2;
        ctx.strokeStyle = `${LANE_COLORS[i]}88`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, hitZone, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Lane label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(LANE_LABELS[i], cx, hitZone + 36);
      }

      // Notes
      state.notes.forEach(note => {
        if (note.hit || note.missed) return;
        if (note.y < -0.05 || note.y > 1.05) return;

        const cx = note.lane * laneW + laneW / 2;
        const cy = note.y * h;
        const r = 16;

        ctx.fillStyle = LANE_COLORS[note.lane];
        ctx.shadowColor = LANE_COLORS[note.lane];
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Feedbacks
      state.feedbacks.forEach(f => {
        const cx = f.lane * laneW + laneW / 2;
        ctx.globalAlpha = Math.min(1, f.alpha);
        ctx.fillStyle = f.color;
        ctx.font = 'bold 16px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.text, cx, hitZone - 40 - (1.5 - f.alpha) * 20);
        ctx.globalAlpha = 1;
      });

      // Combo display
      if (state.combo >= 3) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 18px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${state.combo}× COMBO`, w / 2, 50);
      }

      // Progress bar
      const progress = Math.min(1, state.elapsed / SONG_DURATION);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, h - 4, w, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, h - 4, w * progress, 4);

      // BPM phase label
      const phaseLabel = state.elapsed < 15 ? 'Slow Dhol' : state.elapsed < 30 ? 'Tasha Beat' : 'Festival Frenzy!';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(phaseLabel, w - 12, 20);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, isPaused, addScore, completeGame]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
    />
  );
}
