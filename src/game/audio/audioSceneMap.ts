/**
 * AUDIO SCENE MAPPING SYSTEM
 * 
 * Centralized, type-safe audio registry for scenes and speakers.
 * Source of truth mapped to existing public audio assets.
 * 
 * Rules:
 * - NO TTS fallback
 * - Natural 'ended' event synchronization (no arbitrary fixed timers)
 * - Single source of truth to avoid overlapping / duplicate audio across React re-renders
 * - Clean scene switching and V-index resets
 */

export type AudioGroupKey =
  | 'GRANDPA_VOICE'
  | 'KID_VOICE'
  | 'BACK_TO_ROOM_AJJA'
  | 'BACK_TO_ROOM_VINAY'
  | 'ELEPHANT_SCENE'
  | 'HEAD_JOIN'
  | 'SHIVA_TRISHUL';

export interface AudioTrackInfo {
  vNumber: number;
  url: string;
  speaker: string;
  sceneDescription: string;
  expectedText?: string;
}

export const AUDIO_SCENE_MAP: Record<AudioGroupKey, AudioTrackInfo[]> = {
  GRANDPA_VOICE: [
    { vNumber: 1, url: '/assets/audio/grandpa%20voice/v1.mp3', speaker: 'AJJA', sceneDescription: 'Living Room Opening' },
    { vNumber: 2, url: '/assets/audio/grandpa%20voice/v2.mp3', speaker: 'AJJA', sceneDescription: 'Living Room Opening' },
    { vNumber: 3, url: '/assets/audio/grandpa%20voice/v3.mp3', speaker: 'AJJA', sceneDescription: 'Living Room Opening' },
    { vNumber: 4, url: '/assets/audio/grandpa%20voice/v4.mp3', speaker: 'AJJA', sceneDescription: 'Living Room Opening' },
    { vNumber: 5, url: '/assets/audio/grandpa%20voice/v5.mp3', speaker: 'AJJA', sceneDescription: 'Mount Kailash & Parvati intro' },
    { vNumber: 6, url: '/assets/audio/grandpa%20voice/v6.mp3', speaker: 'AJJA', sceneDescription: 'Sacred clay & divine prana' },
    { vNumber: 7, url: '/assets/audio/grandpa%20voice/v7.mp3', speaker: 'AJJA', sceneDescription: 'Awakening & naming Ganesha' },
    { vNumber: 8, url: '/assets/audio/grandpa%20voice/v8.mp3', speaker: 'AJJA', sceneDescription: 'Parvati commands Ganesha to guard' },
    { vNumber: 9, url: '/assets/audio/grandpa%20voice/v9.mp3', speaker: 'AJJA', sceneDescription: 'Ganesha promised to obey' },
    { vNumber: 10, url: '/assets/audio/grandpa%20voice/v10.mp3', speaker: 'AJJA', sceneDescription: 'Lord Shiva returns to Kailash' },
    { vNumber: 11, url: '/assets/audio/grandpa%20voice/v11.mp3', speaker: 'AJJA', sceneDescription: 'Shiva reasons, Ganesha stands firm' },
    { vNumber: 12, url: '/assets/audio/grandpa%20voice/v12.mp3', speaker: 'AJJA', sceneDescription: 'Battle that shook the heavens' },
    { vNumber: 13, url: '/assets/audio/grandpa%20voice/v13.mp3', speaker: 'AJJA', sceneDescription: 'Mythology climax beat' },
    { vNumber: 14, url: '/assets/audio/grandpa%20voice/v14.mp3', speaker: 'AJJA', sceneDescription: 'Mythology aftermath beat' },
    { vNumber: 15, url: '/assets/audio/grandpa%20voice/v15.mp3', speaker: 'AJJA', sceneDescription: 'Mythology transition beat' },
    { vNumber: 16, url: '/assets/audio/grandpa%20voice/v16.mp3', speaker: 'AJJA', sceneDescription: 'Mythology resolution beat' },
    { vNumber: 17, url: '/assets/audio/grandpa%20voice/v17.mp3', speaker: 'AJJA', sceneDescription: 'Mythology closing beat' },
  ],

  KID_VOICE: [
    { vNumber: 1, url: '/assets/audio/kid%20voice/v1.mp3', speaker: 'VINAY', sceneDescription: 'Living Room Opening: Hey, Ajja.' },
    { vNumber: 2, url: '/assets/audio/kid%20voice/v2.mp3', speaker: 'VINAY', sceneDescription: 'Living Room Opening: Why do we celebrate Ganesh Chaturthi?' },
    { vNumber: 3, url: '/assets/audio/kid%20voice/v3.mp3', speaker: 'VINAY', sceneDescription: 'Living Room Opening: Because Ganesha is the most powerful God?' },
    { vNumber: 4, url: '/assets/audio/kid%20voice/v4.mp3', speaker: 'VINAY', sceneDescription: 'Living Room Opening: Then why, Ajja?' },
  ],

  SHIVA_TRISHUL: [
    {
      vNumber: 1,
      url: '/assets/audio/shiva%20trishul/v1.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Shiva realizes what had happened',
      expectedText: '“Only then did Shiva realize what had happened.”',
    },
    {
      vNumber: 2,
      url: '/assets/audio/shiva%20trishul/v2.mp3',
      speaker: 'AJJA',
      sceneDescription: 'His anger gave way to silence',
      expectedText: '“His anger gave way to silence.”',
    },
  ],

  ELEPHANT_SCENE: [
    {
      vNumber: 1,
      url: '/assets/audio/elephant%20scene/v1.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Shiva finds creature of wisdom',
      expectedText: '“Beyond the ancient trees, Shiva found a creature of great strength and wisdom.”',
    },
    {
      vNumber: 2,
      url: '/assets/audio/elephant%20scene/v2.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Gajaraj offers sacred spirit',
      expectedText: '“In quiet understanding, the noble Gajaraj offered its sacred spirit for the child.”',
    },
  ],

  HEAD_JOIN: [
    {
      vNumber: 1,
      url: '/assets/audio/head%20join/v1.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Cosmic prana flowed through the sacred form',
      expectedText: 'Cosmic prana flowed through the sacred form, and Ganesha breathed once more.',
    },
    {
      vNumber: 2,
      url: '/assets/audio/head%20join/v2.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Ganesha opened his gentle eyes, restored to life',
      expectedText: 'Ganesha opened his gentle eyes, restored to life.',
    },
    {
      vNumber: 3,
      url: '/assets/audio/head%20join/v3.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Parvati embraced her beloved son',
      expectedText: 'Parvati embraced her beloved son — sorrow dissolving into boundless joy.',
    },
    {
      vNumber: 4,
      url: '/assets/audio/head%20join/v4.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Shiva blessed Ganesha, Prathama Pujya',
      expectedText: 'Shiva blessed Ganesha and declared that he would be worshipped first before every new beginning.',
    },
  ],

  BACK_TO_ROOM_AJJA: [
    {
      vNumber: 1,
      url: '/assets/audio/back%20to%20room/ajja/v1.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Before every new beginning, we seek Ganesha’s blessings',
      expectedText: 'Yes, my boy. Before every new beginning, we seek Ganesha’s blessings.',
    },
    {
      vNumber: 2,
      url: '/assets/audio/back%20to%20room/ajja/v2.mp3',
      speaker: 'AJJA',
      sceneDescription: 'Good. Keep that devotion with you',
      expectedText: 'Good. Keep that devotion with you.',
    },
  ],

  BACK_TO_ROOM_VINAY: [
    {
      vNumber: 1,
      url: '/assets/audio/back%20to%20room/vinay%20/v1.mp3',
      speaker: 'VINAY',
      sceneDescription: "So that's why we worship Ganesha first?",
      expectedText: "So that's why we worship Ganesha first?",
    },
    {
      vNumber: 2,
      url: '/assets/audio/back%20to%20room/vinay%20/v2.mp3',
      speaker: 'VINAY',
      sceneDescription: "I'll never forget, Ajja.",
      expectedText: "I'll never forget, Ajja.",
    },
  ],
};

/**
 * Helper to retrieve an audio track by group and 1-based V-number
 */
export function getSceneAudio(group: AudioGroupKey, vNumber: number): AudioTrackInfo | null {
  const sequence = AUDIO_SCENE_MAP[group];
  if (!sequence) {
    console.warn(`[AudioSceneMap] Unknown audio group: ${group}`);
    return null;
  }
  const track = sequence.find((t) => t.vNumber === vNumber);
  if (!track) {
    console.warn(`[AudioSceneMap] Missing audio in group "${group}" at V${vNumber}`);
    return null;
  }
  return track;
}
