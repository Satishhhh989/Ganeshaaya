import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  type: 'dust' | 'petal';
  angle: number;
  rotationSpeed: number;
  oscillationSpeed: number;
  oscillationOffset: number;
}

export function AmbientParticles({ count = 22 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const isPetal = i % 3 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.45) * 0.25,
        vy: isPetal ? 0.3 + Math.random() * 0.35 : -0.15 - Math.random() * 0.25,
        size: isPetal ? 3.5 + Math.random() * 3.5 : 1.2 + Math.random() * 2.0,
        alpha: 0.15 + Math.random() * 0.55,
        targetAlpha: 0.15 + Math.random() * 0.55,
        type: isPetal ? 'petal' : 'dust',
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        oscillationSpeed: 0.008 + Math.random() * 0.012,
        oscillationOffset: Math.random() * Math.PI * 2,
      };
    });

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(frame * p.oscillationSpeed + p.oscillationOffset) * 0.35;
        p.y += p.vy;
        p.angle += p.rotationSpeed;

        // Wrap-around bounds softly
        if (p.type === 'petal' && p.y > height + 20) {
          p.y = -15;
          p.x = Math.random() * width;
        } else if (p.type === 'dust' && p.y < -20) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }

        if (p.x < -20) p.x = width + 15;
        if (p.x > width + 20) p.x = -15;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.type === 'petal') {
          // Soft rose petal (delicate organic oval)
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
          const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
          petalGradient.addColorStop(0, `rgba(244, 167, 185, ${p.alpha})`);
          petalGradient.addColorStop(0.7, `rgba(224, 116, 142, ${p.alpha * 0.8})`);
          petalGradient.addColorStop(1, `rgba(180, 85, 110, 0)`);
          ctx.fillStyle = petalGradient;
          ctx.fill();
        } else {
          // Warm golden luminous dust mote
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          const dustGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
          dustGradient.addColorStop(0, `rgba(255, 240, 200, ${p.alpha})`);
          dustGradient.addColorStop(0.4, `rgba(245, 195, 85, ${p.alpha * 0.6})`);
          dustGradient.addColorStop(1, `rgba(212, 140, 50, 0)`);
          ctx.fillStyle = dustGradient;
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
}
