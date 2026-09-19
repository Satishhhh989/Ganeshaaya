/**
 * GAME 09: PUJA COLLECTOR — Timed item collection in a festive environment
 * Find and collect all 7 required puja items before time runs out.
 */
import { useEffect, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface PujaItem {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  collected: boolean;
  required: boolean;
}

export default function PujaCollector() {
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

    // Generate items
    const spread = (min: number, max: number) => min + Math.random() * (max - min);

    const requiredItems = [
      { id: 'durva', name: 'Durva Grass', emoji: '🌿' },
      { id: 'flowers', name: 'Flowers', emoji: '🌺' },
      { id: 'modaks', name: 'Modaks', emoji: '🍡' },
      { id: 'diya', name: 'Diya', emoji: '🪔' },
      { id: 'coconut', name: 'Coconut', emoji: '🥥' },
      { id: 'kalash', name: 'Kalash', emoji: '🏺' },
      { id: 'incense', name: 'Incense', emoji: '🧧' },
    ];

    const distractors = [
      { id: 'toy1', name: 'Toy', emoji: '🪀' },
      { id: 'toy2', name: 'Ball', emoji: '⚽' },
      { id: 'book', name: 'Book', emoji: '📚' },
      { id: 'cup', name: 'Cup', emoji: '☕' },
      { id: 'shoes', name: 'Shoes', emoji: '👞' },
      { id: 'bag', name: 'Bag', emoji: '👜' },
    ];

    const allItems: PujaItem[] = [
      ...requiredItems.map(item => ({
        ...item,
        x: spread(40, W() - 40),
        y: spread(80, H() - 60),
        collected: false,
        required: true,
      })),
      ...distractors.map(item => ({
        ...item,
        x: spread(40, W() - 40),
        y: spread(80, H() - 60),
        collected: false,
        required: false,
      })),
    ];

    const state = {
      playerX: W() / 2,
      playerY: H() / 2,
      items: allItems,
      timer: 90,
      collectedRequired: 0,
      collectedTotal: 0,
      inventory: [] as string[],
      gameOver: false,
      lastTime: performance.now(),
      keys: {} as Record<string, boolean>,
    };

    scoreManager.resetCombo();

    const handleKeyDown = (e: KeyboardEvent) => { state.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { state.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Touch movement
    let touchTarget = { x: -1, y: -1 };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      touchTarget.x = e.touches[0].clientX - rect.left;
      touchTarget.y = e.touches[0].clientY - rect.top;
    };
    const handleTouchEnd = () => { touchTarget.x = -1; };
    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    let animId = 0;
    const loop = (now: number) => {
      if (state.gameOver) return;
      if (isPaused) { state.lastTime = now; animId = requestAnimationFrame(loop); return; }

      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;
      const w = W();
      const h = H();

      // Timer
      state.timer -= dt;
      setTimeRemaining(Math.max(0, state.timer));

      if (state.timer <= 0) {
        state.gameOver = true;
        if (state.collectedRequired > 0) completeGame();
        else failGame();
        return;
      }

      // Player movement
      const speed = 180;
      if (state.keys['w'] || state.keys['arrowup']) state.playerY -= speed * dt;
      if (state.keys['s'] || state.keys['arrowdown']) state.playerY += speed * dt;
      if (state.keys['a'] || state.keys['arrowleft']) state.playerX -= speed * dt;
      if (state.keys['d'] || state.keys['arrowright']) state.playerX += speed * dt;

      // Touch movement
      if (touchTarget.x >= 0) {
        const dx = touchTarget.x - state.playerX;
        const dy = touchTarget.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          state.playerX += (dx / dist) * speed * dt;
          state.playerY += (dy / dist) * speed * dt;
        }
      }

      // Clamp
      state.playerX = Math.max(16, Math.min(w - 16, state.playerX));
      state.playerY = Math.max(60, Math.min(h - 40, state.playerY));

      // Pickup check
      state.items.forEach(item => {
        if (item.collected) return;
        const dx = state.playerX - item.x;
        const dy = state.playerY - item.y;
        if (Math.sqrt(dx * dx + dy * dy) < 28) {
          item.collected = true;
          state.collectedTotal++;

          if (item.required) {
            state.collectedRequired++;
            state.inventory.push(item.emoji);
            scoreManager.incrementCombo();
            const pts = 50 + Math.floor(state.timer);
            addScore(pts);
            arcadeAudio.playItemCollect();

            if (state.collectedRequired >= 7) {
              state.gameOver = true;
              addScore(Math.floor(state.timer * 10)); // Time bonus
              arcadeAudio.playGameWin();
              completeGame();
            }
          } else {
            // Distractor
            scoreManager.breakCombo();
            arcadeAudio.playModakMiss();
          }
        }
      });

      // === DRAW ===
      ctx.clearRect(0, 0, w, h);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, 0, 0, h);
      floorGrad.addColorStop(0, '#2d1810');
      floorGrad.addColorStop(1, '#1a0e08');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 0, w, h);

      // Floor tiles pattern
      ctx.strokeStyle = 'rgba(139,69,19,0.1)';
      ctx.lineWidth = 1;
      for (let tx = 0; tx < w; tx += 50) {
        for (let ty = 0; ty < h; ty += 50) {
          ctx.strokeRect(tx, ty, 50, 50);
        }
      }

      // Decorative elements
      ctx.fillStyle = 'rgba(217,119,6,0.08)';
      ctx.fillRect(0, 0, w, 50);
      ctx.fillRect(0, h - 30, w, 30);

      // Required items display (top HUD)
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, w, 50);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'left';
      ctx.fillText('Required Items:', 10, 16);

      requiredItems.forEach((item, i) => {
        const collected = state.items.find(it => it.id === item.id)?.collected;
        const x = 10 + i * (w < 500 ? 50 : 70);
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = collected ? 0.3 : 1;
        ctx.fillText(item.emoji, x + 20, 38);
        if (collected) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 12, 36);
          ctx.lineTo(x + 18, 42);
          ctx.lineTo(x + 28, 30);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      // Items on ground
      state.items.forEach(item => {
        if (item.collected) return;
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow for required items
        if (item.required) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
        }
        ctx.fillText(item.emoji, item.x, item.y);
        ctx.shadowBlur = 0;
      });

      // Player
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(state.playerX, state.playerY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(state.playerX, state.playerY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Direction indicator
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(251,191,36,0.2)';
      ctx.beginPath();
      ctx.arc(state.playerX, state.playerY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Collected count
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${state.collectedRequired}/7`, w - 12, h - 12);

      if (state.collectedRequired >= 7) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 28px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('🙏 PUJA READY 🙏', w / 2, h / 2);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
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
