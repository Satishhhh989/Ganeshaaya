/**
 * Central Asset Configuration
 * All 3D models, textures, animations, and audio references are configured here.
 * If you update or replace models later, modify these references without touching gameplay logic.
 */

export const ASSET_CONFIG = {
  characters: {
    child: {
      url: '/assets/characters/child.glb',
      // child.glb has a scene height of 3.478m (raw mesh 1.817m * root node matrix 1.914m).
      // Scale 0.344 gives an authentic child height of 1.20m (~73.6% of Dada's 1.63m height),
      // reaching naturally to Dada's upper chest / shoulders.
      scale: 0.344,
      defaultHeight: 1.20,
      colliderRadius: 0.21,
      animations: {
        idle: 'mixamo.com',
        walk: 'walk',
      },
    },
    oldMan: {
      url: '/assets/characters/old_man.glb',
      // Scaled by 0.1063 so the raw 15.5m model becomes a realistic 1.63m height
      scale: 0.1063,
      defaultHeight: 1.63,
      animations: {
        idle: 'sit',
        sit: 'sit',
        talk: 'talk',
        walk: 'walk',
      },
    },
  },
  staging: {
    // Deliberate initial standing positions
    oldManStanding: [-0.35, 0.0, 3.85] as [number, number, number],
    childSpawn: [0.65, 0.0, 5.05] as [number, number, number],
    // Predefined scripted sofa sitting markers
    oldManSittingMarker: [-0.44, 0.0, 2.75] as [number, number, number],
    childSittingMarker: [0.08, 0.0, 2.75] as [number, number, number],
    // Proximity trigger radius for opening conversation
    interactionRadius: 1.45,
  },
  environments: {
    home: {
      url: '/assets/environments/home.glb',
      scale: 1.0,
      floorY: 0.0,
      // Room boundaries [minX, maxX, minZ, maxZ]
      bounds: {
        minX: -6.8,
        maxX: 6.8,
        minZ: -9.6,
        maxZ: 9.8,
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
