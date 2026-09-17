/**
 * Procedural 3D Character Builder
 * Creates stylized, charming characters from Three.js primitives.
 * No external GLB models needed — everything is code-generated.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Color Palettes ─────────────────────────────────────────────────
const CHILD_COLORS = {
  skin: '#e8b88a',
  hair: '#2c1810',
  kurta: '#ff7733',        // Bright saffron kurta
  kurtaAccent: '#e05520',
  pants: '#4a3728',
  shoes: '#5c3a20',
  eyes: '#1a0e05',
  mouth: '#c4756a',
};

const DADA_COLORS = {
  skin: '#d4a574',
  hair: '#d4d0cc',          // White-grey hair
  kurta: '#f5edd6',          // Cream/off-white kurta
  kurtaAccent: '#e8dcc0',
  dhoti: '#f0e8d0',
  shoes: '#6b4f3a',
  eyes: '#2a1a0a',
  glasses: '#8b7355',
  mouth: '#b8756e',
};

const ADULT_COLORS = {
  skin: '#e5b182',
  hair: '#1c1512',           // Dark stylish modern haircut
  kurta: '#1d3557',          // Modern deep indigo/navy kurta
  kurtaAccent: '#457b9d',    // Subtle teal trim
  pants: '#383d47',          // Charcoal modern trousers
  shoes: '#2e1f14',          // Casual leather shoes
  eyes: '#1a0e05',
  mouth: '#be746b',
  watch: '#d4af37',          // Gold wrist watch
};

// ─── Shared geometry helpers ────────────────────────────────────────
function createMaterial(color: string, opts?: { emissive?: string; roughness?: number }) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts?.roughness ?? 0.7,
    metalness: 0.05,
    emissive: opts?.emissive ?? '#000000',
    emissiveIntensity: opts?.emissive ? 0.15 : 0,
  });
}

// ─── Character Component Interfaces ──────────────────────────────────
export interface CharacterProps {
  speed?: number;
  isRunning?: boolean;
  isSitting?: boolean;
  isTalking?: boolean;
  isWorking?: boolean;
}

export function ChildCharacter({ speed = 0, isRunning = false, isSitting = false }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => ({
    skin: createMaterial(CHILD_COLORS.skin),
    hair: createMaterial(CHILD_COLORS.hair),
    kurta: createMaterial(CHILD_COLORS.kurta, { emissive: '#331100' }),
    kurtaAccent: createMaterial(CHILD_COLORS.kurtaAccent),
    pants: createMaterial(CHILD_COLORS.pants),
    shoes: createMaterial(CHILD_COLORS.shoes),
    eyes: createMaterial(CHILD_COLORS.eyes, { roughness: 0.3 }),
    mouth: createMaterial(CHILD_COLORS.mouth),
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const walkCycle = t * (isRunning ? 10 : 6.5);
    const isWalking = speed > 0.2;

    if (isSitting) {
      // ─── Sitting pose ───
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.2;
        leftLegRef.current.position.z = 0.04;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.2;
        rightLegRef.current.position.z = 0.04;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.3;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.3;
        rightArmRef.current.rotation.z = -0.1;
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.12;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 0.5) * 0.04;
      }
      return;
    }

    if (isWalking) {
      // ─── Walking animation ───
      const swing = Math.sin(walkCycle) * (isRunning ? 0.6 : 0.4);
      const armSwing = Math.sin(walkCycle) * (isRunning ? 0.55 : 0.35);

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      // Body bob
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.018;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.03;
      }
      // Head stability with slight bob
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.025;
      }
    } else {
      // ─── Idle animation: gentle breathing ───
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 1.2) * 0.03;
        leftArmRef.current.rotation.z = 0.12;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 1.2 + 0.5) * 0.03;
        rightArmRef.current.rotation.z = -0.12;
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.5) * 0.006;
        bodyRef.current.rotation.z = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;
        headRef.current.rotation.x = Math.sin(t * 0.7) * 0.03;
      }
    }
  });

  // Character total height: ~1.15m (child-sized)
  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* ─── TORSO (Saffron Kurta) ─── */}
        <mesh position={[0, 0.62, 0]} material={materials.kurta} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 0.22, 8, 16]} />
        </mesh>
        {/* Kurta lower flare */}
        <mesh position={[0, 0.48, 0]} material={materials.kurta} castShadow>
          <cylinderGeometry args={[0.11, 0.14, 0.1, 12]} />
        </mesh>
        {/* Kurta collar / neckline accent */}
        <mesh position={[0, 0.76, 0]} material={materials.kurtaAccent} castShadow>
          <cylinderGeometry args={[0.065, 0.08, 0.04, 12]} />
        </mesh>

        {/* ─── HEAD ─── */}
        <group ref={headRef} position={[0, 0.88, 0]}>
          {/* Head sphere */}
          <mesh material={materials.skin} castShadow receiveShadow>
            <sphereGeometry args={[0.11, 16, 14]} />
          </mesh>
          {/* Hair cap */}
          <mesh position={[0, 0.035, -0.01]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.112, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Left eye */}
          <mesh position={[-0.04, 0.01, 0.095]} material={materials.eyes}>
            <sphereGeometry args={[0.016, 8, 8]} />
          </mesh>
          {/* Right eye */}
          <mesh position={[0.04, 0.01, 0.095]} material={materials.eyes}>
            <sphereGeometry args={[0.016, 8, 8]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.01, 0.1]} material={materials.skin}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>
          {/* Mouth (small smile line) */}
          <mesh position={[0, -0.035, 0.098]} material={materials.mouth}>
            <boxGeometry args={[0.03, 0.005, 0.005]} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.105, -0.005, 0]} material={materials.skin}>
            <sphereGeometry args={[0.02, 6, 6]} />
          </mesh>
          <mesh position={[0.105, -0.005, 0]} material={materials.skin}>
            <sphereGeometry args={[0.02, 6, 6]} />
          </mesh>
        </group>

        {/* ─── ARMS ─── */}
        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.155, 0.68, 0]}>
          {/* Upper arm (skin) */}
          <mesh position={[0, -0.08, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.032, 0.08, 6, 8]} />
          </mesh>
          {/* Forearm (skin) */}
          <mesh position={[0, -0.19, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.028, 0.08, 6, 8]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.26, 0]} material={materials.skin}>
            <sphereGeometry args={[0.025, 6, 6]} />
          </mesh>
        </group>
        {/* Right arm */}
        <group ref={rightArmRef} position={[0.155, 0.68, 0]}>
          <mesh position={[0, -0.08, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.032, 0.08, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.19, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.028, 0.08, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.26, 0]} material={materials.skin}>
            <sphereGeometry args={[0.025, 6, 6]} />
          </mesh>
        </group>

        {/* ─── LEGS ─── */}
        {/* Left leg */}
        <group ref={leftLegRef} position={[-0.055, 0.42, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.08, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.042, 0.1, 6, 8]} />
          </mesh>
          {/* Shin */}
          <mesh position={[0, -0.2, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.035, 0.1, 6, 8]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.3, 0.015]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.055, 0.03, 0.08]} />
          </mesh>
        </group>
        {/* Right leg */}
        <group ref={rightLegRef} position={[0.055, 0.42, 0]}>
          <mesh position={[0, -0.08, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.042, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.035, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.3, 0.015]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.055, 0.03, 0.08]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}


