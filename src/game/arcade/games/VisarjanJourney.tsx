/**
 * GAME 08: VISARJAN JOURNEY — Top-down navigation procession game
 * Guide a festival procession through streets to the water.
 */
import { useEffect, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface Collectible {
  x: number;
  y: number;
  type: 'flower' | 'bell' | 'token';
  collected: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'traffic' | 'puddle';
}

export default function VisarjanJourney() {
  const { gameState, isPaused, addScore, completeGame, failGame, setTimeRemaining } = useMiniGame();
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

    // Generate a procedural map — streets heading toward water
    const ROAD_W = 80;
    const MAP_LENGTH = 3000;

    // Generate obstacles
    const obstacles: Obstacle[] = [];
    const collectibles: Collectible[] = [];

    for (let i = 0; i < 30; i++) {
      const y = 200 + i * 90 + Math.random() * 40;
      const side = Math.random() > 0.5 ? -1 : 1;
      obstacles.push({
        x: side * (ROAD_W / 2 + 10 + Math.random() * 20),
        y: -y,
        w: 20 + Math.random() * 30,
        h: 15 + Math.random() * 15,
        type: ['wall', 'traffic', 'puddle'][Math.floor(Math.random() * 3)] as Obstacle['type'],
      });
    }

    for (let i = 0; i < 25; i++) {
      const y = 150 + i * 110 + Math.random() * 60;
      collectibles.push({
        x: (Math.random() - 0.5) * (ROAD_W - 20),
        y: -y,
        type: ['flower', 'bell', 'token'][Math.floor(Math.random() * 3)] as Collectible['type'],
        collected: false,
      });
    }

    const state = {
      playerX: 0,
      scrollY: 0,
      speed: 2,
      timer: 120,
      score: 0,
      gameOver: false,
      lastTime: performance.now(),
      keys: {} as Record<string, boolean>,
      collectCount: 0,
      distanceTraveled: 0,
    };

    scoreManager.resetCombo();

    const handleKeyDown = (e: KeyboardEvent) => { state.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { state.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch controls
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const handleTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX;
      if (Math.abs(dx) > 10) {
        state.keys[dx > 0 ? 'd' : 'a'] = true;
        state.keys[dx > 0 ? 'a' : 'd'] = false;
      }
    };
    const handleTouchEnd = () => { state.keys['a'] = false; state.keys['d'] = false; };
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    let animId = 0;
    const loop = (now: number) => {
      if (state.gameOver) return;
      if (isPaused) { state.lastTime = now; animId = requestAnimationFrame(loop); return; }

      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;

      const w = W();
      const h = H();
      const cx = w / 2;

      // Timer
      state.timer -= dt;
      setTimeRemaining(Math.max(0, state.timer));

      if (state.timer <= 0) {
        state.gameOver = true;
        failGame();
        return;
      }

      // Movement
      const moveSpeed = 120;
      if (state.keys['a'] || state.keys['arrowleft']) state.playerX -= moveSpeed * dt;
      if (state.keys['d'] || state.keys['arrowright']) state.playerX += moveSpeed * dt;

      // Clamp to road
      const halfRoad = ROAD_W / 2 - 12;
      state.playerX = Math.max(-halfRoad, Math.min(halfRoad, state.playerX));

      // Auto-scroll forward
      state.scrollY += state.speed * dt * 60;
      state.distanceTraveled += state.speed * dt * 60;

      // Reached destination
      if (state.distanceTraveled >= MAP_LENGTH) {
        state.gameOver = true;
        addScore(Math.floor(state.timer * 10)); // Time bonus
        completeGame();
        return;
      }

      // Player collision check
      const playerScreenY = h * 0.7;

      // Check obstacle collisions
      for (const obs of obstacles) {
        const obsScreenX = cx + obs.x;
        const obsScreenY = obs.y + state.scrollY;

        if (obsScreenY > -20 && obsScreenY < h + 20) {
          const px = cx + state.playerX;
          if (px + 10 > obsScreenX && px - 10 < obsScreenX + obs.w &&
              Math.abs(playerScreenY - obsScreenY) < obs.h / 2 + 10) {
            // Push back
            if (obs.type === 'wall' || obs.type === 'traffic') {
              state.scrollY -= 2;
              state.distanceTraveled -= 2;
              scoreManager.breakCombo();
            }
          }
        }
      }

      // Check collectible pickups
      collectibles.forEach(col => {
        if (col.collected) return;
        const colScreenX = cx + col.x;
        const colScreenY = col.y + state.scrollY;
        const px = cx + state.playerX;

        if (Math.abs(px - colScreenX) < 20 && Math.abs(playerScreenY - colScreenY) < 20) {
          col.collected = true;
          state.collectCount++;
          const pts = col.type === 'bell' ? 30 : col.type === 'token' ? 20 : 10;
          scoreManager.incrementCombo();
          addScore(pts);
          arcadeAudio.playItemCollect();
        }
      });

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Background (ground)
      ctx.fillStyle = '#3a5a3e';
      ctx.fillRect(0, 0, w, h);

      // Road
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(cx - ROAD_W / 2, 0, ROAD_W, h);

      // Road center line (dashed)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(cx, (state.scrollY * 1.5) % 35 - 35);
      for (let y = (state.scrollY * 1.5) % 35 - 35; y < h; y += 35) {
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, y + 20);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Road edges
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - ROAD_W / 2, 0);
      ctx.lineTo(cx - ROAD_W / 2, h);
      ctx.moveTo(cx + ROAD_W / 2, 0);
      ctx.lineTo(cx + ROAD_W / 2, h);
      ctx.stroke();

      // Decorative elements along road
      for (let i = 0; i < 8; i++) {
        const dy = ((i * 120 + state.scrollY * 0.3) % (h + 100)) - 50;
        // Left flags
        ctx.fillStyle = 'rgba(217,119,6,0.3)';
        ctx.fillRect(cx - ROAD_W / 2 - 15, dy, 8, 20);
        ctx.fillStyle = `hsl(${i * 40}, 70%, 50%)`;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(cx - ROAD_W / 2 - 25, dy, 12, 8);
        // Right flags
        ctx.fillRect(cx + ROAD_W / 2 + 13, dy, 12, 8);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(217,119,6,0.3)';
        ctx.fillRect(cx + ROAD_W / 2 + 7, dy, 8, 20);
      }

      // Obstacles
      obstacles.forEach(obs => {
        const sx = cx + obs.x;
        const sy = obs.y + state.scrollY;
        if (sy < -30 || sy > h + 30) return;

        ctx.fillStyle = obs.type === 'wall' ? '#8b6914' : obs.type === 'traffic' ? '#cc4444' : '#4488aa';
        ctx.fillRect(sx, sy, obs.w, obs.h);
        if (obs.type === 'traffic') {
          ctx.fillStyle = '#ff8888';
          ctx.fillRect(sx + 2, sy + 2, 6, 6);
        }
      });

      // Collectibles
      collectibles.forEach(col => {
        if (col.collected) return;
        const sx = cx + col.x;
        const sy = col.y + state.scrollY;
        if (sy < -20 || sy > h + 20) return;

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const emoji = col.type === 'flower' ? '🌸' : col.type === 'bell' ? '🔔' : '🎪';
        ctx.fillText(emoji, sx, sy);
      });

      // Player (procession)
      const px = cx + state.playerX;
      // Procession body
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, playerScreenY, 12, 0, Math.PI * 2);
      ctx.fill();
      // Inner detail
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(px, playerScreenY, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(251,191,36,0.3)';
      ctx.beginPath();
      ctx.arc(px, playerScreenY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Progress bar (distance to water)
      const progress = state.distanceTraveled / MAP_LENGTH;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(w - 24, 40, 8, h - 80);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(w - 24, 40 + (h - 80) * (1 - progress), 8, (h - 80) * progress);
      // Water icon at bottom
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌊', w - 20, h - 30);

      // Collected count
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Collected: ${state.collectCount}`, 12, h - 12);

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
  }, [gameState, isPaused, addScore, completeGame, failGame, setTimeRemaining]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
    />
  );
}
