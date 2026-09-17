import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../core/GameState';
import { AdultCharacter } from '../../characters/ProceduralCharacters';

export function CompetitionScene() {
  const { presentScenePhase } = useGameState();
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const spotLight1Ref = useRef<THREE.SpotLight>(null);
  const spotLight2Ref = useRef<THREE.SpotLight>(null);
  const confettiGroupRef = useRef<THREE.Group>(null);

  const isWon = presentScenePhase === 'COMPETITION_WIN';

  // Confetti particles for winning celebration
  const confettiData = useMemo(() => {
    return Array.from({ length: 65 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        3.5 + Math.random() * 4,
        (Math.random() - 0.5) * 4
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      speed: 0.8 + Math.random() * 1.4,
      rotSpeed: 1.5 + Math.random() * 3,
      color: Math.random() > 0.4 ? '#ffb703' : Math.random() > 0.5 ? '#ffd166' : '#2a9d8f',
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Spotlights sweeping subtly over stage
    if (spotLight1Ref.current) {
      spotLight1Ref.current.target.position.set(
        Math.sin(t * 0.8) * 1.5,
        1.2,
        Math.cos(t * 0.6) * 0.8
      );
      spotLight1Ref.current.target.updateMatrixWorld();
    }
    if (spotLight2Ref.current) {
      spotLight2Ref.current.target.position.set(
        Math.cos(t * 0.7) * 2.0,
        1.5,
        Math.sin(t * 0.5) * 0.8
      );
      spotLight2Ref.current.target.updateMatrixWorld();
    }

    // Screen dynamic pulse
    if (screenMatRef.current) {
      const targetColor = isWon
        ? new THREE.Color('#ffb703')
        : new THREE.Color('#0077b6');
      screenMatRef.current.emissive.lerp(targetColor, 0.08);
      screenMatRef.current.emissiveIntensity = isWon
        ? 0.95 + Math.sin(t * 4.0) * 0.15
        : 0.75 + Math.sin(t * 2.0) * 0.1;
    }

    // Animate falling confetti when won
    if (isWon && confettiGroupRef.current) {
      confettiGroupRef.current.children.forEach((mesh, idx) => {
        const d = confettiData[idx];
        mesh.position.y -= d.speed * 0.025;
        mesh.rotation.x += d.rotSpeed * 0.02;
        mesh.rotation.y += d.rotSpeed * 0.02;

        if (mesh.position.y < 0.4) {
          mesh.position.y = 5.5 + Math.random() * 2.0;
        }
      });
    }
  });

  return (
    <group name="CompetitionScene">
      {/* Dramatic Auditorium Atmospheric Lighting */}
      <ambientLight intensity={0.35} color="#0c1222" />
      <directionalLight position={[0, 8, 4]} intensity={0.7} color="#dbeafe" castShadow />

      {/* Sweeping Stage Spotlights */}
      <spotLight
        ref={spotLight1Ref}
        position={[-3, 6, 4]}
        angle={0.45}
        penumbra={0.6}
        intensity={isWon ? 3.5 : 2.2}
        color={isWon ? '#ffeaa7' : '#90e0ef'}
        castShadow
      />
      <spotLight
        ref={spotLight2Ref}
        position={[3, 6, 4]}
        angle={0.45}
        penumbra={0.6}
        intensity={isWon ? 3.5 : 2.2}
        color={isWon ? '#ffd166' : '#00b4d8'}
        castShadow
      />

      {/* ─── AUDITORIUM STAGE ─── */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[13, 0.4, 7.5]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Stage Front Golden Trim */}
      <mesh position={[0, 0.38, 3.72]}>
        <boxGeometry args={[13, 0.05, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ─── GIANT LED BACKDROP SCREEN ─── */}
      <group position={[0, 3.6, -3.4]}>
        {/* Screen Bezel */}
        <mesh castShadow>
          <boxGeometry args={[9.4, 4.6, 0.12]} />
          <meshStandardMaterial color="#090a0f" roughness={0.8} />
        </mesh>
        {/* Active Display Panel */}
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[9.2, 4.4]} />
          <meshStandardMaterial
            ref={screenMatRef}
            color={isWon ? '#ff9e00' : '#03045e'}
            emissive={isWon ? '#ffb703' : '#0077b6'}
            emissiveIntensity={0.85}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* Side LED Banners */}
      <mesh position={[-5.6, 3.0, -3.2]} castShadow>
        <boxGeometry args={[0.9, 3.4, 0.08]} />
        <meshStandardMaterial color="#023e8a" emissive="#0077b6" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[5.6, 3.0, -3.2]} castShadow>
        <boxGeometry args={[0.9, 3.4, 0.08]} />
        <meshStandardMaterial color="#023e8a" emissive="#0077b6" emissiveIntensity={0.5} />
      </mesh>

      {/* ─── SPEAKER PODIUM & MICROPHONE ─── */}
      <group position={[-3.8, 0.4, 0.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 1.05, 0.55]} />
          <meshStandardMaterial color="#2b2d42" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* NIAT Logo plate on podium */}
        <mesh position={[0, 0.25, 0.28]}>
          <planeGeometry args={[0.42, 0.18]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Mic stem */}
        <mesh position={[0, 0.65, 0.1]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} />
        </mesh>
        {/* Host character silhouette */}
        <mesh position={[0, 0.95, -0.45]} castShadow>
          <capsuleGeometry args={[0.18, 0.5, 8, 12]} />
          <meshStandardMaterial color="#1e1e24" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.45, -0.45]} castShadow>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#e5b182" />
        </mesh>
      </group>

      {/* ─── JURY TABLE & JUDGES ─── */}
      <group position={[3.6, 0.4, -0.6]}>
        {/* Table */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.9, 0.8]} />
          <meshStandardMaterial color="#1f2421" roughness={0.6} />
        </mesh>
        {/* 3 Judges seated */}
        {[-0.65, 0, 0.65].map((x, i) => (
          <group key={i} position={[x, 0.5, -0.45]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.15, 0.35, 6, 8]} />
              <meshStandardMaterial color="#2d3142" />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshStandardMaterial color="#e5b182" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── FINALIST PARTICIPANTS LINEUP ON STAGE ─── */}
      {/* Other 2 student contestants */}
      <group position={[-1.4, 0.4, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.55, 8, 10]} />
          <meshStandardMaterial color="#495057" />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
      </group>
      <group position={[1.4, 0.4, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.55, 8, 10]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#e8b88a" />
        </mesh>
      </group>

      {/* ─── PROTAGONIST VINAY (STAGE CENTER) ─── */}
      <group position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
        <AdultCharacter speed={0} isRunning={false} isSitting={false} isTalking={isWon} />
        {/* Subtle golden halo when won */}
        {isWon && (
          <pointLight position={[0, 1.2, 0.4]} color="#ffb703" intensity={1.8} distance={2.5} />
        )}
      </group>

      {/* ─── AUDITORIUM AUDIENCE SILHOUETTES (TIERED ROWS) ─── */}
      <group position={[0, 0, 5.2]}>
        {[0, 1, 2].map((row) => (
          <group key={row} position={[0, -row * 0.25, row * 1.5]}>
            {[-4.5, -3.2, -1.8, -0.6, 0.6, 1.8, 3.2, 4.5].map((x, col) => (
              <group key={col} position={[x, 0.4, 0]}>
                <mesh>
                  <capsuleGeometry args={[0.14, 0.35, 6, 6]} />
                  <meshStandardMaterial color="#0b0d14" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0.38, 0]}>
                  <sphereGeometry args={[0.08, 8, 6]} />
                  <meshStandardMaterial color="#161a29" roughness={0.9} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ─── CELEBRATORY CONFETTI PARTICLES (ACTIVE WHEN WON) ─── */}
      {isWon && (
        <group ref={confettiGroupRef}>
          {confettiData.map((d, i) => (
            <mesh key={i} position={d.pos} rotation={d.rot}>
              <planeGeometry args={[0.08, 0.05]} />
              <meshBasicMaterial color={d.color} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
