/**
 * VINAYAK: The First Prayer
 * An Interactive 3D Devotional Experience
 * Made with ❤️ by Satish (https://github.com/Satishhhh989)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { gameStateStore } from './game/core/GameState';
import { competitionCeremonyStore } from './game/scenes/competition/competitionState';

(window as any).gameStateStore = gameStateStore;
(window as any).competitionCeremonyStore = competitionCeremonyStore;

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
