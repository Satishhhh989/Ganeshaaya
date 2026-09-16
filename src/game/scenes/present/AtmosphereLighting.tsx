import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AtmosphereLighting() {
  const diyaLight1 = useRef<THREE.PointLight>(null);
  const diyaLight2 = useRef<THREE.PointLight>(null);
  const fireplaceLight = useRef<THREE.PointLight>(null);

  // Subtle organic flicker for flame lights
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (diyaLight1.current) {
      diyaLight1.current.intensity = 2.0 + Math.sin(time * 12) * 0.18 + Math.cos(time * 7) * 0.12;
    }
    if (diyaLight2.current) {
      diyaLight2.current.intensity = 1.8 + Math.sin(time * 10 + 2) * 0.15 + Math.cos(time * 8.5) * 0.1;
    }
    if (fireplaceLight.current) {
      fireplaceLight.current.intensity = 2.2 + Math.sin(time * 14) * 0.28 + Math.cos(time * 9) * 0.18;
    }
  });

  return (
    <>
      {/* Rich warm hemisphere ambient bounce */}
      <hemisphereLight
        color="#fff1db"
        groundColor="#3d2719"
        intensity={0.75}
      />

      {/* Soft warm ambient fill */}
      <ambientLight color="#ffdcb0" intensity={0.45} />

      {/* Golden afternoon sunlight streaming through windows */}
      <directionalLight
        position={[7, 11, 2]}
        color="#fff0d6"
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
      />

      {/* Living room chandelier main warm glow (hangs at [-0.17, 4.04, 4.7]) */}
      <pointLight
        position={[-0.17, 3.6, 4.7]}
        color="#ffe2b5"
        intensity={3.2}
        distance={9.5}
        decay={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0003}
      />

      {/* Dining area chandelier warm glow (hangs at [-0.30, 4.04, -3.2]) */}
      <pointLight
        position={[-0.3, 3.6, -3.2]}
        color="#ffe2b5"
        intensity={2.2}
        distance={7.5}
        decay={1.8}
      />

      {/* Brick Fireplace organic warm flame light (at [4.14, 1.02, 5.42]) */}
      <pointLight
        ref={fireplaceLight}
        position={[3.8, 0.75, 5.4]}
        color="#ff6010"
        distance={7.0}
        decay={2}
      />

      {/* Living room coffee table Diya light (table at [-0.27, 0.58, 5.44]) */}
      <pointLight
        ref={diyaLight1}
        position={[-0.27, 0.75, 5.3]}
        color="#ffa028"
        distance={3.8}
        decay={2}
      />

      {/* Fireplace mantel Diya light */}
      <pointLight
        ref={diyaLight2}
        position={[4.05, 1.18, 5.3]}
        color="#ff9020"
        distance={3.2}
        decay={2}
      />
    </>
  );
}
