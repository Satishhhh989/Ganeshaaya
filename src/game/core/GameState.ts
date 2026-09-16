import { useSyncExternalStore } from 'react';
import type { GameStateType, SceneId, DialogueSequence, InteractionTarget, AudioSettings, PresentScenePhase } from './types';
import { OPENING_DIALOGUE, STORY_MODE_DIALOGUE } from '../dialogue/dialogueData';

interface GameStoreState {
  gameState: GameStateType;
  currentScene: SceneId;
  presentScenePhase: PresentScenePhase;
  activeDialogue: DialogueSequence | null;
  dialogueIndex: number;
  activeInteraction: InteractionTarget | null;
  currentObjective: string;
  cinematicMode: boolean;
  audioSettings: AudioSettings;
  controlsLocked: boolean;
  playerPos: [number, number, number];
  playerRot: number;
  isPlayerMoving: boolean;
  isPlayerRunning: boolean;
  isChildSitting: boolean;
}

const initialAudioSettings: AudioSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
};

class GameStateStore {
  private state: GameStoreState = {
    gameState: 'MENU',
    currentScene: 'PRESENT_HOME',
    presentScenePhase: 'APPROACH',
    activeDialogue: null,
    dialogueIndex: 0,
    activeInteraction: null,
    currentObjective: 'Approach Dada in the warm living room',
    cinematicMode: false,
    audioSettings: initialAudioSettings,
    controlsLocked: false,
    playerPos: [0.65, 0, 5.05],
    playerRot: 0,
    isPlayerMoving: false,
    isPlayerRunning: false,
    isChildSitting: false,
  };

  private listeners = new Set<() => void>();

  getState(): GameStoreState {
    return this.state;
  }

  private setState(partial: Partial<GameStoreState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // Actions
  startGame = () => {
    this.setState({
      gameState: 'PLAYING',
      currentScene: 'PRESENT_HOME',
      presentScenePhase: 'APPROACH',
      controlsLocked: false,
      isChildSitting: false,
      currentObjective: 'Approach Dada in the warm living room [WASD to walk]',
    });
  };

  openMenu = () => {
    this.setState({
      gameState: 'MENU',
      controlsLocked: true,
    });
  };

  startDialogue = (sequence: DialogueSequence = OPENING_DIALOGUE) => {
    this.setState({
      gameState: 'DIALOGUE',
      activeDialogue: sequence,
      dialogueIndex: 0,
      controlsLocked: true,
      cinematicMode: true,
    });
  };

  advanceDialogue = () => {
    const { activeDialogue, dialogueIndex, presentScenePhase } = this.state;
    if (!activeDialogue) return;

    if (dialogueIndex + 1 < activeDialogue.lines.length) {
      this.setState({ dialogueIndex: dialogueIndex + 1 });
    } else {
      // If closing the initial opening dialogue, start the physical walk-to-sofa transition!
      if (presentScenePhase === 'APPROACH' || presentScenePhase === 'INITIAL_DIALOGUE') {
        this.completeInitialDialogue();
      } else {
        this.closeDialogue();
      }
    }
  };

  completeInitialDialogue = () => {
    this.setState({
      gameState: 'PLAYING',
      activeDialogue: null,
      dialogueIndex: 0,
      presentScenePhase: 'OLD_MAN_WALKING_SOFA',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'Dada is walking to the sofa...',
    });
  };

  setPresentScenePhase = (phase: PresentScenePhase) => {
    this.setState({ presentScenePhase: phase });
  };

  setChildSitting = (sitting: boolean) => {
    this.setState({ isChildSitting: sitting });
  };

  startStoryMode = () => {
    this.setState({
      presentScenePhase: 'STORY_MODE',
      gameState: 'DIALOGUE',
      activeDialogue: STORY_MODE_DIALOGUE,
      dialogueIndex: 0,
      isChildSitting: true,
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: "Listen to Dada's Tale of Lord Ganesha",
    });
  };

  closeDialogue = () => {
    this.setState({
      gameState: 'PLAYING',
      activeDialogue: null,
      dialogueIndex: 0,
      controlsLocked: false,
      cinematicMode: false,
      currentObjective: 'Ganesh Chaturthi celebration tale unfolds.',
    });
  };

  setActiveInteraction = (target: InteractionTarget | null) => {
    if (this.state.activeInteraction?.id !== target?.id) {
      this.setState({ activeInteraction: target });
    }
  };

  setPlayerTransform = (
    pos: [number, number, number],
    rot: number,
    isMoving: boolean,
    isRunning: boolean
  ) => {
    this.state.playerPos = pos;
    this.state.playerRot = rot;
    this.state.isPlayerMoving = isMoving;
    this.state.isPlayerRunning = isRunning;
    // Don't fire store listener on every frame for position to avoid React re-render thrash
  };

  updateAudioSettings = (partial: Partial<AudioSettings>) => {
    this.setState({
      audioSettings: { ...this.state.audioSettings, ...partial },
    });
  };

  setScene = (scene: SceneId) => {
    this.setState({ currentScene: scene });
  };
}

export const gameStateStore = new GameStateStore();

/**
 * React hook to subscribe to game state changes
 */
export function useGameState(): GameStoreState {
  return useSyncExternalStore(
    gameStateStore.subscribe,
    gameStateStore.getState.bind(gameStateStore)
  );
}