// ─── Old Man (Dada) Character Component ─────────────────────────────
export function DadaCharacter({ speed = 0, isSitting = false, isTalking = false }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => ({
    skin: createMaterial(DADA_COLORS.skin),
    hair: createMaterial(DADA_COLORS.hair),
    kurta: createMaterial(DADA_COLORS.kurta),
    kurtaAccent: createMaterial(DADA_COLORS.kurtaAccent),
    dhoti: createMaterial(DADA_COLORS.dhoti),
    shoes: createMaterial(DADA_COLORS.shoes),
    eyes: createMaterial(DADA_COLORS.eyes, { roughness: 0.3 }),
    glasses: createMaterial(DADA_COLORS.glasses, { roughness: 0.2 }),
    mouth: createMaterial(DADA_COLORS.mouth),
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const walkCycle = t * 4.5; // Slower, elder pace
    const isWalking = speed > 0.15;

    if (isSitting) {
      // ─── Sitting pose ───
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.2;
        leftLegRef.current.position.z = 0.06;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.2;
        rightLegRef.current.position.z = 0.06;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = isTalking ? Math.sin(t * 2.5) * 0.2 - 0.2 : -0.25;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = isTalking ? Math.sin(t * 3) * 0.15 - 0.15 : -0.2;
        rightArmRef.current.rotation.z = -0.1;
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.15;
      }
      if (headRef.current) {
        headRef.current.rotation.x = isTalking ? Math.sin(t * 2) * 0.06 : Math.sin(t * 0.5) * 0.03;
        headRef.current.rotation.y = isTalking ? Math.sin(t * 1.5) * 0.08 : Math.sin(t * 0.3) * 0.04;
      }
      return;
    }

    if (isWalking) {
      // ─── Walking (slower, elderly gait) ───
      const swing = Math.sin(walkCycle) * 0.3;
      const armSwing = Math.sin(walkCycle) * 0.2;

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.012;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.02;
        bodyRef.current.rotation.x = 0.05; // Slight forward lean
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.04; // Compensate lean
      }
    } else {
      // ─── Idle / Standing talk ───
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.92;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.92;

      if (isTalking) {
        // Expressive talk gestures
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.18 - 0.05;
          leftArmRef.current.rotation.z = 0.15 + Math.sin(t * 1.8) * 0.05;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.8 + 1) * 0.22 - 0.08;
          rightArmRef.current.rotation.z = -0.15 - Math.sin(t * 2) * 0.05;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 1.4) * 0.1;
          headRef.current.rotation.x = Math.sin(t * 2) * 0.05;
        }
      } else {
        // Peaceful idle
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.03;
          leftArmRef.current.rotation.z = 0.15;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 0.8 + 0.5) * 0.03;
          rightArmRef.current.rotation.z = -0.15;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
          headRef.current.rotation.x = Math.sin(t * 0.5) * 0.025;
        }
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.0) * 0.004;
        bodyRef.current.rotation.z = 0;
        bodyRef.current.rotation.x = 0.02; // Slight natural hunch
      }
    }
  });

  // Character total height: ~1.65m (adult grandfather)
  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* ─── TORSO (Cream Kurta) ─── */}
        <mesh position={[0, 0.88, 0]} material={materials.kurta} castShadow receiveShadow>
          <capsuleGeometry args={[0.15, 0.32, 8, 16]} />
        </mesh>
        {/* Kurta lower drape */}
        <mesh position={[0, 0.66, 0]} material={materials.kurta} castShadow>
          <cylinderGeometry args={[0.14, 0.17, 0.12, 12]} />
        </mesh>
        {/* Collar / nehru band */}
        <mesh position={[0, 1.08, 0]} material={materials.kurtaAccent} castShadow>
          <cylinderGeometry args={[0.078, 0.09, 0.04, 12]} />
        </mesh>

        {/* ─── HEAD ─── */}
        <group ref={headRef} position={[0, 1.22, 0]}>
          {/* Head sphere */}
          <mesh material={materials.skin} castShadow receiveShadow>
            <sphereGeometry args={[0.12, 16, 14]} />
          </mesh>
          {/* White/grey hair */}
          <mesh position={[0, 0.04, -0.01]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.122, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>
          {/* Beard/jawline */}
          <mesh position={[0, -0.06, 0.04]} material={materials.hair}>
            <sphereGeometry args={[0.07, 10, 8, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5]} />
          </mesh>
          {/* Left eye */}
          <mesh position={[-0.042, 0.015, 0.105]} material={materials.eyes}>
            <sphereGeometry args={[0.014, 8, 8]} />
          </mesh>
          {/* Right eye */}
          <mesh position={[0.042, 0.015, 0.105]} material={materials.eyes}>
            <sphereGeometry args={[0.014, 8, 8]} />
          </mesh>
          {/* Glasses frame (simple circles) */}
          <mesh position={[-0.042, 0.015, 0.11]} material={materials.glasses}>
            <torusGeometry args={[0.022, 0.003, 6, 16]} />
          </mesh>
          <mesh position={[0.042, 0.015, 0.11]} material={materials.glasses}>
            <torusGeometry args={[0.022, 0.003, 6, 16]} />
          </mesh>
          {/* Glasses bridge */}
          <mesh position={[0, 0.015, 0.115]} material={materials.glasses}>
            <boxGeometry args={[0.04, 0.003, 0.003]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.005, 0.115]} material={materials.skin}>
            <sphereGeometry args={[0.015, 6, 6]} />
          </mesh>
          {/* Mouth */}
          <mesh position={[0, -0.04, 0.108]} material={materials.mouth}>
            <boxGeometry args={[0.032, 0.005, 0.005]} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.115, 0, 0]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
          <mesh position={[0.115, 0, 0]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
        </group>

        {/* ─── ARMS ─── */}
        <group ref={leftArmRef} position={[-0.19, 0.98, 0]}>
          <mesh position={[0, -0.1, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.038, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.24, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.032, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.33, 0]} material={materials.skin}>
            <sphereGeometry args={[0.028, 6, 6]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.19, 0.98, 0]}>
          <mesh position={[0, -0.1, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.038, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.24, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.032, 0.1, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.33, 0]} material={materials.skin}>
            <sphereGeometry args={[0.028, 6, 6]} />
          </mesh>
        </group>

        {/* ─── LEGS (Dhoti) ─── */}
        <group ref={leftLegRef} position={[-0.065, 0.58, 0]}>
          <mesh position={[0, -0.1, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.05, 0.14, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.27, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.042, 0.12, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.38, 0.02]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.065, 0.035, 0.095]} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.065, 0.58, 0]}>
          <mesh position={[0, -0.1, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.05, 0.14, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.27, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.042, 0.12, 6, 8]} />
          </mesh>
          <mesh position={[0, -0.38, 0.02]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.065, 0.035, 0.095]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Young Adult Protagonist Character (Vinay - Grown Up) ───────────
