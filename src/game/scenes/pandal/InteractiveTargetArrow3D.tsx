import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveTargetArrow3DProps {
  position: [number, number, number];
  color?: string;
  accentColor?: string;
  radius?: number;
  label?: string;
  arrowHeight?: number;
}

/**
 * High-visibility 3D Ground Circle with Floating Downward-Pointing Arrow
 * Provides unmistakable in-world visual guidance for active interactive stations.
 */
export function InteractiveTargetArrow3D({
  position,
  color = '#ffb703',
  accentColor = '#fb8500',
  radius = 0.65,
  label = 'E',
  arrowHeight = 1.35,
}: InteractiveTargetArrow3DProps) {
  const arrowGroupRef = useRef<THREE.Group>(null);
  const groundInnerRingRef = useRef<THREE.Mesh>(null);
  const groundOuterRingRef = useRef<THREE.Mesh>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);
  const haloRingRef = useRef<THREE.Mesh>(null);

  // Dynamic canvas badge texture for action key
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#18120c';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = color;
      ctx.lineWidth = 12;
      ctx.strokeRect(8, 8, 112, 112);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 76px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 68);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [label, color]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // ─── 1. Arrow vertical hovering bob & rotation ───
    if (arrowGroupRef.current) {
      // Bobbing up and down smoothly
      const bobY = Math.sin(t * 4.2) * 0.12;
      arrowGroupRef.current.position.y = arrowHeight + bobY;
      // Gentle spin to catch light from all angles
      arrowGroupRef.current.rotation.y = t * 2.2;
    }

    // ─── 2. Halo ring around arrow pulsing ───
    if (haloRingRef.current) {
      const s = 1.0 + Math.sin(t * 5.0) * 0.15;
      haloRingRef.current.scale.set(s, s, s);
      haloRingRef.current.rotation.z = -t * 2.8;
    }

    // ─── 3. Ground ring breathing & counter-rotation ───
    if (groundInnerRingRef.current) {
      const mat = groundInnerRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.45 + Math.sin(t * 3.6) * 0.2;
      }
      groundInnerRingRef.current.rotation.z = t * 0.8;
    }

    if (groundOuterRingRef.current) {
      const mat = groundOuterRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.25 + Math.cos(t * 3.2) * 0.15;
      }
      groundOuterRingRef.current.rotation.z = -t * 0.6;
    }

    // ─── 4. Beacon light pulse ───
    if (beaconLightRef.current) {
      beaconLightRef.current.intensity = 2.0 + Math.sin(t * 4.2) * 0.6;
    }
  });

  return (
    <group position={position} name="Interactive_Target_Marker">
      {/* ─── A. GROUND CONCENTRIC CIRCLES ─── */}
      {/* Inner Ground Ring */}
      <mesh ref={groundInnerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[radius * 0.72, radius * 0.95, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Ground Ring */}
      <mesh ref={groundOuterRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[radius * 1.15, radius * 1.28, 36]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Ground Center Soft Glow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[radius * 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} />
      </mesh>

      {/* 4 Corner Chevron Markers along ground circle */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
        <group key={`chevron_${idx}`} rotation={[0, angle, 0]} position={[0, 0.022, 0]}>
          <mesh position={[0, 0, radius * 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.06, 0.12, 3]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* ─── B. FLOATING 3D DOWNWARD-POINTING ARROW ─── */}
      <group ref={arrowGroupRef} position={[0, arrowHeight, 0]}>
        {/* Downward Arrow Cone Head (Point pointing straight down at ground circle) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.22, 0.44, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* Arrow Shaft (Cylinder above the cone head) */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.38, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.3}
            roughness={0.25}
            metalness={0.3}
          />
        </mesh>

        {/* Arrow Top Diamond / Cap */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={1.8}
            roughness={0.1}
          />
        </mesh>

        {/* Pulsing Floating Halo Ring around Arrow Shaft */}
        <mesh ref={haloRingRef} position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.022, 8, 24]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>

        {/* Action Key Badge ([E]) floating above arrow */}
        <group position={[0, 0.88, 0]}>
          {/* Badge Background Box */}
          <mesh>
            <boxGeometry args={[0.36, 0.22, 0.06]} />
            <meshStandardMaterial
              color="#0d0a07"
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>
          {/* Front Action Badge with rendered label */}
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial map={labelTexture} transparent />
          </mesh>
          {/* Back Action Badge with rendered label */}
          <mesh position={[0, 0, -0.032]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial map={labelTexture} transparent />
          </mesh>
        </group>
      </group>

      {/* ─── C. WARM AMBER AMBIENT BEACON LIGHT ─── */}
      <pointLight
        ref={beaconLightRef}
        position={[0, 0.8, 0]}
        color={color}
        intensity={2.2}
        distance={5.0}
        decay={1.8}
      />
    </group>
  );
}
