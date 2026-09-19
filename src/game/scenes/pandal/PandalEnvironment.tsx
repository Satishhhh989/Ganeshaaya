import { useRef } from 'react';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';

export function PandalEnvironment() {
  const { festivalTimeOfDay, presentScenePhase } = useGameState();
  const streetLightRef = useRef<THREE.PointLight>(null);

  const isNight = festivalTimeOfDay === 'NIGHT' || presentScenePhase === 'FINAL_CINEMATIC';
  const isMorning = festivalTimeOfDay === 'MORNING' || presentScenePhase === 'FESTIVAL_PREPARATION';

  const isBuilding = presentScenePhase === 'PANDAL_BUILDING' || presentScenePhase === 'PANDAL_COMPLETE';

  // Warm, vibrant, bright afternoon sunlight for cozy festival preparation
  const ambientIntensity = isNight ? 0.55 : isBuilding ? 1.15 : isMorning ? 1.05 : 0.95;
  const ambientColor = isNight ? '#3a4468' : '#fffbeb';

  const dirLightPos: [number, number, number] = isMorning
    ? [-8, 22, 12]
    : isNight
    ? [10, 16, -10]
    : [-10, 20, 12];
  const dirLightIntensity = isNight ? 0.75 : isBuilding ? 2.2 : isMorning ? 1.9 : 1.7;
  const dirLightColor = isNight ? '#90c0e8' : '#fffbeb';

  const hemiSky = isNight ? '#1e293b' : isMorning ? '#d8e8dc' : '#fef08a';
  const hemiGround = isNight ? '#0f172a' : isMorning ? '#78716c' : '#713f12';
  const hemiIntensity = isNight ? 0.5 : 0.85;

  const streetLightIntensity = isNight ? 2.6 : isMorning ? 0.6 : 1.6;

  return (
    <group name="Pandal_Courtyard_Environment">
      {/* ─── ATMOSPHERIC LIGHTING SETUP ─── */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* Warm Golden Key Sunlight with Contact Shadows */}
      <directionalLight
        position={dirLightPos}
        intensity={dirLightIntensity}
        color={dirLightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />

      {/* Sky & Ground Hemisphere Fill Light */}
      <hemisphereLight
        args={[hemiSky, hemiGround, hemiIntensity]}
        position={[0, 20, 0]}
      />

      {/* Street Lamppost Practical Amber Light */}
      <pointLight
        ref={streetLightRef}
        position={[-5.8, 4.2, 5.0]}
        intensity={streetLightIntensity}
        distance={18}
        decay={1.8}
        color="#ffb703"
        castShadow
      />

      {/* ─── GROUND COURTYARD PAVEMENT ─── */}
      {/* Warm Indian Sandstone Courtyard Ground (replacing prototype dark void) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 2]} receiveShadow>
        <planeGeometry args={[26, 28]} />
        <meshStandardMaterial
          color="#6b5b50"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Stone curb borders framing the courtyard */}
      <mesh position={[-8.6, 0.1, 2]} receiveShadow>
        <boxGeometry args={[0.5, 0.2, 28]} />
        <meshStandardMaterial color="#554940" roughness={0.85} />
      </mesh>
      <mesh position={[8.6, 0.1, 2]} receiveShadow>
        <boxGeometry args={[0.5, 0.2, 28]} />
        <meshStandardMaterial color="#554940" roughness={0.85} />
      </mesh>

      {/* ─── SURROUNDING RESIDENTIAL BUILDINGS ─── */}
      {/* Left Residential Building (warm terracotta plaster) */}
      <group position={[-11.5, 5, 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.5, 10, 26]} />
          <meshStandardMaterial color="#9d5a45" roughness={0.85} />
        </mesh>
        {/* Balconies with warm interior windows */}
        {[-8, -2, 4, 10].map((z, idx) => (
          <group key={`balcony_l_${idx}`} position={[2.8, (idx % 2) * 3 - 1, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.2, 2.6]} />
              <meshStandardMaterial color="#54473b" roughness={0.7} />
            </mesh>
            <mesh position={[0.55, 0.45, 0]}>
              <boxGeometry args={[0.08, 0.7, 2.5]} />
              <meshStandardMaterial color="#2d2d2d" metalness={0.8} />
            </mesh>
            <mesh position={[-0.55, 1.1, 0]}>
              <planeGeometry args={[1.6, 1.8]} />
              <meshBasicMaterial color="#ffbe0b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Residential Building (warm ochre plaster) */}
      <group position={[11.5, 5, 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.5, 10, 26]} />
          <meshStandardMaterial color="#b2774a" roughness={0.85} />
        </mesh>
        {/* Balconies */}
        {[-7, -1, 5, 11].map((z, idx) => (
          <group key={`balcony_r_${idx}`} position={[-2.8, (idx % 2) * 3 - 1, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.2, 2.6]} />
              <meshStandardMaterial color="#54473b" roughness={0.7} />
            </mesh>
            <mesh position={[-0.55, 0.45, 0]}>
              <boxGeometry args={[0.08, 0.7, 2.5]} />
              <meshStandardMaterial color="#2d2d2d" metalness={0.8} />
            </mesh>
            <mesh position={[0.55, 1.1, 0]}>
              <planeGeometry args={[1.6, 1.8]} />
              <meshBasicMaterial color="#ffe3a8" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Back Boundary Wall behind Pandal */}
      <group position={[0, 3.5, -6.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[18, 7, 1]} />
          <meshStandardMaterial color="#6a5847" roughness={0.88} />
        </mesh>
        <mesh position={[0, 3.6, 0]}>
          <boxGeometry args={[18.4, 0.3, 1.2]} />
          <meshStandardMaterial color="#493d31" roughness={0.7} />
        </mesh>
      </group>

      {/* ─── STREET LAMPPOST ─── */}
      <group position={[-6.2, 0, 5.0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 0.4, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 3.8, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.4, 4.0, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </mesh>
        <mesh position={[0.8, 3.85, 0]}>
          <coneGeometry args={[0.3, 0.4, 6]} />
          <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* ─── COURTYARD FESTIVAL PREPARATION PROPS (Perimeter Placed) ─── */}
      {/* Bamboo Stack (Corner near left wall) */}
      <group position={[-5.8, 0, 1.2]} rotation={[0, 0.2, 0]}>
        {[0, 0.14, 0.28].map((y, idx) => (
          <mesh key={`bamboo_stack_${idx}`} position={[0, y + 0.07, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 3.8, 8]} />
            <meshStandardMaterial color="#c2a649" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Carpenter Wooden Toolboxes */}
      <mesh position={[-5.2, 0.35, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.7, 0.8]} />
        <meshStandardMaterial color="#785938" roughness={0.8} />
      </mesh>
      <mesh position={[-4.8, 0.25, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.5, 0.6]} />
        <meshStandardMaterial color="#8c6239" roughness={0.8} />
      </mesh>

      {/* Wicker Baskets with Fresh Marigold Flowers */}
      <group position={[5.4, 0, 1.8]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.35, 0.5, 12]} />
          <meshStandardMaterial color="#936639" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.42, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f77f00" roughness={0.6} />
        </mesh>

        <mesh position={[-0.8, 0.2, 0.4]} castShadow>
          <cylinderGeometry args={[0.4, 0.3, 0.4, 12]} />
          <meshStandardMaterial color="#936639" roughness={0.9} />
        </mesh>
        <mesh position={[-0.8, 0.44, 0.4]}>
          <sphereGeometry args={[0.38, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fcbf49" roughness={0.6} />
        </mesh>
      </group>

      {/* Electrical Wire Spool & Wooden Ladder */}
      <group position={[6.2, 0, -1.2]}>
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
          <meshStandardMaterial color="#3d342a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.28, 0.08, 8, 20]} />
          <meshStandardMaterial color="#f77f00" roughness={0.4} />
        </mesh>
        <group position={[1.2, 0, 0]} rotation={[0, 0, -0.22]}>
          <mesh position={[-0.2, 2.2, 0]} castShadow>
            <boxGeometry args={[0.06, 4.4, 0.08]} />
            <meshStandardMaterial color="#a67c52" roughness={0.8} />
          </mesh>
          <mesh position={[0.2, 2.2, 0]} castShadow>
            <boxGeometry args={[0.06, 4.4, 0.08]} />
            <meshStandardMaterial color="#a67c52" roughness={0.8} />
          </mesh>
          {[0.8, 1.4, 2.0, 2.6, 3.2, 3.8].map((y, idx) => (
            <mesh key={`rung_${idx}`} position={[0, y, 0]}>
              <boxGeometry args={[0.38, 0.04, 0.05]} />
              <meshStandardMaterial color="#a67c52" roughness={0.8} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
