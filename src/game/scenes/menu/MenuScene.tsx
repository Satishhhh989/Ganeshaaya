import { useState, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MenuCamera } from './MenuCamera';
import { MenuLighting } from './MenuLighting';
import { MenuAtmosphere } from './MenuAtmosphere';

// Reactive event emitter for title screen transition sync between 3D Camera & UI
export const menuTransitionState = {
  isTransitioning: false,
  listeners: new Set<(val: boolean) => void>(),
  set(val: boolean) {
    this.isTransitioning = val;
    this.listeners.forEach((fn) => fn(val));
  },
  subscribe(fn: (val: boolean) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  },
};

export function MenuScene() {
  const [isTransitioning, setIsTransitioning] = useState(menuTransitionState.isTransitioning);

  useEffect(() => {
    return menuTransitionState.subscribe((val) => {
      setIsTransitioning(val);
    });
  }, []);

  // Preload and configure high-fidelity hero texture
  const heroTexture = useTexture('/assets/ui/ganesha_hero.jpg');
  heroTexture.colorSpace = THREE.SRGBColorSpace;
  heroTexture.minFilter = THREE.LinearFilter;
  heroTexture.magFilter = THREE.LinearFilter;

  return (
    <group>
      {/* 3D Camera with smooth idle breathing drift and start push-in */}
      <MenuCamera isTransitioning={isTransitioning} />

      {/* Atmospheric Devotional Lighting with flickering Ghee Lamps */}
      <MenuLighting />

      {/* 3D Drifting Rose Petals & Golden Dust */}
      <MenuAtmosphere />

      {/* Hero Ganesha Temple Art Plane (World Canvas) */}
      <mesh position={[0.2, 0, 0]}>
        <planeGeometry args={[11.8, 6.64]} />
        <meshBasicMaterial
          map={heroTexture}
          toneMapped={false}
        />
      </mesh>

      {/* Soft Cinematic Atmospheric Vignette (Deep Wine & Warm Rose Gradient Plane) */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[13.5, 7.8]} />
        <meshBasicMaterial
          transparent
          opacity={0.35}
          depthWrite={false}
          color="#1b0a15"
        />
      </mesh>
    </group>
  );
}
