import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function WindowCurtains() {
  const leftCurtainRef = useRef<THREE.Group>(null);
  const rightCurtainRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Gentle breezy flutter of the sheer curtains
    if (leftCurtainRef.current) {
      leftCurtainRef.current.rotation.y = Math.sin(t * 1.1) * 0.05;
      leftCurtainRef.current.rotation.z = Math.cos(t * 0.9) * 0.02;
    }
    if (rightCurtainRef.current) {
      rightCurtainRef.current.rotation.y = -Math.sin(t * 1.1 + 0.5) * 0.05;
      rightCurtainRef.current.rotation.z = -Math.cos(t * 0.9 + 0.5) * 0.02;
    }
  });

  return (
    <group position={[-0.2, 1.8, 6.95]} name="Window_Sheer_Curtains">
      {/* Curtain Rod (Brushed Brass) */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 3.2, 12]} />
        <meshStandardMaterial color="#c8963e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Left Curtain Drape (Soft linen / cream translucent fabric) */}
      <group ref={leftCurtainRef} position={[-1.1, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <planeGeometry args={[0.85, 1.9, 8, 8]} />
          <meshStandardMaterial
            color="#fefae0"
            roughness={0.7}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Right Curtain Drape */}
      <group ref={rightCurtainRef} position={[1.1, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <planeGeometry args={[0.85, 1.9, 8, 8]} />
          <meshStandardMaterial
            color="#fefae0"
            roughness={0.7}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
