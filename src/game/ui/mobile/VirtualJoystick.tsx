import { useRef, useState, useEffect, useCallback } from 'react';
import { virtualInputStore } from './virtualInputStore';

interface VirtualJoystickProps {
  size?: number;
  disabled?: boolean;
}

/**
 * VirtualJoystick:
 * Dynamic floating or fixed virtual joystick on the lower-left side of the mobile screen.
 * - Translucent, minimal, rounded, low-opacity aesthetic (feels native, zero neon clutter).
 * - Appears on touch in the lower-left screen area, tracks drag displacement.
 * - Dispatches normalized movement vector (x: -1..1, y: -1..1) to virtualInputStore.
 * - Automatically disappears/disables when movement is not permitted in current scene.
 */
export function VirtualJoystick({ size = 128, disabled = false }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [touchId, setTouchId] = useState<number | null>(null);
  const [basePos, setBasePos] = useState<{ x: number; y: number }>({ x: 96, y: 0 });
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const radius = size / 2;
  const maxDistance = radius * 0.85;

  // Set default baseline position based on window height on mount
  useEffect(() => {
    const updateDefaultPos = () => {
      setBasePos({
        x: Math.max(80, window.innerWidth * 0.12),
        y: window.innerHeight - Math.max(90, window.innerHeight * 0.22),
      });
    };
    updateDefaultPos();
    window.addEventListener('resize', updateDefaultPos);
    return () => window.removeEventListener('resize', updateDefaultPos);
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;

      // Only claim touch if it originates in the lower-left 45% width & 65% height of screen
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (
          touch.clientX < window.innerWidth * 0.45 &&
          touch.clientY > window.innerHeight * 0.35 &&
          touchId === null
        ) {
          setTouchId(touch.identifier);
          setActive(true);
          setBasePos({ x: touch.clientX, y: touch.clientY });
          setKnobPos({ x: 0, y: 0 });
          virtualInputStore.setMoveVector(0, 0, false);
          break;
        }
      }
    },
    [disabled, touchId]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!active || touchId === null || disabled) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - basePos.x;
          const dy = touch.clientY - basePos.y;
          const distance = Math.hypot(dx, dy);

          const angle = Math.atan2(dy, dx);
          const clampedDistance = Math.min(distance, maxDistance);

          const kx = Math.cos(angle) * clampedDistance;
          const ky = Math.sin(angle) * clampedDistance;
          setKnobPos({ x: kx, y: ky });

          // Normalized movement vector:
          // X: -1 (left) to +1 (right)
          // Y: -1 (backward) to +1 (forward) -> notice screen down (positive dy) is backward (negative Y)
          const normX = kx / maxDistance;
          const normY = -ky / maxDistance;

          // If pushed past 75% radius, consider running
          const isRun = distance > maxDistance * 0.82;
          virtualInputStore.setMoveVector(normX, normY, isRun);
          break;
        }
      }
    },
    [active, touchId, basePos, maxDistance, disabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchId === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          setActive(false);
          setTouchId(null);
          setKnobPos({ x: 0, y: 0 });
          virtualInputStore.setMoveVector(0, 0, false);
          break;
        }
      }
    },
    [touchId]
  );

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      data-ui="virtual-joystick-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 80,
      }}
    >
      {/* Joystick Base Ring */}
      <div
        style={{
          position: 'absolute',
          left: `${basePos.x}px`,
          top: `${basePos.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          backgroundColor: active ? 'rgba(20, 15, 12, 0.42)' : 'rgba(20, 15, 12, 0.22)',
          border: active
            ? '1.5px solid rgba(245, 202, 117, 0.45)'
            : '1px solid rgba(245, 202, 117, 0.2)',
          boxShadow: active
            ? '0 0 20px rgba(245, 202, 117, 0.15), inset 0 0 14px rgba(0, 0, 0, 0.5)'
            : 'inset 0 0 10px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle cardinal guide cross */}
        <div
          style={{
            position: 'absolute',
            width: '1px',
            height: '40%',
            backgroundColor: 'rgba(245, 202, 117, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: '1px',
            width: '40%',
            backgroundColor: 'rgba(245, 202, 117, 0.15)',
          }}
        />

        {/* Joystick Thumb Knob */}
        <div
          style={{
            position: 'absolute',
            width: `${size * 0.44}px`,
            height: `${size * 0.44}px`,
            borderRadius: '50%',
            backgroundColor: active ? 'rgba(245, 202, 117, 0.45)' : 'rgba(245, 202, 117, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.65)',
            boxShadow: active
              ? '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 12px rgba(245, 202, 117, 0.4)'
              : '0 2px 8px rgba(0, 0, 0, 0.4)',
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: active ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner Golden Dot */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#fffbeb',
              boxShadow: '0 0 6px #f5ca75',
            }}
          />
        </div>
      </div>
    </div>
  );
}