export function AdultCharacter({
  speed = 0,
  isRunning = false,
  isSitting = false,
  isTalking = false,
  isWorking = false,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const materials = useMemo(
    () => ({
      skin: createMaterial(ADULT_COLORS.skin),
      hair: createMaterial(ADULT_COLORS.hair, { roughness: 0.5 }),
      kurta: createMaterial(ADULT_COLORS.kurta, { emissive: '#0a192f' }),
      kurtaAccent: createMaterial(ADULT_COLORS.kurtaAccent),
      pants: createMaterial(ADULT_COLORS.pants, { roughness: 0.75 }),
      shoes: createMaterial(ADULT_COLORS.shoes, { roughness: 0.4 }),
      eyes: createMaterial(ADULT_COLORS.eyes, { roughness: 0.25 }),
      mouth: createMaterial(ADULT_COLORS.mouth),
      watch: createMaterial(ADULT_COLORS.watch, { roughness: 0.3 }),
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const walkCycle = t * (isRunning ? 11 : 7.2);
    const isWalking = speed > 0.2;

    if (isSitting) {
      // Sitting at desk or sofa
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.15;
        leftLegRef.current.position.z = 0.08;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.15;
        rightLegRef.current.position.z = 0.08;
      }
      if (isWorking) {
        // Typing / game developing pose
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 8) * 0.04;
          leftArmRef.current.rotation.y = 0.25;
          leftArmRef.current.rotation.z = 0.15;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.75 + Math.cos(t * 8.5) * 0.04;
          rightArmRef.current.rotation.y = -0.25;
          rightArmRef.current.rotation.z = -0.15;
        }
        if (headRef.current) {
          headRef.current.rotation.x = 0.18 + Math.sin(t * 1.5) * 0.02; // Attentive focus on screen
          headRef.current.rotation.y = Math.sin(t * 0.8) * 0.04;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.35;
          leftArmRef.current.rotation.z = 0.12;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.35;
          rightArmRef.current.rotation.z = -0.12;
        }
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 0.6) * 0.03;
        }
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.22;
        bodyRef.current.rotation.x = isWorking ? 0.08 : 0;
      }
      return;
    }

    if (isWalking) {
      // Dynamic adult stride
      const stride = Math.sin(walkCycle) * (isRunning ? 0.68 : 0.44);
      const armSwing = Math.sin(walkCycle) * (isRunning ? 0.62 : 0.4);

      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.022;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.025;
        bodyRef.current.rotation.x = isRunning ? 0.1 : 0.02;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.02;
      }
    } else {
      // Confident young adult idle
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.88;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.88;

      if (isTalking) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.4) * 0.22 - 0.2;
          leftArmRef.current.rotation.z = 0.18;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.8 + 1) * 0.18 - 0.15;
          rightArmRef.current.rotation.z = -0.18;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 1.8) * 0.08;
          headRef.current.rotation.x = Math.sin(t * 2) * 0.04;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 1.1) * 0.035;
          leftArmRef.current.rotation.z = 0.12;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 1.1 + 0.4) * 0.035;
          rightArmRef.current.rotation.z = -0.12;
        }
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 0.7) * 0.02;
          headRef.current.rotation.y = Math.sin(t * 0.4) * 0.03;
        }
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.2) * 0.006;
        bodyRef.current.rotation.z = 0;
        bodyRef.current.rotation.x = 0;
      }
    }
  });

  // Adult height: ~1.72m with realistic adult proportions
  return (
    <group ref={groupRef} dispose={null}>
      <group ref={bodyRef}>
        {/* ─── HIPS & TORSO ─── */}
        {/* Pelvis */}
        <mesh position={[0, 0.86, 0]} material={materials.pants} castShadow>
          <capsuleGeometry args={[0.13, 0.08, 8, 12]} />
        </mesh>
        {/* Modern Kurta Body */}
        <mesh position={[0, 1.14, 0]} material={materials.kurta} castShadow>
          <cylinderGeometry args={[0.165, 0.185, 0.52, 16]} />
        </mesh>
        {/* Kurta Placket & Collar */}
        <mesh position={[0, 1.25, 0.166]} material={materials.kurtaAccent}>
          <boxGeometry args={[0.028, 0.22, 0.008]} />
        </mesh>
        <mesh position={[0, 1.38, 0.03]} material={materials.kurtaAccent}>
          <torusGeometry args={[0.075, 0.015, 6, 16]} />
        </mesh>

        {/* ─── HEAD & HAIR ─── */}
        <group ref={headRef} position={[0, 1.45, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.02, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.048, 0.056, 0.09, 12]} />
          </mesh>
          {/* Face */}
          <mesh position={[0, 0.09, 0]} material={materials.skin} castShadow>
            <sphereGeometry args={[0.115, 18, 16]} />
          </mesh>
          {/* Stylish modern textured hair */}
          <mesh position={[0, 0.145, -0.01]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Hair fringe / pompadour volume */}
          <mesh position={[0, 0.18, 0.045]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.065, 12, 8]} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.042, 0.1, 0.102]} material={materials.eyes}>
            <sphereGeometry args={[0.013, 8, 8]} />
          </mesh>
          <mesh position={[0.042, 0.1, 0.102]} material={materials.eyes}>
            <sphereGeometry args={[0.013, 8, 8]} />
          </mesh>
          {/* Eyebrows */}
          <mesh position={[-0.042, 0.125, 0.104]} material={materials.hair}>
            <boxGeometry args={[0.03, 0.007, 0.01]} />
          </mesh>
          <mesh position={[0.042, 0.125, 0.104]} material={materials.hair}>
            <boxGeometry args={[0.03, 0.007, 0.01]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, 0.08, 0.114]} material={materials.skin}>
            <coneGeometry args={[0.018, 0.035, 6]} />
          </mesh>
          {/* Warm smile */}
          <mesh position={[0, 0.045, 0.108]} material={materials.mouth}>
            <boxGeometry args={[0.036, 0.006, 0.006]} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.115, 0.08, 0]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
          <mesh position={[0.115, 0.08, 0]} material={materials.skin}>
            <sphereGeometry args={[0.022, 6, 6]} />
          </mesh>
        </group>

        {/* ─── ARMS ─── */}
        <group ref={leftArmRef} position={[-0.21, 1.34, 0]}>
          {/* Upper sleeve */}
          <mesh position={[0, -0.11, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.044, 0.13, 8, 10]} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.27, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.036, 0.14, 8, 10]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.38, 0]} material={materials.skin}>
            <sphereGeometry args={[0.03, 8, 8]} />
          </mesh>
          {/* Wrist watch */}
          <mesh position={[0, -0.34, 0]} material={materials.watch}>
            <torusGeometry args={[0.038, 0.008, 6, 12]} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.21, 1.34, 0]}>
          {/* Upper sleeve */}
          <mesh position={[0, -0.11, 0]} material={materials.kurta} castShadow>
            <capsuleGeometry args={[0.044, 0.13, 8, 10]} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.27, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.036, 0.14, 8, 10]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.38, 0]} material={materials.skin}>
            <sphereGeometry args={[0.03, 8, 8]} />
          </mesh>
        </group>

        {/* ─── LEGS & SHOES ─── */}
        <group ref={leftLegRef} position={[-0.085, 0.82, 0]}>
          {/* Thigh in modern trousers */}
          <mesh position={[0, -0.17, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 8, 10]} />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.44, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 8, 10]} />
          </mesh>
          {/* Leather shoe / loafer */}
          <mesh position={[0, -0.62, 0.035]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.075, 0.05, 0.16]} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.085, 0.82, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.17, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 8, 10]} />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.44, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 8, 10]} />
          </mesh>
          {/* Leather shoe / loafer */}
          <mesh position={[0, -0.62, 0.035]} material={materials.shoes} castShadow>
            <boxGeometry args={[0.075, 0.05, 0.16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
