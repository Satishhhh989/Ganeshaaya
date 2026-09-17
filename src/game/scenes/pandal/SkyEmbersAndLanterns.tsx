import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';

interface LanternDef {
  pos: [number, number, number];
  color: string;
  size: number;
}

const LANTERNS: LanternDef[] = [
  { pos: [-3.5, 4.8, -1.0], color: '#ffb703', size: 0.38 },
  { pos: [3.5, 4.8, -1.0], color: '#fb8500', size: 0.38 },
  { pos: [-4.2, 5.2, 3.2], color: '#e63946', size: 0.35 },
  { pos: [4.2, 5.2, 3.2], color: '#ffb703', size: 0.35 },
  { pos: [0.0, 5.6, 1.2], color: '#ffd166', size: 0.42 },
  { pos: [-2.0, 5.4, 5.5], color: '#f72585', size: 0.34 },
  { pos: [2.0, 5.4, 5.5], color: '#ffb703', size: 0.34 },
];

export function SkyEmbersAndLanterns() {
  const { festivalTimeOfDay, presentScenePhase } = useGameState();
  const embersRef = useRef<THREE.Points>(null);
  const lanternsGroupRef = useRef<THREE.Group>(null);

  const isNight =
    festivalTimeOfDay === 'NIGHT' ||
    presentScenePhase === 'FINAL_CINEMATIC' ||
    presentScenePhase === 'GAME_COMPLETE';

  // 120 lightweight golden atmospheric ember particles
  const emberCount = 140;
  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(emberCount * 3);
    const spd = new Float32Array(emberCount);
    const phs = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = 0.5 + Math.random() * 12;
      pos[i * 3 + 2] = -5 + Math.random() * 16;

      spd[i] = 0.35 + Math.random() * 0.65;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, phases: phs };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.getElapsedTime();

    if (embersRef.current) {
      const posAttr = embersRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < emberCount; i++) {
        // Drift upward
        array[i * 3 + 1] += speeds[i] * dt;
        // Subtle sinusoidal sway in the night breeze
        array[i * 3] += Math.sin(t * 0.8 + phases[i]) * 0.008;
        array[i * 3 + 2] += Math.cos(t * 0.6 + phases[i]) * 0.006;

        // Reset if reached high sky
        if (array[i * 3 + 1] > 14) {
          array[i * 3 + 1] = 0.5;
          array[i * 3] = (Math.random() - 0.5) * 16;
          array[i * 3 + 2] = -5 + Math.random() * 16;
        }
      }

      posAttr.needsUpdate = true;
    }

    // Gentle swaying of lanterns
    if (lanternsGroupRef.current) {
      lanternsGroupRef.current.children.forEach((child, idx) => {
        child.rotation.z = Math.sin(t * 1.2 + idx * 0.9) * 0.06;
        child.rotation.x = Math.cos(t * 1.0 + idx * 0.7) * 0.04;
      });
    }
  });

  return (
    <group name="Sky_Embers_And_Lanterns">
      {/* ─── FLOATING SKY EMBERS & SPARKS ─── */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#ffb703"
          transparent
          opacity={isNight ? 0.85 : 0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ─── HANGING FESTIVE KANDEEL / SKY LANTERNS ─── */}
      <group ref={lanternsGroupRef}>
        {LANTERNS.map((lantern, idx) => (
          <group key={idx} position={lantern.pos}>
            {/* Lantern Thin Suspension Wire */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 1.2, 6]} />
              <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Glowing Lantern Diamond Body */}
            <mesh castShadow>
              <octahedronGeometry args={[lantern.size, 0]} />
              <meshStandardMaterial
                color={lantern.color}
                emissive={lantern.color}
                emissiveIntensity={isNight ? 1.8 : 0.6}
                roughness={0.4}
              />
            </mesh>

            {/* Tassel Frills below */}
            <mesh position={[0, -lantern.size * 1.2, 0]}>
              <coneGeometry args={[lantern.size * 0.5, lantern.size * 0.9, 8]} />
              <meshStandardMaterial
                color="#f4a261"
                emissive="#f4a261"
                emissiveIntensity={isNight ? 0.8 : 0.2}
              />
            </mesh>

            {/* Warm soft point light radiating from each lantern at night */}
            {isNight && (
              <pointLight
                color={lantern.color}
                intensity={1.2}
                distance={6.5}
                decay={2}
              />
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
