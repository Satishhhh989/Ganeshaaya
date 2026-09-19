import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TrishulProp } from './TrishulProp';

interface ShivaCharacterProps {
  speed: number;
  isRunning?: boolean;
  isConfronting?: boolean;
  isRaisingTrishul?: boolean;
  isAftermath?: boolean;
  model: THREE.Group | null;
  animations?: THREE.AnimationClip[];
}

export function ShivaCharacter({
  speed,
  isRunning = false,
  isConfronting = false,
  isRaisingTrishul = false,
  isAftermath = false,
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
      } else if (isAftermath) {
        // Solemn Aftermath: slowly lower Trishul to side, resting downwards
        trishulGroupRef.current.position.y = THREE.MathUtils.lerp(
          trishulGroupRef.current.position.y,
          -0.12,
          dt * 2.0
        );
        trishulGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          trishulGroupRef.current.rotation.x,
          0.24,
          dt * 2.0
        );
        trishulGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          trishulGroupRef.current.rotation.z,
          -0.08,
          dt * 2.0
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
      {/* ─── 3D Shiva Master Asset or Procedural Ascetic Model Fallback ─── */}
      {clonedModel ? (
        <primitive
          object={clonedModel}
          position={[0, 0, 0]}
          scale={0.0112} // Scale factor calibrated for ~2.15m majestic Shiva
        />
      ) : (
        <group position={[0, 0, 0]}>
          {/* ─── Ascetic Dhoti / Tiger-Skin Wrap ─── */}
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.24, 0.28, 0.72, 18]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.98, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.25, 0.08, 18]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} metalness={0.4} />
          </mesh>

          {/* ─── Legs ─── */}
          {[-0.12, 0.12].map((x, idx) => (
            <group key={idx} position={[x, 0.35, 0]}>
              <mesh position={[0, -0.15, 0]} castShadow>
                <capsuleGeometry args={[0.075, 0.32, 8, 12]} />
                <meshStandardMaterial color="#8fa3bd" roughness={0.65} />
              </mesh>
              <mesh position={[0, -0.32, 0.04]}>
                <boxGeometry args={[0.09, 0.05, 0.16]} />
                <meshStandardMaterial color="#8fa3bd" roughness={0.65} />
              </mesh>
            </group>
          ))}

          {/* ─── Muscular Broad Chest (Ash-Blue Celestial Hue) ─── */}
          <mesh position={[0, 1.34, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.24, 0.38, 10, 16]} />
            <meshStandardMaterial color="#8fa3bd" roughness={0.62} metalness={0.08} />
          </mesh>

          {/* ─── Rudraksha Malas across chest & neck ─── */}
          <mesh position={[0, 1.44, 0.12]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.16, 0.016, 8, 20]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.32, 0.16]} rotation={[0.35, 0, 0]}>
            <torusGeometry args={[0.18, 0.014, 8, 20]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>

          {/* ─── Sacred Serpent (Vasuki) coiled around neck ─── */}
          <mesh position={[0, 1.62, 0.04]} rotation={[0.1, 0.3, 0]}>
            <torusGeometry args={[0.11, 0.022, 8, 18]} />
            <meshStandardMaterial color="#365314" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* ─── Neck & Ascetic Head with Matted Locks (Jata) ─── */}
          <mesh position={[0, 1.65, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.095, 0.12, 14]} />
            <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
          </mesh>
          <group position={[0, 1.84, 0]}>
            {/* Head */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.15, 18, 16]} />
              <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
            </mesh>
            {/* Third Eye (Trinetra) on forehead */}
            <mesh position={[0, 0.04, 0.145]}>
              <boxGeometry args={[0.008, 0.028, 0.006]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {/* Matted Hair Jata Topknot */}
            <mesh position={[0, 0.18, -0.02]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 0.22, 14]} />
              <meshStandardMaterial color="#1c1917" roughness={0.85} />
            </mesh>
            {/* Golden Crescent Moon (Chandra) on Jata */}
            <mesh position={[0.10, 0.20, 0.06]} rotation={[0, 0.4, 0.3]}>
              <torusGeometry args={[0.045, 0.008, 6, 16, Math.PI * 1.2]} />
              <meshStandardMaterial color="#fef08a" roughness={0.2} metalness={0.9} emissive="#eab308" emissiveIntensity={0.4} />
            </mesh>
          </group>

          {/* ─── Left Arm (Resting at side) ─── */}
          <group position={[-0.32, 1.42, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 8, 10]} />
              <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
            </mesh>
            <mesh position={[0, -0.38, 0]} castShadow>
              <capsuleGeometry args={[0.052, 0.20, 8, 10]} />
              <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
            </mesh>
            <mesh position={[0, -0.32, 0]}>
              <torusGeometry args={[0.062, 0.012, 6, 14]} />
              <meshStandardMaterial color="#451a03" roughness={0.8} />
            </mesh>
          </group>

          {/* ─── Right Arm (Gripping Trishul) ─── */}
          <group position={[0.32, 1.42, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.22, 8, 10]} />
              <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
            </mesh>
            <mesh position={[0, -0.38, 0.05]} rotation={[0.2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.052, 0.20, 8, 10]} />
              <meshStandardMaterial color="#8fa3bd" roughness={0.62} />
            </mesh>
            <mesh position={[0, -0.32, 0.05]}>
              <torusGeometry args={[0.062, 0.012, 6, 14]} />
              <meshStandardMaterial color="#451a03" roughness={0.8} />
            </mesh>
          </group>
        </group>
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
