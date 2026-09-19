/**
 * ForestClues3D - Environmental Tracking Clues System
 * 
 * - Clue 1: Massive Sacred Elephant Footprints pressed into earth & moss
 * - Clue 2: Broken Cedar Branches & Scraped Bark at elephant height
 * - Clue 3: Disturbed Sacred Grove Threshold with crushed ferns & heavy indentations
 * 
 * Provides 3D visuals, proximity triggers, prana dust particles, and completed states.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ClueDefinition {
  id: 'CLUE_ONE' | 'CLUE_TWO' | 'CLUE_THREE';
  position: [number, number, number];
  title: string;
  examinePrompt: string;
  narration: string;
}

export const CLUES: ClueDefinition[] = [
  {
    id: 'CLUE_ONE',
    position: [2.2, 0.02, 1.8],
    title: 'Massive Sacred Footprints',
    examinePrompt: 'EXAMINE TRACKS',
    narration: '“Enormous footprints... pressed deep into the sacred moss, leading northward.”',
  },
  {
    id: 'CLUE_TWO',
    position: [-1.2, 0.02, -4.8],
    title: 'Broken Branches & Scraped Bark',
    examinePrompt: 'EXAMINE BRANCHES',
    narration: '“High branches snapped cleanly, bark smoothed by enormous strength. It moves deeper into the grove.”',
  },
  {
    id: 'CLUE_THREE',
    position: [0.8, 0.02, -10.8],
    title: 'Sacred Threshold & Tremor',
    examinePrompt: 'EXAMINE CLEARING PATH',
    narration: '“A deep vibration resonates through the soil... the sacred guardian is close.”',
  },
];

interface ForestClues3DProps {
  completedClues: Set<string>;
  activeClueId: string | null;
}

export function ForestClues3D({ completedClues, activeClueId }: ForestClues3DProps) {
  const pulseRingsRef = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    pulseRingsRef.current.forEach((ring, idx) => {
      if (ring) {
        const pulse = Math.sin(time * 2.5 + idx) * 0.12 + 1.0;
        ring.scale.set(pulse, pulse, 1);
      }
    });
  });

  return (
    <group name="ForestClues3D">
      {/* ─── CLUE 1: MASSIVE ELEPHANT FOOTPRINTS ─── */}
      <group position={CLUES[0].position}>
        {/* Footprint 1 (Right Front) */}
        <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
          {/* Main Round Depression */}
          <mesh receiveShadow>
            <circleGeometry args={[0.42, 24]} />
            <meshStandardMaterial
              color={completedClues.has('CLUE_ONE') ? '#1e281c' : '#141c12'}
              roughness={0.95}
            />
          </mesh>
          {/* Subtle Outer Earth Ridge */}
          <mesh position={[0, 0, -0.01]}>
            <ringGeometry args={[0.42, 0.52, 24]} />
            <meshStandardMaterial color="#2d3a28" roughness={0.9} />
          </mesh>
          {/* 3 Front Toe indentations */}
          {[-0.2, 0, 0.2].map((x, idx) => (
            <mesh key={idx} position={[x, 0.36, 0.01]}>
              <circleGeometry args={[0.075, 12]} />
              <meshStandardMaterial color="#0f150e" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Footprint 2 (Left Rear, slightly forward) */}
        <group position={[-0.45, 0, -0.85]} rotation={[-Math.PI / 2, 0, 0.15]}>
          <mesh receiveShadow>
            <circleGeometry args={[0.39, 24]} />
            <meshStandardMaterial
              color={completedClues.has('CLUE_ONE') ? '#1e281c' : '#141c12'}
              roughness={0.95}
            />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <ringGeometry args={[0.39, 0.48, 24]} />
            <meshStandardMaterial color="#2d3a28" roughness={0.9} />
          </mesh>
        </group>

        {/* Broken Twigs scattered across track */}
        {[-0.2, 0.15, -0.1].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0.03, idx * 0.2 - 0.2]}
            rotation={[0, (idx + 1) * 0.8, 0]}
          >
            <cylinderGeometry args={[0.018, 0.022, 0.38, 6]} />
            <meshStandardMaterial color="#3e2723" roughness={0.85} />
          </mesh>
        ))}

        {/* Subtle Ethereal Guiding Ring (Visible before examined) */}
        {!completedClues.has('CLUE_ONE') && (
          <group
            ref={(el) => {
              if (el) pulseRingsRef.current[0] = el;
            }}
            position={[0, 0.04, -0.4]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.75, 0.88, 32]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={activeClueId === 'CLUE_ONE' ? 0.65 : 0.25}
              side={THREE.DoubleSide}
            />
          </group>
        )}
      </group>

      {/* ─── CLUE 2: BROKEN BRANCHES & SCRAPED CEDAR TRUNK ─── */}
      <group position={CLUES[1].position}>
        {/* Ancient Cedar Tree Trunk */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.58, 5.0, 16]} />
          <meshStandardMaterial color="#382417" roughness={0.88} />
        </mesh>

        {/* Freshly Scraped Bark at Elephant Height (2.2m - 3.4m) */}
        <mesh position={[0.22, 2.7, 0.35]} rotation={[0, 0.3, 0]}>
          <planeGeometry args={[0.45, 1.3]} />
          <meshStandardMaterial
            color="#d97706"
            roughness={0.65}
            emissive="#b45309"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Snapped Heavy Branch hanging down */}
        <group position={[0.4, 3.4, 0.2]} rotation={[0.4, 0, 0.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.14, 1.8, 8]} />
            <meshStandardMaterial color="#422919" roughness={0.85} />
          </mesh>
          {/* Cedar Foliage clumps on snapped branch */}
          <mesh position={[0, -0.7, 0]} castShadow>
            <coneGeometry args={[0.65, 0.9, 8]} />
            <meshStandardMaterial color="#1e3a24" roughness={0.8} />
          </mesh>
        </group>

        {/* Fallen Broken Branch on ground */}
        <mesh position={[0.6, 0.1, 0.4]} rotation={[0, 0.4, 1.55]} castShadow>
          <cylinderGeometry args={[0.08, 0.11, 1.4, 8]} />
          <meshStandardMaterial color="#422919" roughness={0.85} />
        </mesh>

        {/* Guiding Ring */}
        {!completedClues.has('CLUE_TWO') && (
          <group
            ref={(el) => {
              if (el) pulseRingsRef.current[1] = el;
            }}
            position={[0.3, 0.04, 0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.85, 0.98, 32]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={activeClueId === 'CLUE_TWO' ? 0.65 : 0.25}
              side={THREE.DoubleSide}
            />
          </group>
        )}
      </group>

      {/* ─── CLUE 3: DISTURBED SACRED CLEARING THRESHOLD ─── */}
      <group position={CLUES[2].position}>
        {/* Crushed Mountain Ferns & Foliage */}
        {[-0.4, 0.1, 0.5].map((x, idx) => (
          <group key={idx} position={[x, 0.08, (idx - 1) * 0.3]}>
            <mesh rotation={[-Math.PI / 2 + 0.3, 0, idx * 1.2]}>
              <planeGeometry args={[0.6, 0.35]} />
              <meshStandardMaterial
                color={completedClues.has('CLUE_THREE') ? '#2e4530' : '#1c301e'}
                roughness={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

        {/* Heavy Ground Impressions & Disturbed Earth */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.0, 1.45, 1]}>
          <circleGeometry args={[0.65, 24]} />
          <meshStandardMaterial color="#1a2517" roughness={0.92} />
        </mesh>

        {/* Scattered Divine Petals */}
        {[-0.3, 0.2, 0.4, -0.15].map((x, idx) => (
          <mesh key={idx} position={[x, 0.04, (idx % 2 === 0 ? 0.3 : -0.3)]}>
            <circleGeometry args={[0.065, 8]} />
            <meshStandardMaterial color="#fb7185" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* Guiding Ring */}
        {!completedClues.has('CLUE_THREE') && (
          <group
            ref={(el) => {
              if (el) pulseRingsRef.current[2] = el;
            }}
            position={[0, 0.04, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.85, 0.98, 32]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={activeClueId === 'CLUE_THREE' ? 0.65 : 0.25}
              side={THREE.DoubleSide}
            />
          </group>
        )}
      </group>
    </group>
  );
}
