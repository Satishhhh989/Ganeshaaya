import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SingleDiyaProps {
  position: [number, number, number];
  scale?: number;
}

function SingleDiya({ position, scale = 1 }: SingleDiyaProps) {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (flameRef.current) {
      const time = state.clock.getElapsedTime();
      flameRef.current.scale.y = 1 + Math.sin(time * 15) * 0.12 + Math.cos(time * 9) * 0.08;
      flameRef.current.scale.x = 1 + Math.cos(time * 11) * 0.08;
      flameRef.current.scale.z = flameRef.current.scale.x;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Brass clay base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.04, 0.035, 16]} />
        <meshStandardMaterial
          color="#c48227"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>

      {/* Diya lip rim */}
      <mesh position={[0, 0.038, 0]}>
        <torusGeometry args={[0.068, 0.008, 8, 20]} />
        <meshStandardMaterial
          color="#d89634"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Oil surface */}
      <mesh position={[0, 0.033, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.005, 16]} />
        <meshStandardMaterial
          color="#754710"
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      {/* Diya Flame with teardrop shape and emission */}
      <mesh ref={flameRef} position={[0, 0.065, 0.02]}>
        <coneGeometry args={[0.022, 0.06, 12]} />
        <meshBasicMaterial color="#ff7b00" />
      </mesh>
      {/* Inner flame core */}
      <mesh position={[0, 0.055, 0.02]} scale={0.6}>
        <coneGeometry args={[0.016, 0.04, 10]} />
        <meshBasicMaterial color="#ffea75" />
      </mesh>
    </group>
  );
}

export function DiyaProps() {
  return (
    <group name="DiyaDecorations">
      {/* Diya on the living room coffee table (table is at [-0.27, 0.58, 5.44]) */}
      <SingleDiya position={[-0.27, 0.61, 5.3]} scale={1.2} />

      {/* Diya pair on the dining table (table is at [-0.34, 0.67, -2.96]) */}
      <SingleDiya position={[-0.25, 0.71, -2.85]} scale={1.1} />
      <SingleDiya position={[-0.45, 0.71, -3.1]} scale={1.1} />

      {/* Diya near fireplace mantel (fireplace at [4.14, 1.02, 5.42]) */}
      <SingleDiya position={[4.05, 1.05, 5.3]} scale={1.2} />
    </group>
  );
}
