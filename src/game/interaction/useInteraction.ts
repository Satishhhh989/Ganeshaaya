import { useEffect } from 'react';
import type { InteractionTarget } from '../core/types';
import { gameStateStore } from '../core/GameState';

class InteractionManager {
  private targets: Map<string, InteractionTarget> = new Map();

  register(target: InteractionTarget) {
    this.targets.set(target.id, target);
  }

  unregister(id: string) {
    this.targets.delete(id);
    const active = gameStateStore.getState().activeInteraction;
    if (active?.id === id) {
      gameStateStore.setActiveInteraction(null);
    }
  }

  update(playerPos: [number, number, number]) {
    const { gameState, controlsLocked } = gameStateStore.getState();
    if (gameState === 'DIALOGUE' || controlsLocked) {
      gameStateStore.setActiveInteraction(null);
      return;
    }

    let closestTarget: InteractionTarget | null = null;
    let minDistance = Infinity;

    for (const target of this.targets.values()) {
      if (target.enabled === false || !target.position || !playerPos) continue;

      const dx = playerPos[0] - target.position[0];
      const dy = playerPos[1] - target.position[1];
      const dz = playerPos[2] - target.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= target.radius && dist < minDistance) {
        minDistance = dist;
        closestTarget = target;
      }
    }

    gameStateStore.setActiveInteraction(closestTarget);
  }

  triggerCurrentInteraction() {
    const active = gameStateStore.getState().activeInteraction;
    if (active && active.onInteract) {
      active.onInteract();
    }
  }
}

export const interactionManager = new InteractionManager();

export function useInteractionListener() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        const { gameState, controlsLocked } = gameStateStore.getState();
        if (gameState === 'PLAYING' && !controlsLocked) {
          interactionManager.triggerCurrentInteraction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
