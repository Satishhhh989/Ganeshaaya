import { useMemo } from 'react';

export function ForestEnvironment() {
  // Sacred stone and mossy forest path pavers
  const forestPath = useMemo(() => {
    const stones = [];
    for (let z = 8; z >= -9; z -= 1.4) {
      for (let x = -1.5; x <= 1.5; x += 1.1) {
        const jitterX = (Math.random() - 0.5) * 0.2;
        const jitterZ = (Math.random() - 0.5) * 0.2;
        const scaleX = 0.9 + Math.random() * 0.3;
        const scaleZ = 1.0 + Math.random() * 0.3;
        stones.push({ x: x + jitterX, z: z + jitterZ, scaleX, scaleZ });
      }
    }
    return stones;
  }, []);

  // Ancient Deodar Cedars & Himalayan Pines flanking the forest corridor
  const trees = useMemo(() => {
    const treeList: Array<{ x: number; z: number; scale: number; id: string }> = [];
    const sideOffsets = [-4.5, -3.6, -2.8, 2.8, 3.6, 4.5];
    for (let z = 9; z >= -11; z -= 2.6) {
      sideOffsets.forEach((x, idx) => {
        if (Math.abs(x) < 2.2 && z > -7 && z < 7) return; // Keep central path open
        const jitterX = (Math.random() - 0.5) * 0.4;
        const jitterZ = (Math.random() - 0.5) * 0.4;
        const scale = 0.85 + Math.random() * 0.4;
        treeList.push({ x: x + jitterX, z: z + jitterZ, scale, id: `${z}_${idx}` });
      });
    }
    return treeList;
  }, []);

  // Mossy forest boulders
  const mossyBoulders = useMemo(() => {
    return [
      { pos: [-2.9, 0.4, 4.2], scale: [1.2, 0.8, 1.4], rot: 0.3 },
      { pos: [3.1, 0.5, 2.1], scale: [1.4, 0.9, 1.2], rot: -0.4 },
      { pos: [-3.2, 0.6, -1.8], scale: [1.5, 1.1, 1.6], rot: 0.2 },
      { pos: [3.0, 0.5, -4.2], scale: [1.3, 0.8, 1.4], rot: -0.2 },
      { pos: [-2.6, 0.4, -6.8], scale: [1.1, 0.7, 1.3], rot: 0.5 },
      { pos: [2.7, 0.4, -7.1], scale: [1.2, 0.8, 1.2], rot: -0.3 },
    ];
  }, []);

  return (
    <group name="ForestEnvironment">
      {/* ─── Ground Terrain (Lush Forest Floor with Moss and Earth) ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[36, 46, 32, 32]} />
        <meshStandardMaterial
          color="#1e2d1d"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* ─── Natural Forest Path Stones ─── */}
      {forestPath.map((stone, idx) => (
        <mesh
          key={idx}
          position={[stone.x, 0.02, stone.z]}
          rotation={[-Math.PI / 2, 0, (idx % 4) * 0.1]}
          receiveShadow
        >
          <planeGeometry args={[stone.scaleX, stone.scaleZ]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#384334' : '#2f392b'}
            roughness={0.8}
            metalness={0.08}
          />
        </mesh>
      ))}

      {/* ─── Ancient Himalayan Pine / Deodar Trees ─── */}
      {trees.map((t) => (
        <group key={t.id} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Robust Cedar Trunk */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.28, 3.2, 8]} />
            <meshStandardMaterial color="#2d1c12" roughness={0.9} />
          </mesh>
          {/* Layered Pine Foliage Cones */}
          {[2.2, 3.2, 4.1, 4.9].map((y, coneIdx) => (
            <mesh key={coneIdx} position={[0, y, 0]} castShadow>
              <coneGeometry args={[1.5 - coneIdx * 0.28, 1.6, 8]} />
              <meshStandardMaterial
                color={coneIdx % 2 === 0 ? '#1b3420' : '#152919'}
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ─── Moss-Covered Rocks & Boulders ─── */}
      {mossyBoulders.map((b, idx) => (
        <mesh
          key={idx}
          position={b.pos as [number, number, number]}
          rotation={[0, b.rot, 0]}
          scale={b.scale as [number, number, number]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#2a3a28"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* ─── Sacred Forest Clearing Light Beam ─── */}
      <spotLight
        position={[0, 14, -8.5]}
        target-position={[0, 0, -8.5]}
        color="#fff1cc"
        intensity={3.5}
        angle={0.45}
        penumbra={0.8}
        castShadow
        distance={25}
      />

      {/* ─── Ambient Sky Fill ─── */}
      <ambientLight color="#85a388" intensity={0.55} />

      {/* ─── Warm Sunlight Filtering Through Trees ─── */}
      <directionalLight
        position={[10, 14, 8]}
        color="#ffe2a8"
        intensity={1.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* ─── Cool Mountain Rim Light ─── */}
      <directionalLight
        position={[-8, 12, -12]}
        color="#70a3c4"
        intensity={0.9}
      />

      {/* ─── Soft Ethereal Forest Mist ─── */}
      <fog attach="fog" args={['#16241b', 7, 26]} />
    </group>
  );
}
