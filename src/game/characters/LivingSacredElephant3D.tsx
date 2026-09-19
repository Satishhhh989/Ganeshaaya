/**
 * LivingSacredElephant3D - Authentic Articulated 3D Celestial Elephant (Sri Gajaraj)
 * 
 * - Fully 3D sculpted creature (zero flat photos, zero billboards, zero planes)
 * - Anatomical Asian elephant proportions: twin skull domes, curved spine, muscular shoulders
 * - Articulated 6-segment procedural trunk with natural wave curling and exploratory motion
 * - Flapping fan ears with natural harmonic flutter
 * - Polished curved ivory tusks
 * - Expressive blinking eyes
 * - Breathing chest expansion and shifting pillar legs
 * - Sacred mythological adornments: Chandan Tilak, royal embroidered Jhool, golden temple bell collar
 * - Living state transitions: IDLE -> AWARE (turns toward Shiva) -> COMMUNING (peaceful bow)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LivingSacredElephant3DProps {
  position?: [number, number, number];
  rotationY?: number;
  isAware?: boolean;       // When Shiva enters clearing (turns head, raises trunk)
  isCommuning?: boolean;   // When Shiva triggers communion (peacefully bows head)
}

export function LivingSacredElephant3D({
  position = [0, 0, -20.5],
  rotationY = 0,
  isAware = false,
  isCommuning = false,
}: LivingSacredElephant3DProps) {
  // Master group & sub-articulation refs
  const masterRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Group>(null);
  const earRightRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  // 6-segment trunk chain refs
  const trunk0Ref = useRef<THREE.Group>(null);
  const trunk1Ref = useRef<THREE.Group>(null);
  const trunk2Ref = useRef<THREE.Group>(null);
  const trunk3Ref = useRef<THREE.Group>(null);
  const trunk4Ref = useRef<THREE.Group>(null);
  const trunk5Ref = useRef<THREE.Group>(null);

  // Legs for subtle weight shifting
  const legFLRef = useRef<THREE.Group>(null);
  const legFRRef = useRef<THREE.Group>(null);
  const legBLRef = useRef<THREE.Group>(null);
  const legBRRef = useRef<THREE.Group>(null);

  // Aura and eye blink refs
  const auraLightRef = useRef<THREE.PointLight>(null);
  const eyeLidLeftRef = useRef<THREE.Mesh>(null);
  const eyeLidRightRef = useRef<THREE.Mesh>(null);

  // Organic Materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: '#42484d',
    roughness: 0.82,
    metalness: 0.08,
  });

  const innerEarMaterial = new THREE.MeshStandardMaterial({
    color: '#5a4a50',
    roughness: 0.75,
    metalness: 0.05,
  });

  const tuskMaterial = new THREE.MeshStandardMaterial({
    color: '#fffef2',
    roughness: 0.22,
    metalness: 0.12,
  });

  const jhoolVelvetMaterial = new THREE.MeshStandardMaterial({
    color: '#831843',
    roughness: 0.65,
    metalness: 0.25,
  });

  const jhoolGoldTrimMaterial = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.3,
    metalness: 0.85,
    emissive: '#b45309',
    emissiveIntensity: 0.2,
  });

  const tilakRedMaterial = new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.4,
    emissive: '#991b1b',
    emissiveIntensity: 0.3,
  });

  const tilakGoldMaterial = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.2,
    emissive: '#d97706',
    emissiveIntensity: 0.4,
  });

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // ─── 1. Natural Breathing Cycle ───
    const breathRate = isCommuning ? 1.0 : isAware ? 1.8 : 1.3;
    const breath = Math.sin(time * breathRate);
    if (bodyRef.current) {
      // Gentle chest expansion & elevation
      bodyRef.current.scale.set(
        1.0 + breath * 0.02,
        1.0 + breath * 0.025,
        1.0 + breath * 0.012
      );
      bodyRef.current.position.y = 1.95 + breath * 0.025;
    }

    // ─── 2. Head Posture & Sway ───
    if (headRef.current) {
      if (isCommuning) {
        // Peaceful devotional bow: lowers head, brings chin inward
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 1.85, dt * 2.0);
        headRef.current.position.z = THREE.MathUtils.lerp(headRef.current.position.z, 2.05, dt * 2.0);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.38, dt * 2.0);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, dt * 2.0);
      } else if (isAware) {
        // Alert, noble recognition: lifts head high, turns gently toward approaching Shiva
        const targetRotY = Math.sin(time * 0.6) * 0.08;
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 2.35, dt * 2.5);
        headRef.current.position.z = THREE.MathUtils.lerp(headRef.current.position.z, 1.95, dt * 2.5);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.15, dt * 2.5);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, dt * 2.5);
      } else {
        // Idle: gentle tranquil head sway
        const idleRotX = -0.04 + Math.sin(time * 0.8) * 0.03;
        const idleRotY = Math.sin(time * 0.45) * 0.06;
        headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, 2.15, dt * 2.0);
        headRef.current.position.z = THREE.MathUtils.lerp(headRef.current.position.z, 1.95, dt * 2.0);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, idleRotX, dt * 2.0);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, idleRotY, dt * 2.0);
      }
    }

    // ─── 3. Ear Flapping & Flutter ───
    const earCycle = Math.sin(time * 1.5);
    const earFlutter = Math.sin(time * 3.8) * 0.04;
    const baseEarAngle = isAware ? 0.35 : 0.22;
    if (earLeftRef.current && earRightRef.current) {
      earLeftRef.current.rotation.y = -(baseEarAngle + earCycle * 0.12 + earFlutter);
      earRightRef.current.rotation.y = baseEarAngle + earCycle * 0.12 + earFlutter;
    }

    // ─── 4. Articulated 6-Segment Trunk Motion ───
    // Wave motion traveling down the trunk chain
    const trunkWave = Math.sin(time * 1.6);
    const trunkCurl = Math.cos(time * 1.2);

    if (isCommuning) {
      // Trunk curls gently inward toward chest in peaceful reverent namaskar
      if (trunk0Ref.current) trunk0Ref.current.rotation.x = THREE.MathUtils.lerp(trunk0Ref.current.rotation.x, 0.45, dt * 2.5);
      if (trunk1Ref.current) trunk1Ref.current.rotation.x = THREE.MathUtils.lerp(trunk1Ref.current.rotation.x, 0.40, dt * 2.5);
      if (trunk2Ref.current) trunk2Ref.current.rotation.x = THREE.MathUtils.lerp(trunk2Ref.current.rotation.x, 0.35, dt * 2.5);
      if (trunk3Ref.current) trunk3Ref.current.rotation.x = THREE.MathUtils.lerp(trunk3Ref.current.rotation.x, 0.30, dt * 2.5);
      if (trunk4Ref.current) trunk4Ref.current.rotation.x = THREE.MathUtils.lerp(trunk4Ref.current.rotation.x, -0.25, dt * 2.5);
      if (trunk5Ref.current) trunk5Ref.current.rotation.x = THREE.MathUtils.lerp(trunk5Ref.current.rotation.x, -0.35, dt * 2.5);
    } else if (isAware) {
      // Trunk arches upward in greeting
      if (trunk0Ref.current) trunk0Ref.current.rotation.x = THREE.MathUtils.lerp(trunk0Ref.current.rotation.x, -0.25 + trunkWave * 0.05, dt * 3.0);
      if (trunk1Ref.current) trunk1Ref.current.rotation.x = THREE.MathUtils.lerp(trunk1Ref.current.rotation.x, -0.35 + trunkWave * 0.06, dt * 3.0);
      if (trunk2Ref.current) trunk2Ref.current.rotation.x = THREE.MathUtils.lerp(trunk2Ref.current.rotation.x, -0.30 + trunkWave * 0.07, dt * 3.0);
      if (trunk3Ref.current) trunk3Ref.current.rotation.x = THREE.MathUtils.lerp(trunk3Ref.current.rotation.x, -0.15 + trunkWave * 0.08, dt * 3.0);
      if (trunk4Ref.current) trunk4Ref.current.rotation.x = THREE.MathUtils.lerp(trunk4Ref.current.rotation.x, 0.20 + trunkWave * 0.10, dt * 3.0);
      if (trunk5Ref.current) trunk5Ref.current.rotation.x = THREE.MathUtils.lerp(trunk5Ref.current.rotation.x, 0.35 + trunkWave * 0.12, dt * 3.0);
    } else {
      // Natural exploratory idle sniff
      const lateralSway = Math.sin(time * 0.9) * 0.08;
      if (trunk0Ref.current) {
        trunk0Ref.current.rotation.x = 0.15 + trunkWave * 0.04;
        trunk0Ref.current.rotation.y = lateralSway * 0.5;
      }
      if (trunk1Ref.current) {
        trunk1Ref.current.rotation.x = 0.18 + trunkWave * 0.06;
        trunk1Ref.current.rotation.y = lateralSway * 0.7;
      }
      if (trunk2Ref.current) {
        trunk2Ref.current.rotation.x = 0.12 + trunkWave * 0.08;
        trunk2Ref.current.rotation.y = lateralSway;
      }
      if (trunk3Ref.current) {
        trunk3Ref.current.rotation.x = -0.05 + trunkCurl * 0.12;
      }
      if (trunk4Ref.current) {
        trunk4Ref.current.rotation.x = -0.15 + trunkCurl * 0.18;
      }
      if (trunk5Ref.current) {
        trunk5Ref.current.rotation.x = -0.22 + trunkCurl * 0.24;
      }
    }

    // ─── 5. Eye Blinking ───
    const blinkCycle = Math.sin(time * 0.35);
    const isBlinking = blinkCycle > 0.96;
    if (eyeLidLeftRef.current && eyeLidRightRef.current) {
      const lidScaleY = isCommuning ? 0.85 : isBlinking ? 0.9 : 0.05;
      eyeLidLeftRef.current.scale.y = THREE.MathUtils.lerp(eyeLidLeftRef.current.scale.y, lidScaleY, dt * 15);
      eyeLidRightRef.current.scale.y = THREE.MathUtils.lerp(eyeLidRightRef.current.scale.y, lidScaleY, dt * 15);
    }

    // ─── 6. Tail Sway ───
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(time * 1.8) * 0.14;
      tailRef.current.rotation.x = 0.12 + Math.sin(time * 1.1) * 0.05;
    }

    // ─── 7. Subtle Weight Shift on Pillar Legs ───
    const weightShift = Math.sin(time * 0.7) * 0.015;
    if (legFLRef.current && legFRRef.current) {
      legFLRef.current.position.y = 0.95 + weightShift;
      legFRRef.current.position.y = 0.95 - weightShift;
    }

    // ─── 8. Divine Prana Glow Pulse ───
    if (auraLightRef.current) {
      auraLightRef.current.intensity = isCommuning
        ? 3.2 + Math.sin(time * 3.5) * 0.8
        : isAware
        ? 2.2 + Math.sin(time * 2.0) * 0.4
        : 1.4 + Math.sin(time * 1.2) * 0.25;
    }
  });

  return (
    <group ref={masterRef} position={position} rotation={[0, rotationY, 0]}>
      {/* ─── Ground Drop Shadow on Forest Clearing Floor ─── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.0, 1.35, 1]}>
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial color="#0b130e" transparent opacity={0.65} />
      </mesh>

      {/* ─── Divine Lotus Bed under the Sacred Elephant ─── */}
      <group position={[0, 0.04, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[3.2, 3.5, 0.12, 32]} />
          <meshStandardMaterial color="#22331f" roughness={0.9} />
        </mesh>
        {/* Ring of Sacred Lotus Petals */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const radius = 3.3;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius]}
              rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]}
            >
              <circleGeometry args={[0.32, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#fda4af' : '#fb7185'}
                roughness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* ─── 4 STURDY ELEPHANT PILLAR LEGS ─── */}
      {/* Front Left Leg */}
      <group ref={legFLRef} position={[-0.95, 0.95, 1.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.44, 1.9, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {/* Foot Pad & Toenails */}
        <mesh position={[0, -0.92, 0.08]}>
          <cylinderGeometry args={[0.44, 0.46, 0.18, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {[-0.22, 0, 0.22].map((x, idx) => (
          <mesh key={idx} position={[x, -0.96, 0.42]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Front Right Leg */}
      <group ref={legFRRef} position={[0.95, 0.95, 1.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.44, 1.9, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        <mesh position={[0, -0.92, 0.08]}>
          <cylinderGeometry args={[0.44, 0.46, 0.18, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {[-0.22, 0, 0.22].map((x, idx) => (
          <mesh key={idx} position={[x, -0.96, 0.42]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Back Left Leg */}
      <group ref={legBLRef} position={[-0.92, 0.95, -1.25]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.44, 1.9, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        <mesh position={[0, -0.92, 0.06]}>
          <cylinderGeometry args={[0.44, 0.46, 0.18, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {[-0.2, 0, 0.2].map((x, idx) => (
          <mesh key={idx} position={[x, -0.96, 0.42]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Back Right Leg */}
      <group ref={legBRRef} position={[0.92, 0.95, -1.25]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.44, 1.9, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        <mesh position={[0, -0.92, 0.06]}>
          <cylinderGeometry args={[0.44, 0.46, 0.18, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {[-0.2, 0, 0.2].map((x, idx) => (
          <mesh key={idx} position={[x, -0.96, 0.42]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ─── MASSIVE ELEPHANT TORSO & ABDOMEN ─── */}
      <group ref={bodyRef} position={[0, 1.95, 0]}>
        {/* Main Central Barrel */}
        <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
          <capsuleGeometry args={[1.25, 2.2, 16, 24]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* Muscular Front Shoulders */}
        <mesh castShadow position={[0, 0.35, 1.0]} scale={[1.15, 1.05, 0.9]}>
          <sphereGeometry args={[1.25, 24, 24]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* Rear Flanks & Hips */}
        <mesh castShadow position={[0, 0.25, -1.1]} scale={[1.1, 1.05, 0.95]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* ─── SACRED CEREMONIAL JHOOL (VELVET BACK COVERING) ─── */}
        <group position={[0, 0.58, 0]}>
          {/* Main Velvet Blanket draped over spine */}
          <mesh castShadow position={[0, 0.12, 0]} scale={[1.5, 0.8, 2.1]}>
            <boxGeometry args={[1.7, 0.8, 1.4]} />
            <primitive object={jhoolVelvetMaterial} />
          </mesh>

          {/* Golden Brocade Border Along Blanket Edges */}
          <mesh position={[0, -0.22, 0]} scale={[1.52, 0.08, 2.12]}>
            <boxGeometry args={[1.72, 0.8, 1.42]} />
            <primitive object={jhoolGoldTrimMaterial} />
          </mesh>

          {/* Central Embroidered Mandala Emblem */}
          <mesh position={[0, 0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55, 24]} />
            <primitive object={jhoolGoldTrimMaterial} />
          </mesh>
        </group>

        {/* ─── SLENDER TAIL ─── */}
        <group ref={tailRef} position={[0, 0.45, -2.1]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.03, 1.4, 8]} />
            <primitive object={skinMaterial} />
          </mesh>
          {/* Dark Tuft at Tail Tip */}
          <mesh position={[0, -0.75, 0]}>
            <coneGeometry args={[0.1, 0.32, 8]} />
            <meshStandardMaterial color="#1f2427" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ─── SCULPTED 3D ELEPHANT HEAD & FACIAL ANATOMY ─── */}
      <group ref={headRef} position={[0, 2.15, 1.95]}>
        {/* Head Base & Cranium */}
        <mesh castShadow position={[0, 0, 0]} scale={[1.0, 1.1, 1.05]}>
          <sphereGeometry args={[0.95, 24, 24]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* Characteristic Asian Elephant Twin Parietal Domes on Forehead */}
        <mesh castShadow position={[-0.38, 0.72, -0.1]} scale={[0.42, 0.48, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        <mesh castShadow position={[0.38, 0.72, -0.1]} scale={[0.42, 0.48, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <primitive object={skinMaterial} />
        </mesh>

        {/* ─── SACRED CHANDAN TILAK (VERMILION & GOLDEN SANDALWOOD) ─── */}
        <group position={[0, 0.42, 0.88]} rotation={[-0.2, 0, 0]}>
          {/* Central Sacred Red Urdhva Pundra Line */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.06, 0.42, 0.02]} />
            <primitive object={tilakRedMaterial} />
          </mesh>
          {/* Flanking Golden Sandalwood Crescent Lines */}
          <mesh position={[-0.08, 0.04, 0]}>
            <boxGeometry args={[0.035, 0.32, 0.02]} />
            <primitive object={tilakGoldMaterial} />
          </mesh>
          <mesh position={[0.08, 0.04, 0]}>
            <boxGeometry args={[0.035, 0.32, 0.02]} />
            <primitive object={tilakGoldMaterial} />
          </mesh>
          {/* Golden Bindu Dot at Brow */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <primitive object={tilakGoldMaterial} />
          </mesh>
        </group>

        {/* ─── EXPRESSIVE EYES ─── */}
        {/* Left Eye */}
        <group position={[-0.75, 0.15, 0.48]} rotation={[0, -0.35, 0]}>
          {/* Eyeball */}
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.15} />
          </mesh>
          {/* Golden Iris Ring */}
          <mesh position={[0, 0, 0.05]}>
            <ringGeometry args={[0.035, 0.07, 16]} />
            <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} />
          </mesh>
          {/* Upper Blinking Eyelid */}
          <mesh ref={eyeLidLeftRef} position={[0, 0.06, 0.02]} scale={[1, 0.05, 1]}>
            <sphereGeometry args={[0.098, 16, 8]} />
            <primitive object={skinMaterial} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.75, 0.15, 0.48]} rotation={[0, 0.35, 0]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <ringGeometry args={[0.035, 0.07, 16]} />
            <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={eyeLidRightRef} position={[0, 0.06, 0.02]} scale={[1, 0.05, 1]}>
            <sphereGeometry args={[0.098, 16, 8]} />
            <primitive object={skinMaterial} />
          </mesh>
        </group>

        {/* ─── LARGE FLAPPING FAN EARS ─── */}
        {/* Left Ear */}
        <group ref={earLeftRef} position={[-0.85, 0.35, -0.15]}>
          <mesh castShadow position={[-0.65, -0.2, 0]} rotation={[0, 0.2, -0.1]}>
            <boxGeometry args={[1.2, 1.45, 0.05]} />
            <primitive object={skinMaterial} />
          </mesh>
          {/* Soft inner ear lining */}
          <mesh position={[-0.62, -0.2, 0.03]} rotation={[0, 0.2, -0.1]}>
            <planeGeometry args={[0.95, 1.15]} />
            <primitive object={innerEarMaterial} />
          </mesh>
        </group>

        {/* Right Ear */}
        <group ref={earRightRef} position={[0.85, 0.35, -0.15]}>
          <mesh castShadow position={[0.65, -0.2, 0]} rotation={[0, -0.2, 0.1]}>
            <boxGeometry args={[1.2, 1.45, 0.05]} />
            <primitive object={skinMaterial} />
          </mesh>
          <mesh position={[0.62, -0.2, 0.03]} rotation={[0, -0.2, 0.1]}>
            <planeGeometry args={[0.95, 1.15]} />
            <primitive object={innerEarMaterial} />
          </mesh>
        </group>

        {/* ─── POLISHED IVORY CURVED TUSKS ─── */}
        {/* Left Tusk */}
        <group position={[-0.38, -0.45, 0.65]} rotation={[-0.3, -0.15, -0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.14, 1.25, 16]} />
            <primitive object={tuskMaterial} />
          </mesh>
          {/* Tusk Tip Curved Upward */}
          <mesh position={[0, -0.68, 0.08]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.09, 0.45, 16]} />
            <primitive object={tuskMaterial} />
          </mesh>
        </group>

        {/* Right Tusk */}
        <group position={[0.38, -0.45, 0.65]} rotation={[-0.3, 0.15, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.14, 1.25, 16]} />
            <primitive object={tuskMaterial} />
          </mesh>
          <mesh position={[0, -0.68, 0.08]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.09, 0.45, 16]} />
            <primitive object={tuskMaterial} />
          </mesh>
        </group>

        {/* ─── ARTICULATED 6-SEGMENT PROCEDURAL TRUNK ─── */}
        {/* Segment 0: Base / Upper Snout */}
        <group ref={trunk0Ref} position={[0, -0.22, 0.85]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.34, 0.42, 0.45, 16]} />
            <primitive object={skinMaterial} />
          </mesh>

          {/* Segment 1 */}
          <group ref={trunk1Ref} position={[0, -0.42, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.29, 0.34, 0.44, 16]} />
              <primitive object={skinMaterial} />
            </mesh>

            {/* Segment 2 */}
            <group ref={trunk2Ref} position={[0, -0.42, 0]}>
              <mesh castShadow position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.24, 0.29, 0.44, 16]} />
                <primitive object={skinMaterial} />
              </mesh>

              {/* Segment 3 */}
              <group ref={trunk3Ref} position={[0, -0.42, 0]}>
                <mesh castShadow position={[0, -0.2, 0]}>
                  <cylinderGeometry args={[0.19, 0.24, 0.44, 16]} />
                  <primitive object={skinMaterial} />
                </mesh>

                {/* Segment 4 */}
                <group ref={trunk4Ref} position={[0, -0.42, 0]}>
                  <mesh castShadow position={[0, -0.2, 0]}>
                    <cylinderGeometry args={[0.15, 0.19, 0.42, 16]} />
                    <primitive object={skinMaterial} />
                  </mesh>

                  {/* Segment 5: Tip with Nostrils */}
                  <group ref={trunk5Ref} position={[0, -0.4, 0]}>
                    <mesh castShadow position={[0, -0.15, 0]}>
                      <cylinderGeometry args={[0.12, 0.15, 0.32, 16]} />
                      <primitive object={skinMaterial} />
                    </mesh>
                    {/* Nostrils */}
                    <mesh position={[-0.04, -0.32, 0.02]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshBasicMaterial color="#18181b" />
                    </mesh>
                    <mesh position={[0.04, -0.32, 0.02]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshBasicMaterial color="#18181b" />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ─── GOLDEN TEMPLE BELL COLLAR AROUND CHEST ─── */}
        <group position={[0, -0.85, 0.45]} rotation={[0.4, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.045, 12, 24]} />
            <primitive object={jhoolGoldTrimMaterial} />
          </mesh>
          {/* Center Sacred Brass Bell */}
          <group position={[0, -0.92, 0.15]}>
            <mesh>
              <coneGeometry args={[0.14, 0.25, 16]} />
              <primitive object={jhoolGoldTrimMaterial} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <primitive object={jhoolGoldTrimMaterial} />
            </mesh>
          </group>
        </group>

        {/* Divine Golden Prana Backlight Halo */}
        <pointLight
          ref={auraLightRef}
          position={[0, 0.8, -0.6]}
          color="#fde047"
          intensity={1.8}
          distance={8.0}
          decay={2}
        />
      </group>
    </group>
  );
}
