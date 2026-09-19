import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';

export function AtmosphereLighting() {
  const { presentScenePhase, timePassageStage = 0 } = useGameState();

  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const diyaLight1 = useRef<THREE.PointLight>(null);
  const diyaLight2 = useRef<THREE.PointLight>(null);
  const fireplaceLight = useRef<THREE.PointLight>(null);

  // Target lighting characteristics based on narrative time passage stage
  const lightingTargets = useMemo(() => {
    if (presentScenePhase === 'TIME_PASSAGE') {
      if (timePassageStage === 0) {
        // Childhood 2012: Warm golden afternoon sunlight streaming onto sofa
        return {
          sunColor: new THREE.Color('#fff0d6'),
          sunIntensity: 2.3,
          sunPos: [7, 11, 2],
          ambientColor: new THREE.Color('#ffdcb0'),
          ambientIntensity: 0.45,
          hemiSky: new THREE.Color('#fff1db'),
          hemiGround: new THREE.Color('#3d2719'),
        };
      } else if (timePassageStage === 1) {
        // School Years 2016: Crisp fresh morning sunlight
        return {
          sunColor: new THREE.Color('#fffbe6'),
          sunIntensity: 2.6,
          sunPos: [8, 12, 1],
          ambientColor: new THREE.Color('#e8f4f8'),
          ambientIntensity: 0.48,
          hemiSky: new THREE.Color('#f0f9ff'),
          hemiGround: new THREE.Color('#38281d'),
        };
      } else if (timePassageStage === 2) {
        // College Years 2020: Golden hour / twilight into cozy evening
        return {
          sunColor: new THREE.Color('#fca311'),
          sunIntensity: 1.7,
          sunPos: [5, 6, 3],
          ambientColor: new THREE.Color('#ffc300'),
          ambientIntensity: 0.4,
          hemiSky: new THREE.Color('#fed9b7'),
          hemiGround: new THREE.Color('#2d1e15'),
        };
      }
    }

    if (presentScenePhase === 'ANNUAL_FESTIVAL_MONTAGE') {
      // Festive warmth: marigold golden celebratory glow
      return {
        sunColor: new THREE.Color('#ffb703'),
        sunIntensity: 2.4,
        sunPos: [6, 10, 2],
        ambientColor: new THREE.Color('#ffe5b4'),
        ambientIntensity: 0.52,
        hemiSky: new THREE.Color('#ffecd1'),
        hemiGround: new THREE.Color('#3e2213'),
      };
    }

    // Default / Adult Present Day 2024: Calm, clear, mature daylight
    return {
      sunColor: new THREE.Color('#ffffff'),
      sunIntensity: 2.2,
      sunPos: [7, 11, 2],
      ambientColor: new THREE.Color('#fff4e6'),
      ambientIntensity: 0.45,
      hemiSky: new THREE.Color('#fff1db'),
      hemiGround: new THREE.Color('#3d2719'),
    };
  }, [presentScenePhase, timePassageStage]);

  // Smooth dynamic light morphing and organic flame flickers
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // Lerp lighting towards targets
    if (sunLightRef.current) {
      sunLightRef.current.color.lerp(lightingTargets.sunColor, dt * 2.0);
      sunLightRef.current.intensity = THREE.MathUtils.lerp(
        sunLightRef.current.intensity,
        lightingTargets.sunIntensity,
        dt * 2.0
      );
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.lerp(lightingTargets.ambientColor, dt * 2.0);
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(
        ambientLightRef.current.intensity,
        lightingTargets.ambientIntensity,
        dt * 2.0
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.lerp(lightingTargets.hemiSky, dt * 2.0);
      hemiLightRef.current.groundColor.lerp(lightingTargets.hemiGround, dt * 2.0);
    }

    // Organic flame flickers
    if (diyaLight1.current) {
      diyaLight1.current.intensity = 2.0 + Math.sin(time * 12) * 0.18 + Math.cos(time * 7) * 0.12;
    }
    if (diyaLight2.current) {
      diyaLight2.current.intensity = 1.8 + Math.sin(time * 10 + 2) * 0.15 + Math.cos(time * 8.5) * 0.1;
    }
    if (fireplaceLight.current) {
      fireplaceLight.current.intensity = 2.2 + Math.sin(time * 14) * 0.28 + Math.cos(time * 9) * 0.18;
    }
  });

  return (
    <>
      {/* Rich warm hemisphere ambient bounce */}
      <hemisphereLight
        ref={hemiLightRef}
        color="#fff1db"
        groundColor="#3d2719"
        intensity={0.75}
      />

      {/* Soft warm ambient fill */}
      <ambientLight ref={ambientLightRef} color="#ffdcb0" intensity={0.45} />

      {/* Dynamic sunlight streaming through windows */}
      <directionalLight
        ref={sunLightRef}
        position={[7, 11, 2]}
        color="#fff0d6"
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
      />

      {/* Living room chandelier main warm glow (hangs at [-0.17, 4.04, 4.7]) */}
      <pointLight
        position={[-0.17, 3.6, 4.7]}
        color="#ffe2b5"
        intensity={3.2}
        distance={9.5}
        decay={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0003}
      />

      {/* Dining area chandelier warm glow (hangs at [-0.30, 4.04, -3.2]) */}
      <pointLight
        position={[-0.3, 3.6, -3.2]}
        color="#ffe2b5"
        intensity={2.2}
        distance={7.5}
        decay={1.8}
      />

      {/* Brick Fireplace organic warm flame light (at [4.14, 1.02, 5.42]) */}
      <pointLight
        ref={fireplaceLight}
        position={[3.8, 0.75, 5.4]}
        color="#ff6010"
        distance={7.0}
        decay={2}
      />

      {/* Living room coffee table Diya light (table at [-0.27, 0.58, 5.44]) */}
      <pointLight
        ref={diyaLight1}
        position={[-0.27, 0.75, 5.3]}
        color="#ffa028"
        distance={3.8}
        decay={2}
      />

      {/* Fireplace mantel Diya light */}
      <pointLight
        ref={diyaLight2}
        position={[4.05, 1.18, 5.3]}
        color="#ff9020"
        distance={3.2}
        decay={2}
      />
    </>
  );
}
