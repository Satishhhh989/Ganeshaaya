/**
 * GAME 10: GANESHA'S OBSTACLE PATH — Side-scrolling platformer obstacle course
 * Jump, run, collect modaks, avoid obstacles, reach the finish.
 */
import { useEffect, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface Platform {
  x: number;
  y: number;
  w: number;
  type: 'ground' | 'platform' | 'moving';
  moveRange?: number;
  moveSpeed?: number;
  baseY?: number;
}

interface ObstacleItem {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'pot' | 'garland' | 'puddle' | 'fire';
}

interface Collectible {
  x: number;
  y: number;
  collected: boolean;
}

interface Checkpoint {
  x: number;
  reached: boolean;
}

export default function ObstaclePath() {
  const { gameState, isPaused, addScore, completeGame, failGame } = useMiniGame();
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

    const COURSE_LENGTH = 4000;
    const GROUND_H = 40;

    // Generate level
    const platforms: Platform[] = [];
    const obstacles: ObstacleItem[] = [];
    const modaks: Collectible[] = [];
    const checkpoints: Checkpoint[] = [];

    // Ground segments
    let gx = 0;
    while (gx < COURSE_LENGTH) {
      const segW = 150 + Math.random() * 200;
      platforms.push({ x: gx, y: 0, w: segW, type: 'ground' });
      gx += segW + (Math.random() < 0.3 ? 60 + Math.random() * 40 : 0); // occasional gaps
    }

    // Elevated platforms
    for (let i = 0; i < 20; i++) {
      const px = 300 + i * 180 + Math.random() * 80;
      const py = 50 + Math.random() * 80;
      const pw = 60 + Math.random() * 60;
      const isMoving = Math.random() < 0.2;
      platforms.push({
        x: px,
        y: py,
        w: pw,
        type: isMoving ? 'moving' : 'platform',
        moveRange: isMoving ? 30 + Math.random() * 30 : undefined,
        moveSpeed: isMoving ? 1 + Math.random() * 2 : undefined,
        baseY: py,
      });
    }

    // Obstacles
    for (let i = 0; i < 25; i++) {
      const ox = 200 + i * 150 + Math.random() * 50;
      const types: ObstacleItem['type'][] = ['pot', 'garland', 'puddle', 'fire'];
      const type = types[Math.floor(Math.random() * types.length)];
      const oh = type === 'garland' ? 50 : type === 'puddle' ? 8 : 24;
      const ow = type === 'puddle' ? 40 : type === 'garland' ? 15 : 20;
      obstacles.push({
        x: ox,
        y: type === 'garland' ? 30 : 0,
        w: ow,
        h: oh,
        type,
      });
    }

    // Modaks
    for (let i = 0; i < 40; i++) {
      modaks.push({
        x: 100 + i * 95 + Math.random() * 40,
        y: 30 + Math.random() * 90,
        collected: false,
      });
    }

    // Checkpoints
    for (let i = 1; i <= 5; i++) {
      checkpoints.push({ x: i * (COURSE_LENGTH / 6), reached: false });
    }

    const state = {
      px: 50,
      py: 0,
      pvx: 0,
      pvy: 0,
      onGround: false,
      lives: 3,
      scrollX: 0,
      score: 0,
      finished: false,
      lastTime: performance.now(),
      keys: {} as Record<string, boolean>,
      respawnX: 50,
      jumpCount: 0,
      runFrame: 0,
      runTimer: 0,
      invincible: 0,
    };

    scoreManager.resetCombo();

    const handleKeyDown = (e: KeyboardEvent) => {
      state.keys[e.key.toLowerCase()] = true;
      state.keys[e.code] = true;
      if ((e.code === 'Space' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') && state.jumpCount < 2) {
        state.pvy = -10;
        state.jumpCount++;
        arcadeAudio.playJump();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      state.keys[e.key.toLowerCase()] = false;
      state.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch: tap to jump, drag left/right
    let touchX = -1;
    const handleTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX;
      if (state.jumpCount < 2) {
        state.pvy = -10;
        state.jumpCount++;
        arcadeAudio.playJump();
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      const nx = e.touches[0].clientX;
      const dx = nx - touchX;
      if (dx > 15) state.keys['d'] = true;
      else if (dx < -15) state.keys['a'] = true;
      else { state.keys['d'] = false; state.keys['a'] = false; }
    };
    const handleTouchEnd = () => { state.keys['a'] = false; state.keys['d'] = false; touchX = -1; };
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    let animId = 0;
    const GRAVITY = 0.45;
    const PLAYER_W = 22;
    const PLAYER_H = 28;

    const loop = (now: number) => {
      if (state.finished) return;
      if (isPaused) { state.lastTime = now; animId = requestAnimationFrame(loop); return; }

      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;
      const w = W();
      const h = H();
      const groundLevel = h - GROUND_H;

      // Horizontal movement
      const accel = 0.6;
      const maxSpeed = 5;
      const friction = 0.85;

      if (state.keys['d'] || state.keys['arrowright']) state.pvx += accel;
      if (state.keys['a'] || state.keys['arrowleft']) state.pvx -= accel;
      state.pvx *= friction;
      state.pvx = Math.max(-maxSpeed, Math.min(maxSpeed, state.pvx));
      state.px += state.pvx;

      // Gravity
      state.pvy += GRAVITY;
      state.py += state.pvy;

      // Moving platforms update
      platforms.forEach(plat => {
        if (plat.type === 'moving' && plat.baseY !== undefined && plat.moveRange && plat.moveSpeed) {
          plat.y = plat.baseY + Math.sin(now * 0.001 * plat.moveSpeed) * plat.moveRange;
        }
      });

      // Platform collision
      state.onGround = false;
      platforms.forEach(plat => {
        const platTop = groundLevel - plat.y - 10;
        if (plat.type === 'ground') {
          // Ground platform
          if (state.px + PLAYER_W / 2 > plat.x && state.px - PLAYER_W / 2 < plat.x + plat.w) {
            if (state.py + PLAYER_H >= groundLevel && state.pvy >= 0) {
              state.py = groundLevel - PLAYER_H;
              state.pvy = 0;
              state.onGround = true;
              state.jumpCount = 0;
            }
          }
        } else {
          // Elevated platform
          if (state.px + PLAYER_W / 2 > plat.x && state.px - PLAYER_W / 2 < plat.x + plat.w) {
            if (state.py + PLAYER_H >= platTop && state.py + PLAYER_H <= platTop + 15 && state.pvy >= 0) {
              state.py = platTop - PLAYER_H;
              state.pvy = 0;
              state.onGround = true;
              state.jumpCount = 0;
            }
          }
        }
      });

      // Fall into void
      if (state.py > h + 50) {
        state.lives--;
        state.px = state.respawnX;
        state.py = 0;
        state.pvy = 0;
        state.pvx = 0;
        state.invincible = 2;
        if (state.lives <= 0) {
          state.finished = true;
          failGame();
          return;
        }
      }

      // Invincibility timer
      if (state.invincible > 0) state.invincible -= dt;

      // Obstacle collision
      if (state.invincible <= 0) {
        for (const obs of obstacles) {
          const obsScreenX = obs.x - state.scrollX;
          if (obsScreenX < -50 || obsScreenX > w + 50) continue;

          const obsTop = obs.type === 'garland' ? groundLevel - obs.y - obs.h : groundLevel - obs.h;
          if (
            state.px + PLAYER_W / 2 > obs.x &&
            state.px - PLAYER_W / 2 < obs.x + obs.w &&
            state.py + PLAYER_H > obsTop &&
            state.py < obsTop + obs.h
          ) {
            state.lives--;
            state.invincible = 2;
            scoreManager.breakCombo();
            arcadeAudio.playModakMiss();
            if (state.lives <= 0) {
              state.finished = true;
              failGame();
              return;
            }
            break;
          }
        }
      }

      // Collect modaks
      modaks.forEach(m => {
        if (m.collected) return;
        if (Math.abs(state.px - m.x) < 20 && Math.abs(state.py + PLAYER_H / 2 - (groundLevel - m.y)) < 20) {
          m.collected = true;
          scoreManager.incrementCombo();
          addScore(15);
          arcadeAudio.playModakCatch();
        }
      });

      // Checkpoints
      checkpoints.forEach(cp => {
        if (!cp.reached && state.px >= cp.x) {
          cp.reached = true;
          state.respawnX = cp.x;
          addScore(100);
          arcadeAudio.playComboChime(1);
        }
      });

      // Finish line
      if (state.px >= COURSE_LENGTH) {
        state.finished = true;
        addScore(500 + state.lives * 100);
        completeGame();
        return;
      }

      // Camera follow
      state.scrollX = Math.max(0, state.px - w * 0.3);

      // Run animation
      if (Math.abs(state.pvx) > 0.5) {
        state.runTimer += dt;
        if (state.runTimer > 0.08) { state.runFrame = (state.runFrame + 1) % 4; state.runTimer = 0; }
      }

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#1a2744');
      sky.addColorStop(0.6, '#2d3a5e');
      sky.addColorStop(1, '#3a2820');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.sin(now * 0.001 + i * 1.5) * 0.1})`;
        ctx.fillRect((i * 89) % w, (i * 41) % (h * 0.5), 2, 2);
      }

      // Background hills (parallax)
      ctx.fillStyle = 'rgba(30,40,30,0.5)';
      for (let i = 0; i < 6; i++) {
        const bx = ((i * 250 - state.scrollX * 0.1) % (w + 300) + w + 300) % (w + 300) - 150;
        ctx.beginPath();
        ctx.moveTo(bx, groundLevel);
        ctx.quadraticCurveTo(bx + 75, groundLevel - 100 - Math.random() * 30, bx + 150, groundLevel);
        ctx.fill();
      }

      // Festival decorations
      for (let i = 0; i < 8; i++) {
        const fx = ((i * 180 - state.scrollX * 0.5) % (w + 200) + w + 200) % (w + 200) - 100;
        ctx.fillStyle = 'rgba(217,119,6,0.15)';
        ctx.fillRect(fx, groundLevel - 90, 4, 90);
        ctx.fillStyle = `hsl(${i * 45 + 10}, 65%, 55%)`;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(fx + 4, groundLevel - 90 + Math.sin(now * 0.002 + i) * 3, 16, 10);
        ctx.globalAlpha = 1;
      }

      // Platforms
      platforms.forEach(plat => {
        const sx = plat.x - state.scrollX;
        if (sx > w + 20 || sx + plat.w < -20) return;

        if (plat.type === 'ground') {
          ctx.fillStyle = '#5a3a28';
          ctx.fillRect(sx, groundLevel, plat.w, GROUND_H);
          ctx.strokeStyle = '#8b6914';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, groundLevel);
          ctx.lineTo(sx + plat.w, groundLevel);
          ctx.stroke();
        } else {
          const platTop = groundLevel - plat.y - 10;
          ctx.fillStyle = plat.type === 'moving' ? '#6b4423' : '#8b5e34';
          ctx.fillRect(sx, platTop, plat.w, 10);
          ctx.strokeStyle = '#c4a26e';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, platTop, plat.w, 10);
        }
      });

      // Obstacles
      obstacles.forEach(obs => {
        const sx = obs.x - state.scrollX;
        if (sx > w + 30 || sx < -30) return;

        const obsTop = obs.type === 'garland' ? groundLevel - obs.y - obs.h : groundLevel - obs.h;
        ctx.fillStyle = obs.type === 'pot' ? '#cd853f' : obs.type === 'garland' ? '#2d7a3e' : obs.type === 'puddle' ? '#4488cc' : '#dd4400';
        ctx.fillRect(sx, obsTop, obs.w, obs.h);

        if (obs.type === 'fire') {
          ctx.fillStyle = `rgba(255,${150 + Math.sin(now * 0.01) * 50},0,0.5)`;
          ctx.fillRect(sx - 2, obsTop - 5, obs.w + 4, 8);
        }
      });

      // Modaks
      modaks.forEach(m => {
        if (m.collected) return;
        const sx = m.x - state.scrollX;
        if (sx > w + 20 || sx < -20) return;

        const sy = groundLevel - m.y;
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍡', sx, sy + Math.sin(now * 0.003 + m.x) * 3);
      });

      // Checkpoints
      checkpoints.forEach(cp => {
        const sx = cp.x - state.scrollX;
        if (sx > w + 20 || sx < -20) return;

        ctx.fillStyle = cp.reached ? '#22c55e' : '#fbbf24';
        ctx.fillRect(sx - 2, groundLevel - 60, 4, 60);
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.fillText(cp.reached ? '✅' : '🚩', sx, groundLevel - 66);
      });

      // Finish line
      const finishX = COURSE_LENGTH - state.scrollX;
      if (finishX < w + 50) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(finishX, groundLevel - 80, 6, 80);
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', finishX + 3, groundLevel - 86);
      }

      // Player
      const playerScreenX = state.px - state.scrollX;
      const blink = state.invincible > 0 && Math.sin(now * 0.02) > 0;

      if (!blink) {
        ctx.save();
        ctx.translate(playerScreenX, state.py);

        // Body
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, PLAYER_H * 0.5, PLAYER_W / 2, PLAYER_H / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(state.pvx >= 0 ? 3 : -5, -4, 3, 3);

        // Legs
        const lo = Math.sin(state.runFrame * Math.PI / 2) * 4;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-6, PLAYER_H - 4, 4, 6 + lo);
        ctx.fillRect(2, PLAYER_H - 4, 4, 6 - lo);

        ctx.restore();
      }

      // Lives
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('❤️'.repeat(state.lives), 12, h - 12);

      // Progress bar
      const progress = Math.min(1, state.px / COURSE_LENGTH);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(60, h - 16, w - 120, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(60, h - 16, (w - 120) * progress, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(progress * 100)}%`, w - 12, h - 10);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, isPaused, addScore, completeGame, failGame]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
    />
  );
}
