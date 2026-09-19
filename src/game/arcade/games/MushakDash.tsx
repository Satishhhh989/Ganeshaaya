/**
 * GAME 02: MUSHAK DASH — Endless runner side-scroller
 * Mushak (mouse) auto-runs right, jump/duck to avoid obstacles, collect items.
 */
import { useEffect, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'basket' | 'wall' | 'flower_pot' | 'puddle';
}

interface Collectible {
  x: number;
  y: number;
  type: 'modak' | 'flower' | 'bell';
  collected: boolean;
}

export default function MushakDash() {
  const { gameState, isPaused, addScore, failGame, completeGame } = useMiniGame();
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

    const GROUND_Y = () => H() - 60;
    const PLAYER_W = 28;
    const PLAYER_H = 32;

    const state = {
      playerY: 0,
      playerVY: 0,
      isDucking: false,
      isJumping: false,
      distance: 0,
      speed: 4,
      score: 0,
      obstacles: [] as Obstacle[],
      collectibles: [] as Collectible[],
      spawnTimer: 0,
      collectSpawnTimer: 0,
      gameOver: false,
      lastTime: performance.now(),
      keys: {} as Record<string, boolean>,
      runFrame: 0,
      runTimer: 0,
    };

    state.playerY = GROUND_Y() - PLAYER_H;

    const handleKeyDown = (e: KeyboardEvent) => {
      state.keys[e.key.toLowerCase()] = true;
      state.keys[e.code] = true;
      if ((e.code === 'Space' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && !state.isJumping) {
        state.playerVY = -12;
        state.isJumping = true;
        arcadeAudio.playJump();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key.toLowerCase()] = false;
      state.keys[e.code] = false;
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const rect = canvas.getBoundingClientRect();
      const relY = y - rect.top;
      if (relY < rect.height * 0.5) {
        // Top half = jump
        if (!state.isJumping) {
          state.playerVY = -12;
          state.isJumping = true;
          arcadeAudio.playJump();
        }
      } else {
        // Bottom half = duck
        state.isDucking = true;
      }
    };
    const handleTouchEnd = () => { state.isDucking = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    scoreManager.resetCombo();

    let animId = 0;
    const loop = (now: number) => {
      if (state.gameOver) return;
      if (isPaused) { state.lastTime = now; animId = requestAnimationFrame(loop); return; }

      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;

      const w = W();
      const h = H();
      const groundY = GROUND_Y();

      // Ducking
      state.isDucking = state.keys['arrowdown'] || state.keys['s'];

      // Speed increases
      state.speed = 4 + state.distance / 2000;
      state.distance += state.speed * dt * 60;
      state.score = Math.floor(state.distance / 10);

      // Gravity
      state.playerVY += 0.6;
      state.playerY += state.playerVY;
      if (state.playerY >= groundY - PLAYER_H) {
        state.playerY = groundY - PLAYER_H;
        state.playerVY = 0;
        state.isJumping = false;
      }

      // Run animation
      state.runTimer += dt;
      if (state.runTimer > 0.1) { state.runFrame = (state.runFrame + 1) % 4; state.runTimer = 0; }

      // Spawn obstacles
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        const types: Obstacle['type'][] = ['basket', 'wall', 'flower_pot', 'puddle'];
        const type = types[Math.floor(Math.random() * types.length)];
        const oh = type === 'wall' ? 50 : type === 'puddle' ? 10 : 30;
        const ow = type === 'wall' ? 20 : type === 'puddle' ? 40 : 25;
        state.obstacles.push({
          x: w + 50,
          y: groundY - oh,
          w: ow,
          h: oh,
          type,
        });
        state.spawnTimer = Math.max(0.8, 2.5 - state.speed * 0.15) + Math.random() * 0.5;
      }

      // Spawn collectibles
      state.collectSpawnTimer -= dt;
      if (state.collectSpawnTimer <= 0) {
        const types: Collectible['type'][] = ['modak', 'flower', 'bell'];
        const type = types[Math.floor(Math.random() * types.length)];
        state.collectibles.push({
          x: w + 50,
          y: groundY - 50 - Math.random() * 80,
          type,
          collected: false,
        });
        state.collectSpawnTimer = 1 + Math.random() * 1.5;
      }

      const playerX = 80;
      const playerH = state.isDucking ? PLAYER_H * 0.6 : PLAYER_H;
      const playerTop = state.isDucking ? state.playerY + PLAYER_H * 0.4 : state.playerY;

      // Update obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.speed * dt * 60;
        // Collision
        if (
          playerX + PLAYER_W > obs.x &&
          playerX < obs.x + obs.w &&
          playerTop + playerH > obs.y &&
          playerTop < obs.y + obs.h
        ) {
          state.gameOver = true;
          arcadeAudio.playModakMiss();
          addScore(state.score);
          if (state.score > 50) completeGame();
          else failGame();
          return false;
        }
        return obs.x > -60;
      });

      // Update collectibles
      state.collectibles = state.collectibles.filter(col => {
        col.x -= state.speed * dt * 60;
        if (!col.collected &&
            Math.abs(playerX + PLAYER_W / 2 - col.x) < 25 &&
            Math.abs(playerTop + playerH / 2 - col.y) < 25) {
          col.collected = true;
          const pts = col.type === 'bell' ? 20 : col.type === 'modak' ? 10 : 5;
          scoreManager.incrementCombo();
          addScore(pts);
          arcadeAudio.playItemCollect();
          return false;
        }
        return col.x > -30;
      });

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1a2744');
      skyGrad.addColorStop(0.7, '#2d4a3e');
      skyGrad.addColorStop(1, '#3a5a3e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(now * 0.001 + i) * 0.15})`;
        ctx.fillRect((i * 73 + state.distance * 0.1) % w, (i * 37) % (h * 0.5), 2, 2);
      }

      // Ground
      ctx.fillStyle = '#5a3a28';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Festival decorations in background
      for (let i = 0; i < 5; i++) {
        const bx = ((i * 200 - state.distance * 0.3) % (w + 200) + w + 200) % (w + 200) - 100;
        ctx.fillStyle = 'rgba(217,119,6,0.15)';
        ctx.fillRect(bx, groundY - 100, 30, 100);
        // Flag
        ctx.fillStyle = `hsl(${(i * 30 + 20)}, 70%, 50%)`;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(bx + 30, groundY - 100 + Math.sin(now * 0.002 + i) * 3, 20, 12);
        ctx.globalAlpha = 1;
      }

      // Obstacles
      state.obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 'wall' ? '#8b5e34' : obs.type === 'puddle' ? '#4a90d9' : obs.type === 'basket' ? '#a0522d' : '#d4956b';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        if (obs.type === 'basket') {
          ctx.strokeStyle = '#6b3a1f';
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        }
      });

      // Collectibles
      state.collectibles.forEach(col => {
        if (col.collected) return;
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const emoji = col.type === 'modak' ? '🍡' : col.type === 'bell' ? '🔔' : '🌸';
        ctx.fillText(emoji, col.x, col.y);
      });

      // Player (Mushak - cute mouse shape)
      ctx.save();
      ctx.translate(playerX, playerTop);
      // Body
      ctx.fillStyle = '#c0a080';
      const bh = state.isDucking ? playerH : PLAYER_H;
      ctx.beginPath();
      ctx.ellipse(PLAYER_W / 2, bh / 2, PLAYER_W / 2, bh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      if (!state.isDucking) {
        ctx.fillStyle = '#e0c0a0';
        ctx.beginPath();
        ctx.ellipse(6, -2, 6, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(PLAYER_W - 6, -2, 6, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(PLAYER_W - 6, bh * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#ff9999';
      ctx.beginPath();
      ctx.arc(PLAYER_W + 2, bh * 0.45, 3, 0, Math.PI * 2);
      ctx.fill();
      // Legs (animated)
      const legOffset = Math.sin(state.runFrame * Math.PI / 2) * 4;
      ctx.fillStyle = '#a08060';
      ctx.fillRect(6, bh - 2, 5, 6 + legOffset);
      ctx.fillRect(PLAYER_W - 12, bh - 2, 5, 6 - legOffset);
      ctx.restore();

      // Distance display
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.floor(state.distance)}m`, 12, h - 12);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, isPaused, addScore, failGame, completeGame]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
    />
  );
}
