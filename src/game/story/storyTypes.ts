/**
 * Core types for the Reusable 2D/2.5D Story Narration System
 */

export type StoryState =
  | 'PRESENT_STORY_INTRO'
  | 'TRANSITION_TO_MYTHOLOGY'
  | 'MYTHOLOGY_INTRO'
  | 'PARVATI_INTRO'
  | 'GANESHA_CREATION'
  | 'GANESHA_AWAKENING'
  | 'GANESHA_GUARDING'
  | 'SHIVA_SETUP'
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

export type LayerType = 'background' | 'midground' | 'character' | 'foreground' | 'particles' | 'effect';

export interface StoryLayer {
  id: string;
  type: LayerType;
  src?: string;
  depth: number; // 0 = static / infinite distance, 0.2 = slow, 0.5 = medium, 1.0 = fast foreground
  opacity?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  blendMode?: 'normal' | 'screen' | 'overlay' | 'multiply';
  animation?: 'subtle_float' | 'slow_pulse' | 'glow_breathe' | 'slide_up' | 'none';
}

export interface StoryCamera {
  initialZoom: number;
  targetZoom: number;
  panX: number; // Percentage offset (-10 to 10)
  panY: number; // Percentage offset (-10 to 10)
  duration: number; // Duration of camera movement in seconds
}

export interface StoryNarration {
  id: string;
  speaker: string; // 'Dada' | 'Narrator' | 'Parvati' | 'Ganesha'
  title?: string;
  text: string;
  hindiText?: string;
  audio?: string; // Voice acting audio path hook
}

export interface StoryAudioHooks {
  bgm?: string; // Background music track hook
  ambient?: string; // Ambient soundscape hook (e.g. mountain wind, temple bells)
  sfx?: string; // Specific transition or event sound effect
}

export interface StorySceneEffects {
  particleType?: 'golden_prana' | 'lotus_drift' | 'himalayan_snow' | 'thunder_sparks';
  glowColor?: string;
  vignette?: boolean;
  pulseGlow?: boolean;
  flash?: boolean;
  ambientLightColor?: string;
}

export interface StoryScene {
  id: string;
  stateId: StoryState;
  title: string;
  subtitle?: string;
  background: string;
  layers: StoryLayer[];
  narration: StoryNarration;
  audio?: StoryAudioHooks;
  camera: StoryCamera;
  effects?: StorySceneEffects;
  nextScene?: StoryState;
  autoAdvanceDelay?: number; // Optional auto-advance time in ms
}
