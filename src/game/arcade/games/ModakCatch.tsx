/**
 * GAME 01: MODAK CATCH — Arcade catching game
 * Modaks fall from above, player moves basket to catch them.
 * Golden modaks = bonus, spoiled items = lose a life.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface FallingItem {
  x: number;
  y: number;
  vy: number;
  type: 'modak' | 'golden' | 'spoiled';
  radius: number;
  id: number;
}

interface CatchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
}

export default function ModakCatch() {
  const { gameState, isPaused, addScore, completeGame, failGame, setTimeRemaining } = useMiniGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    basketX: 0,
    items: [] as FallingItem[],
    particles: [] as CatchParticle[],
    popups: [] as ScorePopup[],
    lives: 3,
    score: 0,
    timer: 60,
    spawnTimer: 0,
    difficulty: 1,
    nextId: 0,
    mouseX: -1,
    gameOver: false,
    lastTime: 0,
    keys: {} as Record<string, boolean>,
  });

  const spawnItem = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const rand = Math.random();
    let type: FallingItem['type'] = 'modak';
    if (rand < 0.08) type = 'golden';
    else if (rand < 0.08 + 0.12 * Math.min(s.difficulty / 5, 1)) type = 'spoiled';

    s.items.push({
      x: 40 + Math.random() * (w - 80),
      y: -20,
      vy: 1.5 + s.difficulty * 0.3 + Math.random() * 1.2,
      type,
      radius: type === 'golden' ? 18 : 14,
      id: s.nextId++,
    });
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 12) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }, []);

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

    const s = stateRef.current;
    s.basketX = canvas.offsetWidth / 2;
    s.lives = 3;
    s.score = 0;
    s.timer = 60;
    s.items = [];
    s.particles = [];
    s.popups = [];
    s.difficulty = 1;
    s.gameOver = false;
    s.lastTime = performance.now();
    scoreManager.resetCombo();

    const handleKeyDown = (e: KeyboardEvent) => { s.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { s.keys[e.key.toLowerCase()] = false; };
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.mouseX = e.clientX - rect.left;
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.mouseX = e.touches[0].clientX - rect.left;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const BASKET_W = 80;
    const BASKET_H = 40;

    let animId = 0;
    const loop = (now: number) => {
      if (s.gameOver) return;
      if (isPaused) {
        s.lastTime = now;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min((now - s.lastTime) / 1000, 0.05);
      s.lastTime = now;
      const w = W();
      const h = H();

      // Timer
      s.timer -= dt;
      setTimeRemaining(Math.max(0, s.timer));
      s.difficulty = 1 + (60 - s.timer) / 15;

      if (s.timer <= 0 || s.lives <= 0) {
        s.gameOver = true;
        if (s.score > 0) completeGame();
        else failGame();
        return;
      }

      // Basket movement
      const speed = 400;
      if (s.keys['a'] || s.keys['arrowleft']) s.basketX -= speed * dt;
      if (s.keys['d'] || s.keys['arrowright']) s.basketX += speed * dt;
      if (s.mouseX >= 0) {
        s.basketX += (s.mouseX - s.basketX) * 0.15;
      }
      s.basketX = Math.max(BASKET_W / 2, Math.min(w - BASKET_W / 2, s.basketX));

      // Spawn items
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        spawnItem();
        s.spawnTimer = Math.max(0.3, 1.2 - s.difficulty * 0.1);
      }

      // Update items
      const basketTop = h - 60;
      s.items = s.items.filter(item => {
        item.y += item.vy * dt * 60;

        // Check catch
        if (item.y >= basketTop - 10 && item.y <= basketTop + BASKET_H &&
            Math.abs(item.x - s.basketX) < BASKET_W / 2 + item.radius) {
          if (item.type === 'spoiled') {
            s.lives--;
            scoreManager.breakCombo();
            arcadeAudio.playModakMiss();
            spawnParticles(item.x, item.y, '#666', 6);
            s.popups.push({ x: item.x, y: item.y, text: '-1 ❤️', alpha: 1.5, color: '#ef4444' });
          } else {
            const pts = item.type === 'golden' ? 30 : 10;
            const combo = scoreManager.incrementCombo();
            const earned = scoreManager.calcPoints(pts);
            s.score += earned;
            addScore(pts);
            arcadeAudio.playModakCatch();
            if (combo > 0 && combo % 5 === 0) arcadeAudio.playComboChime(combo / 5);
            spawnParticles(item.x, item.y, item.type === 'golden' ? '#fde047' : '#f97316', 14);
            s.popups.push({ x: item.x, y: item.y, text: `+${earned}`, alpha: 1.5, color: item.type === 'golden' ? '#fde047' : '#fbbf24' });
          }
          return false;
        }

        // Missed
        if (item.y > h + 20) {
          if (item.type !== 'spoiled') {
            scoreManager.breakCombo();
          }
          return false;
        }
        return true;
      });

      // Update particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.025;
        return p.alpha > 0;
      });

      // Update popups
      s.popups = s.popups.filter(p => {
        p.y -= 1.2;
        p.alpha -= 0.02;
        return p.alpha > 0;
      });

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a0e08');
      grad.addColorStop(1, '#2d1810');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Falling items
      s.items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 'golden') {
          // Golden glow
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#b45309';
          ctx.font = `${item.radius}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍡', 0, 2);
        } else if (item.type === 'spoiled') {
          ctx.fillStyle = '#4a4a4a';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `${item.radius}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💀', 0, 2);
        } else {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.font = `${item.radius}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍡', 0, 2);
        }
        ctx.restore();
      });

      // Basket
      ctx.save();
      ctx.translate(s.basketX, basketTop);
      // Bowl shape
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(-BASKET_W / 2, 0);
      ctx.quadraticCurveTo(-BASKET_W / 2 + 10, BASKET_H, 0, BASKET_H);
      ctx.quadraticCurveTo(BASKET_W / 2 - 10, BASKET_H, BASKET_W / 2, 0);
      ctx.lineTo(BASKET_W / 2 + 4, -4);
      ctx.lineTo(-BASKET_W / 2 - 4, -4);
      ctx.closePath();
      ctx.fill();
      // Rim
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-BASKET_W / 2 - 4, -2);
      ctx.lineTo(BASKET_W / 2 + 4, -2);
      ctx.stroke();
      ctx.restore();

      // Particles
      s.particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Score popups
      s.popups.forEach(p => {
        ctx.globalAlpha = Math.min(1, p.alpha);
        ctx.fillStyle = p.color;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.globalAlpha = 1;

      // Lives
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('❤️'.repeat(s.lives), 12, h - 12);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, isPaused, addScore, completeGame, failGame, setTimeRemaining, spawnItem, spawnParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
      }}
    />
  );
}
