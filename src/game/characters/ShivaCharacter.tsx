import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TrishulProp } from './TrishulProp';

interface ShivaCharacterProps {
  speed: number;
  isRunning?: boolean;
  isConfronting?: boolean;
  isRaisingTrishul?: boolean;
  model: THREE.Group | null;
  animations?: THREE.AnimationClip[];
}

export function ShivaCharacter({
  speed,
  isRunning = false,
  isConfronting = false,
  isRaisingTrishul = false,
  model,
  animations = [],
}: ShivaCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const walkActionRef = useRef<THREE.AnimationAction | null>(null);
  const trishulGroupRef = useRef<THREE.Group>(null);

  // Clone model for this instance and setup materials
  const clonedModel = useMemo(() => {
    if (!model) return null;
    const cloned = model.clone(true);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m) {
              m.transparent = false;
              m.opacity = 1.0;
              m.depthWrite = true;
              m.depthTest = true;
              m.side = THREE.DoubleSide;
              if ((m as THREE.MeshStandardMaterial).roughness !== undefined) {
                (m as THREE.MeshStandardMaterial).roughness = 0.55;
              }
              m.needsUpdate = true;
            }
          });
        }
      }
    });

    return cloned;
  }, [model]);

  // Set up AnimationMixer with the walk clip
  useEffect(() => {
    if (!clonedModel || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(clonedModel);
    mixerRef.current = mixer;

    const walkClip = animations[0]; // "mixamo.com" walking clip
    if (walkClip) {
      const action = mixer.clipAction(walkClip);
      action.loop = THREE.LoopRepeat;
      action.play();
      walkActionRef.current = action;
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [clonedModel, animations]);

  // Frame update: animation mixer blending, Trishul animation, and procedural breath
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // ─── Walk Animation Control ───
    if (mixerRef.current && walkActionRef.current) {
      const action = walkActionRef.current;

      if (speed > 0.15 && !isConfronting && !isRaisingTrishul) {
        // Active walking: scale playback speed with character velocity
        const playbackSpeed = isRunning ? 1.4 : 0.95;
        action.timeScale = playbackSpeed;
        action.weight = 1.0;
        mixerRef.current.update(dt);
      } else {
        // Idle: gently hold a noble, resting stance
        action.timeScale = 0.08;
        action.weight = 0.35;
        mixerRef.current.update(dt * 0.2);
      }
    }

    // ─── Trishul Positioning & Raising Animation ───
    if (trishulGroupRef.current) {
      if (isRaisingTrishul) {
        // Majestic Trishul Lifting: raises up and tilts forward with divine authority
        const targetY = 0.45 + Math.sin(time * 6) * 0.03;
        const targetRotX = -0.35;
        const targetRotZ = 0.15;

        trishulGroupRef.current.position.y = THREE.MathUtils.lerp(
          trishulGroupRef.current.position.y,
          targetY,
          dt * 3.5
        );
        trishulGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          trishulGroupRef.current.rotation.x,
          targetRotX,
          dt * 4
        );
        trishulGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          trishulGroupRef.current.rotation.z,
          targetRotZ,
          dt * 4
        );
      } else {
        // Normal Held Position beside right hand
        const sway = Math.sin(time * (speed > 0.15 ? 5 : 1.5)) * 0.04;
        trishulGroupRef.current.position.set(0.42, 0.05 + sway, 0.1);
        trishulGroupRef.current.rotation.set(0.08, 0, -0.05 + sway * 0.5);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* ─── 3D Shiva Master Asset ─── */}
      {clonedModel ? (
        <primitive
          object={clonedModel}
          position={[0, 0, 0]}
          scale={0.0112} // Scale factor calibrated for ~2.15m majestic Shiva
        />
      ) : (
        // Fallback loading indicator silhouette
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 2.1, 16]} />
          <meshStandardMaterial color="#1a202c" roughness={0.7} />
        </mesh>
      )}

      {/* ─── Divine Hand-Held Trishul Prop ─── */}
      <group ref={trishulGroupRef} position={[0.42, 0.05, 0.1]}>
        <TrishulProp isCharged={isRaisingTrishul} scale={0.95} />
      </group>

      {/* ─── Cosmic Blue / Violet Divine Aura Glow ─── */}
      <pointLight
        position={[0, 1.8, 0.3]}
        color={isRaisingTrishul ? '#60a5fa' : '#818cf8'}
        intensity={isRaisingTrishul ? 3.8 : 1.2}
        distance={5}
        decay={2}
      />
    </group>
  );
}
