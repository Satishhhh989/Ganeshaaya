import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';
import { DadaCharacter } from '../../characters/ProceduralCharacters';

interface CrowdMemberDef {
  id: string;
  name: string;
  pos: [number, number, number];
  rot: number;
  kurtaColor: string;
  dhotiColor: string;
  animType: 'pray' | 'talk' | 'camera' | 'idle' | 'sway';
  scale: number;
}

const CROWD_MEMBERS: CrowdMemberDef[] = [
  // Family near right front of stage (Praying with folded hands)
  {
    id: 'neighbor_sharma',
    name: 'Mrs. Sharma',
    pos: [2.2, 0, 0.4],
    rot: -0.6,
    kurtaColor: '#e63946', // Festive red saree/kurta
    dhotiColor: '#ffd166',
    animType: 'pray',
    scale: 0.95,
  },
  {
    id: 'neighbor_rajesh',
    name: 'Rajesh Uncle',
    pos: [2.8, 0, 0.2],
    rot: -0.8,
    kurtaColor: '#457b9d', // Royal blue kurta
    dhotiColor: '#f1faee',
    animType: 'pray',
    scale: 1.0,
  },
  // Young girl offering flowers
  {
    id: 'child_aarohi',
    name: 'Little Aarohi',
    pos: [1.6, 0, 1.2],
    rot: -0.4,
    kurtaColor: '#ffb703', // Marigold yellow dress
    dhotiColor: '#e76f51',
    animType: 'sway',
    scale: 0.75,
  },
  // Friend taking photo on phone near left entrance
  {
    id: 'friend_amit',
    name: 'Amit (Childhood Friend)',
    pos: [-2.4, 0, 1.2],
    rot: 0.5,
    kurtaColor: '#2a9d8f', // Emerald green kurta
    dhotiColor: '#264653',
    animType: 'camera',
    scale: 1.0,
  },
  // Elder neighbor near left pillar
  {
    id: 'elder_panditji',
    name: 'Panditji',
    pos: [-1.8, 0, -0.4],
    rot: 0.7,
    kurtaColor: '#fb8500', // Saffron kurta
    dhotiColor: '#fefae0',
    animType: 'talk',
    scale: 0.98,
  },
  // Neighbors conversing warmly near the street entrance
  {
    id: 'neighbor_kiran',
    name: 'Kiran Tai',
    pos: [-3.4, 0, 3.2],
    rot: 1.2,
    kurtaColor: '#9b5de5',
    dhotiColor: '#f72585',
    animType: 'talk',
    scale: 0.94,
  },
  {
    id: 'neighbor_anil',
    name: 'Anil Bhaiya',
    pos: [-2.6, 0, 3.5],
    rot: -1.8,
    kurtaColor: '#06d6a0',
    dhotiColor: '#118ab2',
    animType: 'sway',
    scale: 1.02,
  },
];

export function CommunityCrowd3D() {
  const { presentScenePhase } = useGameState();

  const isCelebration =
    presentScenePhase === 'FESTIVAL_PREPARATION' ||
    presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION' ||
    presentScenePhase === 'FINAL_CINEMATIC';

  const crowdGroupRef = useRef<THREE.Group>(null);

  // Procedural subtle animations for crowd members
  useFrame(({ clock }) => {
    if (!crowdGroupRef.current) return;
    const t = clock.getElapsedTime();

    crowdGroupRef.current.children.forEach((child, idx) => {
      const offset = idx * 0.7;
      // Gentle breathing and swaying
      child.position.y = Math.sin(t * 1.8 + offset) * 0.015;
      child.rotation.y += Math.sin(t * 0.8 + offset) * 0.001;
    });
  });

  if (!isCelebration) return null;

  return (
    <group name="Community_Celebration_Crowd">
      {/* ─── DADA (GRANDFATHER) ─── */}
      {/* Positioned near the altar singhasan [ -0.95, 0.7, -0.2 ], looking proudly at Ganesha and Vinay */}
      <group position={[-1.1, 0.7, -0.2]} rotation={[0, 0.4, 0]}>
        <DadaCharacter speed={0} isSitting={false} />
        {/* Interaction indicator above Dada's head */}
        {presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION' && (
          <mesh position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={1.2} />
          </mesh>
        )}
      </group>

      {/* ─── COMMUNITY NEIGHBORS & FAMILIES ─── */}
      <group ref={crowdGroupRef}>
        {CROWD_MEMBERS.map((npc) => (
          <group
            key={npc.id}
            position={npc.pos}
            rotation={[0, npc.rot, 0]}
            scale={[npc.scale, npc.scale, npc.scale]}
          >
            {/* Stylized Procedural Neighbor Model */}
            {/* Head */}
            <mesh position={[0, 1.45, 0]} castShadow>
              <sphereGeometry args={[0.13, 12, 12]} />
              <meshStandardMaterial color="#d4a574" roughness={0.7} />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 1.52, -0.02]}>
              <sphereGeometry args={[0.135, 10, 10]} />
              <meshStandardMaterial color="#1a120b" roughness={0.9} />
            </mesh>

            {/* Torso & Festive Kurta */}
            <mesh position={[0, 0.95, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.22, 0.75, 10]} />
              <meshStandardMaterial color={npc.kurtaColor} roughness={0.6} />
            </mesh>

            {/* Legs & Dhoti/Pants */}
            <mesh position={[-0.08, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
              <meshStandardMaterial color={npc.dhotiColor} roughness={0.7} />
            </mesh>
            <mesh position={[0.08, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
              <meshStandardMaterial color={npc.dhotiColor} roughness={0.7} />
            </mesh>

            {/* Arms - PRAYING with folded hands */}
            {npc.animType === 'pray' && (
              <group position={[0, 1.05, 0.18]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.14, 0.16, 0.08]} />
                  <meshStandardMaterial color="#d4a574" roughness={0.7} />
                </mesh>
              </group>
            )}

            {/* Arms - HOLDING PHONE / CAMERA */}
            {npc.animType === 'camera' && (
              <group position={[0, 1.15, 0.22]}>
                <mesh>
                  <boxGeometry args={[0.12, 0.06, 0.02]} />
                  <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
