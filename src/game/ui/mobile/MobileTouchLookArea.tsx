import { useRef, useEffect } from 'react';
import { virtualInputStore } from './virtualInputStore';

interface MobileTouchLookAreaProps {
  disabled?: boolean;
}

/**
 * MobileTouchLookArea:
 * Captures swipe gestures across the right-hand half of the screen
 * - Smooth camera look & aim control for mobile touch devices
 * - Horizontal swipe: yaw rotation
 * - Vertical swipe: pitch rotation (up/down)
 * - Prevents default browser page drag, scrolling, and rubber-banding (`touch-action: none`)
 * - Ignores touches on buttons or explicit interactive UI elements
 */
export function MobileTouchLookArea({ disabled = false }: MobileTouchLookAreaProps) {
  const activeTouchId = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Find a touch that is in the right 55% of the screen
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX >= window.innerWidth * 0.45 && activeTouchId.current === null) {
          // Check if touch target is a button or interactive element
          const target = touch.target as HTMLElement | null;
          if (
            target &&
            (target.tagName === 'BUTTON' ||
              target.closest('button') ||
              target.closest('[data-ui]') ||
              target.getAttribute?.('data-interactive') === 'true' ||
              target.getAttribute?.('data-action') === 'true')
          ) {
            continue;
          }

          activeTouchId.current = touch.identifier;
          lastPos.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          const dx = touch.clientX - lastPos.current.x;
          const dy = touch.clientY - lastPos.current.y;

          lastPos.current = { x: touch.clientX, y: touch.clientY };

          // Feed into virtualInputStore camera delta buffer
          virtualInputStore.addCameraDelta(dx, dy);

          // Prevent default scrolling on mobile viewport
          if (e.cancelable) {
            e.preventDefault();
          }
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activeTouchId.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          activeTouchId.current = null;
          break;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [disabled]);

  return null;
}
