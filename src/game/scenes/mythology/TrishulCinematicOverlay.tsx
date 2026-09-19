import { useEffect, useState, useRef } from 'react';
import type { ShivaStoryPhase } from '../../core/types';
import { audioManager } from '../../audio/AudioManager';

interface TrishulCinematicOverlayProps {
  phase: ShivaStoryPhase;
  onAdvanceToAftermath: () => void;
  onAdvanceToRestoration: () => void;
  onAdvanceToSearch: () => void;
  onReplaySequence?: () => void;
  onReturnHome?: () => void;
}

export function TrishulCinematicOverlay({
  phase,
  onAdvanceToAftermath,
  onAdvanceToRestoration,
  onAdvanceToSearch,
}: TrishulCinematicOverlayProps) {
  // Flash and blackout state for the Trishul climax
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [blackoutOpacity, setBlackoutOpacity] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const timeoutRefs = useRef<number[]>([]);

  const addTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutRefs.current.push(id);
    return id;
  };

  useEffect(() => {
    // Clear previous timeouts on phase change
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];

    if (phase === 'TRISHUL_CINEMATIC') {
      // ─── STAGE 1: Celestial Energy Gathers (0s - 2.4s) ───
      setFlashOpacity(0);
      setBlackoutOpacity(0);
      setShowSubtitle(true);
      setSubtitleText('Mahadev raises the celestial Trishul... The mountain air trembles with divine authority.');

      // Sound cue: gathering celestial storm / drone
      audioManager.playDistantThunderDamru();

      // ─── STAGE 2: Blinding Celestial Flash (2.6s) ───
      addTimeout(() => {
        setFlashOpacity(1); // Blinding white-cyan impact flash
        audioManager.playTransitionSwell();
      }, 2600);

      // ─── STAGE 3: Instant Darkness & Silence (3.1s) ───
      addTimeout(() => {
        setFlashOpacity(0);
        setBlackoutOpacity(1); // Cosmic darkness
        setShowSubtitle(false);
        // Reduce ambient volume to complete silence
        audioManager.fadeAmbientVolume(0.05, 0.4);
      }, 3100);

      // ─── STAGE 4: Transition into Aftermath (4.6s) ───
      addTimeout(() => {
        onAdvanceToAftermath();
      }, 4600);

    } else if (phase === 'GANESHA_AFTERMATH') {
      // ─── AFTERMATH: Slowly lift blackout into solemn stillness ───
      setFlashOpacity(0);
      setBlackoutOpacity(1);
      setShowSubtitle(false);

      // Slowly fade in over 2.0s
      addTimeout(() => {
        setBlackoutOpacity(0);
        setShowSubtitle(true);
        setSubtitleText(
          'A harrowing silence falls over Mount Kailash. Mahadev gazes upon the fallen child... The eternal truth echoes across the peaks.'
        );
        // Slowly bring back quiet ambient wind
        audioManager.fadeAmbientVolume(0.35, 3.0);
      }, 300);

    } else if (phase === 'RESTORATION_READY') {
      setFlashOpacity(0);
      setBlackoutOpacity(0);
      setShowSubtitle(false);
    }

    return () => {
      timeoutRefs.current.forEach((id) => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, [phase, onAdvanceToAftermath]);

  if (phase !== 'TRISHUL_CINEMATIC' && phase !== 'GANESHA_AFTERMATH' && phase !== 'RESTORATION_READY') {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: phase === 'RESTORATION_READY' || phase === 'GANESHA_AFTERMATH' ? 'auto' : 'none',
        zIndex: 90,
        overflow: 'hidden',
      }}
    >
      {/* ─── Cinematic Widescreen Letterbox Bars (2.39:1 Ratio) ─── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '7vh',
          backgroundColor: '#050302',
          zIndex: 95,
          boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '7vh',
          backgroundColor: '#050302',
          zIndex: 95,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.8)',
        }}
      />

      {/* ─── Divine Cyan/Electric Glow Vignette during Trishul raising ─── */}
      {phase === 'TRISHUL_CINEMATIC' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(96, 165, 250, 0.15) 0%, rgba(30, 58, 138, 0.45) 75%, rgba(10, 14, 26, 0.85) 100%)',
            pointerEvents: 'none',
            animation: 'auraSurge 1.8s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* ─── Celestial White Impact Flash ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#f8fafc',
          opacity: flashOpacity,
          transition: 'opacity 0.12s ease-out',
          zIndex: 96,
          pointerEvents: 'none',
        }}
      />

      {/* ─── Cosmic Darkness Fade ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050403',
          opacity: blackoutOpacity,
          transition: phase === 'GANESHA_AFTERMATH' ? 'opacity 2.4s ease-in-out' : 'opacity 0.3s ease-in',
          zIndex: 94,
          pointerEvents: 'none',
        }}
      />

      {/* ─── Cinematic Subtitle Text Overlay ─── */}
      {showSubtitle && (
        <div
          style={{
            position: 'absolute',
            bottom: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(780px, 90vw)',
            textAlign: 'center',
            zIndex: 98,
            userSelect: 'none',
            animation: 'subtitleFadeIn 1.2s ease-out',
          }}
        >
          <p
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '1.24rem',
              lineHeight: 1.65,
              color: '#f1f5f9',
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.95), 0 0 20px rgba(96, 165, 250, 0.4)',
              margin: '0 0 16px 0',
              fontStyle: 'italic',
            }}
          >
            “{subtitleText}”
          </p>

          {/* Aftermath Action Button */}
          {phase === 'GANESHA_AFTERMATH' && blackoutOpacity === 0 && (
            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvanceToRestoration();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(245, 176, 65, 0.25)',
                border: '1px solid rgba(245, 176, 65, 0.8)',
                borderRadius: '28px',
                color: '#fef08a',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '12px 32px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 176, 65, 0.3)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 176, 65, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 176, 65, 0.25)';
              }}
            >
              <span>Witness the Divine Realization ➔</span>
            </button>
          )}
        </div>
      )}

      {/* ─── PHASE 3 COMPLETION: PROMPT TO ENTER FOREST SEARCH ─── */}
      {phase === 'RESTORATION_READY' && (
        <div
          onClick={() => {
            audioManager.playUIClick();
            onAdvanceToSearch();
          }}
          style={{
            position: 'absolute',
            bottom: 'clamp(32px, 8vh, 60px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 28px',
            borderRadius: '4px',
            background: 'rgba(12, 10, 8, 0.85)',
            border: '1.5px solid rgba(245, 176, 65, 0.7)',
            boxShadow: '0 6px 28px rgba(0, 0, 0, 0.85), 0 0 20px rgba(245, 176, 65, 0.25)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            userSelect: 'none',
            zIndex: 99,
            animation: 'subtitleFadeIn 0.5s ease-out',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
            e.currentTarget.style.background = 'rgba(20, 16, 12, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)';
            e.currentTarget.style.background = 'rgba(12, 10, 8, 0.85)';
          }}
        >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '22px',
                  height: '20px',
                  padding: '0 6px',
                  background: 'rgba(245, 176, 65, 0.25)',
                  border: '1px solid rgba(245, 176, 65, 0.7)',
                  borderRadius: '3px',
                  color: '#ffffff',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                E
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', 'Marcellus', serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#fef08a',
                  textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
                }}
              >
                Search Forest for Celestial Elephant ➔
              </span>
            </div>
          )}

      <style>{`
        @keyframes auraSurge {
          0% { opacity: 0.5; }
          100% { opacity: 1.0; }
        }
        @keyframes subtitleFadeIn {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
