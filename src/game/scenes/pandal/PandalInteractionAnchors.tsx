import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, gameStateStore, normalizePandalTaskId } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { interactionManager } from '../../interaction/useInteraction';
import type { PandalTask } from '../../core/types';

export interface PandalStationDef {
  id: PandalTask;
  label: string;
  actionPrompt: string;
  cost: number;
  pos: [number, number, number];
  prerequisite: PandalTask | null;
  prerequisiteHint: string;
}

export const PANDAL_STATIONS: PandalStationDef[] = [
  {
    id: 'STRUCTURE',
    label: 'Bamboo Framework',
    actionPrompt: 'Build Bamboo Framework',
    cost: 3500,
    pos: [-2.6, 0, 1.2],
    prerequisite: null,
    prerequisiteHint: '',
  },
  {
    id: 'ROOF',
    label: 'Protective Canopy',
    actionPrompt: 'Raise Protective Canopy',
    cost: 1500,
    pos: [2.6, 0, 0.8],
    prerequisite: 'STRUCTURE',
    prerequisiteHint: 'Finish the pandal structure first.',
  },
  {
    id: 'CLOTH',
    label: 'Festive Drapery',
    actionPrompt: 'Drape Saffron & Crimson Satin',
    cost: 1500,
    pos: [-2.6, 0, -0.6],
    prerequisite: 'ROOF',
    prerequisiteHint: 'Raise the protective roof first.',
  },
  {
    id: 'STAGE',
    label: 'Altar Stage Platform',
    actionPrompt: 'Assemble Altar Stage Platform',
    cost: 2000,
    pos: [0, 0, 0.8],
    prerequisite: 'CLOTH',
    prerequisiteHint: 'Hang the festive drapery first.',
  },
  {
    id: 'FLOWERS',
    label: 'Marigold Garlands',
    actionPrompt: 'String Fresh Marigold Garlands',
    cost: 1500,
    pos: [2.6, 0, -0.6],
    prerequisite: 'STAGE',
    prerequisiteHint: 'Assemble the altar stage first.',
  },
  {
    id: 'RANGOLI',
    label: 'Sacred Rangoli',
    actionPrompt: 'Draw Sacred Floor Rangoli',
    cost: 1000,
    pos: [0, 0, 2.2],
    prerequisite: 'FLOWERS',
    prerequisiteHint: 'String the fresh flowers first.',
  },
  {
    id: 'LIGHTS',
    label: 'Festive Fairy Lights',
    actionPrompt: 'String Festive Fairy Lights',
    cost: 2000,
    pos: [-2.8, 0, 2.6],
    prerequisite: 'RANGOLI',
    prerequisiteHint: 'Complete the sacred rangoli first.',
  },
  {
    id: 'FINAL_DECORATION',
    label: 'Sacred Ganesha Murti',
    actionPrompt: 'Install Sacred Clay Ganesha Murti',
    cost: 2000,
    pos: [0, 0, 0.0],
    prerequisite: 'LIGHTS',
    prerequisiteHint: 'Install festive lighting first.',
  },
];

