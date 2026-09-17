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
    childSpawn: [0.6, 0.0, 5.2] as [number, number, number],
    // Scripted sofa sitting markers — Y=0.0 because the sit animation handles the height offset
    oldManSittingMarker: [-0.4, 0.0, 2.6] as [number, number, number],
    childSittingMarker: [0.15, 0.0, 2.6] as [number, number, number],
    // Proximity trigger radius for opening conversation
    interactionRadius: 3.2,
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
