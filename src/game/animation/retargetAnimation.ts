import * as THREE from 'three';

// Map of standard Mixamo bone names (with or without 'mixamorig:' prefix) to kid.glb bone names
const MIXAMO_TO_KID_BONES: Record<string, string> = {
  Hips: 'Hips_01',
  Spine: 'Spine_02',
  Spine1: 'Spine1_03',
  Spine2: 'Spine2_04',
  Neck: 'Neck_05',
  Head: 'Head_08',
  HeadTop_End: 'HeadTop_End_011',
  LeftShoulder: 'LeftShoulder_012',
  LeftArm: 'LeftArm_013',
  LeftForeArm: 'LeftForeArm_014',
  LeftHand: 'LeftHand_017',
  RightShoulder: 'RightShoulder_038',
  RightArm: 'RightArm_039',
  RightForeArm: 'RightForeArm_040',
  RightHand: 'RightHand_043',
  LeftUpLeg: 'LeftUpLeg_063',
  LeftLeg: 'LeftLeg_064',
  LeftFoot: 'LeftFoot_065',
  LeftToeBase: 'LeftToeBase_066',
  LeftToe_End: 'LeftToe_End_067',
  RightUpLeg: 'RightUpLeg_068',
  RightLeg: 'RightLeg_069',
  RightFoot: 'RightFoot_070',
  RightToeBase: 'RightToeBase_071',
  RightToe_End: 'RightToe_End_072',

  // Finger chains
  LeftHandThumb1: 'LeftHandThumb1_018',
  LeftHandThumb2: 'LeftHandThumb2_019',
  LeftHandThumb3: 'LeftHandThumb3_020',
  LeftHandThumb4: 'LeftHandThumb4_021',
  LeftHandIndex1: 'LeftHandIndex1_022',
  LeftHandIndex2: 'LeftHandIndex2_023',
  LeftHandIndex3: 'LeftHandIndex3_024',
  LeftHandIndex4: 'LeftHandIndex4_025',
  LeftHandMiddle1: 'LeftHandMiddle1_026',
  LeftHandMiddle2: 'LeftHandMiddle2_027',
  LeftHandMiddle3: 'LeftHandMiddle3_028',
  LeftHandMiddle4: 'LeftHandMiddle4_029',
  LeftHandRing1: 'LeftHandRing1_030',
  LeftHandRing2: 'LeftHandRing2_031',
  LeftHandRing3: 'LeftHandRing3_032',
  LeftHandRing4: 'LeftHandRing4_033',
  LeftHandPinky1: 'LeftHandPinky1_034',
  LeftHandPinky2: 'LeftHandPinky2_035',
  LeftHandPinky3: 'LeftHandPinky3_036',
  LeftHandPinky4: 'LeftHandPinky4_037',

  RightHandThumb1: 'RightHandThumb1_044',
  RightHandThumb2: 'RightHandThumb2_045',
  RightHandThumb3: 'RightHandThumb3_046',
  RightHandThumb4: 'RightHandThumb4_047',
  RightHandIndex1: 'RightHandIndex1_048',
  RightHandIndex2: 'RightHandIndex2_049',
  RightHandIndex3: 'RightHandIndex3_050',
  RightHandIndex4: 'RightHandIndex4_051',
  RightHandMiddle1: 'RightHandMiddle1_00',
  RightHandMiddle2: 'RightHandMiddle2_052',
  RightHandMiddle3: 'RightHandMiddle3_053',
  RightHandMiddle4: 'RightHandMiddle4_054',
  RightHandRing1: 'RightHandRing1_055',
  RightHandRing2: 'RightHandRing2_056',
  RightHandRing3: 'RightHandRing3_057',
  RightHandRing4: 'RightHandRing4_058',
  RightHandPinky1: 'RightHandPinky1_059',
  RightHandPinky2: 'RightHandPinky2_060',
  RightHandPinky3: 'RightHandPinky3_061',
  RightHandPinky4: 'RightHandPinky4_062',
};

/**
 * Retarget a Mixamo animation clip to the Kid model bones.
 * - Extracts quaternion rotations and retargets to corresponding kid bones.
 * - Leaves in-place locomotion (root movement is handled by player physics controller).
 */
export function retargetMixamoClipToKid(
  sourceClip: THREE.AnimationClip,
  newName: string
): THREE.AnimationClip {
  const newTracks: THREE.KeyframeTrack[] = [];

  for (const track of sourceClip.tracks) {
    const dotIndex = track.name.lastIndexOf('.');
    if (dotIndex === -1) continue;

    const nodePath = track.name.substring(0, dotIndex);
    const property = track.name.substring(dotIndex + 1);

    // Extract core bone name by removing prefixes like "mixamorig:" or "mixamorig"
    let coreName = nodePath;
    if (coreName.includes(':')) {
      coreName = coreName.split(':').pop() || coreName;
    } else if (coreName.startsWith('mixamorig')) {
      coreName = coreName.replace('mixamorig', '');
    }

    const targetBoneName = MIXAMO_TO_KID_BONES[coreName];
    if (!targetBoneName) continue;

    const newTrackName = `${targetBoneName}.${property}`;

    if (track instanceof THREE.QuaternionKeyframeTrack) {
      newTracks.push(new THREE.QuaternionKeyframeTrack(newTrackName, track.times, track.values));
    } else if (track instanceof THREE.VectorKeyframeTrack && property === 'position') {
      // For hips vertical bobbing: in unscaled kid space, hips rest at Y ≈ 0.94
      // We only apply subtle vertical bounce (Y) and lateral sway (X), suppressing forward displacement Z
      if (coreName === 'Hips') {
        const scaledValues = new Float32Array(track.values.length);
        let avgY = 0;
        const count = track.values.length / 3;
        for (let i = 0; i < count; i++) {
          avgY += track.values[i * 3 + 1];
        }
        avgY /= count;

        for (let i = 0; i < count; i++) {
          // Keep subtle X sway
          scaledValues[i * 3] = track.values[i * 3] * 0.006;
          // Keep vertical bobbing relative to child hip baseline (~0.94m)
          const relY = (track.values[i * 3 + 1] - avgY) * 0.006;
          scaledValues[i * 3 + 1] = 0.94 + relY;
          // Zero out Z so locomotion is strictly driven by controller physics
          scaledValues[i * 3 + 2] = 0;
        }

        newTracks.push(new THREE.VectorKeyframeTrack(newTrackName, track.times, scaledValues));
      }
    }
  }

  return new THREE.AnimationClip(newName, sourceClip.duration, newTracks);
}
