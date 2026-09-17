import { useMemo } from 'react';

export function MythologyEnvironment() {
  // Sacred stone paving blocks along the mountain path
  const pavingStones = useMemo(() => {
    const stones = [];
    for (let z = 8; z >= -8; z -= 1.4) {
      for (let x = -1.6; x <= 1.6; x += 1.1) {
        const jitterX = (Math.random() - 0.5) * 0.15;
        const jitterZ = (Math.random() - 0.5) * 0.15;
        const scaleX = 0.9 + Math.random() * 0.2;
        const scaleZ = 1.1 + Math.random() * 0.2;
        stones.push({ x: x + jitterX, z: z + jitterZ, scaleX, scaleZ });
      }
    }
    return stones;
  }, []);

  // Flanking Himalayan rock pillars & boulders
  const rockFormations = useMemo(() => {
    return [
      // Left cliff wall
      { pos: [-3.8, 1.8, 4], scale: [2.2, 3.8, 3.2], rot: 0.2 },
      { pos: [-4.2, 2.5, 0], scale: [2.6, 5.2, 4.0], rot: -0.3 },
      { pos: [-3.6, 2.2, -4], scale: [2.4, 4.5, 3.5], rot: 0.1 },
      { pos: [-3.2, 2.8, -8], scale: [2.5, 5.8, 3.8], rot: 0.4 },
      // Right cliff wall
      { pos: [3.8, 1.8, 4], scale: [2.2, 3.8, 3.2], rot: -0.2 },
      { pos: [4.2, 2.5, 0], scale: [2.6, 5.2, 4.0], rot: 0.3 },
      { pos: [3.6, 2.2, -4], scale: [2.4, 4.5, 3.5], rot: -0.1 },
      { pos: [3.2, 2.8, -8], scale: [2.5, 5.8, 3.8], rot: -0.4 },
    ];
  }, []);

  return (
    <group name="MythologyEnvironment">
      {/* ─── Ground Terrain (Snow-dusted Himalayan stone) ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[32, 42, 32, 32]} />
        <meshStandardMaterial
          color="#353b44"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* ─── Main Stone Paved Pilgrimage Pathway ─── */}
      {pavingStones.map((stone, idx) => (
        <mesh
          key={idx}
          position={[stone.x, 0.02, stone.z]}
          rotation={[-Math.PI / 2, 0, (idx % 3) * 0.08]}
          receiveShadow
        >
          <planeGeometry args={[stone.scaleX, stone.scaleZ]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#484f58' : '#3f454d'}
            roughness={0.75}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* ─── Flanking Cliffs and Mountain Boulders ─── */}
      {rockFormations.map((rock, idx) => (
        <mesh
          key={idx}
          position={rock.pos as [number, number, number]}
          rotation={[0, rock.rot, 0]}
          scale={rock.scale as [number, number, number]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#2a3038"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* ─── Sacred Mountain Portal / Cave Archway ─── */}
      <group position={[0, 0, -9.2]}>
        {/* Left Carved Temple Pillar */}
        <mesh position={[-1.8, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 4.4, 0.7]} />
          <meshStandardMaterial color="#2e353d" roughness={0.7} />
        </mesh>
        {/* Right Carved Temple Pillar */}
        <mesh position={[1.8, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 4.4, 0.7]} />
          <meshStandardMaterial color="#2e353d" roughness={0.7} />
        </mesh>
        {/* Upper Carved Torana Lintel Arch */}
        <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.8, 0.9]} />
          <meshStandardMaterial color="#353c46" roughness={0.7} />
        </mesh>
        {/* Cave Interior Deep Shadow Backdrop */}
        <mesh position={[0, 2.0, -0.8]}>
          <planeGeometry args={[3.8, 4.2]} />
          <meshBasicMaterial color="#080706" />
        </mesh>
      </group>

      {/* ─── Himalayan Pine / Deodar Trees Along the Ridges ─── */}
      {[-4.8, -4.2, 4.2, 4.8].map((x, idx) => (
        <group key={idx} position={[x, 0, idx % 2 === 0 ? 3 : -3]}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 2.4, 8]} />
            <meshStandardMaterial color="#2b1d14" roughness={0.9} />
          </mesh>
          {/* Pine Foliage Cones */}
          {[1.8, 2.6, 3.4].map((y, coneIdx) => (
            <mesh key={coneIdx} position={[0, y, 0]} castShadow>
              <coneGeometry args={[1.1 - coneIdx * 0.25, 1.4, 8]} />
              <meshStandardMaterial color="#1a2e22" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ─── Distant Mountain Silhouettes in the Mists ─── */}
      {[-16, 0, 16].map((x, idx) => (
        <mesh key={idx} position={[x, 9, -24]} rotation={[0, 0, 0]}>
          <coneGeometry args={[14, 18, 4]} />
          <meshBasicMaterial color="#181e28" />
        </mesh>
      ))}

      {/* ─── Cinematic Himalayan Lighting ─── */}
      {/* Cool Celestial Ambient Sky Light */}
      <ambientLight color="#8ba3c7" intensity={0.65} />

      {/* Low Golden Himalayan Sun Beam */}
      <directionalLight
        position={[8, 12, 10]}
        color="#ffd494"
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Dramatic Cosmic Blue Rim Light from Kailash Peak */}
      <directionalLight
        position={[-6, 14, -14]}
        color="#60a5fa"
        intensity={1.2}
      />

      {/* Subtle Himalayan Mountain Fog */}
      <fog attach="fog" args={['#1c2330', 8, 28]} />
    </group>
  );
}
