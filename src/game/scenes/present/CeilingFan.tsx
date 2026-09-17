import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CeilingFan() {
  const fanBladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (fanBladesRef.current) {
      // Smooth continuous rotation of the ceiling fan blades
      fanBladesRef.current.rotation.y += delta * 3.8;
    }
  });

  return (
    <group position={[0, 2.72, 3.5]} name="Living_Room_Ceiling_Fan">
      {/* Ceiling Mounting Canopy */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#3a2312" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Downrod */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 12]} />
        <meshStandardMaterial color="#2d1a0d" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Motor Housing */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.09, 20]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.45} metalness={0.4} />
      </mesh>

      {/* Center Golden Trim Ring */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.02, 20]} />
        <meshStandardMaterial color="#c8963e" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Rotating 3 Blades Assembly */}
      <group ref={fanBladesRef}>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, angle, 0]}>
            {/* Blade Bracket / Flange */}
            <mesh position={[0.22, -0.01, 0]}>
              <boxGeometry args={[0.16, 0.015, 0.04]} />
              <meshStandardMaterial color="#c8963e" metalness={0.7} roughness={0.35} />
            </mesh>
            {/* Aerodynamic Wooden Blade */}
            <mesh position={[0.62, -0.01, 0]} rotation={[0.06, 0, 0]} castShadow>
              <boxGeometry args={[0.72, 0.012, 0.14]} />
              <meshStandardMaterial color="#4a2e18" roughness={0.5} metalness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
