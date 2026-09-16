import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { interactionManager } from './useInteraction';
import { useGameState } from '../core/GameState';

interface InteractionTriggerProps {
  id: string;
  name: string;
  worldPosition?: [number, number, number];
  radius?: number;
  prompt?: string;
  onInteract: () => void;
  showIndicator?: boolean;
}

export function InteractionTrigger({
  id,
  name,
  worldPosition = [0, 0, 0],
  radius = 2.6,
  prompt = 'Talk',
  onInteract,
  showIndicator = true,
}: InteractionTriggerProps) {
  const markerRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { activeInteraction } = useGameState();
  const isFocused = activeInteraction?.id === id;

  useEffect(() => {
    interactionManager.register({
      id,
      name,
      position: worldPosition,
      radius,
      prompt,
      actionKey: 'E',
      onInteract,
      enabled: true,
    });

    return () => {
      interactionManager.unregister(id);
    };
  }, [id, name, worldPosition, radius, prompt, onInteract]);

  useFrame((_, delta) => {
    if (markerRef.current) {
      markerRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
      const targetScale = isFocused ? 1.15 : 0.85;
      ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 4);
    }
  });

  return (
    <group position={worldPosition}>
      {showIndicator && (
        <group ref={markerRef} position={[0, 0.05, 0]}>
          {/* Subtle ground circle with warm golden accent */}
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.58, 32]} />
            <meshBasicMaterial
              color={isFocused ? '#f5b041' : '#df6920'}
              transparent
              opacity={isFocused ? 0.75 : 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
