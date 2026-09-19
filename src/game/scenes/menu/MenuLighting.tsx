import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MenuLighting() {
  const diya1Ref = useRef<THREE.PointLight | null>(null);
  const diya2Ref = useRef<THREE.PointLight | null>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Natural organic ghee flame flicker for Diya 1 (near Ganesha's right side)
    if (diya1Ref.current) {
      const flicker1 =
        Math.sin(t * 7.3) * 0.18 +
        Math.sin(t * 19.1) * 0.12 +
        Math.cos(t * 31.7) * 0.06;
      diya1Ref.current.intensity = 1.6 + flicker1;
      diya1Ref.current.position.y = -0.7 + Math.sin(t * 14.0) * 0.006;
    }

    // Natural organic ghee flame flicker for Diya 2 (temple pillar lamp)
    if (diya2Ref.current) {
      const flicker2 =
        Math.sin(t * 9.1) * 0.15 +
        Math.cos(t * 23.4) * 0.1 +
        Math.sin(t * 43.1) * 0.05;
      diya2Ref.current.intensity = 1.3 + flicker2;
    }
  });

  return (
    <>
      {/* Deep Wine / Soft Plum Ambient Fill */}
      <ambientLight color="#321422" intensity={0.9} />

      {/* Warm Golden Key Light (Evening Temple Glow) */}
      <directionalLight
        position={[4, 3, 3]}
        color="#ffd599"
        intensity={1.5}
        castShadow={false}
      />

      {/* Soft Rose Divine Rim Light */}
      <directionalLight
        position={[-3, 2, -1]}
        color="#e58c9f"
        intensity={0.6}
        castShadow={false}
      />

      {/* Diya 1: Golden Ghee Lamp near Ganesha */}
      <pointLight
        ref={diya1Ref}
        position={[1.6, -0.7, 1.2]}
        color="#ffa338"
        intensity={1.6}
        distance={4.5}
        decay={2}
      />

      {/* Diya 2: Foreground Brass Lamp */}
      <pointLight
        ref={diya2Ref}
        position={[-1.8, -1.1, 1.4]}
        color="#ff8d28"
        intensity={1.3}
        distance={4.0}
        decay={2}
      />
    </>
  );
}
