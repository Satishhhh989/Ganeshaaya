import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';

export function ModernRoomDecor() {
  const { isAdultProtagonist, gameDevState, presentScenePhase, timePassageStage = 0 } = useGameState();
  const laptopScreenRef = useRef<THREE.MeshStandardMaterial>(null);
  const screenLightRef = useRef<THREE.PointLight>(null);
  const fairyLightsRef = useRef<THREE.Group>(null);

  const devScreenColor = useMemo(() => {
    switch (gameDevState) {
      case 'GAME_PROJECT_STARTED':
        return new THREE.Color('#d97706'); // warm amber
      case 'GAME_CONCEPT_CREATED':
        return new THREE.Color('#f59e0b'); // soft saffron
      case 'GAME_PROTOTYPE_CREATED':
        return new THREE.Color('#10b981'); // emerald vitality
      case 'GAME_PROTOTYPE_PLAYABLE':
        return new THREE.Color('#fbbf24'); // golden illumination
      case 'GAME_POLISHED':
        return new THREE.Color('#ffd700'); // pure warm gold
      case 'GAME_SUBMITTED':
        return new THREE.Color('#ffd700'); // celebration gold
      default:
        return new THREE.Color('#e0a96d'); // warm clay/brass
    }
  }, [gameDevState]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Dynamic screen brightness & color shift
    if (laptopScreenRef.current) {
      laptopScreenRef.current.emissive.lerp(devScreenColor, 0.1);
      laptopScreenRef.current.emissiveIntensity = 0.85 + Math.sin(t * 3.0) * 0.15;
    }
    if (screenLightRef.current) {
      screenLightRef.current.color.lerp(devScreenColor, 0.1);
    }
    // Subtle festive fairy light shimmer
    if (fairyLightsRef.current) {
      fairyLightsRef.current.children.forEach((child, i) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
          if (mat.color) {
            mat.opacity = 0.75 + Math.sin(t * 4.0 + i * 1.3) * 0.25;
          }
        }
      });
    }
  });

  // Progressive environmental storytelling flags
  const showDevDesk =
    isAdultProtagonist || (presentScenePhase === 'TIME_PASSAGE' && timePassageStage >= 2);
  const showPhotoAndGanesha =
    isAdultProtagonist || (presentScenePhase === 'TIME_PASSAGE' && timePassageStage >= 1);
  const showCalendar =
    isAdultProtagonist || (presentScenePhase === 'TIME_PASSAGE' && timePassageStage >= 3);
  const showFairyLights =
    isAdultProtagonist ||
    (presentScenePhase === 'TIME_PASSAGE' && timePassageStage >= 2) ||
    presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE';

  return (
    <group name="ModernRoomDecor">
      {/* ─── MODERN DEVELOPER DESK SETUP ─── */}
      {showDevDesk && (
      <group position={[2.4, 0, 3.4]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Desk Surface (Teak Wood) */}
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.04, 0.7]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Desk Legs (Black matte metal frame) */}
        <mesh position={[-0.6, 0.35, -0.3]} castShadow>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
        </mesh>
        <mesh position={[0.6, 0.35, -0.3]} castShadow>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
        </mesh>
        <mesh position={[-0.6, 0.35, 0.3]} castShadow>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
        </mesh>
        <mesh position={[0.6, 0.35, 0.3]} castShadow>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
        </mesh>

        {/* Modern Laptop Base */}
        <mesh position={[0, 0.745, 0.05]} castShadow>
          <boxGeometry args={[0.34, 0.012, 0.24]} />
          <meshStandardMaterial color="#30353c" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Laptop Screen (tilted up 105 degrees) */}
        <group position={[0, 0.75, -0.07]} rotation={[-0.26, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.22, 0.008]} />
            <meshStandardMaterial color="#1f2329" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Glowing Display with code / game viewport */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.32, 0.20]} />
            <meshStandardMaterial
              ref={laptopScreenRef}
              color="#0d1b2a"
              emissive="#00b4d8"
              emissiveIntensity={0.85}
              roughness={0.2}
            />
          </mesh>
          {/* Point light casting subtle screen glow onto keyboard/desk */}
          <pointLight ref={screenLightRef} color="#00e5ff" intensity={0.45} distance={1.2} />
        </group>

        {/* Modern Desk Lamp */}
        <group position={[-0.48, 0.74, -0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.02, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Lamp Shade & Warm Light */}
          <mesh position={[0.08, 0.38, 0.06]} rotation={[0.4, 0, -0.3]}>
            <coneGeometry args={[0.07, 0.1, 16, 1, true]} />
            <meshStandardMaterial color="#d4af37" side={THREE.DoubleSide} metalness={0.6} />
          </mesh>
          <pointLight position={[0.08, 0.34, 0.06]} color="#ffddaa" intensity={1.8} distance={2.2} castShadow />
        </group>

        {/* Game Development Notebook, Pandal Blueprint & NIAT Award */}
        <group position={[0.38, 0.745, 0.06]} rotation={[0, -0.12, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.016, 0.34]} />
            <meshStandardMaterial color="#f5f0e6" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.24, 0.32]} />
            <meshStandardMaterial color="#e8dfd1" roughness={0.9} />
          </mesh>
          {/* Golden NIAT Grant Seal */}
          <mesh position={[0.07, 0.01, 0.09]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.024, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Pen on notebook */}
          <mesh position={[-0.08, 0.012, 0.02]} rotation={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 8]} />
            <meshStandardMaterial color="#e76f51" />
          </mesh>
        </group>

        {/* Ergonomic Office Chair */}
        <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.44, 0.06, 0.44]} />
            <meshStandardMaterial color="#212529" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.74, -0.2]} castShadow>
            <boxGeometry args={[0.42, 0.54, 0.05]} />
            <meshStandardMaterial color="#2b3035" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
            <meshStandardMaterial color="#111111" metalness={0.8} />
          </mesh>
        </group>
      </group>
      )}

      {/* ─── NOSTALGIC FRAMED PHOTO OF DADA & CHILD VINAY ─── */}
      {showPhotoAndGanesha && (
        <group position={[2.4, 0.74, 2.75]} rotation={[0, -Math.PI / 2 + 0.35, 0]}>
          {/* Ornate Gold Picture Frame */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.24, 0.015]} />
            <meshStandardMaterial color="#c99e32" metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Photograph insert (warm golden nostalgic tone) */}
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.14, 0.20]} />
            <meshStandardMaterial color="#fdf0d5" roughness={0.9} emissive="#ffb703" emissiveIntensity={0.2} />
          </mesh>
          {/* Mini Marigold Garland around frame */}
          <mesh position={[0, -0.09, 0.012]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.07, 0.012, 6, 12]} />
            <meshStandardMaterial color="#f77f00" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* ─── MODERN BRASS MINI GANESHA IDOL STAND ─── */}
      {showPhotoAndGanesha && (
        <group position={[-0.27, 0.62, 5.75]}>
          {/* Teak Pedestal */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.04, 16]} />
            <meshStandardMaterial color="#582f0e" roughness={0.5} />
          </mesh>
          {/* Brass Ganesha Idol silhouette */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.07, 0.14, 12]} />
            <meshStandardMaterial color="#e0a96d" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.048, 12, 10]} />
            <meshStandardMaterial color="#e0a96d" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Trunk curve */}
          <mesh position={[0, 0.15, 0.04]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.06, 8]} />
            <meshStandardMaterial color="#e0a96d" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Fresh marigold flower petals around base */}
          <mesh position={[0, 0.025, 0]}>
            <ringGeometry args={[0.08, 0.13, 16]} />
            <meshStandardMaterial color="#fcbf49" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* ─── MODERN 2024 WALL CALENDAR ─── */}
      {showCalendar && (
        <group position={[2.5, 2.1, 4.4]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Calendar Board */}
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.52, 0.01]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Header (Red/Saffron festival banner) */}
          <mesh position={[0, 0.18, 0.006]}>
            <planeGeometry args={[0.36, 0.12]} />
            <meshStandardMaterial color="#d62828" roughness={0.5} />
          </mesh>
          {/* Ganesh Chaturthi Date marker */}
          <mesh position={[0, -0.05, 0.006]}>
            <planeGeometry args={[0.34, 0.3]} />
            <meshStandardMaterial color="#faf0ca" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* ─── FESTIVE FAIRY LIGHTS STRING ─── */}
      {showFairyLights && (
        <group ref={fairyLightsRef} position={[0, 2.7, 3.8]}>
          {[-1.8, -1.3, -0.8, -0.3, 0.2, 0.7, 1.2, 1.7, 2.2].map((x, idx) => (
            <mesh
              key={idx}
              position={[x, Math.sin(x * 1.5) * 0.12 - 0.05, Math.cos(x * 1.2) * 0.08]}
            >
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshBasicMaterial
                color={idx % 2 === 0 ? '#ffb703' : '#ffd166'}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
