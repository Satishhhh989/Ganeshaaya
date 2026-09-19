/**
 * Procedural 3D Character Builder
 * Creates stylized, charming characters from Three.js primitives.
 * No external GLB models needed — everything is code-generated.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStateStore } from '../core/GameState';
import type { PlayerMotionState } from '../core/GameState';

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
  skin: '#ba825a',           // Warm, dignified elder Indian skin tone
  skinShadow: '#9c6a46',     // Subtle wrinkle/shadow tone
  hair: '#d4cfc8',           // Soft silver-grey elder hair
  hairDark: '#857e76',       // Salt & pepper depth
  eyebrow: '#7d7770',        // Gentle elder eyebrows
  eyes: '#1e1008',           // Warm dark brown eyes
  eyeSparkle: '#ffffff',     // Living eye reflection
  moustache: '#b8b2aa',      // Dignified grey moustache
  mouth: '#a8655c',          // Warm gentle smile
  kurta: '#fbf8f0',          // Pristine handloom off-white cotton kurta
  kurtaTrim: '#ede7db',      // Subtle cream collar and hem trim
  kurtaButton: '#fffdfa',    // Pearl buttons
  dhoti: '#f0ece3',          // Soft draped traditional dhoti
  dhotiBorder: '#d8cfbf',    // Subtle dhoti fold line
  sandalLeather: '#4e2d19',  // Handcrafted Indian leather chappal
  sandalSole: '#28170c',     // Sandal sole
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
  motionState?: PlayerMotionState;
  isPraying?: boolean;
  isCarrying?: boolean;
  isInteracting?: boolean;
}

export function ChildCharacter({ speed = 0, isRunning = false, isSitting = false, isTalking = false }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
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

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const motion = gameStateStore.playerMotion;
    const currentVel = Math.abs(motion.velocity) > 0.05 ? motion.velocity : Math.abs(speed);
    const isWalking = (currentVel > 0.12 || motion.state === 'CINEMATIC_WALK') && motion.state !== 'PRAY';
    const walkCycle = t * (isRunning ? 10 : 6.5);

    if (isSitting) {
      // ─── Sitting pose: Hips ON cushion, knees bent 90° downward over sofa edge ───
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.05;
        leftLegRef.current.position.z = 0.05;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.05;
        rightLegRef.current.position.z = 0.05;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = Math.PI / 2.1;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = Math.PI / 2.1;
      }
      if (isTalking) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.12 - 0.35;
          leftArmRef.current.rotation.z = 0.15;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.6 + 0.8) * 0.12 - 0.35;
          rightArmRef.current.rotation.z = -0.15;
        }
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 1.8) * 0.04 - 0.06;
          headRef.current.rotation.y = Math.sin(t * 1.2) * 0.06 + 0.04;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.4;
          leftArmRef.current.rotation.z = 0.12;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.4;
          rightArmRef.current.rotation.z = -0.12;
        }
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 0.5) * 0.04 - 0.06;
        }
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.02; // Elevated onto the cushion surface, no sinking!
      }
      return;
    }

    if (isWalking) {
      // ─── Walking animation with natural knee articulation ───
      const swing = Math.sin(walkCycle) * (isRunning ? 0.6 : 0.4);
      const armSwing = Math.sin(walkCycle) * (isRunning ? 0.55 : 0.35);

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.55);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, swing * 0.55);
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
      // ─── Idle animation: gentle breathing & conversational gesture (firm snap to 0) ───
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0, 18, delta);
        if (Math.abs(leftLegRef.current.rotation.x) < 0.001) leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, 0, 18, delta);
        if (Math.abs(rightLegRef.current.rotation.x) < 0.001) rightLegRef.current.rotation.x = 0;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = THREE.MathUtils.damp(leftKneeRef.current.rotation.x, 0, 18, delta);
        if (Math.abs(leftKneeRef.current.rotation.x) < 0.001) leftKneeRef.current.rotation.x = 0;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = THREE.MathUtils.damp(rightKneeRef.current.rotation.x, 0, 18, delta);
        if (Math.abs(rightKneeRef.current.rotation.x) < 0.001) rightKneeRef.current.rotation.x = 0;
      }

      if (isTalking) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.4) * 0.14 - 0.12;
          leftArmRef.current.rotation.z = 0.16;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.8 + 0.6) * 0.14 - 0.12;
          rightArmRef.current.rotation.z = -0.16;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
          headRef.current.rotation.x = Math.sin(t * 2.2) * 0.04 - 0.04;
        }
      } else {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 1.2) * 0.03;
          leftArmRef.current.rotation.z = 0.12;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 1.2 + 0.5) * 0.03;
          rightArmRef.current.rotation.z = -0.12;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;
          headRef.current.rotation.x = Math.sin(t * 0.7) * 0.03;
        }
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.5) * 0.006;
        bodyRef.current.rotation.z = 0;
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
          <mesh position={[0, -0.06, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.04, 0.08, 6, 8]} />
          </mesh>
          {/* Knee joint & lower leg */}
          <group ref={leftKneeRef} position={[0, -0.12, 0]}>
            {/* Shin */}
            <mesh position={[0, -0.08, 0]} material={materials.pants} castShadow>
              <capsuleGeometry args={[0.034, 0.08, 6, 8]} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, -0.18, 0.015]} material={materials.shoes} castShadow>
              <boxGeometry args={[0.055, 0.03, 0.08]} />
            </mesh>
          </group>
        </group>
        {/* Right leg */}
        <group ref={rightLegRef} position={[0.055, 0.42, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.06, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.04, 0.08, 6, 8]} />
          </mesh>
          {/* Knee joint & lower leg */}
          <group ref={rightKneeRef} position={[0, -0.12, 0]}>
            {/* Shin */}
            <mesh position={[0, -0.08, 0]} material={materials.pants} castShadow>
              <capsuleGeometry args={[0.034, 0.08, 6, 8]} />
            </mesh>
            {/* Shoe */}
            <mesh position={[0, -0.18, 0.015]} material={materials.shoes} castShadow>
              <boxGeometry args={[0.055, 0.03, 0.08]} />
            </mesh>
          </group>
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
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => ({
    skin: createMaterial(DADA_COLORS.skin, { roughness: 0.65 }),
    skinShadow: createMaterial(DADA_COLORS.skinShadow, { roughness: 0.72 }),
    hair: createMaterial(DADA_COLORS.hair, { roughness: 0.85 }),
    hairDark: createMaterial(DADA_COLORS.hairDark, { roughness: 0.88 }),
    eyebrow: createMaterial(DADA_COLORS.eyebrow, { roughness: 0.85 }),
    eyes: createMaterial(DADA_COLORS.eyes, { roughness: 0.25 }),
    eyeSparkle: createMaterial(DADA_COLORS.eyeSparkle, { roughness: 0.1 }),
    moustache: createMaterial(DADA_COLORS.moustache, { roughness: 0.82 }),
    mouth: createMaterial(DADA_COLORS.mouth, { roughness: 0.65 }),
    kurta: createMaterial(DADA_COLORS.kurta, { roughness: 0.78 }),
    kurtaTrim: createMaterial(DADA_COLORS.kurtaTrim, { roughness: 0.75 }),
    kurtaButton: createMaterial(DADA_COLORS.kurtaButton, { roughness: 0.3 }),
    dhoti: createMaterial(DADA_COLORS.dhoti, { roughness: 0.82 }),
    dhotiBorder: createMaterial(DADA_COLORS.dhotiBorder, { roughness: 0.82 }),
    sandalLeather: createMaterial(DADA_COLORS.sandalLeather, { roughness: 0.6 }),
    sandalSole: createMaterial(DADA_COLORS.sandalSole, { roughness: 0.7 }),
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const walkCycle = t * 4.2; // Dignified elder gait
    const isWalking = speed > 0.15;

    if (isSitting) {
      // ─── Sitting pose: Hips resting on sofa cushion, knees bent downward 90° ───
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.05;
        leftLegRef.current.position.z = 0.05;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.05;
        rightLegRef.current.position.z = 0.05;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = Math.PI / 2.1;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = Math.PI / 2.1;
      }

      if (isTalking) {
        // Expressive grandfatherly storytelling gestures while seated
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.18 - 0.35;
          leftArmRef.current.rotation.z = 0.16 + Math.sin(t * 1.8) * 0.04;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.6 + 0.8) * 0.22 - 0.35;
          rightArmRef.current.rotation.z = -0.16 - Math.sin(t * 2.1) * 0.04;
        }
      } else {
        // Peaceful hands resting naturally on lap / thighs
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.42;
          leftArmRef.current.rotation.z = 0.14;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.42;
          rightArmRef.current.rotation.z = -0.14;
        }
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = 0.02;
        bodyRef.current.rotation.x = 0.02;
      }
      if (headRef.current) {
        headRef.current.rotation.x = isTalking ? Math.sin(t * 2.0) * 0.05 : Math.sin(t * 0.6) * 0.025;
        headRef.current.rotation.y = isTalking ? Math.sin(t * 1.4) * 0.08 + 0.06 : Math.sin(t * 0.4) * 0.03 + 0.06;
      }
      return;
    }

    if (isWalking) {
      // ─── Walking: smooth elderly gait with natural knee articulation ───
      const swing = Math.sin(walkCycle) * 0.32;
      const armSwing = Math.sin(walkCycle) * 0.22;

      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.55);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, swing * 0.55);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -armSwing;
        leftArmRef.current.rotation.z = -0.09;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = armSwing;
        rightArmRef.current.rotation.z = 0.09;
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.012;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.02;
        bodyRef.current.rotation.x = 0.04; // Natural elder forward lean
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.03;
      }
    } else {
      // ─── Idle / Standing conversational presence ───
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.92;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.92;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x *= 0.92;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x *= 0.92;

      if (isTalking) {
        // Expressive storytelling gestures with open, warm stance
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.18 - 0.05;
          leftArmRef.current.rotation.z = -0.16 + Math.sin(t * 1.8) * 0.04;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 2.8 + 1) * 0.22 - 0.08;
          rightArmRef.current.rotation.z = 0.16 - Math.sin(t * 2) * 0.04;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 1.4) * 0.08;
          headRef.current.rotation.x = Math.sin(t * 2) * 0.04;
        }
      } else {
        // Peaceful, warm standing idle with natural arm clearance
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(t * 0.9) * 0.03;
          leftArmRef.current.rotation.z = -0.10;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(t * 0.9 + 0.6) * 0.03;
          rightArmRef.current.rotation.z = 0.10;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.35) * 0.04;
          headRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
        }
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.1) * 0.005;
        bodyRef.current.rotation.z = 0;
        bodyRef.current.rotation.x = 0.02;
      }
    }
  });

  // Character total height: ~1.65m (authentic grandfather proportions)
  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* ─── UPPER TORSO & KURTA (Smooth, contoured, no boxy edges) ─── */}
        {/* Main Kurta Torso - tailored dignified grandfather silhouette */}
        <mesh position={[0, 1.05, 0]} material={materials.kurta} castShadow receiveShadow>
          <cylinderGeometry args={[0.155, 0.170, 0.38, 20]} />
        </mesh>
        {/* Gentle rounded shoulder yoke */}
        <mesh position={[0, 1.20, 0]} scale={[1.30, 1.0, 0.90]} material={materials.kurta} castShadow receiveShadow>
          <capsuleGeometry args={[0.115, 0.18, 10, 16]} />
        </mesh>
        {/* Soft left & right shoulder caps connecting naturally to arm sleeves */}
        <mesh position={[-0.215, 1.18, 0]} material={materials.kurta} castShadow>
          <sphereGeometry args={[0.062, 14, 12]} />
        </mesh>
        <mesh position={[0.215, 1.18, 0]} material={materials.kurta} castShadow>
          <sphereGeometry args={[0.062, 14, 12]} />
        </mesh>

        {/* Kurta Lower Skirt / Drapes hanging straight over dhoti toward knees */}
        <mesh position={[0, 0.72, 0]} material={materials.kurta} castShadow receiveShadow>
          <cylinderGeometry args={[0.170, 0.190, 0.32, 20]} />
        </mesh>

        {/* Clean Nehru / Mandarin Collar */}
        <mesh position={[0, 1.25, 0]} material={materials.kurtaTrim} castShadow>
          <cylinderGeometry args={[0.062, 0.072, 0.04, 18]} />
        </mesh>

        {/* Neat front placket & mother-of-pearl buttons */}
        <mesh position={[0, 1.10, 0.17]} material={materials.kurtaTrim}>
          <boxGeometry args={[0.024, 0.22, 0.006]} />
        </mesh>
        <mesh position={[0, 1.18, 0.174]} material={materials.kurtaButton}>
          <sphereGeometry args={[0.004, 8, 8]} />
        </mesh>
        <mesh position={[0, 1.11, 0.174]} material={materials.kurtaButton}>
          <sphereGeometry args={[0.004, 8, 8]} />
        </mesh>
        <mesh position={[0, 1.04, 0.174]} material={materials.kurtaButton}>
          <sphereGeometry args={[0.004, 8, 8]} />
        </mesh>

        {/* ─── NECK ─── */}
        <mesh position={[0, 1.28, 0]} material={materials.skin} castShadow>
          <cylinderGeometry args={[0.048, 0.056, 0.08, 16]} />
        </mesh>

        {/* ─── HEAD & EXPRESSIVE GRANDFATHER FACE ─── */}
        <group ref={headRef} position={[0, 1.40, 0.01]}>
          {/* Head cranium */}
          <mesh material={materials.skin} castShadow receiveShadow>
            <sphereGeometry args={[0.115, 20, 18]} />
          </mesh>

          {/* Receding elder hairline - Silver-grey hair naturally wrapping around temples & nape */}
          <mesh position={[0, 0.015, -0.02]} scale={[1.02, 0.98, 1.04]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.116, 20, 14, 0, Math.PI * 2, Math.PI * 0.22, Math.PI * 0.52]} />
          </mesh>
          {/* Temple hair fullness */}
          <mesh position={[-0.106, -0.005, -0.015]} scale={[0.75, 1.1, 1.0]} material={materials.hair}>
            <sphereGeometry args={[0.025, 10, 10]} />
          </mesh>
          <mesh position={[0.106, -0.005, -0.015]} scale={[0.75, 1.1, 1.0]} material={materials.hair}>
            <sphereGeometry args={[0.025, 10, 10]} />
          </mesh>

          {/* Warm, Kind Grandfather Eyes (clean, expressive, charming like Vinay's eyes) */}
          {/* Left eye */}
          <mesh position={[-0.042, 0.015, 0.104]} material={materials.eyes}>
            <sphereGeometry args={[0.013, 12, 12]} />
          </mesh>
          <mesh position={[-0.038, 0.019, 0.114]} material={materials.eyeSparkle}>
            <sphereGeometry args={[0.0035, 6, 6]} />
          </mesh>
          {/* Right eye */}
          <mesh position={[0.042, 0.015, 0.104]} material={materials.eyes}>
            <sphereGeometry args={[0.013, 12, 12]} />
          </mesh>
          <mesh position={[0.046, 0.019, 0.114]} material={materials.eyeSparkle}>
            <sphereGeometry args={[0.0035, 6, 6]} />
          </mesh>

          {/* Soft, gentle grey eyebrows curving with grandfatherly warmth */}
          <mesh position={[-0.044, 0.036, 0.104]} rotation={[0, 0, -0.14]} material={materials.eyebrow}>
            <capsuleGeometry args={[0.004, 0.022, 6, 8]} />
          </mesh>
          <mesh position={[0.044, 0.036, 0.104]} rotation={[0, 0, 0.14]} material={materials.eyebrow}>
            <capsuleGeometry args={[0.004, 0.022, 6, 8]} />
          </mesh>

          {/* Gentle elder laugh lines / eyelid crease */}
          <mesh position={[-0.042, 0.026, 0.106]} material={materials.skinShadow}>
            <boxGeometry args={[0.020, 0.003, 0.004]} />
          </mesh>
          <mesh position={[0.042, 0.026, 0.106]} material={materials.skinShadow}>
            <boxGeometry args={[0.020, 0.003, 0.004]} />
          </mesh>

          {/* Friendly, rounded Indian grandfather nose */}
          <mesh position={[0, -0.002, 0.114]} material={materials.skin}>
            <sphereGeometry args={[0.014, 10, 10]} />
          </mesh>

          {/* Dignified Indian Moustache (neat, curving softly over upper lip, NOT fangs) */}
          <mesh position={[0, -0.022, 0.112]} rotation={[0, 0, Math.PI / 2]} material={materials.moustache}>
            <capsuleGeometry args={[0.0085, 0.046, 8, 10]} />
          </mesh>
          {/* Moustache wings curving gently downwards */}
          <mesh position={[-0.028, -0.028, 0.105]} rotation={[0, 0, -0.55]} material={materials.moustache}>
            <capsuleGeometry args={[0.006, 0.020, 6, 8]} />
          </mesh>
          <mesh position={[0.028, -0.028, 0.105]} rotation={[0, 0, 0.55]} material={materials.moustache}>
            <capsuleGeometry args={[0.006, 0.020, 6, 8]} />
          </mesh>

          {/* Warm Grandfather Smile */}
          <mesh position={[0, -0.042, 0.102]} material={materials.mouth}>
            <boxGeometry args={[0.028, 0.005, 0.006]} />
          </mesh>

          {/* Natural Ears */}
          <mesh position={[-0.112, 0.004, -0.005]} rotation={[0, -0.15, 0]} material={materials.skin}>
            <sphereGeometry args={[0.020, 8, 8]} />
          </mesh>
          <mesh position={[0.112, 0.004, -0.005]} rotation={[0, 0.15, 0]} material={materials.skin}>
            <sphereGeometry args={[0.020, 8, 8]} />
          </mesh>
        </group>

        {/* ─── ARMS: SLEEVED HANDLOOM KURTA & ELDER HANDS ─── */}
        {/* Left Arm: Natural comfortable clearance from torso */}
        <group ref={leftArmRef} position={[-0.225, 1.16, 0]}>
          {/* Kurta Sleeve (upper arm) */}
          <mesh position={[0, -0.10, 0]} material={materials.kurta} castShadow>
            <cylinderGeometry args={[0.048, 0.040, 0.18, 14]} />
          </mesh>
          {/* Forearm (warm elder skin) */}
          <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.026, 0.12, 8, 10]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.31, 0]} material={materials.skin}>
            <sphereGeometry args={[0.024, 8, 8]} />
          </mesh>
        </group>

        {/* Right Arm: Symmetrical natural clearance from body */}
        <group ref={rightArmRef} position={[0.225, 1.16, 0]}>
          {/* Kurta Sleeve (upper arm) */}
          <mesh position={[0, -0.10, 0]} material={materials.kurta} castShadow>
            <cylinderGeometry args={[0.048, 0.040, 0.18, 14]} />
          </mesh>
          {/* Forearm (warm elder skin) */}
          <mesh position={[0, -0.22, 0]} material={materials.skin} castShadow>
            <capsuleGeometry args={[0.026, 0.12, 8, 10]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.31, 0]} material={materials.skin}>
            <sphereGeometry args={[0.024, 8, 8]} />
          </mesh>
        </group>

        {/* ─── LEGS: PLEATED DRAPED DHOTI & LEATHER CHAPPALS ─── */}
        {/* Center Dhoti Pleat Fold (Patli) */}
        <mesh position={[0, 0.44, 0.08]} material={materials.dhotiBorder} castShadow>
          <boxGeometry args={[0.055, 0.28, 0.02]} />
        </mesh>

        {/* Left Leg with Articulated Knee Joint */}
        <group ref={leftLegRef} position={[-0.075, 0.58, 0]}>
          {/* Thigh (Draped Dhoti) */}
          <mesh position={[0, -0.11, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.052, 0.15, 8, 12]} />
          </mesh>
          {/* Knee joint & lower leg */}
          <group ref={leftKneeRef} position={[0, -0.22, 0]}>
            {/* Shin (Dhoti drape) */}
            <mesh position={[0, -0.11, 0]} material={materials.dhoti} castShadow>
              <capsuleGeometry args={[0.044, 0.13, 8, 12]} />
            </mesh>
            {/* Handcrafted Indian Leather Chappal */}
            <mesh position={[0, -0.20, 0.025]} material={materials.sandalLeather} castShadow>
              <boxGeometry args={[0.062, 0.025, 0.11]} />
            </mesh>
            {/* Sandal Sole */}
            <mesh position={[0, -0.215, 0.025]} material={materials.sandalSole}>
              <boxGeometry args={[0.065, 0.010, 0.114]} />
            </mesh>
          </group>
        </group>

        {/* Right Leg with Articulated Knee Joint */}
        <group ref={rightLegRef} position={[0.075, 0.58, 0]}>
          {/* Thigh (Draped Dhoti) */}
          <mesh position={[0, -0.11, 0]} material={materials.dhoti} castShadow>
            <capsuleGeometry args={[0.052, 0.15, 8, 12]} />
          </mesh>
          {/* Knee joint & lower leg */}
          <group ref={rightKneeRef} position={[0, -0.22, 0]}>
            {/* Shin (Dhoti drape) */}
            <mesh position={[0, -0.11, 0]} material={materials.dhoti} castShadow>
              <capsuleGeometry args={[0.044, 0.13, 8, 12]} />
            </mesh>
            {/* Handcrafted Indian Leather Chappal */}
            <mesh position={[0, -0.20, 0.025]} material={materials.sandalLeather} castShadow>
              <boxGeometry args={[0.062, 0.025, 0.11]} />
            </mesh>
            {/* Sandal Sole */}
            <mesh position={[0, -0.215, 0.025]} material={materials.sandalSole}>
              <boxGeometry args={[0.065, 0.010, 0.114]} />
            </mesh>
          </group>
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
  isPraying = false,
  isCarrying = false,
  isInteracting = false,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
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

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const motion = gameStateStore.playerMotion;
    const currentVelocity = Math.abs(motion.velocity) > 0.05 ? motion.velocity : Math.abs(speed);
    const motionState = motion.state;
    const praying = isPraying || motion.isPraying || motionState === 'PRAY';
    const carrying = isCarrying || motion.isCarrying || motionState === 'CARRY';
    const interacting = isInteracting || motion.isInteracting || motionState === 'INTERACT';
    const isCinematicWalk = motionState === 'CINEMATIC_WALK';

    // Strict velocity rules:
    // velocity ≈ 0 -> IDLE
    // walking velocity -> WALK
    // running velocity -> RUN
    // interacting -> INTERACT
    // praying -> PRAY
    // carrying -> CARRY
    // scripted cinematic walking -> CINEMATIC_WALK
    const isActuallyMoving = (currentVelocity > 0.12 || isCinematicWalk) && !praying && !interacting;
    const isRunningActual = !isCinematicWalk && (isRunning || currentVelocity > 3.0);
    const walkCycle = t * (isRunningActual ? 11 : 7.2);

    if (isSitting) {
      // Sitting at desk chair or sofa
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.05;
        leftLegRef.current.position.z = 0.04;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.05;
        rightLegRef.current.position.z = 0.04;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = Math.PI / 2.1;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = Math.PI / 2.1;
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
          headRef.current.rotation.x = 0.18 + Math.sin(t * 1.5) * 0.02;
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
        bodyRef.current.position.y = -0.38;
        bodyRef.current.rotation.x = isWorking ? 0.08 : 0;
      }
      return;
    }

    if (praying) {
      // Respectful Namaste pose: hands joined in front of chest, head gently bowed towards Bappa
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(leftLegRef.current.rotation.x) < 0.001) leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(rightLegRef.current.rotation.x) < 0.001) rightLegRef.current.rotation.x = 0;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = THREE.MathUtils.damp(leftKneeRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(leftKneeRef.current.rotation.x) < 0.001) leftKneeRef.current.rotation.x = 0;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = THREE.MathUtils.damp(rightKneeRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(rightKneeRef.current.rotation.x) < 0.001) rightKneeRef.current.rotation.x = 0;
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -0.92, 14, delta);
        leftArmRef.current.rotation.y = THREE.MathUtils.damp(leftArmRef.current.rotation.y, 0.28, 14, delta);
        leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, 0.38, 14, delta);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -0.92, 14, delta);
        rightArmRef.current.rotation.y = THREE.MathUtils.damp(rightArmRef.current.rotation.y, -0.28, 14, delta);
        rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, -0.38, 14, delta);
      }
      if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, 0.16, 10, delta);
        headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, 0, 10, delta);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.5) * 0.004;
        bodyRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    if (interacting) {
      // Reaching forward to consecrate/place the murti on the singhasan
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(leftLegRef.current.rotation.x) < 0.001) leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(rightLegRef.current.rotation.x) < 0.001) rightLegRef.current.rotation.x = 0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -0.85, 12, delta);
        leftArmRef.current.rotation.y = 0.16;
        leftArmRef.current.rotation.z = 0.12;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -0.85, 12, delta);
        rightArmRef.current.rotation.y = -0.16;
        rightArmRef.current.rotation.z = -0.12;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.08;
      }
      return;
    }

    if (isActuallyMoving) {
      // Dynamic adult stride
      const stride = Math.sin(walkCycle) * (isRunningActual ? 0.68 : 0.44);
      const armSwing = Math.sin(walkCycle) * (isRunningActual ? 0.62 : 0.4);

      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -stride * 0.45);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, stride * 0.45);

      if (carrying) {
        // Holding palanquin while walking
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.72 + Math.sin(walkCycle) * 0.08;
          leftArmRef.current.rotation.y = 0.14;
          leftArmRef.current.rotation.z = 0.12;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.72 - Math.sin(walkCycle) * 0.08;
          rightArmRef.current.rotation.y = -0.14;
          rightArmRef.current.rotation.z = -0.12;
        }
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.022;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.025;
        bodyRef.current.rotation.x = isRunningActual ? 0.1 : 0.02;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.02;
      }
    } else {
      // Confident young adult idle: STRICT ZERO ON STATIONARY
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(leftLegRef.current.rotation.x) < 0.001) leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(rightLegRef.current.rotation.x) < 0.001) rightLegRef.current.rotation.x = 0;
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = THREE.MathUtils.damp(leftKneeRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(leftKneeRef.current.rotation.x) < 0.001) leftKneeRef.current.rotation.x = 0;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = THREE.MathUtils.damp(rightKneeRef.current.rotation.x, 0, 20, delta);
        if (Math.abs(rightKneeRef.current.rotation.x) < 0.001) rightKneeRef.current.rotation.x = 0;
      }

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
          <mesh position={[0, -0.16, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 8, 10]} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.30, 0]}>
            {/* Calf */}
            <mesh position={[0, -0.15, 0]} material={materials.pants} castShadow>
              <capsuleGeometry args={[0.05, 0.20, 8, 10]} />
            </mesh>
            {/* Leather shoe / loafer */}
            <mesh position={[0, -0.30, 0.035]} material={materials.shoes} castShadow>
              <boxGeometry args={[0.075, 0.05, 0.16]} />
            </mesh>
          </group>
        </group>

        <group ref={rightLegRef} position={[0.085, 0.82, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.16, 0]} material={materials.pants} castShadow>
            <capsuleGeometry args={[0.058, 0.22, 8, 10]} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.30, 0]}>
            {/* Calf */}
            <mesh position={[0, -0.15, 0]} material={materials.pants} castShadow>
              <capsuleGeometry args={[0.05, 0.20, 8, 10]} />
            </mesh>
            {/* Leather shoe / loafer */}
            <mesh position={[0, -0.30, 0.035]} material={materials.shoes} castShadow>
              <boxGeometry args={[0.075, 0.05, 0.16]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
