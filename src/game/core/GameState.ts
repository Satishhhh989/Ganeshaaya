import { useSyncExternalStore } from 'react';
import type {
  GameStateType,
  SceneId,
  DialogueSequence,
  InteractionTarget,
  AudioSettings,
  PresentScenePhase,
  ShivaStoryPhase,
  GameDevState,
  PandalTask,
} from './types';
import type { StoryState } from '../story/storyTypes';
import { OPENING_DIALOGUE, STORY_MODE_DIALOGUE, RETURN_HOME_DIALOGUE } from '../dialogue/dialogueData';

interface GameStoreState {
  gameState: GameStateType;
  currentScene: SceneId;
  presentScenePhase: PresentScenePhase;
  storyState: StoryState;
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
  shivaPhase: ShivaStoryPhase;
  isNearElephant: boolean;
  gameBudget: number;
  isAdultProtagonist: boolean;
  gameDevState: GameDevState;
  prizeReceived: boolean;
  prizeAmount: number;
  isWorkingAtDesk: boolean;
  completedPandalTasks: PandalTask[];
  pandalSpentBudget: number;
  pandalRemainingBudget: number;
  pandalComplete: boolean;
  pandalPlanningDone: boolean;
  isPandalMontagePlaying: boolean;
  ganeshaInstalled: boolean;
  ganeshaChaturthiCelebrationComplete: boolean;
  festivalTimeOfDay: 'MORNING' | 'EVENING' | 'NIGHT';
}

