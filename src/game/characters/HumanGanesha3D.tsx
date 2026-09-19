/**
 * HumanGanesha3D - Lord Ganesha in Original Human Form
 * Pure 3D procedural character model with authentic mythological details:
 * Saffron pitambar dhoti, golden jewelry (kamarbandh, haar, angada), janeu thread,
 * calm determined guardian stance, gentle breathing idle, and sacred doorway pedestal.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HumanGanesha3DProps {
  position?: [number, number, number];
  isFallen?: boolean;
}

export function HumanGanesha3D({
  position = [0, 0, -8.0],
  isFallen = false,
}: HumanGanesha3DProps) {
  const rootGroup = useRef<THREE.Group>(null);
  const bodyGroup = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const leftArmGroup = useRef<THREE.Group>(null);
  const rightArmGroup = useRef<THREE.Group>(null);
  const auraLightRef = useRef<THREE.PointLight>(null);

  // Mythological color palette
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: '#e2ab7a',
        roughness: 0.65,
        metalness: 0.05,
      }),
      dhoti: new THREE.MeshStandardMaterial({
        color: '#f59e0b', // Radiant saffron / pitambar gold
        roughness: 0.7,
        metalness: 0.15,
        emissive: '#78350f',
        emissiveIntensity: 0.15,
      }),
      dhotiBorder: new THREE.MeshStandardMaterial({
        color: '#d97706',
        roughness: 0.6,
        metalness: 0.3,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#ffd700',
        roughness: 0.25,
        metalness: 0.85,
        emissive: '#d4af37',
        emissiveIntensity: 0.2,
      }),
      ruby: new THREE.MeshStandardMaterial({
        color: '#b91c1c',
        roughness: 0.2,
        metalness: 0.5,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: '#1c1917',
        roughness: 0.8,
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: '#0c0a09',
        roughness: 0.2,
      }),
      tilak: new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.4,
      }),
      janeu: new THREE.MeshStandardMaterial({
        color: '#fef3c7',
        roughness: 0.8,
      }),
      staffWood: new THREE.MeshStandardMaterial({
        color: '#451a03',
        roughness: 0.7,
        metalness: 0.1,
      }),
      brassDiya: new THREE.MeshStandardMaterial({
        color: '#b45309',
        roughness: 0.35,
        metalness: 0.8,
      }),
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!isFallen) {
      // Gentle breathing idle & subtle natural weight shifting
      const breath = Math.sin(t * 1.8) * 0.008;
      const sway = Math.sin(t * 0.9) * 0.005;

      if (bodyGroup.current) {
        bodyGroup.current.position.y = 0.02 + breath;
        bodyGroup.current.rotation.z = sway;
      }

      if (headGroup.current) {
        // Calm steadfast gaze facing Shiva with micro movements
        headGroup.current.rotation.x = Math.sin(t * 1.2) * 0.02 + 0.02;
        headGroup.current.rotation.y = Math.sin(t * 0.7) * 0.03;
      }

      if (leftArmGroup.current) {
        leftArmGroup.current.rotation.x = Math.sin(t * 1.5) * 0.02 - 0.15;
      }
      if (rightArmGroup.current) {
        rightArmGroup.current.rotation.x = Math.sin(t * 1.5 + 0.5) * 0.02 - 0.2;
      }

      if (auraLightRef.current) {
        auraLightRef.current.intensity = 1.3 + Math.sin(t * 2.5) * 0.25;
      }
    } else {
      // Fallen / peaceful slumber state in aftermath
      if (bodyGroup.current) {
        bodyGroup.current.position.y = THREE.MathUtils.lerp(
          bodyGroup.current.position.y,
          -0.25,
          0.05
        );
        bodyGroup.current.rotation.z = THREE.MathUtils.lerp(
          bodyGroup.current.rotation.z,
          0.4,
          0.04
        );
        bodyGroup.current.rotation.x = THREE.MathUtils.lerp(
          bodyGroup.current.rotation.x,
          0.2,
          0.04
        );
      }
      if (auraLightRef.current) {
        auraLightRef.current.intensity = 0.4;
      }
    }
  });

  return (
    <group ref={rootGroup} position={position}>
      {/* ─── Carved Sacred Stone Threshold Pedestal ─── */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.14, 28]} />
        <meshStandardMaterial color="#2d2822" roughness={0.8} />
      </mesh>
      {/* Ornate pedestal rim */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[1.02, 1.08, 0.04, 28]} />
        <meshStandardMaterial color="#3d342a" roughness={0.7} />
      </mesh>

      {/* ─── Ground Contact Shadow ─── */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 24]} />
        <meshBasicMaterial color="#050302" transparent opacity={0.65} />
      </mesh>

      {/* ─── Human Ganesha Body Group (Child Scale ~1.15m height) ─── */}
      <group ref={bodyGroup} position={[0, 0, 0]}>
        {/* ─── LEGS & DHOTI ─── */}
        {/* Left Leg in draped silk dhoti */}
        <group position={[-0.11, 0.38, 0]}>
          <mesh position={[0, -0.08, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.075, 0.18, 8, 12]} />
          </mesh>
          {/* Lower calf & bare foot */}
          <mesh position={[0, -0.24, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.048, 0.14, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.34, 0.025]} material={materials.skin}>
            <boxGeometry args={[0.07, 0.04, 0.11]} />
          </mesh>
          {/* Golden ankle kada */}
          <mesh position={[0, -0.29, 0]} material={materials.gold}>
            <torusGeometry args={[0.052, 0.008, 6, 16]} />
          </mesh>
        </group>

        {/* Right Leg in draped silk dhoti */}
        <group position={[0.11, 0.38, 0]}>
          <mesh position={[0, -0.08, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.075, 0.18, 8, 12]} />
          </mesh>
          <mesh position={[0, -0.24, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.048, 0.14, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.34, 0.025]} material={materials.skin}>
            <boxGeometry args={[0.07, 0.04, 0.11]} />
          </mesh>
          <mesh position={[0, -0.29, 0]} material={materials.gold}>
            <torusGeometry args={[0.052, 0.008, 6, 16]} />
          </mesh>
        </group>

        {/* Central Pleated Dhoti Drape (Patli) */}
        <mesh position={[0, 0.36, 0.08]} material={materials.dhotiBorder} castShadow>
          <boxGeometry args={[0.12, 0.28, 0.03]} />
        </mesh>

        {/* Golden Kamarbandh (Ornate Waist Belt) */}
        <mesh position={[0, 0.49, 0]} material={materials.gold} castShadow>
          <cylinderGeometry args={[0.165, 0.17, 0.04, 20]} />
        </mesh>
        {/* Central Ruby Gem on Waist Belt */}
        <mesh position={[0, 0.49, 0.168]} material={materials.ruby}>
          <sphereGeometry args={[0.018, 8, 8]} />
        </mesh>

        {/* ─── TORSO (Bare Divine Chest, Healthy Child Proportions) ─── */}
        <mesh position={[0, 0.64, 0]} material={materials.skin} castShadow receiveShadow>
          <capsuleGeometry args={[0.145, 0.22, 10, 16]} />
        </mesh>

        {/* Sacred Janeu (Yagnopaveetham Thread across chest from left shoulder to right waist) */}
        <mesh
          position={[-0.02, 0.65, 0.12]}
          rotation={[0, 0, -0.65]}
          material={materials.janeu}
        >
          <boxGeometry args={[0.008, 0.32, 0.006]} />
        </mesh>

        {/* Royal Golden Necklace (Kantha Haar) */}
        <mesh position={[0, 0.77, 0.06]} material={materials.gold} castShadow>
          <torusGeometry args={[0.09, 0.012, 6, 18]} />
        </mesh>
        <mesh position={[0, 0.73, 0.14]} material={materials.ruby}>
          <sphereGeometry args={[0.014, 8, 8]} />
        </mesh>

        {/* ─── NECK ─── */}
        <mesh position={[0, 0.81, 0]} material={materials.skin} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.07, 14]} />
        </mesh>

        {/* ─── HEAD & NOBLE INNOCENT FACE ─── */}
        <group ref={headGroup} position={[0, 0.94, 0.01]}>
          {/* Head Sphere */}
          <mesh material={materials.skin} castShadow receiveShadow>
            <sphereGeometry args={[0.122, 18, 16]} />
          </mesh>

          {/* Traditional Silken Hair Cap */}
          <mesh position={[0, 0.025, -0.015]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.124, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          </mesh>

          {/* Sacred Shikha / Topknot on Crown */}
          <group position={[0, 0.135, -0.02]}>
            <mesh material={materials.hair} castShadow>
              <sphereGeometry args={[0.042, 12, 10]} />
            </mesh>
            {/* Golden Hair Ornament Ring */}
            <mesh position={[0, -0.015, 0]} material={materials.gold}>
              <torusGeometry args={[0.038, 0.008, 6, 16]} />
            </mesh>
          </group>

          {/* Large Kind Divine Eyes */}
          {/* Left Eye */}
          <mesh position={[-0.045, 0.012, 0.108]} material={materials.eyes}>
            <sphereGeometry args={[0.014, 10, 10]} />
          </mesh>
          <mesh position={[-0.041, 0.016, 0.119]}>
            <sphereGeometry args={[0.004, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.045, 0.012, 0.108]} material={materials.eyes}>
            <sphereGeometry args={[0.014, 10, 10]} />
          </mesh>
          <mesh position={[0.049, 0.016, 0.119]}>
            <sphereGeometry args={[0.004, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Sacred Red Chandan Tilak on Forehead */}
          <mesh position={[0, 0.048, 0.122]} material={materials.tilak}>
            <boxGeometry args={[0.014, 0.035, 0.004]} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.008, 0.122]} material={materials.skin}>
            <sphereGeometry args={[0.015, 8, 8]} />
          </mesh>

          {/* Innocent Determined Smile */}
          <mesh position={[0, -0.036, 0.114]}>
            <boxGeometry args={[0.032, 0.006, 0.006]} />
            <meshStandardMaterial color="#b95345" roughness={0.6} />
          </mesh>

          {/* Ears with Golden Kundal Earrings */}
          <mesh position={[-0.12, 0.005, -0.005]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
          <mesh position={[-0.125, -0.018, -0.005]} material={materials.gold}>
            <torusGeometry args={[0.012, 0.004, 6, 12]} />
          </mesh>

          <mesh position={[0.12, 0.005, -0.005]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
          <mesh position={[0.125, -0.018, -0.005]} material={materials.gold}>
            <torusGeometry args={[0.012, 0.004, 6, 12]} />
          </mesh>
        </group>

        {/* ─── ARMS: VIGILANT SACRED GUARDIAN POSTURE ─── */}
        {/* Left Arm */}
        <group ref={leftArmGroup} position={[-0.20, 0.74, 0]}>
          <mesh position={[0, -0.10, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.04, 0.12, 6, 8]} />
          </mesh>
          {/* Golden Upper Armlet (Angada) */}
          <mesh position={[0, -0.06, 0]} material={materials.gold}>
            <torusGeometry args={[0.044, 0.008, 6, 16]} />
          </mesh>
          {/* Forearm angled vigilantly */}
          <group position={[0, -0.18, 0]} rotation={[0.4, 0, 0.2]}>
            <mesh position={[0, -0.09, 0]} material={materials.skin} castShadow>
              <capsuleGeometry args={[0.035, 0.12, 6, 8]} />
            </mesh>
            {/* Wrist Kada */}
            <mesh position={[0, -0.15, 0]} material={materials.gold}>
              <torusGeometry args={[0.038, 0.006, 6, 14]} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.19, 0]} material={materials.skin}>
              <sphereGeometry args={[0.028, 8, 8]} />
            </mesh>
          </group>
        </group>

        {/* Right Arm - Holding Sacred Guardian Staff */}
        <group ref={rightArmGroup} position={[0.20, 0.74, 0]}>
          <mesh position={[0, -0.10, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.04, 0.12, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={materials.gold}>
            <torusGeometry args={[0.044, 0.008, 6, 16]} />
          </mesh>
          <group position={[0, -0.18, 0]} rotation={[0.3, 0, -0.15]}>
            <mesh position={[0, -0.09, 0]} material={materials.skin} castShadow>
              <capsuleGeometry args={[0.035, 0.12, 6, 8]} />
            </mesh>
            <mesh position={[0, -0.15, 0]} material={materials.gold}>
              <torusGeometry args={[0.038, 0.006, 6, 14]} />
            </mesh>
            <mesh position={[0, -0.19, 0]} material={materials.skin}>
              <sphereGeometry args={[0.028, 8, 8]} />
            </mesh>

            {/* Sacred Guardian Staff held in right hand */}
            <group position={[0.02, -0.18, 0]} rotation={[0.1, 0, 0]}>
              <mesh position={[0, 0.15, 0]} material={materials.staffWood} castShadow>
                <cylinderGeometry args={[0.016, 0.018, 1.4, 12]} />
              </mesh>
              {/* Golden Top Finial of Staff */}
              <mesh position={[0, 0.86, 0]} material={materials.gold} castShadow>
                <sphereGeometry args={[0.038, 12, 12]} />
              </mesh>
              {/* Red Silk Ribbon on Staff */}
              <mesh position={[0, 0.76, 0.02]} rotation={[0.2, 0, 0.1]}>
                <boxGeometry args={[0.025, 0.18, 0.005]} />
                <meshStandardMaterial color="#dc2626" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ─── Divine Prana Radiance Light (Warm Golden Halo) ─── */}
      <pointLight
        ref={auraLightRef}
        position={[0, 0.85, 0.1]}
        color={isFallen ? '#ffaa44' : '#ffd54f'}
        intensity={1.4}
        distance={4.5}
        decay={2}
      />

      {/* ─── Sacred Flickering Brass Diya Lamps on Flanking Pedestal ─── */}
      {[-0.88, 0.88].map((x, idx) => (
        <group key={idx} position={[x, 0.02, 0.35]}>
          {/* Diya Bowl */}
          <mesh material={materials.brassDiya} castShadow>
            <cylinderGeometry args={[0.09, 0.05, 0.07, 14]} />
          </mesh>
          {/* Diya Flame */}
          <mesh position={[0, 0.07, 0]}>
            <coneGeometry args={[0.022, 0.065, 8]} />
            <meshBasicMaterial color="#ffedd5" />
          </mesh>
          <pointLight
            position={[0, 0.09, 0]}
            color="#f97316"
            intensity={isFallen ? 0.3 : 1.2}
            distance={2.4}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
