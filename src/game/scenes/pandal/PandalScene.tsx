import { Suspense } from 'react';
import { PandalEnvironment } from './PandalEnvironment';
import { PandalStructure3D } from './PandalStructure3D';
import { PandalInteractionAnchors } from './PandalInteractionAnchors';
import { CommunityCrowd3D } from './CommunityCrowd3D';
import { GaneshaProcession3D } from './GaneshaProcession3D';
import { PeepalTrees3D } from './PeepalTrees3D';
import { SkyEmbersAndLanterns } from './SkyEmbersAndLanterns';

export function PandalScene() {
  return (
    <group name="Ganesh_Chaturthi_Pandal_Scene">
      <Suspense fallback={null}>
        <PandalEnvironment />
        <PeepalTrees3D />
        <PandalStructure3D />
        <PandalInteractionAnchors />
        <GaneshaProcession3D />
        <CommunityCrowd3D />
        <SkyEmbersAndLanterns />
      </Suspense>
    </group>
  );
}
