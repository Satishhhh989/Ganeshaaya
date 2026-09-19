import type { StoryScene } from './storyTypes';
import { STORY_ASSETS } from './storyAssets';

export const STORY_SCENES: Record<string, StoryScene> = {
  // Beat 1: V5 - Mount Kailash & Parvati intro
  MYTHOLOGY_INTRO: {
    id: 'scene_01_kailash',
    stateId: 'MYTHOLOGY_INTRO',
    title: 'Mount Kailash',
    subtitle: 'The Sacred Abode of the Gods',
    background: STORY_ASSETS.backgrounds.kailashAbode.url,
    layers: [
      {
        id: 'layer_bg_kailash',
        type: 'background',
        src: STORY_ASSETS.backgrounds.kailashAbode.url,
        depth: 0.15,
        scale: 1.05,
      },
      {
        id: 'layer_particles_snow',
        type: 'particles',
        depth: 0.8,
      },
    ],
    narration: {
      id: 'narr_v5',
      speaker: 'Ajja',
      title: 'Mount Kailash',
      text: 'Long ago, on Mount Kailash, Goddess Parvati wished to create a child of her own.',
      audio: '/assets/audio/grandpa voice/v5.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/divine_kailash_ambience.mp3',
      ambient: '/assets/audio/sfx/himalayan_wind.mp3',
    },
    camera: {
      initialZoom: 1.0,
      targetZoom: 1.08,
      panX: 0,
      panY: -2,
      duration: 12,
    },
    effects: {
      particleType: 'himalayan_snow',
      vignette: true,
      ambientLightColor: 'rgba(255, 235, 195, 0.1)',
    },
    nextScene: 'GANESHA_CREATION',
  },

  // Beat 2: V6 - Sacred clay & life
  GANESHA_CREATION: {
    id: 'scene_02_creation',
    stateId: 'GANESHA_CREATION',
    title: 'The Sacred Creation',
    subtitle: 'Shaped from Sacred Clay',
    background: STORY_ASSETS.characters.parvatiCreatingClay.url,
    layers: [
      {
        id: 'layer_creation_hands',
        type: 'character',
        src: STORY_ASSETS.characters.parvatiCreatingClay.url,
        depth: 0.3,
        scale: 1.05,
      },
      {
        id: 'layer_golden_aura',
        type: 'effect',
        src: STORY_ASSETS.effects.divineGoldenAura.url,
        depth: 0.5,
        blendMode: 'screen',
        opacity: 0.45,
        animation: 'glow_breathe',
      },
      {
        id: 'layer_prana_sparkles',
        type: 'particles',
        depth: 0.85,
      },
    ],
    narration: {
      id: 'narr_v6',
      speaker: 'Ajja',
      title: 'Sacred Clay',
      text: 'She shaped a little boy from sacred clay and, with her divine power, breathed life into him.',
      audio: '/assets/audio/grandpa voice/v6.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/divine_kailash_ambience.mp3',
      sfx: '/assets/audio/sfx/sacred_hum.mp3',
    },
    camera: {
      initialZoom: 1.0,
      targetZoom: 1.14,
      panX: 0,
      panY: 2,
      duration: 11,
    },
    effects: {
      particleType: 'golden_prana',
      pulseGlow: true,
      glowColor: 'rgba(255, 190, 60, 0.4)',
    },
    nextScene: 'GANESHA_AWAKENING',
  },

  // Beat 3: V7 - Awakening and naming Ganesha
  GANESHA_AWAKENING: {
    id: 'scene_03_awakening',
    stateId: 'GANESHA_AWAKENING',
    title: 'The Awakening',
    subtitle: 'Named Ganesha',
    background: STORY_ASSETS.characters.ganeshaAwakened.url,
    layers: [
      {
        id: 'layer_ganesha_awakened',
        type: 'character',
        src: STORY_ASSETS.characters.ganeshaAwakened.url,
        depth: 0.35,
        scale: 1.04,
        animation: 'slow_pulse',
      },
      {
        id: 'layer_prana_aura',
        type: 'effect',
        src: STORY_ASSETS.effects.divineGoldenAura.url,
        depth: 0.5,
        blendMode: 'screen',
        opacity: 0.7,
        animation: 'glow_breathe',
      },
      {
        id: 'layer_lotus_foreground',
        type: 'foreground',
        src: STORY_ASSETS.props.lotusPetalsForeground.url,
        depth: 0.9,
        blendMode: 'screen',
        opacity: 0.5,
      },
      {
        id: 'layer_sparkles',
        type: 'particles',
        depth: 0.95,
      },
    ],
    narration: {
      id: 'narr_v7',
      speaker: 'Ajja',
      title: 'Life Awakens',
      text: 'The boy opened his eyes, and Parvati lovingly named him Ganesha.',
      audio: '/assets/audio/grandpa voice/v7.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/divine_kailash_ambience.mp3',
      sfx: '/assets/audio/sfx/divine_pulse_awakening.mp3',
    },
    camera: {
      initialZoom: 1.08,
      targetZoom: 1.0,
      panX: 0,
      panY: -1,
      duration: 10,
    },
    effects: {
      particleType: 'golden_prana',
      flash: true,
      pulseGlow: true,
      glowColor: 'rgba(255, 215, 80, 0.6)',
    },
    nextScene: 'GANESHA_GUARDING',
  },

  // Beat 4: V8 - Guarding the entrance command
  GANESHA_GUARDING: {
    id: 'scene_04_guarding',
    stateId: 'GANESHA_GUARDING',
    title: 'The Sacred Duty',
    subtitle: 'Guard the Entrance',
    background: STORY_ASSETS.characters.ganeshaGuarding.url,
    layers: [
      {
        id: 'layer_ganesha_guard',
        type: 'character',
        src: STORY_ASSETS.characters.ganeshaGuarding.url,
        depth: 0.35,
        scale: 1.05,
        animation: 'subtle_float',
      },
      {
        id: 'layer_petals_wind',
        type: 'foreground',
        src: STORY_ASSETS.props.lotusPetalsForeground.url,
        depth: 0.85,
        blendMode: 'screen',
        opacity: 0.4,
      },
      {
        id: 'layer_snow_dust',
        type: 'particles',
        depth: 0.8,
      },
    ],
    narration: {
      id: 'narr_v8',
      speaker: 'Ajja',
      title: 'The Command',
      text: 'One day, Parvati asked Ganesha to guard the entrance and not allow anyone to enter.',
      audio: '/assets/audio/grandpa voice/v8.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/divine_kailash_ambience.mp3',
      ambient: '/assets/audio/sfx/himalayan_wind.mp3',
    },
    camera: {
      initialZoom: 1.0,
      targetZoom: 1.08,
      panX: -1,
      panY: 0,
      duration: 12,
    },
    effects: {
      particleType: 'himalayan_snow',
      vignette: true,
    },
    nextScene: 'GANESHA_OBEYING',
  },

  // Beat 5: V9 - Ganesha promised to obey
  GANESHA_OBEYING: {
    id: 'scene_05_obeying',
    stateId: 'GANESHA_OBEYING',
    title: 'The Devoted Promise',
    subtitle: 'Obedience to Mother',
    background: STORY_ASSETS.characters.ganeshaGuarding.url,
    layers: [
      {
        id: 'layer_ganesha_obeying',
        type: 'character',
        src: STORY_ASSETS.characters.ganeshaGuarding.url,
        depth: 0.35,
        scale: 1.08,
        animation: 'subtle_float',
      },
      {
        id: 'layer_golden_aura_obeying',
        type: 'effect',
        src: STORY_ASSETS.effects.divineGoldenAura.url,
        depth: 0.5,
        blendMode: 'screen',
        opacity: 0.4,
        animation: 'glow_breathe',
      },
      {
        id: 'layer_snow_dust_obeying',
        type: 'particles',
        depth: 0.8,
      },
    ],
    narration: {
      id: 'narr_v9',
      speaker: 'Ajja',
      title: 'A Son’s Vow',
      text: 'Ganesha promised to obey his mother.',
      audio: '/assets/audio/grandpa voice/v9.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/divine_kailash_ambience.mp3',
      ambient: '/assets/audio/sfx/himalayan_wind.mp3',
    },
    camera: {
      initialZoom: 1.04,
      targetZoom: 1.12,
      panX: 0,
      panY: 1,
      duration: 8,
    },
    effects: {
      particleType: 'himalayan_snow',
      vignette: true,
      pulseGlow: true,
    },
    nextScene: 'SHIVA_SETUP',
  },

  // Beat 6: V10 - Shiva returns, Ganesha refuses to let Shiva pass
  SHIVA_SETUP: {
    id: 'scene_06_shiva_arrival',
    stateId: 'SHIVA_SETUP',
    title: 'Return to Kailash',
    subtitle: 'The Unknown Lord',
    background: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
    layers: [
      {
        id: 'layer_shiva_arrival',
        type: 'background',
        src: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
        depth: 0.25,
        scale: 1.07,
      },
      {
        id: 'layer_storm_sparks',
        type: 'particles',
        depth: 0.9,
      },
    ],
    narration: {
      id: 'narr_v10',
      speaker: 'Ajja',
      title: 'Lord Shiva Returns',
      text: 'Soon, Lord Shiva returned to Kailash.\nBut Ganesha did not know who he was, and he refused to let Shiva pass.',
      audio: '/assets/audio/grandpa voice/v10.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/shiva_arrival_storm.mp3',
      sfx: '/assets/audio/sfx/distant_thunder_damru.mp3',
    },
    camera: {
      initialZoom: 1.0,
      targetZoom: 1.15,
      panX: 0,
      panY: -2,
      duration: 13,
    },
    effects: {
      particleType: 'thunder_sparks',
      vignette: true,
      glowColor: 'rgba(80, 140, 255, 0.4)',
    },
    nextScene: 'SHIVA_CONFRONTATION',
  },

  // Beat 7: V11 - Shiva reasons, Ganesha stands firm
  SHIVA_CONFRONTATION: {
    id: 'scene_07_shiva_confrontation',
    stateId: 'SHIVA_CONFRONTATION',
    title: 'The Confrontation',
    subtitle: 'Steadfast at the Gates',
    background: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
    layers: [
      {
        id: 'layer_confrontation_bg',
        type: 'background',
        src: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
        depth: 0.2,
        scale: 1.08,
      },
      {
        id: 'layer_confrontation_guardian',
        type: 'character',
        src: STORY_ASSETS.characters.ganeshaGuarding.url,
        depth: 0.4,
        scale: 1.05,
        animation: 'subtle_float',
      },
      {
        id: 'layer_confrontation_sparks',
        type: 'particles',
        depth: 0.85,
      },
    ],
    narration: {
      id: 'narr_v11',
      speaker: 'Ajja',
      title: 'Standing Firm',
      text: 'Shiva tried to reason with him, but Ganesha stood firmly at the door.',
      audio: '/assets/audio/grandpa voice/v11.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/shiva_arrival_storm.mp3',
      ambient: '/assets/audio/sfx/himalayan_wind.mp3',
    },
    camera: {
      initialZoom: 1.05,
      targetZoom: 1.14,
      panX: -1,
      panY: -1,
      duration: 10,
    },
    effects: {
      particleType: 'thunder_sparks',
      vignette: true,
      glowColor: 'rgba(90, 140, 240, 0.35)',
    },
    nextScene: 'SHIVA_BATTLE',
  },

  // Beat 8: V12 - Fierce battle that shook the heavens
  SHIVA_BATTLE: {
    id: 'scene_08_shiva_battle',
    stateId: 'SHIVA_BATTLE',
    title: 'The Cosmic Disagreement',
    subtitle: 'Shaking the Heavens',
    background: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
    layers: [
      {
        id: 'layer_battle_sky',
        type: 'background',
        src: STORY_ASSETS.backgrounds.shivaArrivalSky.url,
        depth: 0.25,
        scale: 1.1,
      },
      {
        id: 'layer_battle_sparks',
        type: 'particles',
        depth: 0.9,
      },
    ],
    narration: {
      id: 'narr_v12',
      speaker: 'Ajja',
      title: 'The Clash',
      text: 'Their disagreement turned into a fierce battle that shook the heavens.',
      audio: '/assets/audio/grandpa voice/v12.mp3',
    },
    audio: {
      bgm: '/assets/audio/music/shiva_arrival_storm.mp3',
      sfx: '/assets/audio/sfx/distant_thunder_damru.mp3',
    },
    camera: {
      initialZoom: 1.0,
      targetZoom: 1.18,
      panX: 0,
      panY: -2,
      duration: 12,
    },
    effects: {
      particleType: 'thunder_sparks',
      vignette: true,
      glowColor: 'rgba(240, 120, 60, 0.45)',
    },
    nextScene: 'SHIVA_SEQUENCE_READY',
  },
};

export const STORY_SEQUENCE_ORDER: StoryScene['stateId'][] = [
  'MYTHOLOGY_INTRO',
  'GANESHA_CREATION',
  'GANESHA_AWAKENING',
  'GANESHA_GUARDING',
  'GANESHA_OBEYING',
  'SHIVA_SETUP',
  'SHIVA_CONFRONTATION',
  'SHIVA_BATTLE',
  'SHIVA_SEQUENCE_READY',
];
