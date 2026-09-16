import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DustParticles({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distributed within living area
      pos[i * 3] = (Math.random() - 0.5) * 9.0;
      pos[i * 3 + 1] = 0.2 + Math.random() * 3.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12.0;

      spd[i * 3] = (Math.random() - 0.5) * 0.08;
      spd[i * 3 + 1] = 0.02 + Math.random() * 0.04;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i * 3 + 1] * delta;
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.04 * delta;
      arr[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 0.4 + i) * 0.04 * delta;

      // Wrap around ceiling to floor
      if (arr[i * 3 + 1] > 3.6) {
        arr[i * 3 + 1] = 0.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  // Procedural soft circular texture for golden glowing dust motes
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 235, 175, 1)');
      gradient.addColorStop(0.35, 'rgba(255, 200, 100, 0.7)');
      gradient.addColorStop(0.7, 'rgba(230, 140, 40, 0.2)');
      gradient.addColorStop(1, 'rgba(200, 100, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        map={circleTexture}
        color="#ffe8b0"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
