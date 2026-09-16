import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from './GameState';
import { SceneManager } from '../scenes/SceneManager';
import { PlayerController } from '../player/PlayerController';
import { useInteractionListener } from '../interaction/useInteraction';
import { MainMenu } from '../ui/components/MainMenu';
import { GameHUD } from '../ui/components/GameHUD';
import { InteractionPrompt } from '../ui/components/InteractionPrompt';
import { DialogueBox } from '../ui/components/DialogueBox';
import { LoadingScreen } from '../ui/components/LoadingScreen';

export function GameEngine() {
  const { gameState } = useGameState();

  // Listen for 'E' keypress to trigger nearby interactions
  useInteractionListener();

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0b0806',
      }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2, -3.2], fov: 48, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneManager />
          <PlayerController />
        </Suspense>
      </Canvas>

      {/* 2D Cinematic Game UI Overlays */}
      <LoadingScreen />
      {gameState === 'MENU' && <MainMenu />}
      <GameHUD />
      <InteractionPrompt />
      <DialogueBox />
    </div>
  );
}
