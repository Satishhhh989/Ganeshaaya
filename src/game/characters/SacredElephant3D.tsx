import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { STORY_ASSETS } from '../story/storyAssets';

interface SacredElephant3DProps {
  position?: [number, number, number];
  isCommuning?: boolean;
}

export function SacredElephant3D({
  position = [0, 0, -8.5],
  isCommuning = false,
}: SacredElephant3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraLightRef = useRef<THREE.PointLight>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Load the authentic sacred elephant illustration texture
  const texture = useTexture(STORY_ASSETS.characters.elephantSacred.url);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle, serene breathing motion
      const breath = Math.sin(time * 1.5) * 0.02;
      groupRef.current.position.y = position[1] + 1.05 + breath;
      groupRef.current.rotation.z = Math.sin(time * 1.2) * 0.005;
    }

    if (auraLightRef.current) {
      auraLightRef.current.intensity = isCommuning
        ? 3.2 + Math.sin(time * 4) * 0.6
        : 1.8 + Math.sin(time * 2) * 0.3;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = time * 0.25;
      const pulseScale = isCommuning ? 1.08 + Math.sin(time * 4) * 0.06 : 1.0;
      haloRef.current.scale.set(pulseScale, pulseScale, 1);
    }
  });

  return (
    <group position={position}>
      {/* ─── Ground Drop Shadow on Forest Floor ─── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial
          color="#060c07"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ─── Mossy Forest Earth Bed ─── */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.2, 0.12, 24]} />
        <meshStandardMaterial
          color="#22331f"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* ─── Animated Elephant Body ─── */}
      <group ref={groupRef} position={[0, 1.05, 0]}>
        {/* 2.5D Layered Elephant Illustration Plane */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[3.4, 1.95]} />
          <meshStandardMaterial
            map={texture}
            transparent
            roughness={0.45}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Golden Divine Prana Backlight Halo */}
        <pointLight
          ref={auraLightRef}
          position={[0, 0.3, -0.4]}
          color="#fde047"
          intensity={1.8}
          distance={5.5}
          decay={2}
        />

        {/* Soft Front Fill Light */}
        <pointLight
          position={[0, 0.2, 1.2]}
          color="#fffbeb"
          intensity={1.1}
          distance={4.0}
        />

        {/* Ethereal Sacred Aura Disc */}
        <mesh ref={haloRef} position={[0, 0.2, -0.08]}>
          <ringGeometry args={[1.3, 1.55, 32]} />
          <meshBasicMaterial
            color="#fef08a"
            transparent
            opacity={isCommuning ? 0.45 : 0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ─── Floating Forest Flowers at Bed Perimeter ─── */}
      {[-1.4, -0.7, 0.7, 1.4].map((x, idx) => (
        <group key={idx} position={[x, 0.08, idx % 2 === 0 ? 0.7 : -0.7]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.04, 0.04, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.7} />
          </mesh>
          <pointLight
            color="#fbbf24"
            intensity={0.3}
            distance={1.2}
            position={[0, 0.06, 0]}
          />
        </group>
      ))}
    </group>
  );
}
