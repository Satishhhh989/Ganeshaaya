import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { InteractiveTargetArrow3D } from './InteractiveTargetArrow3D';

interface ProcessionNPCDef {
  role: 'bearer' | 'flag' | 'dhol';
  offset: [number, number, number];
  kurtaColor: string;
  dhotiColor: string;
  flagColor?: string;
}

const PROCESSION_NPCS: ProcessionNPCDef[] = [
  // Two flag bearers leading the way
  { role: 'flag', offset: [-0.65, 0, 1.4], kurtaColor: '#f77f00', dhotiColor: '#fefae0', flagColor: '#ff9f1c' },
  { role: 'flag', offset: [0.65, 0, 1.4], kurtaColor: '#d62828', dhotiColor: '#fdf0d5', flagColor: '#ff9f1c' },
  // Dhol drummer
  { role: 'dhol', offset: [0, 0, 2.0], kurtaColor: '#ffbe0b', dhotiColor: '#1d3557' },
  // Four palanquin bearers (front-left, front-right, rear-left, rear-right)
  { role: 'bearer', offset: [-0.68, 0, 0.45], kurtaColor: '#e76f51', dhotiColor: '#f4f1de' },
  { role: 'bearer', offset: [0.68, 0, 0.45], kurtaColor: '#2a9d8f', dhotiColor: '#e9c46a' },
  { role: 'bearer', offset: [-0.68, 0, -0.45], kurtaColor: '#457b9d', dhotiColor: '#f1faee' },
  { role: 'bearer', offset: [0.68, 0, -0.45], kurtaColor: '#e63946', dhotiColor: '#ffd166' },
];

