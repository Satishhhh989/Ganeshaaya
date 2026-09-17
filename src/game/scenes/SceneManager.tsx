import { useGameState } from '../core/GameState';
import { PresentHomeScene } from './present/PresentHomeScene';
import { MythologyShiva3D } from './mythology/MythologyShivaScene';
import { CompetitionScene } from './competition/CompetitionScene';
import { PandalScene } from './pandal/PandalScene';

export function SceneManager() {
  const { currentScene } = useGameState();

  switch (currentScene) {
    case 'PRESENT_HOME':
      return <PresentHomeScene />;
    case 'SHIVA_SEQUENCE':
      return <MythologyShiva3D />;
    case 'NIAT_COMPETITION':
      return <CompetitionScene />;
    case 'PANDAL':
    case 'CELEBRATION':
      return <PandalScene />;
    case 'MYTHOLOGY_CREATION':
    case 'GANESHA_STORY':
    case 'RESTORATION':
      // 2D/2.5D Mythology story engine renders on top; 3D canvas is empty
      return null;
    default:
      return <PresentHomeScene />;
  }
}
