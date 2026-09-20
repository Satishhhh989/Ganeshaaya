import { Suspense, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, gameStateStore } from './GameState';
import { audioManager } from '../audio/AudioManager';
import { SceneManager } from '../scenes/SceneManager';
import { PlayerController } from '../player/PlayerController';
import { useInteractionListener } from '../interaction/useInteraction';
import { MainMenu } from '../ui/components/MainMenu';
import { GameHUD } from '../ui/components/GameHUD';
import { InteractionPrompt } from '../ui/components/InteractionPrompt';
import { DialogueBox } from '../ui/components/DialogueBox';
import { LoadingScreen } from '../ui/components/LoadingScreen';
import { TransitionOverlay } from '../story/TransitionOverlay';
import { MythologyScene } from '../scenes/mythology/MythologyScene';
import { MythologyShivaUI } from '../scenes/mythology/MythologyShivaScene';
import { TimePassageSequence } from '../scenes/present/TimePassageSequence';
import { WorkspaceDevConsole } from '../scenes/dev/WorkspaceDevConsole';
import { CompetitionUI } from '../scenes/competition/CompetitionUI';
import { PostCompetitionTransition } from '../scenes/present/PostCompetitionTransition';
import { PandalHUD } from '../scenes/pandal/PandalHUD';
import { PandalMontage } from '../scenes/pandal/PandalMontage';
import { PandalRevealCinematic } from '../scenes/pandal/PandalRevealCinematic';
import { FestivalArrivalModal } from '../scenes/pandal/FestivalArrivalModal';
import { CelebrationHUD } from '../scenes/pandal/CelebrationHUD';
import { FinalCelebrationCinematic } from '../scenes/pandal/FinalCelebrationCinematic';
import { MobileOrientationOverlay } from '../ui/mobile/MobileOrientationOverlay';
import { MobileControlsManager } from '../ui/mobile/MobileControlsManager';

const GameArcade = lazy(() => import('../arcade/ui/GameArcade').then(m => ({ default: m.GameArcade })));

export function GameEngine() {
  const { gameState, currentScene, presentScenePhase, arcadeActive } = useGameState();

  // Listen for 'E' keypress to trigger nearby interactions
  useInteractionListener();

  // Centralized Scene Ambience Audio Management with Smooth Cross-fades
  useEffect(() => {
    if (gameState === 'MENU') {
      audioManager.setSceneAmbience('HOME');
    } else if (
      currentScene === 'MYTHOLOGY_CREATION' ||
      currentScene === 'GANESHA_STORY' ||
      currentScene === 'SHIVA_SEQUENCE' ||
      currentScene === 'RESTORATION'
    ) {
      audioManager.setSceneAmbience('MYTHOLOGY');
    } else if (currentScene === 'NIAT_COMPETITION') {
      audioManager.setSceneAmbience('COMPETITION');
    } else if (currentScene === 'PANDAL' || currentScene === 'CELEBRATION') {
      audioManager.setSceneAmbience('GANESH_CHATURTHI');
    } else if (
      presentScenePhase === 'GAME_DEVELOPMENT_READY' ||
      presentScenePhase === 'GAME_DEVELOPMENT'
    ) {
      audioManager.setSceneAmbience('GAME_DEV');
    } else {
      audioManager.setSceneAmbience('HOME');
    }
  }, [currentScene, presentScenePhase, gameState]);

  const isMythology = currentScene === 'MYTHOLOGY_CREATION' || currentScene === 'GANESHA_STORY';

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
      {/* 3D WebGL Canvas (Active during Present Home, 3D Shiva Scene, NIAT Competition, and Pandal) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isMythology ? 0 : 1,
          pointerEvents: isMythology ? 'none' : 'auto',
          transition: 'opacity 1.2s ease-in-out',
        }}
      >
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
            {(currentScene === 'PRESENT_HOME' || currentScene === 'PANDAL') &&
              gameState !== 'MENU' && <PlayerController />}
          </Suspense>
        </Canvas>
      </div>

      {/* 2D / 2.5D Cinematic Mythology Story Mode Engine */}
      {isMythology && <MythologyScene />}

      {/* Seamless 3D to 2D Cinematic Transition Bloom & Fade Overlay */}
      <TransitionOverlay />

      {/* 2D Present Home UI Overlays (Only active in 3D Home Scene) */}
      <LoadingScreen />
      {gameState === 'MENU' && <MainMenu />}
      {currentScene === 'PRESENT_HOME' &&
        gameState !== 'MENU' &&
        presentScenePhase !== 'TRANSITION_TO_MYTHOLOGY' &&
        presentScenePhase !== 'GAME_DEVELOPMENT' && (
          <>
            <GameHUD />
            <InteractionPrompt />
            <DialogueBox />
          </>
        )}

      {/* Present-Day Time Passage & Discovery Progression */}
      {currentScene === 'PRESENT_HOME' && <TimePassageSequence />}

      {/* Interactive Game Development Workspace Console */}
      {currentScene === 'PRESENT_HOME' && <WorkspaceDevConsole />}

      {/* Post-Competition Return Home & Pandal Ready Milestone */}
      {currentScene === 'PRESENT_HOME' && <PostCompetitionTransition />}

      {/* 3D Shiva Mount Kailash UI & Cinematic Overlays */}
      {currentScene === 'SHIVA_SEQUENCE' && <MythologyShivaUI />}

      {/* NIAT National Championship Auditorium UI & Winner Reveal */}
      {currentScene === 'NIAT_COMPETITION' && <CompetitionUI />}

      {/* Ganesh Chaturthi Pandal HUD & Interactive Building */}
      {currentScene === 'PANDAL' && <PandalHUD />}

      {/* Pandal Consecration & Grand Reveal Cinematic */}
      {currentScene === 'PANDAL' && <PandalRevealCinematic />}

      {/* Pandal Construction Cinematic Montage */}
      {currentScene === 'PANDAL' && <PandalMontage />}

      {/* Ganesh Chaturthi Morning Arrival & Consecration Sequence */}
      {currentScene === 'PANDAL' && <FestivalArrivalModal />}

      {/* Ganesh Chaturthi Community Celebration & Grandfather Dialogue HUD */}
      {currentScene === 'PANDAL' && <CelebrationHUD />}

      {/* Grand Evening Aarti & Full-Circle Retrospective Cinematic */}
      {currentScene === 'PANDAL' && <FinalCelebrationCinematic />}

      {/* Game Arcade — Vinay's Mini-Game Collection */}
      {arcadeActive && (
        <Suspense fallback={null}>
          <GameArcade onComplete={() => gameStateStore.exitArcade()} />
        </Suspense>
      )}

      {/* ─── MOBILE LANDSCAPE SUPPORT ONLY ─── */}
      {/* 1. Portrait orientation blocker with minimal cinematic rotate device indicator */}
      <MobileOrientationOverlay />

      {/* 2. Touch movement joystick, right swipe camera look, and contextual actions */}
      <MobileControlsManager />
    </div>
  );
}

