import { useState, useEffect } from 'react';
import { useGameState } from '../../core/GameState';

export function PandalHUD() {
  const {
    currentScene,
    presentScenePhase,
    completedPandalTasks,
    pandalRemainingBudget,
    activeInteraction,
  } = useGameState();

  const [showControlsTip, setShowControlsTip] = useState(true);
  const [controlsOpacity, setControlsOpacity] = useState(1);

  // Fade out control hints after 4.5 seconds
  useEffect(() => {
    if (presentScenePhase !== 'PANDAL_BUILDING') return;

    const fadeTimer = setTimeout(() => {
      setControlsOpacity(0);
    }, 4500);

    const hideTimer = setTimeout(() => {
      setShowControlsTip(false);
    }, 5300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [presentScenePhase]);

  if (currentScene !== 'PANDAL' || presentScenePhase !== 'PANDAL_BUILDING') {
    return null;
  }

  const isTaskPrompt = activeInteraction?.id.startsWith('pandal_task_');
  const isLockedPrompt = activeInteraction?.id.startsWith('pandal_locked_');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 60,
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ─── TOP LEFT: MINIMAL OBJECTIVE & PROGRESS ─── */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '2.5px',
            color: '#f5b041',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Building Bappa's Home
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '15px', color: '#f5f5f7', fontWeight: 600 }}>
            {completedPandalTasks.length} of 8 completed
          </span>

          {/* 8 Subtle minimalist progress dots */}
          <div style={{ display: 'flex', gap: '5px', marginLeft: '4px' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
              const isFilled = idx < completedPandalTasks.length;
              return (
                <div
                  key={idx}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isFilled ? '#f5b041' : 'rgba(255, 255, 255, 0.18)',
                    boxShadow: isFilled ? '0 0 8px rgba(245, 176, 65, 0.7)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TOP RIGHT: MINIMAL BUDGET GLASS CARD ─── */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '32px',
          background: 'rgba(18, 14, 11, 0.78)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(245, 176, 65, 0.25)',
          borderRadius: '20px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px', fontWeight: 500 }}>
          Fund ₹15,000
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
        <span style={{ color: '#f5b041', fontSize: '13px', fontWeight: 700 }}>
          Remaining ₹{pandalRemainingBudget.toLocaleString('en-IN')}
        </span>
      </div>

      {/* ─── CONTEXTUAL INTERACTION PROMPT ─── */}
      {isTaskPrompt && (
        <div
          style={{
            position: 'absolute',
            bottom: '14%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <button
            onClick={() => activeInteraction?.onInteract?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: 'rgba(18, 14, 11, 0.92)',
              border: '1.5px solid #f5b041',
              padding: '11px 26px',
              borderRadius: '28px',
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(245, 176, 65, 0.3)',
              transition: 'transform 0.15s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#f5b041',
                color: '#1a1005',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              }}
            >
              E
            </div>
            <span style={{ color: '#ffffff', fontSize: '14.5px', fontWeight: 600 }}>
              {activeInteraction?.label || activeInteraction?.prompt || ''}
            </span>
          </button>
        </div>
      )}

      {/* ─── CONTEXTUAL DEPENDENCY / PREREQUISITE WARNING ─── */}
      {isLockedPrompt && (
        <div
          style={{
            position: 'absolute',
            bottom: '14%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(22, 16, 12, 0.88)',
              border: '1px solid rgba(245, 176, 65, 0.35)',
              padding: '9px 22px',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
            }}
          >
            <span style={{ fontSize: '13px' }}>🔒</span>
            <span style={{ color: '#f0dfcf', fontSize: '13.5px', fontWeight: 500 }}>
              {activeInteraction?.label || activeInteraction?.prompt || ''}
            </span>
          </div>
        </div>
      )}

      {/* ─── TEMPORARY CONTROLS HINT (Fades after 4.5s) ─── */}
      {showControlsTip && (
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(10, 8, 6, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 20px',
            borderRadius: '16px',
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: '12px',
            pointerEvents: 'none',
            opacity: controlsOpacity,
            transition: 'opacity 0.8s ease-out',
            whiteSpace: 'nowrap',
          }}
        >
          WASD to walk · Shift to run · Mouse to look · E to interact
        </div>
      )}
    </div>
  );
}
