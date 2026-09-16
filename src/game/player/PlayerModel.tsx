import { useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { ASSET_CONFIG } from '../core/assetConfig';
import { retargetMixamoClipToKid } from '../animation/retargetAnimation';

interface PlayerModelProps {
  speed: number;
  isRunning: boolean;
  isSitting?: boolean;
}

export function PlayerModel({ speed, isRunning, isSitting = false }: PlayerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const childGltf = useGLTF(ASSET_CONFIG.characters.child.url);
  const oldManGltf = useGLTF(ASSET_CONFIG.characters.oldMan.url);

  // Prepare retargeted clips for the child:
  // 1. 'idle': child's authentic mixamo.com clip
  // 2. 'walk': authentic walk cycle retargeted to child skeleton
  // 3. 'sit': authentic sitting pose retargeted to child skeleton
  const animationClips = useMemo(() => {
    const clips: THREE.AnimationClip[] = [];

    // Child Idle
    if (childGltf.animations && childGltf.animations.length > 0) {
      const baseClip = childGltf.animations[0].clone();
      baseClip.name = 'idle';
      clips.push(baseClip);
    }

    // Retargeted Walk
    if (oldManGltf.animations) {
      const sourceWalk = oldManGltf.animations.find(
        (a) => a.name === 'walk' || a.name === 'walk.001'
      );
      if (sourceWalk) {
        const walkClip = retargetMixamoClipToKid(sourceWalk, 'walk');
        clips.push(walkClip);
      }

      // Retargeted Sit
      const sourceSit = oldManGltf.animations.find(
        (a) => a.name === 'sit' || a.name === 'sit.001'
      );
      if (sourceSit) {
        const sitClip = retargetMixamoClipToKid(sourceSit, 'sit');
        clips.push(sitClip);
      }
    }

    return clips;
  }, [childGltf.animations, oldManGltf.animations]);

  const { actions } = useAnimations(animationClips, groupRef);
  const currentActionName = useRef<string>('idle');

  // Setup shadows and material tuning
  useEffect(() => {
    if (childGltf.scene) {
      childGltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.roughness !== undefined) {
              mat.roughness = Math.max(0.45, mat.roughness);
            }
          }
        }
      });
    }
  }, [childGltf]);

  // Initial animation setup
  useEffect(() => {
    if (!actions) return;
    const idle = actions['idle'];
    if (idle) {
      idle.reset().fadeIn(0.2).play();
      currentActionName.current = 'idle';
    }
  }, [actions]);

  // Animation cross-fading based on movement and state
  useEffect(() => {
    if (!actions) return;

    let targetActionName = 'idle';
    if (isSitting) {
      targetActionName = 'sit';
    } else if (speed > 0.15) {
      targetActionName = 'walk';
    }

    if (currentActionName.current !== targetActionName) {
      const prevAction = actions[currentActionName.current];
      const nextAction = actions[targetActionName];

      if (nextAction) {
        nextAction.reset();

        // Adjust walk speed relative to player speed
        if (targetActionName === 'walk') {
          const timeScale = isRunning ? 1.4 : Math.max(0.9, speed * 0.95);
          nextAction.setEffectiveTimeScale(timeScale);
        } else {
          nextAction.setEffectiveTimeScale(1.0);
        }

        if (prevAction) {
          prevAction.crossFadeTo(nextAction, 0.25, true);
        } else {
          nextAction.fadeIn(0.25);
        }

        nextAction.play();
        currentActionName.current = targetActionName;
      }
    } else if (targetActionName === 'walk' && actions['walk']) {
      // Dynamic speed adjustment while continuing to walk
      const timeScale = isRunning ? 1.4 : Math.max(0.9, speed * 0.95);
      actions['walk'].setEffectiveTimeScale(timeScale);
    }
  }, [actions, speed, isRunning, isSitting]);

  return (
    <group ref={groupRef} scale={ASSET_CONFIG.characters.child.scale}>
      <primitive object={childGltf.scene} />
    </group>
  );
}

useGLTF.preload(ASSET_CONFIG.characters.child.url);
useGLTF.preload(ASSET_CONFIG.characters.oldMan.url);
