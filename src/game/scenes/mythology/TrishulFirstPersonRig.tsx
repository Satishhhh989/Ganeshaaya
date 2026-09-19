/**
 * TrishulFirstPersonRig - First-person handheld Trishul divine weapon presentation
 * 
 * - Rendered directly relative to the camera in view space
 * - Positioned in the lower-right foreground, occupying ~18-24% of the screen
 * - Angled naturally upward & forward toward the crosshair target without blocking the center reticle
 * - Shaft originates below the lower edge of the camera viewport
 * - Subtle warm golden divine prana grip wrap around the contact section (unseen divine presence)
 * - Subtle rhythmic breathing bob & gentle mouse inertia lag sway
 * - Anticipation pull-back and thrust animation during throw
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrishulFirstPersonRigProps {
  isThrowing: boolean;
  isAiming: boolean;
  throwProgress: number; // 0 to 1
  isVisible: boolean;
  mouseDelta: { x: number; y: number };
}

export function TrishulFirstPersonRig({
  isThrowing,
  isAiming,
  throwProgress,
  isVisible,
  mouseDelta,
}: TrishulFirstPersonRigProps) {
  const rigGroupRef = useRef<THREE.Group>(null);
  
  // Natural lower-right handheld first-person weapon coordinates:
  // X: 0.28 (offset right so center crosshair is clear)
  // Y: -0.34 (resting in lower quadrant)
  // Z: -0.68 (close in foreground, shaft base dipping below viewport)
  const currentPos = useRef(new THREE.Vector3(0.28, -0.34, -0.68));
  // Rotation: pitched back ~0.24 rad, yawed inward ~0.12 rad, slight roll ~0.08 rad
  const currentRot = useRef(new THREE.Euler(-0.24, -0.12, 0.08));

  useFrame((state, delta) => {
    if (!rigGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Default rest / aim transform (lower-right foreground, pointing forward-upward)
    const targetPos = new THREE.Vector3(0.28, -0.34, -0.68);
    const targetRot = new THREE.Euler(-0.24, -0.12, 0.08);

    if (isAiming && !isThrowing) {
      // Subtle rhythmic divine breathing bob
      const breathY = Math.sin(t * 1.6) * 0.006;
      const breathX = Math.cos(t * 0.8) * 0.003;
      targetPos.y += breathY;
      targetPos.x += breathX;

      // Natural mouse inertia lag sway (subtle follow/sway when aiming)
      const swayX = THREE.MathUtils.clamp(mouseDelta.x * 0.0004, -0.025, 0.025);
      const swayY = THREE.MathUtils.clamp(mouseDelta.y * 0.0004, -0.025, 0.025);
      targetPos.x -= swayX;
      targetPos.y -= swayY;
      targetRot.y -= swayX * 0.8;
      targetRot.x -= swayY * 0.8;
    } else if (isThrowing) {
      if (throwProgress < 0.35) {
        // Stage 1: Anticipation pull-back
        const p = throwProgress / 0.35;
        const easePull = p * p;
        targetPos.x += 0.08 * easePull;
        targetPos.y += 0.04 * easePull;
        targetPos.z += 0.22 * easePull;
        targetRot.x += 0.22 * easePull;
        targetRot.y -= 0.10 * easePull;
        targetRot.z += 0.12 * easePull;
      } else if (throwProgress < 0.7) {
        // Stage 2: Explosive forward throw thrust toward center crosshair
        const p = (throwProgress - 0.35) / 0.35;
        const easeThrust = Math.sin(p * Math.PI * 0.5);
        targetPos.x = 0.36 - 0.28 * easeThrust;
        targetPos.y = -0.30 - 0.02 * easeThrust;
        targetPos.z = -0.46 - 0.65 * easeThrust;
        targetRot.x = -0.02 - 0.38 * easeThrust;
        targetRot.y = -0.22 + 0.15 * easeThrust;
        targetRot.z = 0.20 - 0.26 * easeThrust;
      } else {
        // Stage 3: Follow-through and release forward
        const p = (throwProgress - 0.7) / 0.3;
        targetPos.set(0.12, -0.42 - p * 0.1, -1.25);
        targetRot.set(-0.45, -0.04, -0.10);
      }
    }

    // Smooth spring interpolation
    currentPos.current.lerp(targetPos, dt * 16);
    currentRot.current.x = THREE.MathUtils.lerp(currentRot.current.x, targetRot.x, dt * 16);
    currentRot.current.y = THREE.MathUtils.lerp(currentRot.current.y, targetRot.y, dt * 16);
    currentRot.current.z = THREE.MathUtils.lerp(currentRot.current.z, targetRot.z, dt * 16);

    rigGroupRef.current.position.copy(currentPos.current);
    rigGroupRef.current.rotation.copy(currentRot.current);
  });

  if (!isVisible) return null;

  return (
    <group ref={rigGroupRef} scale={[0.58, 0.58, 0.58]}>
      {/* ─── SACRED DIVINE GRIP SECTION (HELD IN FIRST-PERSON FOREGROUND) ─── */}
      {/* Subtly communicates that the Trishul is held by an unseen divine presence */}
      <group position={[0, -0.38, 0]}>
        {/* Soft Golden Divine Prana Aura contacting the grip area */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.28, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={0.65}
            transparent
            opacity={0.32}
            roughness={0.2}
          />
        </mesh>

        {/* Sacred Golden Grip Band with Ornate Rings */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 0.24, 16]} />
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.25}
            metalness={0.88}
          />
        </mesh>

        {/* Sacred Rudraksha Beads Contact Wrap around Lower Grip */}
        {[-0.07, 0, 0.07].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <torusGeometry args={[0.032, 0.007, 8, 18]} />
            <meshStandardMaterial color="#4a2511" roughness={0.8} />
          </mesh>
        ))}

        {/* Warm subtle point light representing divine touch */}
        <pointLight
          position={[0, 0, 0.06]}
          color="#fde68a"
          intensity={0.7}
          distance={1.2}
          decay={2}
        />
      </group>

      {/* ─── THE SACRED TRISHUL DIVINE WEAPON ─── */}
      <group position={[0, 0, 0]}>
        {/* Main Shaft (Deep forged dark celestial metal) extending downward below camera */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.020, 1.7, 16]} />
          <meshStandardMaterial
            color="#2a2725"
            roughness={0.35}
            metalness={0.8}
          />
        </mesh>

        {/* Golden Grip Sleeve around Hand Contact */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.24, 16]} />
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.25}
            metalness={0.88}
          />
        </mesh>

        {/* Upper Golden Bands on Shaft */}
        {[0.2, 0.45, 0.72].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.035, 16]} />
            <meshStandardMaterial
              color="#e5b83b"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Sacred Damru Tied below Trident Blades */}
        <group position={[0.045, 0.72, 0]} rotation={[0, 0, 0.35]}>
          <mesh position={[0, 0.03, 0]}>
            <coneGeometry args={[0.038, 0.055, 12]} />
            <meshStandardMaterial color="#542c13" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.03, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.038, 0.055, 12]} />
            <meshStandardMaterial color="#542c13" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.016, 12]} />
            <meshStandardMaterial color="#ffd700" metalness={0.85} />
          </mesh>
        </group>

        {/* Red & Gold Silk Ribbon fluttering from Damru */}
        <mesh position={[-0.03, 0.65, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.016, 0.18, 0.004]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        <mesh position={[-0.02, 0.62, 0.01]} rotation={[0.15, 0, -0.1]}>
          <boxGeometry args={[0.012, 0.14, 0.004]} />
          <meshStandardMaterial color="#e5b83b" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Trident Base Collar (Ornate Gold) */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.026, 0.08, 16]} />
          <meshStandardMaterial
            color="#ffd700"
            roughness={0.2}
            metalness={0.92}
          />
        </mesh>

        {/* Crossbar Connector */}
        <mesh position={[0, 0.91, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.24, 14]} />
          <meshStandardMaterial
            color="#ffd700"
            roughness={0.2}
            metalness={0.92}
          />
        </mesh>

        {/* Center Main Blade (Gleaming celestial gold & steel) */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <coneGeometry args={[0.036, 0.42, 4]} />
          <meshStandardMaterial
            color="#fef08a"
            roughness={0.12}
            metalness={0.95}
            emissive="#d4af37"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Left Curved Outer Prong */}
        <group position={[-0.105, 1.05, 0]} rotation={[0, 0, 0.24]}>
          <mesh castShadow>
            <coneGeometry args={[0.028, 0.32, 4]} />
            <meshStandardMaterial
              color="#fef08a"
              roughness={0.12}
              metalness={0.95}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Right Curved Outer Prong */}
        <group position={[0.105, 1.05, 0]} rotation={[0, 0, -0.24]}>
          <mesh castShadow>
            <coneGeometry args={[0.028, 0.32, 4]} />
            <meshStandardMaterial
              color="#fef08a"
              roughness={0.12}
              metalness={0.95}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Subtle Celestial Aura Glow on Blades */}
        <pointLight
          position={[0, 1.1, 0.08]}
          color="#fef08a"
          intensity={0.9}
          distance={2.0}
          decay={2}
        />
      </group>
    </group>
  );
}
