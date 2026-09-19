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
  radius = 2.5,
  prompt = 'Talk',
  onInteract,
  showIndicator = true,
}: InteractionTriggerProps) {
  const markerRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { activeInteraction } = useGameState();
  const isFocused = activeInteraction?.id === id;

  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  const [px, py, pz] = worldPosition;

  useEffect(() => {
    interactionManager.register({
      id,
      name,
      position: [px, py, pz],
      radius,
      prompt,
      actionKey: 'E',
      onInteract: () => onInteractRef.current?.(),
      enabled: true,
    });

    return () => {
      interactionManager.unregister(id);
    };
  }, [id, name, px, py, pz, radius, prompt]);

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
    <group position={[px, py, pz]}>
      {showIndicator && (
        <group ref={markerRef} position={[0, 0.05, 0]}>
          {/* Subtle ground circle with warm golden accent */}
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.52, 32]} />
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
