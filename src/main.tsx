import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { gameStateStore } from './game/core/GameState';

(window as any).gameStateStore = gameStateStore;

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