export function GaneshaProcession3D() {
  const { currentScene, presentScenePhase, ganeshaInstalled, festivalArrivalStep } = useGameState();

  const isVisible =
    currentScene === 'PANDAL' &&
    (presentScenePhase === 'FESTIVAL_PREPARATION' ||
      (presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION' && !ganeshaInstalled));

  const ganeshaTexture = useLoader(THREE.TextureLoader, '/assets/props/sacred_clay_ganesha_murti.jpg');

  // Groups and anim refs
  const processionGroupRef = useRef<THREE.Group>(null);
  const murtiPlacingRef = useRef<THREE.Group>(null);
  const flag1Ref = useRef<THREE.Mesh>(null);
  const flag2Ref = useRef<THREE.Mesh>(null);
  const petalGroupRef = useRef<THREE.Group>(null);

  // Position state of procession along Z
  // Starts near colony gate at Z = 11.5, walks to Z = 7.0 (spotted), then to Z = 1.2 (pandal entrance)
  const processionPos = useRef(new THREE.Vector3(0, 0, 11.5));
  const placementAnimTimer = useRef(0);

  // Marigold petals drifting data
  const petals = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      x: (Math.random() - 0.5) * 3.5,
      y: 0.3 + Math.random() * 2.2,
      z: (Math.random() - 0.5) * 3.5,
      speed: 0.2 + Math.random() * 0.3,
      sway: Math.random() * Math.PI * 2,
      scale: 0.05 + Math.random() * 0.04,
      color: i % 2 === 0 ? '#ffb703' : '#fb8500',
    }));
  }, []);

  useFrame(({ clock }, delta) => {
    if (!isVisible) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Flag flapping in morning festival breeze
    if (flag1Ref.current) {
      flag1Ref.current.rotation.y = Math.sin(t * 5.0) * 0.22;
      flag1Ref.current.rotation.z = Math.cos(t * 3.5) * 0.12;
    }
    if (flag2Ref.current) {
      flag2Ref.current.rotation.y = Math.sin(t * 5.2 + 1.2) * 0.22;
      flag2Ref.current.rotation.z = Math.cos(t * 3.7 + 0.5) * 0.12;
    }

    // Floating marigold petals drifting down around procession
    if (petalGroupRef.current) {
      petalGroupRef.current.children.forEach((mesh, idx) => {
        const p = petals[idx];
        if (!p) return;
        mesh.position.y -= p.speed * dt;
        mesh.position.x += Math.sin(t * 2.0 + p.sway) * 0.006;
        mesh.position.z += Math.cos(t * 1.8 + p.sway) * 0.006;
        mesh.rotation.x += dt * 1.5;
        mesh.rotation.y += dt * 1.2;

        if (mesh.position.y < 0.05) {
          mesh.position.y = 2.2;
          mesh.position.x = (Math.random() - 0.5) * 3.2;
        }
      });
    }

    // Movement state machine based on arrival step:
    // Step 0: Sunrise (procession resting at entrance)
    // Step 1: Hear procession (procession marches from 11.5 to 7.2)
    // Step 2: Waiting for Vinay to join (steady at 7.2)
    // Step 3: Joined procession! Moving smoothly with Vinay from 7.2 to 1.2 (pandal altar)
    // Step 4: Placing Ganesha onto singhasan (murti elevates along smooth bezier onto altar)
    // Step 5: Consecrated & praying
    if (festivalArrivalStep === 1) {
      // Approach towards courtyard middle
      processionPos.current.z = THREE.MathUtils.damp(processionPos.current.z, 7.2, 0.8, dt);
    } else if (festivalArrivalStep === 3) {
      // Marching into the pandal with Vinay
      processionPos.current.z = THREE.MathUtils.damp(processionPos.current.z, 1.25, 0.75, dt);
    }

    // Apply procession group position
    if (processionGroupRef.current) {
      processionGroupRef.current.position.copy(processionPos.current);
      // Gentle rhythmic bounce of bearers carrying palanquin
      const isWalking =
        (festivalArrivalStep === 1 && processionPos.current.z > 7.3) ||
        (festivalArrivalStep === 3 && processionPos.current.z > 1.3);
      if (isWalking) {
        processionGroupRef.current.position.y = Math.abs(Math.sin(t * 7.5)) * 0.04;
      } else {
        processionGroupRef.current.position.y = THREE.MathUtils.damp(
          processionGroupRef.current.position.y,
          0,
          10,
          dt
        );
      }
    }

    // Step 4: Ceremonial murti placement animation onto singhasan
    if (festivalArrivalStep === 4) {
      placementAnimTimer.current += dt;
      const animT = Math.min(1, placementAnimTimer.current / 2.8);
      const ease = animT * animT * (3 - 2 * animT); // smooth cubic ease

      if (murtiPlacingRef.current) {
        // Start: atop palanquin [0, 0.65, 0] relative to procession (which is at Z = 1.25)
        // Global start: [0, 0.65, 1.25]
        // Target: singhasan throne [0, 1.35, -1.3] in world space
        // Relative to processionGroup (at Z = 1.25): target Z is -1.3 - 1.25 = -2.55, Y is 1.35
        const startY = 0.65;
        const targetY = 1.35;
        const startZ = 0;
        const targetZ = -2.55;

        // Arc upwards during flight
        const arcY = Math.sin(animT * Math.PI) * 0.55;
        murtiPlacingRef.current.position.y = THREE.MathUtils.lerp(startY, targetY, ease) + arcY;
        murtiPlacingRef.current.position.z = THREE.MathUtils.lerp(startZ, targetZ, ease);

        if (animT >= 1 && !ganeshaInstalled) {
          // Consecration complete!
          gameStateStore.setGaneshaInstalled(true);
          gameStateStore.setFestivalArrivalStep(5);
          audioManager.playSacredArtiBell();
          audioManager.playCelebrationChime();
          audioManager.playLightsIgnite();
        }
      }
    }
  });

  if (!isVisible) return null;

  return (
    <>
      <group ref={processionGroupRef} position={[0, 0, 11.5]} name="Ganesha_Colony_Procession">
        {/* ─── TARGET ARROW: Waiting for Vinay to join procession ─── */}
        {festivalArrivalStep === 2 && (
          <InteractiveTargetArrow3D
            position={[0, 0.02, 0.6]}
            radius={0.82}
            arrowHeight={1.6}
            label="E"
          />
        )}

        {/* ─── 1. DECORATED WOODEN PALANQUIN ─── */}
        <group position={[0, 0.25, 0]}>
        {/* Main Timber Carrying Poles (long parallel bamboo/teak spars) */}
        <mesh position={[-0.45, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 2.6, 12]} />
          <meshStandardMaterial color="#8b5e34" roughness={0.65} />
        </mesh>
        <mesh position={[0.45, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 2.6, 12]} />
          <meshStandardMaterial color="#8b5e34" roughness={0.65} />
        </mesh>

        {/* Cross Beams & Raised Wooden Palanquin Bed */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.12, 1.15]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.7} />
        </mesh>

        {/* Sacred Saffron Silk Velvet Drape */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.95, 0.08, 1.05]} />
          <meshStandardMaterial color="#e76f51" roughness={0.45} />
        </mesh>

        {/* Golden Embroidered Border Trim */}
        <mesh position={[0, 0.31, 0]}>
          <boxGeometry args={[0.85, 0.02, 0.95]} />
          <meshStandardMaterial color="#ffd166" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Marigold Floral Torans around Palanquin Base */}
        {[-0.52, 0.52].map((x, i) => (
          <group key={`garland_side_${i}`} position={[x, 0.18, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 1.1, 8]} />
            <meshStandardMaterial color="#ffb703" roughness={0.9} />
          </group>
        ))}

        {/* Brass Diya Lamp on Palanquin (warm amber light illuminating Bappa) */}
        <group position={[0.32, 0.34, 0.36]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.03, 0.04, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          <pointLight color="#ffaa00" intensity={1.6} distance={3.2} decay={2} />
        </group>

        {/* Puja Thali with Flowers & Coconut */}
        <group position={[-0.28, 0.33, 0.36]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.07, 0.02, 12]} />
            <meshStandardMaterial color="#e0e1dd" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ─── 2. THE SACRED CLAY GANESHA MURTI (On Palanquin during arrival, elevates on placement) ─── */}
      {!ganeshaInstalled && (
        <group ref={murtiPlacingRef} position={[0, 0.65, 0]}>
          {/* Radiant halo disk behind murti */}
          <mesh position={[0, 0.42, -0.06]}>
            <circleGeometry args={[0.55, 24]} />
            <meshBasicMaterial color="#ffb703" transparent opacity={0.4} />
          </mesh>

          {/* Wooden back frame */}
          <mesh position={[0, 0.42, -0.02]}>
            <boxGeometry args={[0.95, 0.95, 0.04]} />
            <meshStandardMaterial color="#3d1e08" roughness={0.7} />
          </mesh>

          {/* Eco-Friendly Clay Ganesha Murti Plane */}
          <mesh position={[0, 0.42, 0.02]} castShadow>
            <planeGeometry args={[0.92, 0.92]} />
            <meshStandardMaterial
              map={ganeshaTexture}
              roughness={0.4}
              metalness={0.15}
              emissive="#ff9e00"
              emissiveIntensity={0.2}
              transparent
            />
          </mesh>

          {/* Decorative Garland loop around murti */}
          <mesh position={[0, 0.18, 0.05]}>
            <torusGeometry args={[0.32, 0.035, 8, 16]} />
            <meshStandardMaterial color="#fb8500" roughness={0.9} />
          </mesh>

          {/* Devotional Warm Key Spotlight on Bappa */}
          <pointLight position={[0, 0.8, 0.6]} intensity={2.2} distance={4.5} decay={2} color="#ffbe0b" />
        </group>
      )}

      {/* ─── 3. PROCESSION CITIZENS & NEIGHBORS (Believable stylized colony crowd) ─── */}
      {PROCESSION_NPCS.map((npc, idx) => (
        <group key={`npc_${idx}`} position={npc.offset}>
          {/* Head */}
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.13, 10, 10]} />
            <meshStandardMaterial color="#ba825a" roughness={0.6} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 1.62, -0.03]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#221100" roughness={0.8} />
          </mesh>
          {/* Kurta Torso */}
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.65, 10]} />
            <meshStandardMaterial color={npc.kurtaColor} roughness={0.75} />
          </mesh>
          {/* Dhoti / Pants */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.65, 10]} />
            <meshStandardMaterial color={npc.dhotiColor} roughness={0.85} />
          </mesh>
          {/* Feet */}
          <mesh position={[-0.07, 0.08, 0.02]}>
            <boxGeometry args={[0.07, 0.06, 0.16]} />
            <meshStandardMaterial color="#4e2d19" roughness={0.6} />
          </mesh>
          <mesh position={[0.07, 0.08, 0.02]}>
            <boxGeometry args={[0.07, 0.06, 0.16]} />
            <meshStandardMaterial color="#4e2d19" roughness={0.6} />
          </mesh>

          {/* Specific Props per Role */}
          {npc.role === 'flag' && (
            <group position={[0.18, 1.3, 0.15]}>
              {/* Bamboo flag pole */}
              <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 1.8, 6]} />
                <meshStandardMaterial color="#d4a373" roughness={0.7} />
              </mesh>
              {/* Fluttering Triangular Saffron Flag (Bhagwa Dhwaja) */}
              <mesh
                ref={idx === 0 ? flag1Ref : flag2Ref}
                position={[0.32, 1.15, 0]}
                rotation={[0, 0, -Math.PI / 2]}
              >
                <coneGeometry args={[0.32, 0.65, 3]} />
                <meshStandardMaterial
                  color={npc.flagColor || '#ff9f1c'}
                  roughness={0.5}
                  emissive="#ff8800"
                  emissiveIntensity={0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}

          {npc.role === 'dhol' && (
            <group position={[0, 1.05, 0.28]}>
              {/* Cylindrical Traditional Indian Dhol Drum */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.58, 14]} />
                <meshStandardMaterial color="#9d0208" roughness={0.65} />
              </mesh>
              {/* Brass tension rings */}
              <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.225, 0.02, 6, 16]} />
                <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.225, 0.02, 6, 16]} />
                <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Drumming stick */}
              <mesh position={[0.24, 0.14, 0.12]} rotation={[0.4, 0, 0.6]}>
                <cylinderGeometry args={[0.012, 0.012, 0.35, 6]} />
                <meshStandardMaterial color="#fefae0" roughness={0.5} />
              </mesh>
            </group>
          )}

          {npc.role === 'bearer' && (
            // Hands holding the palanquin pole
            <mesh position={[npc.offset[0] < 0 ? 0.18 : -0.18, 0.72, 0]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color="#ba825a" roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* ─── 4. MARIGOLD PETAL SHOWER (Festive petals drifting through the air) ─── */}
      <group ref={petalGroupRef} position={[0, 0, 0]}>
        {petals.map((p, pIdx) => (
          <mesh
            key={`petal_${pIdx}`}
            position={[p.x, p.y, p.z]}
            scale={[p.scale, p.scale * 0.4, p.scale]}
          >
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial color={p.color} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>

    {/* ─── TARGET ARROW: Waiting for Vinay to offer first sacred prayer at singhasan altar ─── */}
    {festivalArrivalStep === 5 && (
      <InteractiveTargetArrow3D
        position={[0, 0.68, 0.35]}
        radius={0.75}
        arrowHeight={1.5}
        label="E"
        color="#ffb703"
        accentColor="#fb8500"
      />
    )}
  </>
  );
}
