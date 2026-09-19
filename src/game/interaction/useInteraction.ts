import { useEffect } from 'react';
import type { InteractionTarget } from '../core/types';
import { gameStateStore } from '../core/GameState';
import { ASSET_CONFIG } from '../core/assetConfig';
import { audioManager } from '../audio/AudioManager';

class InteractionManager {
  private targets: Map<string, InteractionTarget> = new Map();

  constructor() {
    // Pre-register Dada's living room conversation target so it is permanently resilient
    this.register({
      id: 'npc_old_man',
      name: 'Dada',
      position: ASSET_CONFIG.staging.oldManStanding,
      radius: ASSET_CONFIG.staging.interactionRadius,
      prompt: 'Talk',
      actionKey: 'E',
      onInteract: () => {
        audioManager.playTempleBell();
        gameStateStore.setPresentScenePhase('INITIAL_DIALOGUE');
        gameStateStore.startDialogue();
      },
      enabled: true,
    });
  }

  register(target: InteractionTarget) {
    this.targets.set(target.id, target);
  }

  unregister(id: string) {
    if (id !== 'npc_old_man') {
      this.targets.delete(id);
      const active = gameStateStore.getState().activeInteraction;
      if (active?.id === id) {
        gameStateStore.setActiveInteraction(null);
      }
    }
  }

  update(playerPos: [number, number, number], playerRot?: number) {
    const { gameState, controlsLocked, presentScenePhase } = gameStateStore.getState();
    if (gameState !== 'PLAYING' || controlsLocked) {
      gameStateStore.setActiveInteraction(null);
      return;
    }

    let closestTarget: InteractionTarget | null = null;
    let minDistance = Infinity;

    for (const target of this.targets.values()) {
      if (target.enabled === false || !target.position || !playerPos) continue;

      // In home scene, Old Man interaction is only active during APPROACH
      if (target.id === 'npc_old_man' && presentScenePhase !== 'APPROACH') {
        continue;
      }

      const dx = target.position[0] - playerPos[0];
      const dy = target.position[1] - playerPos[1];
      const dz = target.position[2] - playerPos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Distance check: must be strictly within target radius (~2.5m for Dada)
      if (dist <= target.radius && dist < minDistance) {
        // Orientation / Facing check (if playerRot is provided)
        if (typeof playerRot === 'number') {
          const distXZ = Math.hypot(dx, dz);
          if (distXZ > 0.1) {
            const dirX = dx / distXZ;
            const dirZ = dz / distXZ;
            // Player forward vector in world space
            const forwardX = Math.sin(playerRot);
            const forwardZ = Math.cos(playerRot);
            const dot = forwardX * dirX + forwardZ * dirZ;

            // Forgiving facing cone (~105 degrees, cos(105°) ≈ -0.25)
            // Player must be generally looking towards target, not directly backwards away
            if (dot < -0.25) {
              continue; // Looking completely away from target
            }
          }
        }

        minDistance = dist;
        closestTarget = target;
      }
    }

    gameStateStore.setActiveInteraction(closestTarget);
  }

  triggerCurrentInteraction() {
    const active = gameStateStore.getState().activeInteraction;
    if (active && active.onInteract) {
      // Clear active interaction immediately to prevent duplicate triggers
      gameStateStore.setActiveInteraction(null);
      active.onInteract();
    }
  }
}

export const interactionManager = new InteractionManager();

export function useInteractionListener() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        const { gameState, controlsLocked, activeInteraction } = gameStateStore.getState();
        // E key ONLY triggers interaction when player is actively near & facing target in PLAYING state
        if (gameState === 'PLAYING' && !controlsLocked && activeInteraction) {
          e.preventDefault();
          e.stopPropagation();
          interactionManager.triggerCurrentInteraction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
