import { useEffect, useMemo } from 'react';
import { useGameState, gameStateStore, normalizePandalTaskId } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { interactionManager } from '../../interaction/useInteraction';
import type { PandalTask } from '../../core/types';
import { InteractiveTargetArrow3D } from './InteractiveTargetArrow3D';

export interface PandalStationDef {
  id: PandalTask;
  label: string;
  actionPrompt: string;
  cost: number;
  resourcePos: [number, number, number];
  targetPos: [number, number, number];
  prerequisite: PandalTask | null;
  prerequisiteHint: string;
}

export const PANDAL_STATIONS: PandalStationDef[] = [
  {
    id: 'STRUCTURE',
    label: 'Bamboo Framework',
    actionPrompt: 'Pick Up Bamboo & Raise Framework',
    cost: 3500,
    resourcePos: [-3.8, 0, 2.8],
    targetPos: [-2.6, 0, 1.2],
    prerequisite: null,
    prerequisiteHint: '',
  },
  {
    id: 'ROOF',
    label: 'Protective Canopy',
    actionPrompt: 'Raise Protective Roof Canopy',
    cost: 1500,
    resourcePos: [3.8, 0, 2.2],
    targetPos: [2.6, 0, 0.8],
    prerequisite: 'STRUCTURE',
    prerequisiteHint: 'Erect the bamboo framework first.',
  },
  {
    id: 'CLOTH',
    label: 'Festive Drapery',
    actionPrompt: 'Drape Saffron & Crimson Satin',
    cost: 1500,
    resourcePos: [-3.8, 0, 0.4],
    targetPos: [-2.6, 0, -0.6],
    prerequisite: 'ROOF',
    prerequisiteHint: 'Secure the protective roof first.',
  },
  {
    id: 'STAGE',
    label: 'Altar Stage Platform',
    actionPrompt: 'Assemble Altar Platform',
    cost: 2000,
    resourcePos: [-1.8, 0, -1.8],
    targetPos: [0, 0, 0.8],
    prerequisite: 'CLOTH',
    prerequisiteHint: 'Hang the festive drapery first.',
  },
  {
    id: 'FLOWERS',
    label: 'Marigold Garlands',
    actionPrompt: 'String Fresh Marigold Garlands',
    cost: 1500,
    resourcePos: [3.8, 0, -0.4],
    targetPos: [2.6, 0, -0.6],
    prerequisite: 'STAGE',
    prerequisiteHint: 'Build the altar stage first.',
  },
  {
    id: 'RANGOLI',
    label: 'Sacred Floor Rangoli',
    actionPrompt: 'Draw Sacred Floor Rangoli',
    cost: 1000,
    resourcePos: [1.8, 0, 3.4],
    targetPos: [0, 0, 2.2],
    prerequisite: 'FLOWERS',
    prerequisiteHint: 'Hang the fresh marigolds first.',
  },
  {
    id: 'LIGHTS',
    label: 'Festive Fairy Lights',
    actionPrompt: 'String Warm Fairy Lights',
    cost: 2000,
    resourcePos: [-3.6, 0, 4.0],
    targetPos: [-2.8, 0, 2.6],
    prerequisite: 'RANGOLI',
    prerequisiteHint: 'Complete the floor rangoli first.',
  },
  {
    id: 'FINAL_DECORATION',
    label: 'Sacred Ganesha Murti',
    actionPrompt: 'Consecrate Sri Ganesha on Altar',
    cost: 2000,
    resourcePos: [0, 0, 4.4],
    targetPos: [0, 0, 0.0],
    prerequisite: 'LIGHTS',
    prerequisiteHint: 'Illuminate the pandal with lights first.',
  },
];

