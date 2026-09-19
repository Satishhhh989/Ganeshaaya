import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ASSET_CONFIG } from '../../core/assetConfig';
import { AtmosphereLighting } from './AtmosphereLighting';
import { DustParticles } from './DustParticles';
import { DiyaProps } from './DiyaProps';
import { OldManNPC } from './OldManNPC';
import { ModernRoomDecor } from './ModernRoomDecor';
import { CeilingFan } from './CeilingFan';

export function PresentHomeScene() {
  const gltf = useGLTF(ASSET_CONFIG.environments.home.url);

  // Clone to avoid shared material mutations
  const clonedScene = useMemo(() => {
    return gltf.scene.clone(true);
  }, [gltf.scene]);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Fix materials for solid, warm indoor appearance
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (mat) {
            const stdMat = mat as THREE.MeshStandardMaterial;
            // Ensure environment is fully opaque and solid
            stdMat.transparent = false;
            stdMat.opacity = 1.0;
            stdMat.depthWrite = true;
            stdMat.depthTest = true;
            // Keep DoubleSide for environment (walls visible from both sides)
            stdMat.side = THREE.DoubleSide;

            if (stdMat.roughness !== undefined) {
              stdMat.roughness = Math.max(0.3, stdMat.roughness);
            }

            stdMat.needsUpdate = true;
          }
        });
      }
    });
  }, [clonedScene]);

  return (
    <group name="PresentHomeScene">
      {/* 3D House Environment */}
      <primitive object={clonedScene} position={[0, 0, 0]} scale={ASSET_CONFIG.environments.home.scale} />

      {/* Atmospheric Lighting */}
      <AtmosphereLighting />

      {/* Subtle floating dust motes in sunbeams */}
      <DustParticles count={130} />

      {/* Traditional Indian Diyas and details */}
      <DiyaProps />

      {/* Modern Room Evolution props (developer workstation, nostalgic photo, calendar) */}
      <ModernRoomDecor />

      {/* Rotating Living Room Ceiling Fan */}
      <CeilingFan />

      {/* Old Man (Dada) Character NPC */}
      <OldManNPC />
    </group>
  );
}

useGLTF.preload(ASSET_CONFIG.environments.home.url);
