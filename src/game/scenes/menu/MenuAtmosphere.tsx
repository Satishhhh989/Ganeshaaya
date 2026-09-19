import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PetalData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  scale: number;
  phase: number;
}

export function MenuAtmosphere() {
  const petalsRef = useRef<THREE.InstancedMesh | null>(null);
  const dustRef = useRef<THREE.Points | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Rose Petals Simulation Data
  const petalCount = 28;
  const petalsData = useMemo<PetalData[]>(() => {
    const arr: PetalData[] = [];
    for (let i = 0; i < petalCount; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.3) * 6.5,
          (Math.random() - 0.4) * 4.5,
          (Math.random() - 0.5) * 3.5 + 0.8
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.4) * 0.008,
          -(0.004 + Math.random() * 0.007),
          (Math.random() - 0.5) * 0.005
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.016,
          (Math.random() - 0.5) * 0.01
        ),
        scale: 0.045 + Math.random() * 0.035,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // 2. Golden Dust Particles Data
  const dustCount = 42;
  const { dustPositions, dustVelocities, dustPhases } = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    const vel = new Float32Array(dustCount * 3);
    const phases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.4) * 7.0;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.0 + 0.5;

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = 0.002 + Math.random() * 0.004;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      phases[i] = Math.random() * Math.PI * 2;
    }
    return { dustPositions: pos, dustVelocities: vel, dustPhases: phases };
  }, []);

  // Petal Geometry (Curved Oval Petal Shape)
  const petalGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(1, 1.4, 2, 2);
    // Add subtle curvature to plane vertices
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, (1 - (x * x + y * y)) * 0.15);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Update Petals
    if (petalsRef.current) {
      for (let i = 0; i < petalCount; i++) {
        const p = petalsData[i];

        // Position update with gentle lateral flutter
        p.position.y += p.velocity.y;
        p.position.x += p.velocity.x + Math.sin(t * 0.8 + p.phase) * 0.002;
        p.position.z += p.velocity.z + Math.cos(t * 0.6 + p.phase) * 0.001;

        // Tumble rotation
        p.rotation.x += p.rotSpeed.x;
        p.rotation.y += p.rotSpeed.y;
        p.rotation.z += p.rotSpeed.z;

        // Reset if drifted below view
        if (p.position.y < -2.4) {
          p.position.y = 2.4;
          p.position.x = (Math.random() - 0.3) * 6.5;
        }

        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();

        petalsRef.current.setMatrixAt(i, dummy.matrix);
      }
      petalsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Dust Particles
    if (dustRef.current) {
      const posAttr = dustRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < dustCount; i++) {
        positions[i * 3 + 1] += dustVelocities[i * 3 + 1];
        positions[i * 3 + 0] += dustVelocities[i * 3 + 0] + Math.sin(t * 0.5 + dustPhases[i]) * 0.001;

        if (positions[i * 3 + 1] > 2.6) {
          positions[i * 3 + 1] = -2.4;
          positions[i * 3 + 0] = (Math.random() - 0.4) * 7.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 3D Instanced Floating Rose Petals */}
      <instancedMesh
        ref={petalsRef}
        args={[petalGeometry, undefined, petalCount]}
      >
        <meshStandardMaterial
          color="#f4a7b9"
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent
          opacity={0.82}
        />
      </instancedMesh>

      {/* 3D Golden Firefly Dust Motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          color="#fbe49d"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
