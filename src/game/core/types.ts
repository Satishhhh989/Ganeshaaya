export type GameStateType = 'MENU' | 'PLAYING' | 'DIALOGUE' | 'PAUSED' | 'LOADING';

export type PresentScenePhase =
  | 'APPROACH'
  | 'INITIAL_DIALOGUE'
  | 'OLD_MAN_WALKING_SOFA'
  | 'OLD_MAN_SITTING'
  | 'CHILD_WALKING_SOFA'
  | 'CHILD_SITTING'
  | 'STORY_MODE';

export type SceneId = 
  | 'PRESENT_HOME'
  | 'MYTHOLOGY_CREATION'
  | 'GANESHA_STORY'
  | 'SHIVA_SEQUENCE'
  | 'RESTORATION'
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