export function PandalInteractionAnchors() {
  const { completedPandalTasks, presentScenePhase } = useGameState();

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

  // Determine the single next active task for subtle guidance
  const activeNextTask = useMemo(() => {
    return PANDAL_STATIONS.find((station) => {
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
  }, [completedPandalTasks]);

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
          prompt: `${station.actionPrompt} [₹${station.cost.toLocaleString('en-IN')}]`,
          label: `${station.actionPrompt} [₹${station.cost.toLocaleString('en-IN')}]`,
          position: station.resourcePos,
          radius: 3.2,
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
          position: station.resourcePos,
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

  const isTaskCompleted = (id: PandalTask) => {
    return completedPandalTasks.some((t) => normalizePandalTaskId(t) === normalizePandalTaskId(id));
  };

  if (presentScenePhase !== 'PANDAL_BUILDING') return null;

  return (
    <group name="Pandal_Physical_Resources">
      {/* ─── 1. BAMBOO POLES RESOURCE PILE (Visible until STRUCTURE is built) ─── */}
      {!isTaskCompleted('STRUCTURE') && (
        <group position={[-3.8, 0, 2.8]} rotation={[0, 0.4, 0]}>
          {/* Wooden Sawhorses */}
          <mesh position={[-0.8, 0.25, 0]} castShadow>
            <boxGeometry args={[0.08, 0.5, 0.6]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
          <mesh position={[0.8, 0.25, 0]} castShadow>
            <boxGeometry args={[0.08, 0.5, 0.6]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
          {/* Bamboo Poles resting on sawhorses */}
          {[-0.15, -0.05, 0.05, 0.15].map((zOffset, idx) => (
            <mesh
              key={idx}
              position={[0, 0.52 + (idx % 2) * 0.06, zOffset]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshStandardMaterial color="#d4a373" roughness={0.6} />
            </mesh>
          ))}
          {/* Coir rope binding */}
          <mesh position={[-0.6, 0.55, 0]}>
            <torusGeometry args={[0.12, 0.015, 6, 12]} />
            <meshStandardMaterial color="#8c6239" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ─── 2. ROOF CANOPY & ROPES (Visible until ROOF is built) ─── */}
      {!isTaskCompleted('ROOF') && (
        <group position={[3.8, 0, 2.2]} rotation={[0, -0.3, 0]}>
          {/* Wooden crate */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.8, 0.5, 0.8]} />
            <meshStandardMaterial color="#6b4423" roughness={0.85} />
          </mesh>
          {/* Rolled tarpaulin canvas */}
          <mesh position={[0, 0.58, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.9, 12]} />
            <meshStandardMaterial color="#1e40af" roughness={0.7} />
          </mesh>
          {/* Coir rope coil */}
          <mesh position={[0.2, 0.56, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 6, 12]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        </group>
      )}

      {/* ─── 3. CLOTH BOLTS (Visible until CLOTH is built) ─── */}
      {!isTaskCompleted('CLOTH') && (
        <group position={[-3.8, 0, 0.4]} rotation={[0, 0.2, 0]}>
          {/* Wooden bench */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.1, 0.44, 0.5]} />
            <meshStandardMaterial color="#4a3728" roughness={0.75} />
          </mesh>
          {/* Saffron Silk Bolt */}
          <mesh position={[-0.25, 0.52, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.65, 10]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Crimson Silk Bolt */}
          <mesh position={[0.25, 0.52, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.65, 10]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      )}

      {/* ─── 4. ALTAR STAGE PLANKS (Visible until STAGE is built) ─── */}
      {!isTaskCompleted('STAGE') && (
        <group position={[-1.8, 0, -1.8]} rotation={[0, -0.4, 0]}>
          {/* Stack of smooth teak planks */}
          {[0, 0.08, 0.16, 0.24].map((y, idx) => (
            <mesh key={idx} position={[0, y + 0.04, 0]} castShadow>
              <boxGeometry args={[1.4, 0.07, 0.55]} />
              <meshStandardMaterial color="#854d0e" roughness={0.65} />
            </mesh>
          ))}
        </group>
      )}

      {/* ─── 5. FRESH MARIGOLD BASKETS (Visible until FLOWERS is built) ─── */}
      {!isTaskCompleted('FLOWERS') && (
        <group position={[3.8, 0, -0.4]}>
          {/* Wicker cane basket 1 */}
          <mesh position={[-0.25, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.22, 0.4, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.9} />
          </mesh>
          {/* Yellow Marigold heap */}
          <mesh position={[-0.25, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.26, 8, 8]} />
            <meshStandardMaterial color="#eab308" roughness={0.8} />
          </mesh>
          {/* Wicker cane basket 2 */}
          <mesh position={[0.25, 0.18, 0.1]} castShadow>
            <cylinderGeometry args={[0.28, 0.2, 0.36, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.9} />
          </mesh>
          {/* Orange Marigold heap */}
          <mesh position={[0.25, 0.38, 0.1]} castShadow>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshStandardMaterial color="#f97316" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* ─── 6. RANGOLI POWDER THALI (Visible until RANGOLI is built) ─── */}
      {!isTaskCompleted('RANGOLI') && (
        <group position={[1.8, 0, 3.4]} rotation={[0, 0.5, 0]}>
          {/* Low wooden stool */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.24, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Brass Puja Thali */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.32, 0.3, 0.03, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Powder bowls (Vermilion, Turmeric, White Rice) */}
          <mesh position={[-0.1, 0.28, 0]}>
            <coneGeometry args={[0.07, 0.09, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.9} />
          </mesh>
          <mesh position={[0.1, 0.28, 0]}>
            <coneGeometry args={[0.07, 0.09, 8]} />
            <meshStandardMaterial color="#eab308" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.28, 0.12]}>
            <coneGeometry args={[0.07, 0.09, 8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ─── 7. FAIRY LIGHTS REEL & LANTERNS (Visible until LIGHTS is built) ─── */}
      {!isTaskCompleted('LIGHTS') && (
        <group position={[-3.6, 0, 4.0]}>
          {/* Wooden cable spool */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.52, 12]} />
            <meshStandardMaterial color="#57534e" roughness={0.8} />
          </mesh>
          {/* Fairy wire coil */}
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.44, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.6} />
          </mesh>
          {/* Paper Akash Kandil folded on top */}
          <mesh position={[0, 0.58, 0]} rotation={[0.2, 0.4, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* ─── 8. SACRED CLAY GANESHA PALANQUIN (Visible until FINAL_DECORATION is built) ─── */}
      {!isTaskCompleted('FINAL_DECORATION') && (
        <group position={[0, 0, 4.4]}>
          {/* Wooden Palanquin with handles */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.7, 0.12, 0.7]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          {/* Carrying poles */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Yellow sacred silk cloth covering */}
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
          {/* Sacred Clay Idol silhouette waiting in palanquin */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshStandardMaterial color="#d4a373" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.12, 0.24, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.7} />
          </mesh>
          {/* Small Diya / Incense plate */}
          <mesh position={[0.22, 0.28, 0.22]}>
            <cylinderGeometry args={[0.05, 0.04, 0.02, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* ─── ACTIVE TASK IN-WORLD GROUND CIRCLE & FLOATING 3D POINTING ARROW ─── */}
      {activeNextTask && (
        <InteractiveTargetArrow3D
          position={[activeNextTask.resourcePos[0], 0.02, activeNextTask.resourcePos[2]]}
          color="#ffb703"
          accentColor="#fb8500"
          radius={0.68}
          label="E"
          arrowHeight={1.4}
        />
      )}
    </group>
  );
}
