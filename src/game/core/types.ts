export type GameStateType = 'MENU' | 'PLAYING' | 'DIALOGUE' | 'PAUSED' | 'LOADING' | 'GAME_COMPLETE';

export type PresentScenePhase =
  | 'APPROACH'
  | 'INITIAL_DIALOGUE'
  | 'OLD_MAN_WALKING_SOFA'
  | 'OLD_MAN_SITTING'
  | 'CHILD_WALKING_SOFA'
  | 'CHILD_SITTING'
  | 'STORY_MODE'
  | 'TRANSITION_TO_MYTHOLOGY'
  | 'RETURN_TO_PRESENT'
  | 'TIME_PASSAGE'
  | 'ADULT_PROTAGONIST'
  | 'ANNUAL_FESTIVAL_MONTAGE'
  | 'CURRENT_YEAR'
  | 'FINANCIAL_PROBLEM'
  | 'COMPETITION_DISCOVERY'
  | 'GAME_DEVELOPMENT_READY'
  | 'GAME_DEVELOPMENT'
  | 'COMPETITION_READY'
  | 'COMPETITION'
  | 'COMPETITION_WIN'
  | 'PRIZE_RECEIVED'
  | 'PANDAL_READY'
  | 'PANDAL_BUILDING'
  | 'PANDAL_COMPLETE'
  | 'GANESH_CHATURTHI_READY'
  | 'FESTIVAL_PREPARATION'
  | 'GANESH_CHATURTHI_CELEBRATION'
  | 'FINAL_CINEMATIC'
  | 'GAME_COMPLETE';

export type PandalTask =
  | 'STRUCTURE'
  | 'ROOF'
  | 'CLOTH'
  | 'STAGE'
  | 'FLOWERS'
  | 'RANGOLI'
  | 'LIGHTS'
  | 'FINAL_DECORATION'
  | 'PANDAL_STRUCTURE'
  | 'PANDAL_ROOF'
  | 'PANDAL_CLOTH'
  | 'STAGE_DECORATION'
  | 'FLOWER_DECORATION';

export type GameDevState =
  | 'NOT_STARTED'
  | 'GAME_PROJECT_STARTED'
  | 'GAME_CONCEPT_CREATED'
  | 'GAME_PROTOTYPE_CREATED'
  | 'GAME_PROTOTYPE_PLAYABLE'
  | 'GAME_POLISHED'
  | 'GAME_SUBMITTED';

export type ShivaStoryPhase =
  | 'SHIVA_SEQUENCE_READY'
  | 'SHIVA_INTRO'
  | 'SHIVA_GAMEPLAY'
  | 'SHIVA_APPROACH'
  | 'CONFRONTATION'
  | 'TRISHUL_CINEMATIC'
  | 'GANESHA_AFTERMATH'
  | 'RESTORATION_READY'
  | 'SHIVA_SEARCH'
  | 'ELEPHANT_ENCOUNTER'
  | 'DIVINE_TRANSITION'
  | 'DIVINE_RESTORATION'
  | 'GANESHA_DIVINE_AWAKENING'
  | 'FAMILY_REUNION'
  | 'DIVINE_BLESSING'
  | 'RETURN_TO_PRESENT_READY';

export type SceneId = 
  | 'PRESENT_HOME'
  | 'MYTHOLOGY_CREATION'
  | 'GANESHA_STORY'
  | 'SHIVA_SEQUENCE'
  | 'RESTORATION'
  | 'NIAT_COMPETITION'
  | 'PANDAL'
  | 'CELEBRATION';

export interface DialogueLine {
  id: string;
  speaker: 'Child' | 'Old Man' | 'Narrator' | 'Parvati' | 'Shiva' | 'Ganesha';
  text: string;
  hindiText?: string;
  // External audio file hook (e.g. '/assets/audio/voice/line_1.mp3')
  audioFile?: string;
  audioCue?: string;
  // Optional character animation to trigger (e.g. 'talk', 'sit', 'curious', 'nod')
  animation?: string;
  // Optional camera event/framing (e.g. 'child_close', 'old_man_close', 'two_shot', 'story_wide')
  cameraEvent?: 'child_close' | 'old_man_close' | 'two_shot' | 'wide' | 'story_mode' | string;
  cameraFocus?: 'child' | 'old_man' | 'two_shot' | 'wide';
  nextId?: string | null;
}

export interface DialogueSequence {
  id: string;
  title: string;
  lines: DialogueLine[];
  onCompleteAction?: string;
}

export interface InteractionTarget {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  prompt: string;
  label?: string;
  actionKey?: string;
  onInteract: () => void;
  enabled?: boolean;
}

export interface CharacterControlInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  interact: boolean;
  jump?: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}
