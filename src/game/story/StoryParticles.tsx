import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
  angle: number;
  rotSpeed: number;
}

interface StoryParticlesProps {
  type?: 'golden_prana' | 'lotus_drift' | 'himalayan_snow' | 'thunder_sparks';
}

export function StoryParticles({ type = 'golden_prana' }: StoryParticlesProps) {
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

    // Particle count & configuration based on effect type
    const count = type === 'golden_prana' ? 65 : type === 'himalayan_snow' ? 50 : 35;
    const particles: Particle[] = [];

    const getParticleColor = () => {
      if (type === 'golden_prana') {
        const golds = [
          'rgba(255, 215, 110, ',
          'rgba(255, 190, 60, ',
          'rgba(255, 235, 170, ',
          'rgba(235, 160, 40, ',
        ];
        return golds[Math.floor(Math.random() * golds.length)];
      } else if (type === 'thunder_sparks') {
        const electric = [
          'rgba(140, 200, 255, ',
          'rgba(180, 160, 255, ',
          'rgba(255, 255, 255, ',
        ];
        return electric[Math.floor(Math.random() * electric.length)];
      } else if (type === 'lotus_drift') {
        const lotus = [
          'rgba(255, 180, 200, ',
          'rgba(255, 210, 150, ',
          'rgba(255, 230, 240, ',
        ];
        return lotus[Math.floor(Math.random() * lotus.length)];
      } else {
        // Himalayan snow
        return 'rgba(235, 245, 255, ';
      }
    };

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (type === 'golden_prana' ? 3.5 : 2.8) + 1.2,
        speedX: (Math.random() - 0.5) * (type === 'himalayan_snow' ? 0.8 : 0.4),
        speedY: (Math.random() * 0.6 + 0.2) * (type === 'himalayan_snow' ? 1.4 : -0.7),
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: (Math.random() * 0.01 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        color: getParticleColor(),
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.rotSpeed;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Screen wrap
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        // Soft halo glow
        const rad = p.size;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad * 2.5);
        grad.addColorStop(0, `${p.color}${p.opacity})`);
        grad.addColorStop(0.5, `${p.color}${p.opacity * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rad * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