export function PandalInteractionAnchors() {
  const { completedPandalTasks, presentScenePhase } = useGameState();
  const groundRingRef = useRef<THREE.Mesh>(null);

  // Sound and state execution handler
  const executeTask = (station: PandalStationDef) => {
    switch (station.id) {
      case 'STRUCTURE':
      case 'ROOF':
      case 'STAGE':
      case 'PANDAL_STRUCTURE':
      case 'PANDAL_ROOF':
      case 'STAGE_DECORATION':
        audioManager.playWoodCraft();
        break;
      case 'CLOTH':
      case 'PANDAL_CLOTH':
        audioManager.playFabricRustle();
        break;
      case 'FLOWERS':
      case 'RANGOLI':
      case 'FLOWER_DECORATION':
        audioManager.playFloralChime();
        break;
      case 'LIGHTS':
        audioManager.playLightsIgnite();
        break;
      case 'FINAL_DECORATION':
        audioManager.playSacredArtiBell();
        audioManager.playCelebrationChime();
        break;
      default:
        audioManager.playUIClick();
    }

    interactionManager.unregister(`pandal_task_${station.id}`);
    interactionManager.unregister(`pandal_locked_${station.id}`);
    gameStateStore.setActiveInteraction(null);
    gameStateStore.completePandalTask(station.id, station.cost);
  };

  // Synchronize stations with the central InteractionManager
  useEffect(() => {
    if (presentScenePhase !== 'PANDAL_BUILDING') {
      PANDAL_STATIONS.forEach((s) => {
        interactionManager.unregister(`pandal_task_${s.id}`);
        interactionManager.unregister(`pandal_locked_${s.id}`);
      });
      return;
    }

    PANDAL_STATIONS.forEach((station) => {
      const isDone = completedPandalTasks.some(
        (t) => normalizePandalTaskId(t) === normalizePandalTaskId(station.id)
      );

      if (isDone) {
        interactionManager.unregister(`pandal_task_${station.id}`);
        interactionManager.unregister(`pandal_locked_${station.id}`);
        return;
      }

      const prereqDone =
        !station.prerequisite ||
        completedPandalTasks.some(
          (t) => normalizePandalTaskId(t) === normalizePandalTaskId(station.prerequisite!)
        );

      if (prereqDone) {
        interactionManager.unregister(`pandal_locked_${station.id}`);
        interactionManager.register({
          id: `pandal_task_${station.id}`,
          name: station.label,
          prompt: `${station.actionPrompt} (₹${station.cost.toLocaleString('en-IN')})`,
          label: `${station.actionPrompt} (₹${station.cost.toLocaleString('en-IN')})`,
          position: station.pos,
          radius: 2.8,
          enabled: true,
          onInteract: () => executeTask(station),
        });
      } else {
        interactionManager.unregister(`pandal_task_${station.id}`);
        interactionManager.register({
          id: `pandal_locked_${station.id}`,
          name: station.label,
          prompt: station.prerequisiteHint,
          label: station.prerequisiteHint,
          position: station.pos,
          radius: 2.8,
          enabled: true,
          onInteract: () => {
            audioManager.playUIClick();
          },
        });
      }
    });

    return () => {
      PANDAL_STATIONS.forEach((s) => {
        interactionManager.unregister(`pandal_task_${s.id}`);
        interactionManager.unregister(`pandal_locked_${s.id}`);
      });
    };
  }, [completedPandalTasks, presentScenePhase]);

  // Determine the single next active task for subtle floor guide
  const activeNextTask = PANDAL_STATIONS.find((station) => {
    const isDone = completedPandalTasks.some(
      (t) => normalizePandalTaskId(t) === normalizePandalTaskId(station.id)
    );
    if (isDone) return false;
    return (
      !station.prerequisite ||
      completedPandalTasks.some(
        (t) => normalizePandalTaskId(t) === normalizePandalTaskId(station.prerequisite!)
      )
    );
  });

  // Soft breathing animation for the grounded chalk marker
  useFrame(({ clock }) => {
    if (!groundRingRef.current) return;
    const t = clock.getElapsedTime();
    const mat = groundRingRef.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = 0.28 + Math.sin(t * 2.5) * 0.12;
    }
  });

  if (presentScenePhase !== 'PANDAL_BUILDING' || !activeNextTask) return null;

  return (
    <group name="Pandal_World_Station_Guide">
      {/* 
        Subtle grounded chalk ring on the pavement floor (never floating).
        Indicates the next construction focus naturally like traditional kolam floor chalk.
      */}
      <mesh
        ref={groundRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[activeNextTask.pos[0], 0.02, activeNextTask.pos[2]]}
      >
        <ringGeometry args={[0.32, 0.46, 32]} />
        <meshBasicMaterial
          color="#f5b041"
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
