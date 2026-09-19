/**
 * TrishulProjectile - Active 3D thrown projectile with realistic trajectory physics,
 * gravity arc, tip alignment, golden particle trail, and collision detection against
 * Ganesha's sacred hit box and the Mount Kailash environment.
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrishulProjectileProps {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  targetCenter: THREE.Vector3;
  targetRadius: number;
  onHit: (hitPoint: THREE.Vector3) => void;
  onMiss: (missPoint: THREE.Vector3) => void;
  onPositionUpdate?: (pos: THREE.Vector3, velocity: THREE.Vector3) => void;
}

export function TrishulProjectile({
  origin,
  direction,
  targetCenter,
  targetRadius,
  onHit,
  onMiss,
  onPositionUpdate,
}: TrishulProjectileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  // Trajectory state
  const pos = useRef(origin.clone());
  const initialSpeed = 14.5; // m/s (gives a smooth cinematic ~0.85-0.95s flight across ~11-12m distance)
  const vel = useRef(direction.clone().multiplyScalar(initialSpeed));
  const gravity = -1.0; // Subtle mythic elevation maintaining straight heroic flight
  const hasCollided = useRef(false);
  const roll = useRef(0);

  // Initialize position and orientation
  useEffect(() => {
    pos.current.copy(origin);
    vel.current.copy(direction.clone().multiplyScalar(initialSpeed));
    hasCollided.current = false;
  }, [origin, direction]);

  useFrame((state, delta) => {
    if (hasCollided.current || !groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    const prevPos = pos.current.clone();

    // 1. Update Physics
    vel.current.y += gravity * dt;
    pos.current.addScaledVector(vel.current, dt);

    // 2. Align weapon to face velocity vector (pointed forward)
    const forwardDir = vel.current.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);

    // Rotation matrix from default weapon axis (0, 1, 0) to velocity vector
    const targetQuaternion = new THREE.Quaternion();

    // The Trishul model points along +Y; rotate +Y to forwardDir
    targetQuaternion.setFromUnitVectors(up, forwardDir);

    // Spin slightly along longitudinal axis for divine stability
    roll.current += dt * 6.0;
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(forwardDir, roll.current);
    targetQuaternion.premultiply(rollQuat);

    groupRef.current.position.copy(pos.current);
    groupRef.current.quaternion.copy(targetQuaternion);

    // Provide projectile telemetry to parent camera system
    if (onPositionUpdate) {
      onPositionUpdate(pos.current, vel.current);
    }

    // 3. Collision Detection against Ganesha's Sacred Hit Sphere
    // Test shortest distance from line segment [prevPos, pos] to targetCenter
    const segment = new THREE.Line3(prevPos, pos.current);
    const closestPoint = new THREE.Vector3();
    segment.closestPointToPoint(targetCenter, true, closestPoint);
    const distToTarget = closestPoint.distanceTo(targetCenter);

    if (distToTarget <= targetRadius) {
      hasCollided.current = true;
      onHit(closestPoint);
      return;
    }

    // 4. Collision Detection against Mount Kailash Environment
    // Ground collision
    if (pos.current.y <= 0.12) {
      hasCollided.current = true;
      onMiss(pos.current.clone());
      return;
    }

    // Back stone portal / temple rear wall collision
    if (pos.current.z <= -9.2) {
      hasCollided.current = true;
      onMiss(pos.current.clone());
      return;
    }

    // Flanking cliff rock collision
    if (Math.abs(pos.current.x) >= 3.6 && pos.current.z <= 0) {
      hasCollided.current = true;
      onMiss(pos.current.clone());
      return;
    }

    // Max range safety
    if (pos.current.distanceTo(origin) > 36) {
      hasCollided.current = true;
      onMiss(pos.current.clone());
      return;
    }

    // Update trail particles
    if (trailRef.current) {
      trailRef.current.rotation.y = state.clock.getElapsedTime() * 4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ─── The Thrown Trishul Model ─── */}
      <group scale={[0.85, 0.85, 0.85]}>
        {/* Shaft */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.02, 1.8, 12]} />
          <meshStandardMaterial color="#2d2825" roughness={0.35} metalness={0.85} />
        </mesh>

        {/* Golden Cuffs */}
        {[-0.8, -0.2, 0.3].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.03, 12]} />
            <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.9} />
          </mesh>
        ))}

        {/* Sacred Damru */}
        <group position={[0.035, 0.38, 0]} rotation={[0, 0, 0.4]}>
          <mesh position={[0, 0.025, 0]}>
            <coneGeometry args={[0.034, 0.045, 10]} />
            <meshStandardMaterial color="#5c2e14" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.025, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.034, 0.045, 10]} />
            <meshStandardMaterial color="#5c2e14" roughness={0.6} />
          </mesh>
        </group>

        {/* Trident Collar */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.034, 0.024, 0.07, 14]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* Crossbar */}
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.22, 12]} />
          <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.92} />
        </mesh>

        {/* Center Golden Blade */}
        <mesh position={[0, 0.74, 0]} castShadow>
          <coneGeometry args={[0.032, 0.38, 4]} />
          <meshStandardMaterial
            color="#fffbeb"
            roughness={0.1}
            metalness={0.95}
            emissive="#f59e0b"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Left Prong */}
        <group position={[-0.095, 0.68, 0]} rotation={[0, 0, 0.22]}>
          <mesh castShadow>
            <coneGeometry args={[0.024, 0.28, 4]} />
            <meshStandardMaterial
              color="#fffbeb"
              roughness={0.1}
              metalness={0.95}
              emissive="#f59e0b"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Right Prong */}
        <group position={[0.095, 0.68, 0]} rotation={[0, 0, -0.22]}>
          <mesh castShadow>
            <coneGeometry args={[0.024, 0.28, 4]} />
            <meshStandardMaterial
              color="#fffbeb"
              roughness={0.1}
              metalness={0.95}
              emissive="#f59e0b"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* ─── Celestial Radiance Point Light Traveling with Weapon ─── */}
        <pointLight
          position={[0, 0.75, 0]}
          color="#fde68a"
          intensity={2.2}
          distance={5.0}
          decay={2}
        />

        {/* ─── Glowing Energy Blade Core ─── */}
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}
