import { useEffect, useRef, useState, useCallback } from 'react';
import { audioManager } from '../../audio/AudioManager';

interface PlayablePrototypeMiniGameProps {
  onComplete: () => void;
}

interface Entity {
  x: number;
  y: number;
  radius: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

export function PlayablePrototypeMiniGame({ onComplete }: PlayablePrototypeMiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Player position and velocity
  const player = useRef<Entity & { vx: number; vy: number; facing: number; frame: number }>({
    x: 100,
    y: 220,
    radius: 18,
    vx: 0,
    vy: 0,
    facing: 1, // 1 for right, -1 for left
    frame: 0,
  });

  // Altar destination
  const altar: Entity = { x: 500, y: 220, radius: 36 };

  // Collectible items (3 golden modaks)
  const items = useRef<Array<Entity & { id: number; collected: boolean; label: string }>>([
    { id: 1, x: 220, y: 110, radius: 16, collected: false, label: 'Modak 1' },
    { id: 2, x: 340, y: 320, radius: 16, collected: false, label: 'Modak 2' },
    { id: 3, x: 420, y: 130, radius: 16, collected: false, label: 'Modak 3' },
  ]);

  const [collectedCount, setCollectedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const sparkles = useRef<Sparkle[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});

  const spawnSparkles = useCallback((x: number, y: number, color = '#ffd700', count = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      sparkles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color,
      });
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const p = player.current;

      // Input acceleration
      let ax = 0;
      let ay = 0;
      const speed = 260;

      if (keys.current['KeyW'] || keys.current['ArrowUp'] || keys.current['w']) ay -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown'] || keys.current['s']) ay += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft'] || keys.current['a']) {
        ax -= 1;
        p.facing = -1;
      }
      if (keys.current['KeyD'] || keys.current['ArrowRight'] || keys.current['d']) {
        ax += 1;
        p.facing = 1;
      }

      // Normalize diagonal
      const len = Math.hypot(ax, ay);
      if (len > 0) {
        ax /= len;
        ay /= len;
        p.frame += dt * 8;
      }

      // Smooth physics velocity
      p.vx += (ax * speed - p.vx) * 12 * dt;
      p.vy += (ay * speed - p.vy) * 12 * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bounds clamping
      const pad = p.radius + 12;
      p.x = Math.max(pad, Math.min(canvas.width - pad, p.x));
      p.y = Math.max(pad, Math.min(canvas.height - pad, p.y));

      // Check item collection
      items.current.forEach((item) => {
        if (!item.collected) {
          const dist = Math.hypot(p.x - item.x, p.y - item.y);
          if (dist < p.radius + item.radius) {
            item.collected = true;
            audioManager.playFloralChime();
            spawnSparkles(item.x, item.y, '#fef08a', 20);
            setCollectedCount((prev) => {
              const updated = prev + 1;
              if (updated === 3) {
                audioManager.playSacredArtiBell();
              }
              return updated;
            });
          }
        }
      });

      // Check altar completion
      const allCollected = items.current.every((i) => i.collected);
      if (allCollected && !isCompleted) {
        const distToAltar = Math.hypot(p.x - altar.x, p.y - altar.y);
        if (distToAltar < p.radius + altar.radius) {
          setIsCompleted(true);
          audioManager.playCelebrationChime();
          audioManager.playTempleBell();
          spawnSparkles(altar.x, altar.y, '#ffd700', 45);

          setTimeout(() => {
            onComplete();
          }, 2400);
        }
      }

      // ─── RENDER ───
      // 1. Background glade
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0d1f14');
      grad.addColorStop(0.5, '#132c1c');
      grad.addColorStop(1, '#08170e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Decorative grid / tile floor pattern
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 3. Sacred Altar Sanctuary (Center right)
      ctx.save();
      const altarPulse = Math.sin(currentTime * 0.004) * 0.15 + 1;
      ctx.beginPath();
      ctx.arc(altar.x, altar.y, altar.radius * altarPulse, 0, Math.PI * 2);
      ctx.fillStyle = allCollected ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = allCollected ? '#fbbf24' : 'rgba(254, 240, 138, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Altar Lotus Flower / Pedestal
      ctx.fillStyle = allCollected ? '#ffb703' : '#94a3b8';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪷', altar.x, altar.y);

      // Altar prompt text
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillStyle = allCollected ? '#fef08a' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(allCollected ? 'DELIVER OFFERINGS ➔' : 'SACRED ALTAR', altar.x, altar.y + 44);
      ctx.restore();

      // 4. Draw Collectibles (Golden Modaks)
      items.current.forEach((item) => {
        if (!item.collected) {
          ctx.save();
          const bob = Math.sin(currentTime * 0.005 + item.id) * 4;
          const iy = item.y + bob;

          // Halo glow
          ctx.beginPath();
          ctx.arc(item.x, iy, item.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.fill();

          // Modak golden icon
          ctx.font = '22px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🥟', item.x, iy);

          // Golden sparkle ring
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(item.x, iy, item.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 5. Draw Player Character (Little Vinayaka / Hero)
      ctx.save();
      const pBob = Math.sin(p.frame) * 2;
      const px = p.x;
      const py = p.y + pBob;

      // Drop shadow
      ctx.beginPath();
      ctx.ellipse(px, py + p.radius - 2, p.radius * 0.85, p.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Saffron aura
      ctx.beginPath();
      ctx.arc(px, py, p.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
      ctx.fill();

      // Avatar Circle (Saffron Robes)
      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ea580c';
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Face / Symbol
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🕉', px, py);

      // Facing indicator arrow
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(px + p.facing * (p.radius + 2), py);
      ctx.lineTo(px + p.facing * (p.radius - 3), py - 4);
      ctx.lineTo(px + p.facing * (p.radius - 3), py + 4);
      ctx.fill();
      ctx.restore();

      // 6. Draw Sparkles
      for (let i = sparkles.current.length - 1; i >= 0; i--) {
        const s = sparkles.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= dt * 1.6;

        if (s.alpha <= 0) {
          sparkles.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isCompleted, onComplete, spawnSparkles]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Top HUD for Mini-Game */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '640px',
          padding: '8px 14px',
          background: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(254, 240, 138, 0.3)',
          borderRadius: '6px 6px 0 0',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '11.5px',
              color: '#fef08a',
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}
          >
            PLAYABLE PROTOTYPE · SANDBOX TEST
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12.5px',
            color: '#ffffff',
            fontWeight: 600,
          }}
        >
          Modaks Collected: <span style={{ color: '#fbbf24' }}>{collectedCount} / 3</span>
        </div>
      </div>

      {/* Canvas Screen */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          height: '360px',
          border: '1.5px solid rgba(254, 240, 138, 0.45)',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 176, 65, 0.15)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: '#0a170f',
          }}
        />

        {/* Victory Celebration Overlay */}
        {isCompleted && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 8, 5, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeIn 0.4s ease-out',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>🪷</div>
            <h3
              style={{
                fontFamily: "'Cinzel', 'Marcellus', serif",
                fontSize: '20px',
                color: '#fef08a',
                letterSpacing: '0.14em',
                margin: '0 0 6px 0',
                textTransform: 'uppercase',
              }}
            >
              Prototype Test Complete!
            </h3>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                color: '#e2e8f0',
                margin: 0,
              }}
            >
              All systems verified · Build compiled for N-I-A-T Submission
            </p>
          </div>
        )}
      </div>

      {/* Controls Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '10px',
          fontSize: '11px',
          fontFamily: "'Outfit', sans-serif",
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        <span>
          Move: <strong style={{ color: '#fef08a' }}>WASD / Arrow Keys</strong>
        </span>
        <span>•</span>
        <span>
          Goal: <strong style={{ color: '#fef08a' }}>Collect 3 Modaks & Reach Altar</strong>
        </span>
      </div>
    </div>
  );
}
