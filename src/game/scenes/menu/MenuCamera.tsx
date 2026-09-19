import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface MenuCameraProps {
  isTransitioning: boolean;
}

export function MenuCamera({ isTransitioning }: MenuCameraProps) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const currentPosRef = useRef(new THREE.Vector3(0, 0, 4.6));
  const targetPosRef = useRef(new THREE.Vector3(0, 0, 4.6));
  const lookAtRef = useRef(new THREE.Vector3(0.4, 0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1..1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = nx * 0.12;
      mouseRef.current.targetY = ny * 0.08;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // Smooth mouse lerp
    const m = mouseRef.current;
    m.x += (m.targetX - m.x) * Math.min(1, delta * 3.5);
    m.y += (m.targetY - m.y) * Math.min(1, delta * 3.5);

    const time = state.clock.getElapsedTime();

    // Very subtle, continuous breathing camera motion
    const breathX = Math.sin(time * 0.35) * 0.04;
    const breathY = Math.cos(time * 0.28) * 0.03;

    if (isTransitioning) {
      // Cinematic push-in towards Ganesha on START
      targetPosRef.current.set(0.6, 0.05, 3.4);
      lookAtRef.current.lerp(new THREE.Vector3(1.1, 0.1, 0), delta * 2.5);
    } else {
      // Normal idle title screen camera
      targetPosRef.current.set(m.x + breathX, m.y + breathY, 4.6);
      lookAtRef.current.set(0.35, 0, 0);
    }

    // Smooth camera position interpolation
    currentPosRef.current.lerp(targetPosRef.current, Math.min(1, delta * (isTransitioning ? 2.8 : 3.0)));
    camera.position.copy(currentPosRef.current);
    camera.lookAt(lookAtRef.current);
  });

  return null;
}
