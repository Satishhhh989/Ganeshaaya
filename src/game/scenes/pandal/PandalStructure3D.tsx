import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, normalizePandalTaskId } from '../../core/GameState';

export function PandalStructure3D() {
  const { completedPandalTasks, presentScenePhase, ganeshaInstalled } = useGameState();

  const isCelebration =
    presentScenePhase === 'FESTIVAL_PREPARATION' ||
    presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION' ||
    presentScenePhase === 'FINAL_CINEMATIC' ||
    presentScenePhase === 'GAME_COMPLETE';

  const isBuilt = (task: string) => {
    const norm = normalizePandalTaskId(task);
    return (
      completedPandalTasks.some((t) => normalizePandalTaskId(t) === norm) ||
      isCelebration ||
      (norm === 'FINAL_DECORATION' && ganeshaInstalled)
    );
  };

  // Textures
  const rangoliTexture = useLoader(THREE.TextureLoader, '/assets/props/sacred_pandal_rangoli.jpg');
  const ganeshaTexture = useLoader(THREE.TextureLoader, '/assets/props/sacred_clay_ganesha_murti.jpg');

  // Animation and lighting refs
  const diyaFlickerRef = useRef<THREE.PointLight>(null);
  const altarLightRef = useRef<THREE.PointLight>(null);
  const kandilGroupRef = useRef<THREE.Group>(null);
  const prabhavaliAuraRef = useRef<THREE.Mesh>(null);

  // Smooth appearance groups
  const stage1Ref = useRef<THREE.Group>(null);
  const stage2Ref = useRef<THREE.Group>(null);
  const stage3Ref = useRef<THREE.Group>(null);
  const stage4Ref = useRef<THREE.Group>(null);
  const stage5Ref = useRef<THREE.Group>(null);
  const stage6Ref = useRef<THREE.Group>(null);
  const stage7Ref = useRef<THREE.Group>(null);
  const stage8Ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Diya light flicker
    if (diyaFlickerRef.current) {
      diyaFlickerRef.current.intensity = 1.4 + Math.sin(t * 12) * 0.2 + Math.cos(t * 19) * 0.15;
    }

    // Altar warm spotlight pulse
    if (altarLightRef.current) {
      altarLightRef.current.intensity = 2.4 + Math.sin(t * 3.5) * 0.25;
    }

    // Akash kandil gentle sway in evening breeze
    if (kandilGroupRef.current) {
      kandilGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
      kandilGroupRef.current.rotation.x = Math.cos(t * 1.2) * 0.03;
    }

    // Divine halo aura breathing glow
    if (prabhavaliAuraRef.current) {
      const scale = 1.0 + Math.sin(t * 2.2) * 0.04;
      prabhavaliAuraRef.current.scale.set(scale, scale, scale);
    }

    // Smooth physical assembly lerps for active stages
    const lerpGroup = (ref: React.RefObject<THREE.Group | null>, built: boolean) => {
      if (!ref.current) return;
      const targetScale = built ? 1 : 0.001;
      ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale, 0.12);
      ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.12);
      ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, targetScale, 0.12);
    };

    lerpGroup(stage1Ref, isBuilt('STRUCTURE'));
    lerpGroup(stage2Ref, isBuilt('ROOF'));
    lerpGroup(stage3Ref, isBuilt('CLOTH'));
    lerpGroup(stage4Ref, isBuilt('STAGE'));
    lerpGroup(stage5Ref, isBuilt('FLOWERS'));
    lerpGroup(stage6Ref, isBuilt('RANGOLI'));
    lerpGroup(stage7Ref, isBuilt('LIGHTS'));
    lerpGroup(stage8Ref, isBuilt('FINAL_DECORATION'));
  });

  return (
    <group position={[0, 0, -2.4]} name="Pandal_Structure_Root">
      {/* ─── 0. UNFINISHED OUTLINE & GROUND CHALK (Always visible as foundation) ─── */}
      <group name="Ground_Layout_Markings">
        {/* Chalk outline of pandal footprint */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 5.4]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.16} />
        </mesh>

        {/* 8 Corner & Mid post marker pegs on ground */}
        {[
          [-2.8, -2.2], [0, -2.2], [2.8, -2.2],
          [-2.8, 0], [2.8, 0],
          [-2.8, 2.2], [0, 2.2], [2.8, 2.2],
        ].map(([x, z], idx) => (
          <mesh key={`peg_${idx}`} position={[x, 0.05, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
            <meshStandardMaterial color="#c29b61" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ─── 1. STRUCTURE: Bamboo Pillars & Lintel Framework ─── */}
      <group ref={stage1Ref} name="Stage1_Pandal_Structure" scale={[0.001, 0.001, 0.001]}>
        {/* 8 Sturdy Bamboo Uprights with Coir Rope Lashings */}
        {[
          [-2.8, -2.2], [0, -2.2], [2.8, -2.2],
          [-2.8, 0], [2.8, 0],
          [-2.8, 2.2], [0, 2.2], [2.8, 2.2],
        ].map(([x, z], idx) => (
          <group key={`bamboo_col_${idx}`} position={[x, 0, z]}>
            {/* Bamboo Main Stem */}
            <mesh position={[0, 2.3, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.11, 4.6, 10]} />
              <meshStandardMaterial color="#d4a373" roughness={0.65} />
            </mesh>
            {/* Bamboo Node Rings */}
            {[0.8, 1.6, 2.4, 3.2, 4.0].map((ny, nIdx) => (
              <mesh key={`node_${nIdx}`} position={[0, ny, 0]}>
                <torusGeometry args={[0.105, 0.015, 6, 12]} />
                <meshStandardMaterial color="#997b66" roughness={0.8} />
              </mesh>
            ))}
            {/* Coir Rope Lashing knot at top */}
            <mesh position={[0, 4.2, 0]}>
              <torusGeometry args={[0.12, 0.04, 6, 12]} />
              <meshStandardMaterial color="#b08968" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Horizontal Lintel Crossbeams */}
        <mesh position={[0, 4.3, 2.2]} castShadow>
          <boxGeometry args={[5.9, 0.14, 0.14]} />
          <meshStandardMaterial color="#c29b61" roughness={0.7} />
        </mesh>
        <mesh position={[0, 4.3, -2.2]} castShadow>
          <boxGeometry args={[5.9, 0.14, 0.14]} />
          <meshStandardMaterial color="#c29b61" roughness={0.7} />
        </mesh>
        <mesh position={[-2.8, 4.3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[4.6, 0.14, 0.14]} />
          <meshStandardMaterial color="#c29b61" roughness={0.7} />
        </mesh>
        <mesh position={[2.8, 4.3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[4.6, 0.14, 0.14]} />
          <meshStandardMaterial color="#c29b61" roughness={0.7} />
        </mesh>
      </group>

      {/* ─── 2. ROOF: Pitched Weatherproof Canopy & Truss ─── */}
      <group ref={stage2Ref} name="Stage2_Pandal_Roof" scale={[0.001, 0.001, 0.001]}>
        {/* Central ridge beam */}
        <mesh position={[0, 5.4, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[4.8, 0.15, 0.15]} />
          <meshStandardMaterial color="#b08968" roughness={0.7} />
        </mesh>
        {/* Left pitched canopy slope (Festive green tarpaulin) */}
        <mesh position={[-1.5, 4.85, 0]} rotation={[0, 0, 0.38]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.08, 4.9]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
        </mesh>
        {/* Right pitched canopy slope */}
        <mesh position={[1.5, 4.85, 0]} rotation={[0, 0, -0.38]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.08, 4.9]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
        </mesh>
        {/* Front triangular gable cloth with golden border */}
        <mesh position={[0, 4.85, 2.3]} rotation={[0, 0, 0]}>
          <coneGeometry args={[3.2, 1.2, 3]} />
          <meshStandardMaterial color="#d4af37" roughness={0.6} />
        </mesh>
      </group>

      {/* ─── 3. CLOTH: Saffron, Crimson & Gold Silk Drapery ─── */}
      <group ref={stage3Ref} name="Stage3_Pandal_Cloth" scale={[0.001, 0.001, 0.001]}>
        {/* Back wall festive drape */}
        <mesh position={[0, 2.5, -2.15]}>
          <planeGeometry args={[5.6, 3.6]} />
          <meshStandardMaterial color="#c1121f" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Saffron side curtains */}
        <mesh position={[-2.75, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.2, 3.6]} />
          <meshStandardMaterial color="#f77f00" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[2.75, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[4.2, 3.6]} />
          <meshStandardMaterial color="#f77f00" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Front Entrance Scalloped Valance / Pelmet */}
        {[-2, -1, 0, 1, 2].map((x, idx) => (
          <mesh key={`valance_${idx}`} position={[x, 4.15, 2.25]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#ffb703" roughness={0.5} />
          </mesh>
        ))}
        {/* Column fabric pleat wraps */}
        {[[-2.8, 2.2], [2.8, 2.2]].map(([x, z], idx) => (
          <mesh key={`column_drape_${idx}`} position={[x, 2.2, z]}>
            <cylinderGeometry args={[0.18, 0.22, 4.2, 12]} />
            <meshStandardMaterial color="#d00000" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ─── 4. STAGE: Raised Platform, Front Steps & Crimson Velvet Carpet ─── */}
      <group ref={stage4Ref} name="Stage4_Pandal_Stage" scale={[0.001, 0.001, 0.001]}>
        {/* Raised Timber Stage Platform */}
        <mesh position={[0, 0.35, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[5.8, 0.7, 4.2]} />
          <meshStandardMaterial color="#583101" roughness={0.7} />
        </mesh>
        {/* Frontal wooden step */}
        <mesh position={[0, 0.18, 1.7]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.35, 0.5]} />
          <meshStandardMaterial color="#6f4e37" roughness={0.75} />
        </mesh>
        {/* Rich Crimson Velvet Carpet on Altar */}
        <mesh position={[0, 0.71, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.8, 3.4]} />
          <meshStandardMaterial color="#780000" roughness={0.9} />
        </mesh>
      </group>

      {/* ─── 5. FLOWERS: Fresh Marigolds & Mango Leaf Torans ─── */}
      <group ref={stage5Ref} name="Stage5_Flower_Decoration" scale={[0.001, 0.001, 0.001]}>
        {/* Front Entrance Arch Mango Leaf Toran */}
        <mesh position={[0, 4.22, 2.3]}>
          <boxGeometry args={[5.7, 0.12, 0.08]} />
          <meshStandardMaterial color="#386641" roughness={0.6} />
        </mesh>
        {/* Cascading Marigold Garlands wrapping the front entrance pillars */}
        {[[-2.8, 2.2], [2.8, 2.2]].map(([x, z], pIdx) => (
          <group key={`garland_pillar_${pIdx}`} position={[x, 0, z]}>
            {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map((gy, gIdx) => (
              <mesh key={`garland_ring_${gIdx}`} position={[0, gy, 0]} rotation={[0.2, 0, 0]}>
                <torusGeometry args={[0.22, 0.045, 8, 16]} />
                <meshStandardMaterial color={gIdx % 2 === 0 ? '#ff7b00' : '#ffb703'} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Hanging Marigold Pom-poms / Floral Bells from roof eaves */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x, idx) => (
          <group key={`hanging_flower_${idx}`} position={[x, 3.9, 2.28]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.4, 4]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#f77f00' : '#fcbf49'} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── 6. RANGOLI: Sacred Geometric Floor Rangoli & Glowing Diyas ─── */}
      <group ref={stage6Ref} name="Stage6_Rangoli_Ground" position={[0, 0.02, 2.6]} scale={[0.001, 0.001, 0.001]}>
        {/* Circular Sacred Rangoli Decal / Mesh */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial map={rangoliTexture} roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Terracotta Clay Diyas around the Rangoli circumference */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const dx = Math.cos(rad) * 1.55;
          const dz = Math.sin(rad) * 1.55;
          return (
            <group key={`diya_${idx}`} position={[dx, 0.02, dz]}>
              <mesh position={[0, 0.02, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.03, 0.03, 8]} />
                <meshStandardMaterial color="#99582a" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <coneGeometry args={[0.02, 0.05, 6]} />
                <meshBasicMaterial color="#ffb703" />
              </mesh>
            </group>
          );
        })}
        {/* Warm point light simulating diya glow */}
        <pointLight
          ref={diyaFlickerRef}
          position={[0, 0.35, 0]}
          intensity={1.5}
          distance={5}
          decay={2}
          color="#ff9e00"
        />
      </group>

      {/* ─── 7. LIGHTS: Fairy Light Strings, Akash Kandil & Ambient Floodlights ─── */}
      <group ref={stage7Ref} name="Stage7_Festive_Lights" scale={[0.001, 0.001, 0.001]}>
        {/* Micro-LED Warm Fairy Light string along the front eave */}
        <mesh position={[0, 4.28, 2.32]}>
          <boxGeometry args={[5.8, 0.03, 0.03]} />
          <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={1.8} />
        </mesh>
        {/* Micro-LED Fairy lights along roof edges */}
        <mesh position={[-1.5, 4.9, 2.32]} rotation={[0, 0, 0.38]}>
          <boxGeometry args={[3.4, 0.03, 0.03]} />
          <meshStandardMaterial color="#ffbe0b" emissive="#ffbe0b" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[1.5, 4.9, 2.32]} rotation={[0, 0, -0.38]}>
          <boxGeometry args={[3.4, 0.03, 0.03]} />
          <meshStandardMaterial color="#ffbe0b" emissive="#ffbe0b" emissiveIntensity={1.8} />
        </mesh>
        {/* Hanging Traditional Akash Kandil (Sky Lantern) */}
        <group ref={kandilGroupRef} position={[0, 3.8, 2.2]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.6, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={1.2} />
          </mesh>
          {[0, 1, 2, 3].map((rIdx) => (
            <mesh key={`frill_${rIdx}`} position={[0, -0.4, 0]} rotation={[0, (rIdx * Math.PI) / 2, 0]}>
              <planeGeometry args={[0.08, 0.45]} />
              <meshStandardMaterial color="#ffb703" side={THREE.DoubleSide} emissive="#ffb703" emissiveIntensity={0.6} />
            </mesh>
          ))}
          <pointLight intensity={1.8} distance={6} decay={2} color="#ff007f" />
        </group>
        {/* Warm Amber Floodlights casting soft illumination into pandal interior */}
        <pointLight position={[-2.4, 4.0, 1.8]} intensity={1.8} distance={9} decay={1.8} color="#ffb703" />
        <pointLight position={[2.4, 4.0, 1.8]} intensity={1.8} distance={9} decay={1.8} color="#ffb703" />
      </group>

      {/* ─── 8. FINAL_DECORATION: Singhasan Throne, Samai, Modaks & Sacred Clay Ganesha Murti ─── */}
      <group ref={stage8Ref} name="Stage8_Final_Decoration_Altar" scale={[0.001, 0.001, 0.001]}>
        {/* Carved Teak Wooden Singhasan (Throne Pedestal) */}
        <group position={[0, 1.1, -1.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.5, 1.4]} />
            <meshStandardMaterial color="#3d1e08" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.9, -0.6]} castShadow>
            <boxGeometry args={[2.2, 1.3, 0.15]} />
            <meshStandardMaterial color="#4a2508" roughness={0.5} metalness={0.3} />
          </mesh>
        </group>

        {/* Pair of Tall Traditional Brass Samai (Standing Oil Lamps) */}
        {[-1.6, 1.6].map((sx, sIdx) => (
          <group key={`samai_${sIdx}`} position={[sx, 0.7, -0.2]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.28, 0.16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 1.2, 12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 1.35, 0]}>
              <cylinderGeometry args={[0.26, 0.18, 0.1, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 1.48, 0]}>
              <coneGeometry args={[0.04, 0.12, 8]} />
              <meshBasicMaterial color="#ffb703" />
            </mesh>
            <pointLight position={[0, 1.5, 0]} intensity={1.2} distance={4.5} decay={2} color="#ffaa00" />
          </group>
        ))}

        {/* Silver Puja Thali with Fresh Modaks & Coconut */}
        <group position={[0, 1.38, -0.4]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.38, 0.04, 24]} />
            <meshStandardMaterial color="#e0e1dd" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.8} />
          </mesh>
          {[[-0.15, 0.12], [0.15, 0.12], [-0.18, -0.08], [0.18, -0.08], [0, 0.22]].map(
            ([mx, mz], mIdx) => (
              <mesh key={`modak_${mIdx}`} position={[mx, 0.06, mz]}>
                <coneGeometry args={[0.045, 0.08, 8]} />
                <meshStandardMaterial color="#fefae0" roughness={0.5} />
              </mesh>
            )
          )}
        </group>

        {/* Consecrated Ganesha Murti with Radiant Sunburst Prabhavali */}
        <group position={[0, 1.35, -1.3]}>
          <pointLight
            ref={altarLightRef}
            position={[0, 1.8, 1.2]}
            intensity={2.6}
            distance={8}
            decay={1.8}
            color="#ffb703"
            castShadow
          />
          <mesh ref={prabhavaliAuraRef} position={[0, 0.55, -0.1]}>
            <ringGeometry args={[0.7, 1.25, 32]} />
            <meshStandardMaterial
              color="#ffb703"
              emissive="#ffb703"
              emissiveIntensity={1.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.55, -0.15]}>
            <circleGeometry args={[1.35, 32]} />
            <meshBasicMaterial color="#ffbe0b" transparent opacity={0.35} />
          </mesh>
          {/* High quality 2.5D Sacred Eco-Friendly Clay Ganesha Murti */}
          <mesh position={[0, 0.52, 0.05]} castShadow receiveShadow>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial
              map={ganeshaTexture}
              roughness={0.4}
              metalness={0.15}
              emissive="#ff9e00"
              emissiveIntensity={0.18}
              transparent
            />
          </mesh>
          <mesh position={[0, 0.52, 0.01]}>
            <boxGeometry args={[1.56, 1.56, 0.06]} />
            <meshStandardMaterial color="#2d1500" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.18, 0.35]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#d00000" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
