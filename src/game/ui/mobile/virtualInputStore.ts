/**
 * virtualInputStore: Lightweight state hub for mobile touch inputs
 * - Detects touch device presence automatically
 * - Receives virtual joystick movement vector (x: -1..1, y: -1..1)
 * - Receives camera drag deltas (dx, dy)
 * - Broadcasts contextual action events (INTERACT, THROW)
 */

type Listener = () => void;

interface VirtualInputState {
  isTouchDevice: boolean;
  isPortrait: boolean;
  // Movement vector from virtual joystick: x: -1 to 1 (left/right), y: -1 to 1 (forward/backward)
  moveVector: { x: number; y: number };
  isRunning: boolean;
  // Camera swipe delta: dx, dy accumulated each frame
  cameraDelta: { dx: number; dy: number };
  // Trigger counters or flags for instant actions
  interactTrigger: number;
  throwTrigger: number;
}

class VirtualInputStore {
  private state: VirtualInputState = {
    isTouchDevice: false,
    isPortrait: false,
    moveVector: { x: 0, y: 0 },
    isRunning: false,
    cameraDelta: { dx: 0, dy: 0 },
    interactTrigger: 0,
    throwTrigger: 0,
  };

  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Automatic touch capability detection
      const detectTouch = () => {
        const hasTouch =
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error fallback for msMaxTouchPoints
          (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0) ||
          window.matchMedia('(pointer: coarse)').matches;

        if (hasTouch !== this.state.isTouchDevice) {
          this.state.isTouchDevice = hasTouch;
          this.notify();
        }
      };

      detectTouch();
      window.addEventListener('touchstart', () => {
        if (!this.state.isTouchDevice) {
          this.state.isTouchDevice = true;
          this.notify();
        }
      }, { once: true, passive: true });

      // Orientation detection: check if portrait
      const updateOrientation = () => {
        const isPortrait =
          window.innerHeight > window.innerWidth ||
          (window.screen.orientation && window.screen.orientation.type.includes('portrait')) ||
          window.matchMedia('(orientation: portrait)').matches;

        if (isPortrait !== this.state.isPortrait) {
          this.state.isPortrait = isPortrait;
          this.notify();
        }
      };

      updateOrientation();
      window.addEventListener('resize', updateOrientation, { passive: true });
      window.addEventListener('orientationchange', updateOrientation, { passive: true });
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener('change', updateOrientation);
      }
    }
  }

  getState(): VirtualInputState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  setMoveVector(x: number, y: number, isRunning: boolean = false) {
    this.state.moveVector.x = x;
    this.state.moveVector.y = y;
    this.state.isRunning = isRunning;
    // Don't notify on every 60fps micro touch-move to keep React from re-rendering whole tree;
    // controllers read directly via getMoveVector() in useFrame!
  }

  getMoveVector(): { x: number; y: number; isRunning: boolean } {
    return {
      x: this.state.moveVector.x,
      y: this.state.moveVector.y,
      isRunning: this.state.isRunning,
    };
  }

  addCameraDelta(dx: number, dy: number) {
    this.state.cameraDelta.dx += dx;
    this.state.cameraDelta.dy += dy;
  }

  consumeCameraDelta(): { dx: number; dy: number } {
    const delta = { dx: this.state.cameraDelta.dx, dy: this.state.cameraDelta.dy };
    this.state.cameraDelta.dx = 0;
    this.state.cameraDelta.dy = 0;
    return delta;
  }

  triggerInteract() {
    this.state.interactTrigger += 1;
    this.notify();
  }

  triggerThrow() {
    this.state.throwTrigger += 1;
    this.notify();
  }
}

export const virtualInputStore = new VirtualInputStore();

import { useState, useEffect } from 'react';

export function useVirtualInputState() {
  const [state, setState] = useState(virtualInputStore.getState());
  useEffect(() => {
    return virtualInputStore.subscribe(() => {
      setState({ ...virtualInputStore.getState() });
    });
  }, []);
  return state;
}
