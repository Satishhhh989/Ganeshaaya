/**
 * Story Asset Configuration
 * Centralized, data-driven mapping of all 2D story illustrations and effects.
 * Allows effortless swapping between placeholder and final art assets.
 */

export const STORY_ASSETS = {
  backgrounds: {
    kailashAbode: {
      id: 'bg_kailash_abode',
      url: '/assets/story/mythology/backgrounds/kailash_abode.jpg',
      label: 'Sacred Mount Kailash Divine Abode',
      aspectRatio: '16:9',
    },
    shivaArrivalSky: {
      id: 'bg_shiva_arrival_sky',
      url: '/assets/story/mythology/backgrounds/shiva_arrival_sky.jpg',
      label: 'Cosmic Gathering of Mahadev',
      aspectRatio: '16:9',
    },
  },
  characters: {
    parvatiSerene: {
      id: 'char_parvati_serene',
      url: '/assets/story/mythology/characters/parvati_serene.jpg',
      label: 'Mata Parvati Divine Grace',
      aspectRatio: '16:9',
    },
    parvatiCreatingClay: {
      id: 'char_parvati_creating_clay',
      url: '/assets/story/mythology/characters/parvati_creating_clay.jpg',
      label: 'Parvati Sculpting Ganesha from Turmeric Paste',
      aspectRatio: '16:9',
    },
    ganeshaAwakened: {
      id: 'char_ganesha_awakened',
      url: '/assets/story/mythology/characters/ganesha_awakened.jpg',
      label: 'Divine Child Ganesha Awakening to Life',
      aspectRatio: '16:9',
    },
    ganeshaGuarding: {
      id: 'char_ganesha_guarding',
      url: '/assets/story/mythology/characters/ganesha_guarding.jpg',
      label: 'Brave Young Ganesha Guarding the Portal',
      aspectRatio: '16:9',
    },
    elephantSacred: {
      id: 'char_elephant_sacred',
      url: '/assets/story/mythology/characters/elephant_sacred.jpg',
      label: 'Sacred Celestial Gajaraj in the Himalayan Forest',
      aspectRatio: '16:9',
    },
    shivaParvatiReunion: {
      id: 'char_shiva_parvati_reunion',
      url: '/assets/story/mythology/characters/shiva_parvati_reunion.jpg',
      label: 'Divine Family Reunion: Shiva, Parvati, and Ganesha',
      aspectRatio: '16:9',
    },
  },
  props: {
    lotusPetalsForeground: {
      id: 'prop_lotus_petals',
      url: '/assets/story/mythology/props/lotus_petals_foreground.jpg',
      label: 'Drifting Lotus & Marigold Petals',
      blendMode: 'screen',
    },
  },
  effects: {
    divineGoldenAura: {
      id: 'fx_divine_golden_aura',
      url: '/assets/story/mythology/effects/divine_golden_aura.jpg',
      label: 'Sacred Prana & Golden Burst Aura',
      blendMode: 'screen',
    },
  },
  models: {
    shivaLazyUrl: '/assets/characters/shiva_walking.fbx',
  },
} as const;

export type StoryAssetKey = keyof typeof STORY_ASSETS;
