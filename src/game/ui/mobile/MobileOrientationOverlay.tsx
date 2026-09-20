import { useEffect, useState } from 'react';
import { useVirtualInputState } from './virtualInputStore';

/**
 * MobileOrientationOverlay:
 * Strict Landscape-Only Experience Enforcer.
 * 
 * - Held vertically in Portrait:
 *   - Displays an ultra-clean, cinematic orientation screen.
 *   - "ROTATE YOUR DEVICE" with minimal animated golden phone rotation icon.
 *   - Background matches the deep temple bronze/midnight aesthetic (#080504).
 *   - Completely masks the game without resetting progress, position, or dialogue.
 * 
 * - Held horizontally in Landscape:
 *   - Automatically removed with zero friction.
 *   - Game resumes in full landscape composition.
 */
export function MobileOrientationOverlay() {
  const { isTouchDevice, isPortrait } = useVirtualInputState();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Show overlay if touch device is detected AND currently portrait
    setActive(isTouchDevice && isPortrait);
  }, [isTouchDevice, isPortrait]);

  if (!active) return null;

  return (
    <div
      data-ui="mobile-orientation-lock"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#070504',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f8f4ec',
        padding: '24px',
        textAlign: 'center',
        userSelect: 'none',
        touchAction: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Subtle divine golden glow behind phone indicator */}
      <div
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 176, 65, 0.18) 0%, rgba(220, 140, 40, 0.05) 45%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulseGlow 3s ease-in-out infinite alternate',
        }}
      />

      {/* Cinematic Animated Phone Rotation Indicator */}
      <div
        style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}
      >
        {/* Orbiting celestial curved arrow */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            animation: 'orbitSpin 4s linear infinite',
          }}
        >
          <path
            d="M 50 12 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="rgba(245, 176, 65, 0.35)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 50 88 A 38 38 0 0 1 12 50"
            fill="none"
            stroke="rgba(245, 176, 65, 0.35)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Minimal rounded phone silhouette rotating from vertical to horizontal */}
        <div
          style={{
            width: '40px',
            height: '66px',
            border: '2px solid #f5ca75',
            borderRadius: '9px',
            boxShadow: '0 0 20px rgba(245, 202, 117, 0.35), inset 0 0 10px rgba(245, 202, 117, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0',
            animation: 'rotatePhone 3.2s cubic-bezier(0.45, 0, 0.15, 1) infinite',
            background: 'rgba(25, 18, 12, 0.65)',
          }}
        >
          {/* Top speaker notch */}
          <div
            style={{
              width: '12px',
              height: '2px',
              backgroundColor: 'rgba(245, 202, 117, 0.7)',
              borderRadius: '1px',
            }}
          />
          {/* Screen subtle glow */}
          <div
            style={{
              width: '24px',
              height: '36px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, rgba(245, 202, 117, 0.15), transparent)',
            }}
          />
          {/* Bottom home indicator dot */}
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 202, 117, 0.7)',
            }}
          />
        </div>
      </div>

      {/* Main Title: ROTATE YOUR DEVICE */}
      <h2
        style={{
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.24em',
          color: '#ffffff',
          textTransform: 'uppercase',
          margin: '0 0 12px 0',
          textShadow: '0 2px 14px rgba(245, 202, 117, 0.4)',
        }}
      >
        ROTATE YOUR DEVICE
      </h2>

      {/* Minimal Subtitle */}
      <p
        style={{
          fontFamily: "'Marcellus', serif",
          fontSize: '13px',
          color: 'rgba(245, 238, 225, 0.65)',
          letterSpacing: '0.06em',
          lineHeight: 1.5,
          maxWidth: '280px',
          margin: '0 0 24px 0',
        }}
      >
        Please turn your phone horizontally to experience the sacred journey in landscape.
      </p>

      {/* Minimal Devanagari touch mark */}
      <div
        style={{
          fontFamily: "'Marcellus', serif",
          fontSize: '12px',
          color: 'rgba(245, 202, 117, 0.4)',
          letterSpacing: '0.18em',
        }}
      >
        विनायक · LANDSCAPE ONLY
      </div>

      <style>{`
        @keyframes rotatePhone {
          0%, 15% {
            transform: rotate(0deg);
          }
          45%, 70% {
            transform: rotate(90deg);
          }
          90%, 100% {
            transform: rotate(0deg);
          }
        }
        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.12); opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
