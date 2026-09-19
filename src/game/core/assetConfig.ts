/**
 * Central Asset Configuration
 * All 3D models, textures, animations, and audio references are configured here.
 * If you update or replace models later, modify these references without touching gameplay logic.
 */

export const ASSET_CONFIG = {
  characters: {
    child: {
      url: '/assets/characters/child.glb',
      // child.glb scene height ~3.478m. Scale 0.344 → ~1.20m child height
      // Reaches naturally to Dada's upper chest/shoulders (~73.6% of Dada's 1.63m)
      scale: 0.344,
      defaultHeight: 1.20,
      colliderRadius: 0.22,
      animations: {
        idle: 'mixamo.com',
        walk: 'walk',
      },
    },
    oldMan: {
      url: '/assets/characters/old_man.glb',
      // old_man.glb raw height ~15.52m. Scale 0.1063 → ~1.65m realistic old man
      scale: 0.1063,
      defaultHeight: 1.65,
      animations: {
        idle: 'sit',
        sit: 'sit',
        talk: 'talk',
        walk: 'walk',
      },
    },
  },
  staging: {
    // Deliberate standing positions in the living room
    oldManStanding: [-0.3, 0.0, 3.7] as [number, number, number],
    childSpawn: [0.6, 0.0, 6.4] as [number, number, number],
    // Scripted sofa sitting markers:
    // Left cushion (Dada): X = -0.44, Y = 0.08, Z = 2.96 (moved in front and down onto cushion per user request)
    // Right cushion (Vinay): X = 0.16, Y = 0.36, Z = 2.78 (child kept unchanged)
    oldManSittingMarker: [-0.44, 0.08, 2.96] as [number, number, number],
    childSittingMarker: [0.16, 0.36, 2.78] as [number, number, number],
    // Proximity trigger radius for opening conversation (natural conversational distance ~2.5m)
    interactionRadius: 2.5,
  },
  environments: {
    home: {
      url: '/assets/environments/home.glb',
      scale: 1.0,
      floorY: 0.0,
      // Room boundaries matching actual home.glb geometry
      // Actual bounds: min=[-8.34, -0.01, -11.17] max=[5.02, 4.78, 10.06]
      bounds: {
        minX: -4.6,
        maxX: 4.6,
        minZ: -8.0,
        maxZ: 9.0,
      },
    },
  },
  props: {
    diya: {
      flameColor: '#ffaa33',
      lightIntensity: 2.2,
      lightDistance: 4.5,
    },
  },
  audio: {
    ambientRaga: 'bhupali_evening',
    footsteps: 'carpet_wood',
    bellChime: 'temple_bell',
  },
};
