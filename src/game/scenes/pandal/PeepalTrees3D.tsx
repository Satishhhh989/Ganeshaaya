import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeDef {
  pos: [number, number, number];
  rot: number;
  scale: number;
}

const TREES: TreeDef[] = [
  // Tree behind the left residential wall
  { pos: [-9.2, 0, -3.5], rot: 0.4, scale: 1.15 },
  // Tree near the back left courtyard corner
  { pos: [-6.8, 0, -6.5], rot: 1.2, scale: 1.05 },
  // Tree behind right residential wall
  { pos: [9.5, 0, -2.5], rot: -0.6, scale: 1.2 },
  // Tree near front right entrance street
  { pos: [8.5, 0, 7.5], rot: 0.9, scale: 1.0 },
];

export function PeepalTrees3D() {
  const treesGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (treesGroupRef.current) {
      treesGroupRef.current.children.forEach((tree, idx) => {
        const offset = idx * 1.4;
        // Subtle organic sway in the breeze
        tree.rotation.z = Math.sin(t * 0.9 + offset) * 0.025;
        tree.rotation.x = Math.cos(t * 0.75 + offset) * 0.018;
      });
    }
  });

  return (
    <group ref={treesGroupRef} name="Peepal_Courtyard_Trees">
      {TREES.map((tree, idx) => (
        <group key={idx} position={tree.pos} scale={[tree.scale, tree.scale, tree.scale]}>
          {/* Trunk */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.45, 4.4, 8]} />
            <meshStandardMaterial color="#4a3b32" roughness={0.9} />
          </mesh>

          {/* Main Branches */}
          <group position={[0, 4.0, 0]}>
            <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, 0.45]} castShadow>
              <cylinderGeometry args={[0.16, 0.24, 1.8, 6]} />
              <meshStandardMaterial color="#4a3b32" roughness={0.9} />
            </mesh>
            <mesh position={[0.45, 0.7, 0.2]} rotation={[0.2, 0, -0.42]} castShadow>
              <cylinderGeometry args={[0.15, 0.22, 2.0, 6]} />
              <meshStandardMaterial color="#4a3b32" roughness={0.9} />
            </mesh>
          </group>

          {/* Foliage Canopy Clusters (Stylized Peepal Tree leaves) */}
          <group position={[0, 5.2, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <dodecahedronGeometry args={[1.8, 1]} />
              <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
            </mesh>
            <mesh position={[-0.9, 0.2, 0.4]} castShadow>
              <dodecahedronGeometry args={[1.3, 1]} />
              <meshStandardMaterial color="#40916c" roughness={0.8} />
            </mesh>
            <mesh position={[0.85, 0.3, -0.3]} castShadow>
              <dodecahedronGeometry args={[1.4, 1]} />
              <meshStandardMaterial color="#1b4332" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.4, 0]} castShadow>
              <dodecahedronGeometry args={[1.2, 1]} />
              <meshStandardMaterial color="#52b788" roughness={0.8} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