export function normalizePandalTaskId(task: string): string {
  if (task === 'PANDAL_STRUCTURE' || task === 'STRUCTURE') return 'STRUCTURE';
  if (task === 'PANDAL_ROOF' || task === 'ROOF') return 'ROOF';
  if (task === 'PANDAL_CLOTH' || task === 'CLOTH') return 'CLOTH';
  if (task === 'STAGE_DECORATION' || task === 'STAGE') return 'STAGE';
  if (task === 'FLOWER_DECORATION' || task === 'FLOWERS') return 'FLOWERS';
  if (task === 'RANGOLI') return 'RANGOLI';
  if (task === 'LIGHTS') return 'LIGHTS';
  if (task === 'FINAL_DECORATION') return 'FINAL_DECORATION';
  return task;
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
    storyState: 'PRESENT_STORY_INTRO',
    activeDialogue: null,
    dialogueIndex: 0,
    activeInteraction: null,
    currentObjective: 'Approach Dada in the warm living room',
    cinematicMode: false,
    audioSettings: initialAudioSettings,
    controlsLocked: false,
    playerPos: [0.6, 0, 5.2],
    playerRot: 0,
    isPlayerMoving: false,
    isPlayerRunning: false,
    isChildSitting: false,
    shivaPhase: 'SHIVA_SEQUENCE_READY',
    isNearElephant: false,
    gameBudget: 0,
    isAdultProtagonist: false,
    gameDevState: 'NOT_STARTED',
    prizeReceived: false,
    prizeAmount: 0,
    isWorkingAtDesk: false,
    completedPandalTasks: [],
    pandalSpentBudget: 0,
    pandalRemainingBudget: 15000,
    pandalComplete: false,
    pandalPlanningDone: false,
    isPandalMontagePlaying: false,
    ganeshaInstalled: false,
    ganeshaChaturthiCelebrationComplete: false,
    festivalTimeOfDay: 'MORNING',
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
      currentScene: 'PRESENT_HOME',
      presentScenePhase: 'APPROACH',
      controlsLocked: true,
      cinematicMode: false,
      activeDialogue: null,
      dialogueIndex: 0,
      activeInteraction: null,
      isChildSitting: false,
      isAdultProtagonist: false,
      isWorkingAtDesk: false,
      gameBudget: 0,
      prizeReceived: false,
      prizeAmount: 0,
      completedPandalTasks: [],
      pandalSpentBudget: 0,
      pandalRemainingBudget: 15000,
      pandalComplete: false,
      pandalPlanningDone: false,
      isPandalMontagePlaying: false,
      ganeshaInstalled: false,
      ganeshaChaturthiCelebrationComplete: false,
      festivalTimeOfDay: 'MORNING',
      playerPos: [0.6, 0, 5.2],
      playerRot: 0,
      currentObjective: 'Approach Dada in the warm living room',
    });
  };

  completeGame = () => {
    this.setState({
      gameState: 'GAME_COMPLETE',
      presentScenePhase: 'GAME_COMPLETE',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'Ganpati Bappa Morya · The sacred story is complete',
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
      } else if (presentScenePhase === 'STORY_MODE') {
        this.startMythologyTransition();
      } else if (presentScenePhase === 'RETURN_TO_PRESENT') {
        this.startTimePassage();
      } else {
        this.closeDialogue();
      }
    }
  };

  startTimePassage = () => {
    this.setState({
      gameState: 'PLAYING',
      activeDialogue: null,
      dialogueIndex: 0,
      presentScenePhase: 'TIME_PASSAGE',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'Witness the years pass in the family home...',
    });
  };

  startMythologyTransition = () => {
    this.setState({
      gameState: 'PLAYING',
      activeDialogue: null,
      dialogueIndex: 0,
      presentScenePhase: 'TRANSITION_TO_MYTHOLOGY',
      storyState: 'TRANSITION_TO_MYTHOLOGY',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'Transitioning to the sacred legend of Lord Ganesha...',
    });
  };

  enterMythologyScene = () => {
    this.setState({
      currentScene: 'MYTHOLOGY_CREATION',
      presentScenePhase: 'STORY_MODE',
      storyState: 'MYTHOLOGY_INTRO',
      gameState: 'PLAYING',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'The Tale of Lord Ganesha Begins',
    });
  };

  setStoryState = (storyState: StoryState) => {
    this.setState({ storyState });
  };

  startShivaSequence = () => {
    this.setState({
      currentScene: 'SHIVA_SEQUENCE',
      storyState: 'SHIVA_INTRO',
      shivaPhase: 'SHIVA_INTRO',
      gameState: 'PLAYING',
      cinematicMode: true,
      controlsLocked: true,
      currentObjective: 'Witness the arrival of Lord Shiva on Mount Kailash',
    });
  };

  setShivaPhase = (phase: ShivaStoryPhase) => {
    const isGameplay =
      phase === 'SHIVA_GAMEPLAY' ||
      phase === 'SHIVA_APPROACH' ||
      phase === 'SHIVA_SEARCH';
    this.setState({
      shivaPhase: phase,
      storyState: phase as StoryState,
      controlsLocked: !isGameplay,
      cinematicMode: !isGameplay,
      currentObjective:
        phase === 'SHIVA_INTRO'
          ? 'Lord Shiva arrives upon Mount Kailash'
          : phase === 'SHIVA_GAMEPLAY'
          ? 'Explore the mountain path and approach the sacred cave entrance [WASD to Walk]'
          : phase === 'SHIVA_APPROACH'
          ? 'Confront the steadfast guardian at the sacred threshold [Press E]'
          : phase === 'CONFRONTATION'
          ? 'Dialogue of divine duty between Shiva and Ganesha'
          : phase === 'TRISHUL_CINEMATIC'
          ? 'The fateful raising of the celestial Trishul'
          : phase === 'GANESHA_AFTERMATH'
          ? 'Silence over Kailash: Shiva contemplates the fallen child'
          : phase === 'RESTORATION_READY'
          ? 'Phase 3 Complete: Prepared for Divine Restoration'
          : phase === 'SHIVA_SEARCH'
          ? 'Search the ancient forest clearing for the sacred being [WASD to Walk]'
          : phase === 'ELEPHANT_ENCOUNTER'
          ? 'Commune with the sacred celestial elephant in the clearing'
          : phase === 'DIVINE_TRANSITION'
          ? 'The sacred elephant bestows its divine offering'
          : phase === 'DIVINE_RESTORATION'
          ? 'Mahadev unites the sacred elephant head with the child'
          : phase === 'GANESHA_DIVINE_AWAKENING'
          ? 'Sri Ganesha awakens upon the sacred blooming lotus'
          : phase === 'FAMILY_REUNION'
          ? 'Divine reunion of Lord Shiva, Mata Parvati, and Sri Ganesha'
          : phase === 'DIVINE_BLESSING'
          ? 'Lord Shiva declares Ganesha as Prathama Pujya'
          : 'The sacred legend concludes; ready to return to present day',
    });
  };

  replayShivaSequence = () => {
    this.setShivaPhase('SHIVA_GAMEPLAY');
  };

  setNearElephant = (isNear: boolean) => {
    if (this.state.isNearElephant !== isNear) {
      this.setState({ isNearElephant: isNear });
    }
  };

  returnToHomeScene = () => {
    this.setState({
      currentScene: 'PRESENT_HOME',
      presentScenePhase: 'RETURN_TO_PRESENT',
      gameState: 'DIALOGUE',
      activeDialogue: RETURN_HOME_DIALOGUE,
      dialogueIndex: 0,
      storyState: 'PRESENT_STORY_INTRO',
      controlsLocked: true,
      cinematicMode: true,
      currentObjective: 'Listen to Dada as the sacred legend concludes',
    });
  };

  advancePresentPhase = (phase: PresentScenePhase) => {
    const isAdult =
      phase === 'ADULT_PROTAGONIST' ||
      phase === 'ANNUAL_FESTIVAL_MONTAGE' ||
      phase === 'CURRENT_YEAR' ||
      phase === 'FINANCIAL_PROBLEM' ||
      phase === 'COMPETITION_DISCOVERY' ||
      phase === 'GAME_DEVELOPMENT_READY' ||
      phase === 'GAME_DEVELOPMENT' ||
      phase === 'COMPETITION_READY' ||
      phase === 'COMPETITION' ||
      phase === 'COMPETITION_WIN' ||
      phase === 'PRIZE_RECEIVED' ||
      phase === 'PANDAL_READY' ||
      phase === 'PANDAL_BUILDING' ||
      phase === 'PANDAL_COMPLETE' ||
      phase === 'GANESH_CHATURTHI_READY' ||
      phase === 'FESTIVAL_PREPARATION' ||
      phase === 'GANESH_CHATURTHI_CELEBRATION' ||
      phase === 'FINAL_CINEMATIC';

    const isDevDesk = phase === 'GAME_DEVELOPMENT_READY' || phase === 'GAME_DEVELOPMENT';

    const budget =
      phase === 'COMPETITION_WIN' ||
      phase === 'PRIZE_RECEIVED' ||
      phase === 'PANDAL_READY' ||
      phase === 'PANDAL_BUILDING' ||
      phase === 'PANDAL_COMPLETE' ||
      phase === 'GANESH_CHATURTHI_READY' ||
      phase === 'FESTIVAL_PREPARATION' ||
      phase === 'GANESH_CHATURTHI_CELEBRATION' ||
      phase === 'FINAL_CINEMATIC'
        ? 15000
        : this.state.gameBudget;

    const scene: SceneId =
      phase === 'COMPETITION' || phase === 'COMPETITION_WIN'
        ? 'NIAT_COMPETITION'
        : phase === 'PANDAL_BUILDING' ||
          phase === 'PANDAL_COMPLETE' ||
          phase === 'GANESH_CHATURTHI_READY' ||
          phase === 'FESTIVAL_PREPARATION' ||
          phase === 'GANESH_CHATURTHI_CELEBRATION' ||
          phase === 'FINAL_CINEMATIC'
        ? 'PANDAL'
        : 'PRESENT_HOME';

    const isWon =
      phase === 'COMPETITION_WIN' ||
      phase === 'PRIZE_RECEIVED' ||
      phase === 'PANDAL_READY' ||
      phase === 'PANDAL_BUILDING' ||
      phase === 'PANDAL_COMPLETE' ||
      phase === 'GANESH_CHATURTHI_READY' ||
      phase === 'FESTIVAL_PREPARATION' ||
      phase === 'GANESH_CHATURTHI_CELEBRATION' ||
      phase === 'FINAL_CINEMATIC';

    // Staging position updates for smooth continuity
    let newPlayerPos = this.state.playerPos;
    let newPlayerRot = this.state.playerRot;
    let controlsLocked = true;
    let cinematicMode = true;

    if (isDevDesk) {
      newPlayerPos = [2.4, 0, 3.95];
      newPlayerRot = Math.PI; // facing desk towards negative Z
    } else if (phase === 'PRIZE_RECEIVED' || phase === 'PANDAL_READY') {
      newPlayerPos = [0.6, 0, 5.2];
      newPlayerRot = 0;
    } else if (phase === 'PANDAL_BUILDING') {
      newPlayerPos = [0, 0, 6.8];
      newPlayerRot = 0;
      controlsLocked = false;
      cinematicMode = false;
    } else if (phase === 'PANDAL_COMPLETE' || phase === 'GANESH_CHATURTHI_READY') {
      newPlayerPos = [0, 0, 3.2];
      newPlayerRot = 0;
      controlsLocked = true;
      cinematicMode = true;
    } else if (phase === 'FESTIVAL_PREPARATION') {
      newPlayerPos = [0, 0, 4.0];
      newPlayerRot = 0;
      controlsLocked = true;
      cinematicMode = true;
    } else if (phase === 'GANESH_CHATURTHI_CELEBRATION') {
      newPlayerPos = [0, 0, 4.5];
      newPlayerRot = 0;
      controlsLocked = false;
      cinematicMode = false;
    } else if (phase === 'FINAL_CINEMATIC') {
      newPlayerPos = [-0.2, 0.7, -0.2];
      newPlayerRot = 0.2;
      controlsLocked = true;
      cinematicMode = true;
    } else if (phase === 'GAME_COMPLETE') {
      controlsLocked = true;
      cinematicMode = true;
    }

    this.setState({
      presentScenePhase: phase,
      currentScene: scene,
      isAdultProtagonist: isAdult,
      isChildSitting: isAdult ? false : this.state.isChildSitting,
      isWorkingAtDesk: isDevDesk,
      gameBudget: budget,
      prizeReceived: isWon,
      prizeAmount: isWon ? 15000 : this.state.prizeAmount,
      playerPos: newPlayerPos,
      playerRot: newPlayerRot,
      controlsLocked,
      cinematicMode,
      currentObjective:
        phase === 'TIME_PASSAGE'
          ? 'Years pass by in the warm family home...'
          : phase === 'ADULT_PROTAGONIST'
          ? 'Vinay has grown into a young adult with a passion for games'
          : phase === 'ANNUAL_FESTIVAL_MONTAGE'
          ? 'Keeping the sacred promise: celebrating Bappa year after year'
          : phase === 'CURRENT_YEAR'
          ? 'Present Day 2024: Preparing for this year’s Ganesh Chaturthi'
          : phase === 'FINANCIAL_PROBLEM'
          ? 'Savings depleted: ₹15,000 needed to fund the community pandal'
          : phase === 'COMPETITION_DISCOVERY'
          ? 'NIAT National Game Making Competition: ₹15,000 first prize!'
          : phase === 'GAME_DEVELOPMENT_READY'
          ? 'Prepare to build "The Legend of Vinayaka" at your workspace'
          : phase === 'GAME_DEVELOPMENT'
          ? 'Build, prototype and polish "The Legend of Vinayaka"'
          : phase === 'COMPETITION_READY'
          ? 'Reviewing final build and submitting to the NIAT jury'
          : phase === 'COMPETITION'
          ? 'NIAT National Championship: Auditorium Stage'
          : phase === 'COMPETITION_WIN'
          ? 'First Place Winner! ₹15,000 Cash Prize Awarded!'
          : phase === 'PRIZE_RECEIVED'
          ? '₹15,000 Prize Money Received! Festival budget secured'
          : phase === 'PANDAL_READY'
          ? 'Funds secured — Ready to build the Ganesh Chaturthi pandal'
          : phase === 'PANDAL_BUILDING'
          ? 'Explore the community ground & build the pandal [WASD to walk, E to interact]'
          : phase === 'PANDAL_COMPLETE'
          ? 'The Ganesh Chaturthi pandal is complete! Admire the sacred altar'
          : phase === 'GANESH_CHATURTHI_READY'
          ? 'Ganesh Chaturthi Ready: The neighborhood awaits the grand celebration!'
          : 'Ready for Ganesh Chaturthi pandal preparation',
    });
  };

  setPandalPlanningDone = (done: boolean = true) => {
    this.setState({ pandalPlanningDone: done });
  };

  completePandalTask = (task: PandalTask, cost: number) => {
    const norm = normalizePandalTaskId(task);
    const existing = this.state.completedPandalTasks;
    if (existing.some((t) => normalizePandalTaskId(t) === norm)) return;

    const newCompleted = [...existing, task];
    const newSpent = this.state.pandalSpentBudget + cost;
    const newRemaining = Math.max(0, 15000 - newSpent);
    const isAllComplete = newCompleted.length >= 8;
    const isGanesha = norm === 'FINAL_DECORATION' || this.state.ganeshaInstalled;

    this.setState({
      completedPandalTasks: newCompleted,
      pandalSpentBudget: newSpent,
      pandalRemainingBudget: newRemaining,
      ganeshaInstalled: isGanesha,
      pandalComplete: isAllComplete,
      controlsLocked: isAllComplete,
      cinematicMode: isAllComplete,
      presentScenePhase: isAllComplete ? 'PANDAL_COMPLETE' : 'PANDAL_BUILDING',
      currentObjective: isAllComplete
        ? 'The pandal is complete! Admire Lord Ganesha’s sacred altar'
        : `Building Bappa's Home: ${newCompleted.length}/8 tasks complete (Remaining: ₹${newRemaining.toLocaleString('en-IN')})`,
    });
  };

  setPandalMontage = (playing: boolean) => {
    this.setState({
      isPandalMontagePlaying: playing,
      cinematicMode: playing,
    });
  };

  setGaneshaInstalled = (installed: boolean = true) => {
    this.setState({ ganeshaInstalled: installed });
  };

  setFestivalTimeOfDay = (time: 'MORNING' | 'EVENING' | 'NIGHT') => {
    this.setState({ festivalTimeOfDay: time });
  };

  completeCelebration = () => {
    this.setState({
      ganeshaChaturthiCelebrationComplete: true,
      presentScenePhase: 'FINAL_CINEMATIC',
      cinematicMode: true,
      controlsLocked: true,
      currentObjective: 'Ganpati Bappa Morya! The sacred story has reached its heart',
    });
  };

  setGameDevState = (step: GameDevState) => {
    this.setState({
      gameDevState: step,
      currentObjective:
        step === 'GAME_PROJECT_STARTED'
          ? 'Initialize game workspace for "The Legend of Vinayaka"'
          : step === 'GAME_CONCEPT_CREATED'
          ? 'Draft game design doc & ancient Mount Kailash lore'
          : step === 'GAME_PROTOTYPE_CREATED'
          ? 'Rig 3D guardian character & sacred mountain environment'
          : step === 'GAME_PROTOTYPE_PLAYABLE'
          ? 'Test playable prototype: control young guardian at sacred gate'
          : step === 'GAME_POLISHED'
          ? 'Add golden aura shaders, temple soundscapes & compile build'
          : step === 'GAME_SUBMITTED'
          ? 'Project submitted to NIAT National Competition!'
          : this.state.currentObjective,
    });
  };

  setGameBudget = (budget: number) => {
    this.setState({ gameBudget: budget });
  };

  setAdultProtagonist = (isAdult: boolean) => {
    this.setState({ isAdultProtagonist: isAdult });
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

if (typeof window !== 'undefined') {
  (window as any).gameStateStore = gameStateStore;
}

/**
 * React hook to subscribe to game state changes
 */
export function useGameState(): GameStoreState {
  return useSyncExternalStore(
    gameStateStore.subscribe,
    gameStateStore.getState.bind(gameStateStore)
  );
}
