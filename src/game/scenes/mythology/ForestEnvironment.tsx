/**
 * ForestEnvironment - Rebuilt Mythological Himalayan Cedar Grove
 * 
 * - Bright, warm early-morning sunbeams filtering through ancient canopies
 * - Distant snow-capped Himalayan peaks visible across the tree line
 * - 3D Himalayan Deodar Cedars with multi-tiered canopies and mossy root flares
 * - Natural non-linear winding paths with elevation variation
 * - Layered vegetation: wild ferns, mountain marigolds, mossy boulders, fallen logs
 * - Sacred sunlit clearing with ancient carved stone pillar fragments & lotus pedestal
 * - Zero black tunnels, zero flat billboard foliage walls
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ForestEnvironment() {
  const particlesRef = useRef<THREE.Points>(null);

  // 1. Organic Tree Placements (Flanking the natural primary trail & clearing)
  const trees = useMemo(() => {
    const list: Array<{ x: number; z: number; scale: number; rotY: number }> = [];

    // Continuous Primary Trail Corridor Check:
    // Path waypoints: [0, 8] -> [0.8, 4.5] -> [1.8, 1.8] (Clue 1) -> [0.4, -1.5] -> [-1.2, -4.8] (Clue 2) -> [-0.2, -7.8] -> [0.8, -10.8] (Clue 3) -> [0.2, -14.5] -> [0, -20.5] (Clearing)
    const isOnPrimaryTrail = (x: number, z: number) => {
      // Entrance straight trail (Z: 8.5 down to 5.0)
      if (Math.abs(x) < 2.5 && z >= 4.5 && z <= 9.0) return true;
      // Gentle curve toward Clue 1 on right (Z: 4.5 down to 0.5)
      if (x >= -0.8 && x <= 3.8 && z >= 0.5 && z < 4.5) return true;
      // Transition from Clue 1 toward Clue 2 on left (Z: 0.5 down to -3.0)
      if (x >= -1.8 && x <= 2.8 && z >= -3.0 && z < 0.5) return true;
      // Curve past Clue 2 on left (Z: -3.0 down to -6.5)
      if (x >= -3.2 && x <= 1.2 && z >= -6.5 && z < -3.0) return true;
      // Transition toward Clue 3 on right (Z: -6.5 down to -9.0)
      if (x >= -2.0 && x <= 2.2 && z >= -9.0 && z < -6.5) return true;
      // Approach Clue 3 and threshold (Z: -9.0 down to -14.0)
      if (x >= -1.5 && x <= 2.8 && z >= -14.0 && z < -9.0) return true;
      // Sacred clearing opening (Z <= -14.0 to -28.0)
      if (Math.abs(x) < 7.0 && z < -14.0 && z >= -28.0) return true;
      return false;
    };

    // Distribute trees densely on both sides to form a majestic natural green canopy flanking the single trail
    for (let z = 10; z >= -30; z -= 3.0) {
      for (let x = -16; x <= 16; x += 3.2) {
        const jitterX = (Math.random() - 0.5) * 1.6;
        const jitterZ = (Math.random() - 0.5) * 1.6;
        const finalX = x + jitterX;
        const finalZ = z + jitterZ;

        if (!isOnPrimaryTrail(finalX, finalZ)) {
          const scale = 0.85 + Math.random() * 0.45;
          const rotY = Math.random() * Math.PI * 2;
          list.push({ x: finalX, z: finalZ, scale, rotY });
        }
      }
    }
    return list;
  }, []);

  // 2. Mossy Forest Boulders naturally defining the edges of the primary trail
  const boulders = useMemo(() => {
    return [
      // Left and right shoulders at start
      { pos: [-3.2, 0.6, 6.5], scale: [1.8, 1.2, 1.5], rot: 0.3 },
      { pos: [3.4, 0.7, 6.2], scale: [1.7, 1.1, 1.4], rot: -0.4 },
      // Flanking Clue 1
      { pos: [-2.6, 0.8, 2.5], scale: [2.1, 1.3, 1.8], rot: 0.5 },
      { pos: [4.2, 0.7, 1.2], scale: [1.9, 1.2, 1.6], rot: -0.2 },
      // Flanking Clue 2
      { pos: [-3.8, 0.8, -4.2], scale: [2.3, 1.4, 1.9], rot: 0.2 },
      { pos: [2.8, 0.7, -5.5], scale: [1.8, 1.2, 1.5], rot: 0.6 },
      // Flanking Clue 3 & Threshold
      { pos: [-2.8, 0.9, -10.5], scale: [2.2, 1.3, 1.8], rot: -0.3 },
      { pos: [3.6, 0.8, -11.2], scale: [2.0, 1.2, 1.7], rot: 0.4 },
      // Clearing perimeter grand boulders framing the sacred elephant
      { pos: [-7.2, 1.3, -18.5], scale: [3.2, 2.0, 2.8], rot: 0.2 },
      { pos: [7.4, 1.4, -18.8], scale: [3.0, 1.9, 2.6], rot: -0.4 },
      { pos: [-6.5, 1.2, -24.5], scale: [2.8, 1.7, 2.4], rot: 0.5 },
      { pos: [6.8, 1.2, -24.8], scale: [2.9, 1.8, 2.5], rot: -0.6 },
      { pos: [0, 1.4, -27.5], scale: [3.6, 2.2, 2.8], rot: 0.1 },
    ];
  }, []);

  // 3. Fallen Moss-Covered Ancient Cedar Logs naturally blocking wrong off-trail turns
  const fallenLogs = useMemo(() => {
    return [
      // Blocks westward wander near spawn
      { pos: [-3.4, 0.35, 4.8], rot: [0, 0.8, 0.04], scale: [0.42, 0.38, 4.2] },
      // Blocks eastward wander near Clue 2
      { pos: [3.2, 0.35, -3.8], rot: [0.03, -0.6, 0.02], scale: [0.44, 0.40, 4.4] },
      // Blocks westward detour before clearing
      { pos: [-3.6, 0.4, -12.5], rot: [0, 0.4, -0.04], scale: [0.46, 0.42, 4.6] },
    ];
  }, []);

  // 4. Primary Trail Path Ribbons & Weathered Stepping Stones
  const trailSegments = useMemo(() => {
    // Exact continuous centerline of the primary path from spawn to elephant clearing
    const waypoints = [
      { x: 0, z: 8.5 },
      { x: 0.4, z: 6.5 },
      { x: 1.0, z: 4.5 },
      { x: 1.8, z: 2.2 },  // Clue 1: Massive Footprints
      { x: 1.2, z: 0.0 },
      { x: 0.2, z: -2.2 },
      { x: -1.0, z: -4.5 }, // Clue 2: Broken Branches
      { x: -0.4, z: -7.5 },
      { x: 0.4, z: -9.5 },
      { x: 0.8, z: -11.0 }, // Clue 3: Sacred Threshold
      { x: 0.3, z: -13.5 },
      { x: 0.0, z: -16.5 }, // Entering clearing
      { x: 0.0, z: -19.5 }, // In front of Sri Gajaraj
    ];

    const ribbons: Array<{ x: number; z: number; width: number; length: number; rot: number }> = [];
    const stones: Array<{ x: number; z: number; scale: number; rot: number }> = [];
    const trailTracks: Array<{ x: number; z: number; rot: number }> = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      // Main compacted earth trail ribbon
      ribbons.push({
        x: (p1.x + p2.x) / 2,
        z: (p1.z + p2.z) / 2,
        width: 3.2, // Generously wide primary path (3.2m wide)
        length: dist + 0.5,
        rot: angle,
      });

      // Stepping stones along the path
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        const t = (s + 0.5) / steps;
        const sx = THREE.MathUtils.lerp(p1.x, p2.x, t) + (Math.random() - 0.5) * 0.4;
        const sz = THREE.MathUtils.lerp(p1.z, p2.z, t);
        stones.push({
          x: sx,
          z: sz,
          scale: 0.85 + Math.random() * 0.35,
          rot: Math.random() * Math.PI,
        });
      }

      // Elephant footprint depressions leading naturally forward along the path
      if (i % 2 === 0) {
        trailTracks.push({
          x: (p1.x + p2.x) / 2 + (i % 4 === 0 ? 0.35 : -0.35),
          z: (p1.z + p2.z) / 2,
          rot: angle + (Math.random() - 0.5) * 0.2,
        });
      }
    }

    return { ribbons, stones, trailTracks };
  }, []);

  // 5. Drifting Sunlit Prana & Forest Leaf Particles
  const particleCount = 140;
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = 0.5 + Math.random() * 6.5;
      positions[i * 3 + 2] = 8 - Math.random() * 36;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Gentle downward drift + wind sway
        array[i * 3 + 1] -= 0.006;
        array[i * 3] += Math.sin(time * 0.6 + i) * 0.005;

        // Reset to top when fallen
        if (array[i * 3 + 1] < 0.2) {
          array[i * 3 + 1] = 6.8;
          array[i * 3] = (Math.random() - 0.5) * 32;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="ForestEnvironment">
      {/* ─── DISTANT SNOW-CAPPED HIMALAYAN PEAKS (NORTHERN HORIZON) ─── */}
      <group position={[0, 0, -36]}>
        {[-16, -6, 4, 15].map((x, idx) => (
          <group key={idx} position={[x, 0, (idx % 2) * -3]}>
            {/* Rocky Mountain Ridge */}
            <mesh position={[0, 8.5, 0]}>
              <coneGeometry args={[11 + idx * 1.5, 17, 5]} />
              <meshStandardMaterial color="#2d3a3f" roughness={0.9} />
            </mesh>
            {/* Eternal Snow Cap */}
            <mesh position={[0, 14.2, 0]}>
              <coneGeometry args={[4.5 + idx * 0.6, 6.2, 5]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── LUSH FOREST TERRAIN (ORGANIC EARTH & MOSS FLOOR) ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -8]} receiveShadow>
        <planeGeometry args={[48, 56, 32, 32]} />
        <meshStandardMaterial
          color="#1e2c1d"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* ─── PRIMARY GLOWING SACRED TRAIL (GOLDEN LUMINOUS PATHWAY TO ELEPHANT) ─── */}
      {/* 1. Base Earthen Trail Ribbons: compacted loam bed */}
      {trailSegments.ribbons.map((rib, idx) => (
        <mesh
          key={`ribbon-${idx}`}
          position={[rib.x, -0.015, rib.z]}
          rotation={[-Math.PI / 2, 0, rib.rot]}
          receiveShadow
        >
          <planeGeometry args={[rib.width, rib.length]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#4a3c2c' : '#413526'}
            roughness={0.82}
          />
        </mesh>
      ))}

      {/* 2. Luminous Golden Glowing Center Streamer (The Glowing Path toward Elephant) */}
      {trailSegments.ribbons.map((rib, idx) => (
        <mesh
          key={`glow-ribbon-${idx}`}
          position={[rib.x, 0.008, rib.z]}
          rotation={[-Math.PI / 2, 0, rib.rot]}
        >
          <planeGeometry args={[rib.width * 0.72, rib.length]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.65}
            transparent
            opacity={0.52}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* 3. Soft Earthen Trail Borders with subtle celestial moss glow */}
      {trailSegments.ribbons.map((rib, idx) => (
        <group key={`border-${idx}`} position={[rib.x, -0.01, rib.z]} rotation={[0, rib.rot, 0]}>
          {/* Left Path Edge */}
          <mesh position={[-rib.width * 0.48, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.55, rib.length]} />
            <meshStandardMaterial
              color="#3a4f32"
              emissive="#22c55e"
              emissiveIntensity={0.12}
              roughness={0.88}
            />
          </mesh>
          {/* Right Path Edge */}
          <mesh position={[rib.width * 0.48, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.55, rib.length]} />
            <meshStandardMaterial
              color="#3a4f32"
              emissive="#22c55e"
              emissiveIntensity={0.12}
              roughness={0.88}
            />
          </mesh>
        </group>
      ))}

      {/* 4. Glowing Sacred Elephant Footprints Along the Trail */}
      {trailSegments.trailTracks.map((trk, idx) => (
        <group
          key={`trk-${idx}`}
          position={[trk.x, 0.015, trk.z]}
          rotation={[-Math.PI / 2, 0, trk.rot]}
        >
          {/* Main Elephant Pad Impression */}
          <mesh receiveShadow>
            <circleGeometry args={[0.38, 18]} />
            <meshStandardMaterial
              color="#2a1f15"
              emissive="#eab308"
              emissiveIntensity={0.25}
              roughness={0.9}
            />
          </mesh>
          {/* Disturbed Earth Rim */}
          <mesh position={[0, 0, -0.005]}>
            <ringGeometry args={[0.38, 0.48, 18]} />
            <meshStandardMaterial
              color="#544332"
              roughness={0.88}
            />
          </mesh>
          {/* Radiant Golden Prana Pulse on Tracks */}
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.26, 14]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.45} />
          </mesh>
          {/* Footprint Guide Ring */}
          <mesh position={[0, 0, 0.012]}>
            <ringGeometry args={[0.34, 0.42, 16]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
          </mesh>
        </group>
      ))}

      {/* 4. Natural Weathered Stepping Stones Along Path */}
      {trailSegments.stones.map((s, idx) => (
        <mesh
          key={`stone-${idx}`}
          position={[s.x, 0.02, s.z]}
          rotation={[-Math.PI / 2, 0, s.rot]}
          receiveShadow
        >
          <planeGeometry args={[s.scale * 0.75, s.scale * 0.95]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#5a5448' : '#4e483e'}
            roughness={0.78}
          />
        </mesh>
      ))}

      {/* ─── 3D HIMALAYAN DEODAR CEDARS (FULL 3D TRUNKS & MULTI-TIER CANOPIES) ─── */}
      {trees.map((t, idx) => (
        <group key={idx} position={[t.x, 0, t.z]} scale={t.scale} rotation={[0, t.rotY, 0]}>
          {/* Main Cedar Trunk */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.44, 5.6, 10]} />
            <meshStandardMaterial color="#352216" roughness={0.9} />
          </mesh>

          {/* Exposed Mossy Roots */}
          {[0, 2.1, 4.2].map((angle, rIdx) => (
            <mesh
              key={rIdx}
              position={[Math.cos(angle) * 0.5, 0.12, Math.sin(angle) * 0.5]}
              rotation={[0, angle, 0.4]}
            >
              <cylinderGeometry args={[0.08, 0.16, 1.1, 6]} />
              <meshStandardMaterial color="#2d1c12" roughness={0.9} />
            </mesh>
          ))}

          {/* 4-Tier Foliage Cones */}
          {[3.4, 4.6, 5.7, 6.7].map((y, cIdx) => (
            <mesh key={cIdx} position={[0, y, 0]} castShadow>
              <coneGeometry args={[2.1 - cIdx * 0.38, 1.8, 8]} />
              <meshStandardMaterial
                color={cIdx % 2 === 0 ? '#1b3822' : '#162e1c'}
                roughness={0.78}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ─── MOSSY BOULDERS & GLADE FORMATIONS ─── */}
      {boulders.map((b, idx) => (
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
            color="#2d3f2c"
            roughness={0.84}
            metalness={0.08}
          />
        </mesh>
      ))}

      {/* ─── FALLEN MOSSY CEDAR LOGS ─── */}
      {fallenLogs.map((log, idx) => (
        <mesh
          key={idx}
          position={log.pos as [number, number, number]}
          rotation={log.rot as [number, number, number]}
          scale={log.scale as [number, number, number]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial color="#3a271a" roughness={0.92} />
        </mesh>
      ))}

      {/* ─── SCATTERED MOUNTAIN FERNS & FLOWERS ─── */}
      {[-2.2, 1.8, -3.4, 2.5, -0.8, 1.2, -1.6, 2.8].map((x, idx) => {
        const z = 6 - idx * 3.4;
        return (
          <group key={idx} position={[x, 0.05, z]}>
            {/* Fern Fronds */}
            <mesh rotation={[-Math.PI / 2 + 0.2, 0, idx * 0.8]}>
              <planeGeometry args={[0.7, 0.5]} />
              <meshStandardMaterial
                color="#2f5734"
                roughness={0.75}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Wild Himalayan Mountain Golden Flower */}
            <mesh position={[0.15, 0.2, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#f59e0b' : '#fbbf24'}
                emissive={idx % 2 === 0 ? '#b45309' : '#d97706'}
                emissiveIntensity={0.35}
              />
            </mesh>
          </group>
        );
      })}

      {/* ─── ANCIENT STONE PILLARS IN SACRED CLEARING PERIMETER (Z = -16 to -25) ─── */}
      {[-4.8, 4.8].map((x, idx) => (
        <group key={idx} position={[x, 0, -18.5]}>
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.42, 3.6, 12]} />
            <meshStandardMaterial color="#4a5568" roughness={0.85} />
          </mesh>
          {/* Carved Torana Capital */}
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color="#5a6578" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ─── CELESTIAL SUNLIGHT FUNNEL & GOD RAYS OVER CLEARING ─── */}
      <spotLight
        position={[0, 18, -20.5]}
        target-position={[0, 0, -20.5]}
        color="#fff5db"
        intensity={4.8}
        angle={0.55}
        penumbra={0.85}
        castShadow
        distance={30}
      />

      {/* ─── LIGHTING: BEAUTIFUL DAYLIGHT / GOLDEN MORNING ATMOSPHERE ─── */}
      {/* 1. Ambient Sky Dome (Prevents crushed black shadows) */}
      <ambientLight color="#92c4a0" intensity={0.78} />

      {/* 2. Warm Sun Directional Light */}
      <directionalLight
        position={[14, 22, 12]}
        color="#fff1cc"
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* 3. Cool Mountain Backlight Rim */}
      <directionalLight
        position={[-12, 16, -26]}
        color="#93c5fd"
        intensity={1.05}
      />

      {/* 4. Warm Forest Floor Bounce Light */}
      <directionalLight
        position={[0, -10, -10]}
        color="#5a4224"
        intensity={0.4}
      />

      {/* ─── DRIFTING PRANA / GOLDEN LEAF PARTICLES ─── */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          color="#fef08a"
          size={0.12}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ─── CONTINUOUS GOLDEN GLOWING TRAIL LIGHTS (LEADING DIRECTLY TO ELEPHANT) ─── */}
      {[
        { x: 0.0, z: 7.5 },   // Spawn path start
        { x: 0.8, z: 4.8 },   // Path curve 1
        { x: 1.8, z: 2.2 },   // Clue 1 Footprints
        { x: 0.8, z: -1.2 },  // Trail link
        { x: -1.0, z: -4.5 }, // Clue 2 Broken Cedar
        { x: -0.2, z: -7.5 }, // Northbound trail
        { x: 0.8, z: -10.8 }, // Clue 3 Threshold
        { x: 0.2, z: -14.2 }, // Entrance to Clearing
        { x: 0.0, z: -18.0 }, // Sacred Clearing & Elephant
      ].map((lightPos, idx) => (
        <pointLight
          key={`trail-light-${idx}`}
          position={[lightPos.x, 1.2, lightPos.z]}
          color="#fbbf24"
          intensity={1.25}
          distance={6.5}
          decay={2}
        />
      ))}

      {/* ─── CLEAN, READABLE MOUNTAIN MIST (Atmospheric without obscuring the path) ─── */}
      <fog attach="fog" args={['#1c2d22', 18, 52]} />
    </group>
  );
}
