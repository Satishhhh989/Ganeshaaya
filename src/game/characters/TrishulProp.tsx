import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrishulPropProps {
  isCharged?: boolean;
  scale?: number;
}

export function TrishulProp({ isCharged = false, scale = 1 }: TrishulPropProps) {
  const glowRef = useRef<THREE.PointLight>(null);
  const auraMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.intensity = isCharged
        ? 3.5 + Math.sin(time * 8) * 1.5
        : 0.8 + Math.sin(time * 2) * 0.2;
    }
    if (auraMeshRef.current && isCharged) {
      auraMeshRef.current.rotation.y = time * 3;
      const s = 1 + Math.sin(time * 10) * 0.12;
      auraMeshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group scale={scale}>
      {/* ─── Long Staff Shaft ─── */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.026, 2.3, 16]} />
        <meshStandardMaterial
          color="#3a2f26"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* ─── Shaft Golden Bands & Grips ─── */}
      {[-0.5, 0, 0.5, 0.9].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
      ))}

      {/* ─── Trident Base Collar ─── */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.03, 0.1, 16]} />
        <meshStandardMaterial
          color="#e5b83b"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* ─── Trident Center Blade ─── */}
      <mesh position={[0, 1.38, 0]} castShadow>
        <coneGeometry args={[0.042, 0.42, 4]} />
        <meshStandardMaterial
          color={isCharged ? '#a8d8ff' : '#f5ca55'}
          emissive={isCharged ? '#3070ff' : '#b8860b'}
          emissiveIntensity={isCharged ? 1.2 : 0.2}
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* ─── Left Curved Prong ─── */}
      <group position={[-0.11, 1.3, 0]} rotation={[0, 0, 0.22]}>
        <mesh castShadow>
          <coneGeometry args={[0.032, 0.34, 4]} />
          <meshStandardMaterial
            color={isCharged ? '#a8d8ff' : '#f5ca55'}
            emissive={isCharged ? '#3070ff' : '#b8860b'}
            emissiveIntensity={isCharged ? 1.0 : 0.15}
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>
      </group>

      {/* ─── Right Curved Prong ─── */}
      <group position={[0.11, 1.3, 0]} rotation={[0, 0, -0.22]}>
        <mesh castShadow>
          <coneGeometry args={[0.032, 0.34, 4]} />
          <meshStandardMaterial
            color={isCharged ? '#a8d8ff' : '#f5ca55'}
            emissive={isCharged ? '#3070ff' : '#b8860b'}
            emissiveIntensity={isCharged ? 1.0 : 0.15}
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>
      </group>

      {/* ─── Crossbar Connector ─── */}
      <mesh position={[0, 1.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* ─── Sacred Damru Tied Below Trident Head ─── */}
      <group position={[0.06, 1.06, 0]} rotation={[0, 0, 0.4]}>
        {/* Upper Drum Cone */}
        <mesh position={[0, 0.04, 0]}>
          <coneGeometry args={[0.05, 0.07, 12]} />
          <meshStandardMaterial color="#6a3818" roughness={0.6} />
        </mesh>
        {/* Lower Drum Cone */}
        <mesh position={[0, -0.04, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.07, 12]} />
          <meshStandardMaterial color="#6a3818" roughness={0.6} />
        </mesh>
        {/* Damru Center Tie */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      </group>

      {/* ─── Sacred Red & Gold Ribbon Streamer ─── */}
      <mesh position={[-0.04, 0.98, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.02, 0.22, 0.005]} />
        <meshStandardMaterial color="#b31b1b" roughness={0.5} />
      </mesh>
      <mesh position={[-0.02, 0.96, 0.02]} rotation={[0.2, 0, -0.1]}>
        <boxGeometry args={[0.015, 0.18, 0.005]} />
        <meshStandardMaterial color="#e5b83b" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* ─── Divine Radiance Point Light ─── */}
      <pointLight
        ref={glowRef}
        position={[0, 1.35, 0.05]}
        color={isCharged ? '#50a0ff' : '#ffc850'}
        intensity={1.2}
        distance={3.5}
        decay={2}
      />

      {/* ─── Celestial Energy Burst Mesh (When Charged) ─── */}
      {isCharged && (
        <mesh ref={auraMeshRef} position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial
            color="#80c0ff"
            transparent
            opacity={0.35}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}
