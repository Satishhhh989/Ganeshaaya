import { useGameState } from '../core/GameState';
import { PresentHomeScene } from './present/PresentHomeScene';
import { MythologyScenePlaceholder } from './mythology/MythologyScenePlaceholder';
import { PandalScenePlaceholder } from './pandal/PandalScenePlaceholder';

export function SceneManager() {
  const { currentScene } = useGameState();

  switch (currentScene) {
    case 'PRESENT_HOME':
      return <PresentHomeScene />;
    case 'MYTHOLOGY_CREATION':
    case 'GANESHA_STORY':
    case 'SHIVA_SEQUENCE':
    case 'RESTORATION':
      return <MythologyScenePlaceholder />;
    case 'PANDAL':
    case 'CELEBRATION':
      return <PandalScenePlaceholder />;
    default:
      return <PresentHomeScene />;
  }
}
