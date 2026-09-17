import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { STORY_ASSETS } from '../story/storyAssets';

interface GaneshaGuardian3DProps {
  position?: [number, number, number];
  isFallen?: boolean;
  onApproachRadius?: boolean;
}

export function GaneshaGuardian3D({
  position = [0, 0, -10],
  isFallen = false,
}: GaneshaGuardian3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const haloLightRef = useRef<THREE.PointLight>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  // Load the authentic guarding illustration texture
  const texture = useTexture(STORY_ASSETS.characters.ganeshaGuarding.url);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      if (!isFallen) {
        // Gentle breathing motion
        const breath = Math.sin(time * 2) * 0.015;
        groupRef.current.position.y = position[1] + breath;
        groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.008;
      } else {
        // Fallen / aftermath pose: gently tilted, solemn stillness
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          position[1] - 0.35,
          0.05
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          0.45,
          0.04
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          0.2,
          0.04
        );
      }
    }

    if (haloLightRef.current) {
      haloLightRef.current.intensity = isFallen
        ? 0.4
        : 1.8 + Math.sin(time * 3) * 0.3;
    }

    if (auraRef.current) {
      auraRef.current.rotation.z = time * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* ─── Carved Sacred Stone Pedestal Threshold ─── */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.14, 24]} />
        <meshStandardMaterial
          color="#2d251e"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* ─── Ground Drop Shadow ─── */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 24]} />
        <meshBasicMaterial
          color="#050302"
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* ─── Animated Character Body ─── */}
      <group ref={groupRef} position={[0, 0.95, 0]}>
        {/* 2.5D Layered Character Plane */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1.5, 1.9]} />
          <meshStandardMaterial
            map={texture}
            transparent
            roughness={0.4}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Golden Divine Prana Backlight Halo */}
        <pointLight
          ref={haloLightRef}
          position={[0, 0.2, -0.3]}
          color={isFallen ? '#ffaa40' : '#ffd700'}
          intensity={1.8}
          distance={4.0}
          decay={2}
        />

        {/* Front Soft Fill Light */}
        <pointLight
          position={[0, 0.2, 0.8]}
          color="#fff5e6"
          intensity={isFallen ? 0.3 : 0.9}
          distance={3.5}
        />

        {/* Ethereal Sacred Aura Disc */}
        {!isFallen && (
          <mesh ref={auraRef} position={[0, 0.15, -0.05]}>
            <ringGeometry args={[0.75, 0.88, 32]} />
            <meshBasicMaterial
              color="#f5ca75"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* ─── Sacred Oil Lamps (Diyas) at Ganesha's Threshold ─── */}
      {[-0.85, 0.85].map((x, idx) => (
        <group key={idx} position={[x, 0.05, 0.3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.05, 0.08, 12]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
          </mesh>
          <pointLight
            color="#ff9933"
            intensity={isFallen ? 0.4 : 1.2}
            distance={2.0}
            position={[0, 0.08, 0]}
          />
        </group>
      ))}
    </group>
  );
}
