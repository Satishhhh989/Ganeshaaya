/**
 * MythologyEnvironment - Sacred Mount Kailash Abode & Sanctum Portal
 * Renders a breathtaking Himalayan threshold:
 * Weathered stone pilgrimage path, towering snow-crusted mountain crags,
 * carved temple torana entrance, traditional deepastambha flame lanterns,
 * distant sacred Kailash summit under celestial twilight, and luminous divine lighting.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MythologyEnvironment() {
  const starsRef = useRef<THREE.Points>(null);
  const lanternFlickerRef = useRef<THREE.PointLight>(null);

  // Sacred carved stone paving slabs along the path
  const pavingStones = useMemo(() => {
    const stones = [];
    for (let z = 8; z >= -8.5; z -= 1.3) {
      for (let x = -1.8; x <= 1.8; x += 1.2) {
        const jitterX = (Math.sin(x * 12 + z * 7) * 0.08);
        const jitterZ = (Math.cos(x * 9 + z * 11) * 0.08);
        const scaleX = 1.05 + Math.abs(Math.sin(z)) * 0.15;
        const scaleZ = 1.15 + Math.abs(Math.cos(x)) * 0.15;
        stones.push({ x: x + jitterX, z: z + jitterZ, scaleX, scaleZ });
      }
    }
    return stones;
  }, []);

  // Majestic flanking mountain boulders and cliff walls
  const mountainCrags = useMemo(() => {
    return [
      // Left cliff range
      { pos: [-4.2, 2.2, 5.0], scale: [2.8, 5.0, 3.8], rot: 0.15 },
      { pos: [-4.8, 3.2, 0.5], scale: [3.4, 6.8, 4.8], rot: -0.25 },
      { pos: [-4.0, 3.0, -4.5], scale: [3.0, 6.2, 4.2], rot: 0.2 },
      { pos: [-3.6, 3.8, -9.0], scale: [3.2, 8.0, 4.5], rot: 0.35 },
      // Right cliff range
      { pos: [4.2, 2.2, 5.0], scale: [2.8, 5.0, 3.8], rot: -0.15 },
      { pos: [4.8, 3.2, 0.5], scale: [3.4, 6.8, 4.8], rot: 0.25 },
      { pos: [4.0, 3.0, -4.5], scale: [3.0, 6.2, 4.2], rot: -0.2 },
      { pos: [3.6, 3.8, -9.0], scale: [3.2, 8.0, 4.5], rot: -0.35 },
    ];
  }, []);

  // Atmospheric celestial snow/star particles
  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = Math.random() * 14 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (starsRef.current) {
      // Gentle downward drifting of Himalayan snow flecks
      const posAttr = starsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] -= 0.015;
        if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 14;
      }
      posAttr.needsUpdate = true;
    }

    if (lanternFlickerRef.current) {
      lanternFlickerRef.current.intensity = 2.4 + Math.sin(t * 7.5) * 0.3 + Math.cos(t * 11) * 0.2;
    }
  });

  return (
    <group name="MythologyEnvironment">
      {/* ─── Ground Terrain: Snow-Dusted Himalayan Rock ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[36, 44, 32, 32]} />
        <meshStandardMaterial
          color="#38404a"
          roughness={0.82}
          metalness={0.12}
        />
      </mesh>

      {/* ─── Raised Stone Pilgrimage Pathway ─── */}
      {pavingStones.map((stone, idx) => (
        <mesh
          key={idx}
          position={[stone.x, 0.02, stone.z]}
          rotation={[-Math.PI / 2, 0, (idx % 4) * 0.06]}
          receiveShadow
        >
          <planeGeometry args={[stone.scaleX, stone.scaleZ]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#545d68' : '#4a525d'}
            roughness={0.72}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* ─── Flanking Himalayan Cliff Rocks & Boulders ─── */}
      {mountainCrags.map((rock, idx) => (
        <group key={idx} position={rock.pos as [number, number, number]} rotation={[0, rock.rot, 0]} scale={rock.scale as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#373e48"
              roughness={0.88}
              metalness={0.14}
            />
          </mesh>
          {/* Snow cap on upper rock facet */}
          <mesh position={[0, 0.58, 0]} scale={[0.85, 0.35, 0.85]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#dbeafe"
              roughness={0.65}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* ─── SACRED TEMPLE ENTRANCE / SANCTUM TORANA ─── */}
      <group position={[0, 0, -9.0]}>
        {/* Left Ornate Carved Temple Pillar */}
        <group position={[-2.1, 2.3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 4.6, 0.8]} />
            <meshStandardMaterial color="#424b56" roughness={0.68} metalness={0.15} />
          </mesh>
          {/* Pillar Capital with Golden Accent */}
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[1.0, 0.25, 1.0]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Right Ornate Carved Temple Pillar */}
        <group position={[2.1, 2.3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 4.6, 0.8]} />
            <meshStandardMaterial color="#424b56" roughness={0.68} metalness={0.15} />
          </mesh>
          {/* Pillar Capital with Golden Accent */}
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[1.0, 0.25, 1.0]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Grand Temple Lintel / Carved Torana Arch */}
        <mesh position={[0, 4.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.9, 1.0]} />
          <meshStandardMaterial color="#4b5563" roughness={0.65} metalness={0.15} />
        </mesh>

        {/* Golden Kalash Finial on Arch Apex */}
        <mesh position={[0, 5.5, 0]} castShadow>
          <coneGeometry args={[0.3, 0.8, 12]} />
          <meshStandardMaterial color="#ffd700" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Sanctum Threshold Stone Step */}
        <mesh position={[0, 0.08, 0.3]} receiveShadow>
          <boxGeometry args={[3.8, 0.16, 1.0]} />
          <meshStandardMaterial color="#47515d" roughness={0.7} />
        </mesh>

        {/* Warm Golden Sacred Sanctum Glow within Archway */}
        <mesh position={[0, 2.3, -0.6]}>
          <planeGeometry args={[3.4, 4.4]} />
          <meshBasicMaterial color="#1e1814" />
        </mesh>
        <pointLight
          ref={lanternFlickerRef}
          position={[0, 2.4, -0.3]}
          color="#ffba5a"
          intensity={2.8}
          distance={8.0}
          decay={1.8}
        />
      </group>

      {/* ─── TRADITIONAL BRASS FLAME LANTERNS (DEEPASTAMBHAS) ─── */}
      {[-2.6, 2.6].map((x, idx) => (
        <group key={idx} position={[x, 0, -4.5]}>
          {/* Stone Base */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.35, 0.5, 12]} />
            <meshStandardMaterial color="#374151" roughness={0.8} />
          </mesh>
          {/* Pillar Shaft */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.9, 10]} />
            <meshStandardMaterial color="#b45309" roughness={0.4} metalness={0.75} />
          </mesh>
          {/* Lamp Bowl */}
          <mesh position={[0, 1.45, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.14, 0.22, 12]} />
            <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Golden Flame */}
          <mesh position={[0, 1.62, 0]}>
            <coneGeometry args={[0.08, 0.22, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight
            position={[0, 1.7, 0]}
            color="#f59e0b"
            intensity={1.5}
            distance={5.0}
            decay={2}
          />
        </group>
      ))}

      {/* ─── HIMALAYAN PINE & DEODAR TREES ALONG RIDGES ─── */}
      {[-5.2, -4.6, 4.6, 5.2].map((x, idx) => (
        <group key={idx} position={[x, 0, (idx % 2 === 0 ? 2.5 : -3.5)]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 2.8, 8]} />
            <meshStandardMaterial color="#2d1b12" roughness={0.9} />
          </mesh>
          {[2.2, 3.2, 4.1].map((y, coneIdx) => (
            <mesh key={coneIdx} position={[0, y, 0]} castShadow>
              <coneGeometry args={[1.3 - coneIdx * 0.3, 1.6, 8]} />
              <meshStandardMaterial color="#1e3325" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ─── DISTANT MOUNT KAILASH SUMMIT SILHOUETTES IN THE CELESTIAL MISTS ─── */}
      {/* Central Sacred Summit (Luminous Kailash Pyramid) */}
      <mesh position={[0, 16, -32]} rotation={[0, Math.PI * 0.25, 0]}>
        <coneGeometry args={[16, 26, 4]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.6}
          emissive="#60a5fa"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* Flanking Himalayan ridges */}
      {[-22, 22].map((x, idx) => (
        <mesh key={idx} position={[x, 11, -28]}>
          <coneGeometry args={[15, 20, 5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      ))}

      {/* ─── HIMALAYAN DRIFTING SNOW / PRANA MOTE PARTICLES ─── */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#e0f2fe"
          transparent
          opacity={0.75}
        />
      </points>

      {/* ─── CINEMATIC HIMALAYAN LIGHTING ─── */}
      {/* Cool Celestial Ambient Sky Light (Bright enough to clearly see the scene) */}
      <ambientLight color="#93c5fd" intensity={0.95} />

      {/* Low Golden Himalayan Sun/Moon Beam radiating across path */}
      <directionalLight
        position={[7, 14, 8]}
        color="#ffedd5"
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Dramatic Celestial Blue Rim Light from Kailash Summit */}
      <directionalLight
        position={[-6, 16, -16]}
        color="#60a5fa"
        intensity={1.6}
      />

      {/* Sacred Doorway Spotlight Illuminating Ganesha at the Entrance */}
      <spotLight
        position={[0, 6.5, -4.5]}
        target-position={[0, 0.8, -8.0]}
        color="#fef08a"
        intensity={2.4}
        angle={0.55}
        penumbra={0.6}
        castShadow
      />

      {/* Deep Atmospheric Mountain Fog (Pushed far back to maintain depth & clarity) */}
      <fog attach="fog" args={['#141b26', 14, 45]} />
    </group>
  );
}
