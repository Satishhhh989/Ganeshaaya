import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ASSET_CONFIG } from '../../core/assetConfig';
import { AtmosphereLighting } from './AtmosphereLighting';
import { DustParticles } from './DustParticles';
import { DiyaProps } from './DiyaProps';
import { OldManNPC } from './OldManNPC';

export function PresentHomeScene() {
  const gltf = useGLTF(ASSET_CONFIG.environments.home.url);

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Optimize standard materials for warm indoor look
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.roughness !== undefined) {
              mat.roughness = Math.max(0.3, mat.roughness);
            }
          }
        }
      });
    }
  }, [gltf]);

  return (
    <group name="PresentHomeScene">
      {/* 3D House Environment */}
      <primitive object={gltf.scene} position={[0, 0, 0]} scale={ASSET_CONFIG.environments.home.scale} />

      {/* Atmospheric Lighting */}
      <AtmosphereLighting />

      {/* Subtle floating dust motes in sunbeams */}
      <DustParticles count={130} />

      {/* Traditional Indian Diyas and details */}
      <DiyaProps />

      {/* Old Man (Dada) Character NPC */}
      <OldManNPC />
    </group>
  );
}

useGLTF.preload(ASSET_CONFIG.environments.home.url);
