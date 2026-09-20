/**
 * MainMenu - Opening cinematic title screen & menu experience.
 * Made with ❤️ by Satish (https://github.com/Satishhhh989)
 */

import { useState, useEffect, useRef } from 'react';
import { gameStateStore, useGameState } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { AmbientParticles } from './AmbientParticles';

export function MainMenu() {
  const { audioSettings } = useGameState();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'creators'>('none');
  const [masterVolume, setMasterVolume] = useState(audioSettings.masterVolume ?? 0.8);
  const [musicVolume, setMusicVolume] = useState(audioSettings.musicVolume ?? 0.7);
  const [isMuted, setIsMuted] = useState(audioSettings.muted ?? false);
  const [entranceStage, setEntranceStage] = useState(0);
  const [isStartHovered, setIsStartHovered] = useState(false);

  // References for 60fps zero-re-render cinematic camera drift, parallax & living light
  const heroRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const diya1Ref = useRef<HTMLDivElement | null>(null);
  const diya2Ref = useRef<HTMLDivElement | null>(null);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseSmoothRef = useRef({ x: 0, y: 0 });
  const hasPlayedHoverSoundRef = useRef(false);

  // Cinematic staged entrance sequence: 1 -> 2 -> 3 -> 4
  useEffect(() => {
    const t1 = setTimeout(() => setEntranceStage(1), 180);  // Sacred invocation & Devanagari
    const t2 = setTimeout(() => setEntranceStage(2), 550);  // VINAYAK title
    const t3 = setTimeout(() => setEntranceStage(3), 950);  // THE FIRST PRAYER
    const t4 = setTimeout(() => setEntranceStage(4), 1300); // START & secondary navigation
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Subtle Mouse Parallax Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Small normalized mouse delta (-1 to 1)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseTargetRef.current.x = nx * -10; // Max 10px subtle shift
      mouseTargetRef.current.y = ny * -7;  // Max 7px subtle shift
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Continuous 30-second Cinematic Camera Drift, Divine Light Breathing & Living Diya Flickers
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const renderLoop = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // 1. Smooth mouse parallax lerp
      const ms = mouseSmoothRef.current;
      const mt = mouseTargetRef.current;
      ms.x += (mt.x - ms.x) * 0.04;
      ms.y += (mt.y - ms.y) * 0.04;

      // 2. Slow continuous camera drift (smooth 28-36 second periodic curves)
      const driftX = Math.sin(elapsed * 0.17) * 11;
      const driftY = Math.cos(elapsed * 0.13) * 7;
      const driftScale = 1.24 + Math.sin(elapsed * 0.09) * 0.022;

      // Apply to Ganesha hero artwork layer (transform-origin anchored on Ganesha at 82% 44%)
      if (heroRef.current) {
        if (isTransitioning) {
          heroRef.current.style.transform = `translate(${ms.x}px, ${ms.y}px) scale(1.36)`;
          heroRef.current.style.transition = 'transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
        } else {
          heroRef.current.style.transform = `translate(${driftX + ms.x}px, ${driftY + ms.y}px) scale(${driftScale})`;
          heroRef.current.style.transition = 'none';
        }
      }

      // 3. Subtle divine lighting breath on Ganesha (12-second slow wave)
      if (auraRef.current) {
        const auraBreath = 0.14 + Math.sin(elapsed * 0.52) * 0.06;
        auraRef.current.style.opacity = auraBreath.toFixed(3);
      }

      // 4. Living organic ghee lamp flickers (Diyas)
      if (diya1Ref.current) {
        const flicker1 =
          0.52 +
          Math.sin(elapsed * 7.9) * 0.12 +
          Math.sin(elapsed * 19.3) * 0.08 +
          Math.cos(elapsed * 31.1) * 0.04;
        diya1Ref.current.style.opacity = flicker1.toFixed(3);
      }
      if (diya2Ref.current) {
        const flicker2 =
          0.44 +
          Math.sin(elapsed * 11.2) * 0.1 +
          Math.cos(elapsed * 23.4) * 0.07 +
          Math.sin(elapsed * 37.8) * 0.04;
        diya2Ref.current.style.opacity = flicker2.toFixed(3);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isTransitioning]);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal !== 'none') {
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const handleStartGame = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    audioManager.playTempleBell();
    audioManager.playTransitionSwell();
    audioManager.startAmbientMusic();

    // Cinematic push-in and dissolve into gameplay scene
    setTimeout(() => {
      gameStateStore.startGame();
    }, 950);
  };

  const handleHoverStart = () => {
    setIsStartHovered(true);
    if (!hasPlayedHoverSoundRef.current) {
      audioManager.playHoverChime();
      hasPlayedHoverSoundRef.current = true;
      setTimeout(() => {
        hasPlayedHoverSoundRef.current = false;
      }, 280);
    }
  };

  const handleHoverSecondary = () => {
    audioManager.playHoverChime();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
    gameStateStore.updateAudioSettings({ muted });
    if (!muted) {
      audioManager.playTempleBell();
      audioManager.startAmbientMusic();
    }
  };

  const handleMasterVolumeChange = (v: number) => {
    setMasterVolume(v);
    gameStateStore.updateAudioSettings({ masterVolume: v });
  };

  const handleMusicVolumeChange = (v: number) => {
    setMusicVolume(v);
    gameStateStore.updateAudioSettings({ musicVolume: v });
    audioManager.fadeAmbientVolume(v * 0.45, 0.2);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          overflow: 'hidden',
          backgroundColor: '#160c14',
          userSelect: 'none',
          pointerEvents: isTransitioning ? 'none' : 'auto',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.95s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* HERO GANESHA ARTWORK: TIGHT CLOSE/MEDIUM CINEMATIC SHOT */}
        <div
          ref={heroRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/ui/ganesha_hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: '84% 42%',
            transformOrigin: '82% 44%',
            transform: 'scale(1.24)',
            willChange: 'transform',
            filter: 'brightness(0.94) contrast(1.04)',
          }}
        />

        {/* DISTANT TEMPLE ATMOSPHERIC HAZE (DEPTH-OF-FIELD SOFTENING ON DISTANT ARCHITECTURE) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 25% 45%, rgba(28, 12, 24, 0.42) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* BREATHING DIVINE AURA LAYER (GENTLE WARM GOLDEN ILLUMINATION SHIFTING ON GANESHA) */}
        <div
          ref={auraRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 82% 44%, rgba(255, 218, 140, 0.9) 0%, rgba(244, 167, 185, 0.3) 35%, transparent 60%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: 0.16,
            willChange: 'opacity',
          }}
        />

        {/* LIVING DIYA FLICKER 1: TALL BRASS LAMP STAND NEAR GANESHA */}
        <div
          ref={diya1Ref}
          style={{
            position: 'absolute',
            left: '69%',
            top: '63%',
            width: '120px',
            height: '120px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 170, 60, 0.85) 0%, rgba(245, 120, 30, 0.35) 40%, transparent 70%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: 0.5,
            willChange: 'opacity',
          }}
        />

        {/* LIVING DIYA FLICKER 2: FOREGROUND TEMPLE LAMP STAND */}
        <div
          ref={diya2Ref}
          style={{
            position: 'absolute',
            left: '19%',
            top: '71%',
            width: '140px',
            height: '140px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 160, 50, 0.75) 0%, rgba(230, 100, 25, 0.28) 45%, transparent 70%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: 0.45,
            willChange: 'opacity',
          }}
        />

        {/* CINEMATIC VIGNETTE & CONTRAST SHADING (DEEP WINE / WARM PLUM) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 82% 44%, transparent 40%, rgba(22, 10, 18, 0.42) 85%),
              linear-gradient(90deg, rgba(22, 10, 18, 0.94) 0%, rgba(22, 10, 18, 0.72) 34%, rgba(22, 10, 18, 0.22) 64%, transparent 100%),
              linear-gradient(180deg, rgba(22, 10, 18, 0.45) 0%, transparent 25%, transparent 75%, rgba(22, 10, 18, 0.68) 100%)
            `,
            pointerEvents: 'none',
          }}
        />

        {/* FOREGROUND & MIDGROUND FLOATING ROSE PETALS & GOLDEN DUST */}
        <AmbientParticles count={20} />

        {/* TOP HEADER: SACRED INVOCATION & UTILITY CONTROLS */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '36px 5vw 0 6vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            opacity: entranceStage >= 1 ? 1 : 0,
            transform: entranceStage >= 1 ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          {/* Sacred Sanskrit Invocation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                backgroundColor: '#ffd580',
                boxShadow: '0 0 6px #ffd580',
              }}
            />
            <span
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '11.5px',
                letterSpacing: '0.28em',
                color: '#faeedb',
                opacity: 0.68,
                textTransform: 'uppercase',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
              }}
            >
              ॥ श्री गणेशाय नमः ॥
            </span>
          </div>

          {/* Minimal Corner Utility Controls (SVGs, Zero Emojis) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Enable Sound' : 'Mute Sound'}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: isMuted ? 'rgba(250, 238, 219, 0.4)' : '#faeedb',
                opacity: 0.75,
                outline: 'none',
                transition: 'opacity 0.25s ease, color 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = '#ffd580';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.75';
                e.currentTarget.style.color = isMuted ? 'rgba(250, 238, 219, 0.4)' : '#faeedb';
              }}
            >
              {isMuted ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: '#faeedb',
                opacity: 0.75,
                outline: 'none',
                transition: 'opacity 0.25s ease, color 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = '#ffd580';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.75';
                e.currentTarget.style.color = '#faeedb';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* CENTER-LEFT GAME TITLE & PRIMARY START ACTION */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '7vw',
            transform: 'translateY(-52%)',
            maxWidth: '680px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}
        >
          {/* Devanagari Title */}
          <div
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)',
              color: '#f6dfb8',
              letterSpacing: '0.22em',
              marginBottom: '10px',
              opacity: entranceStage >= 1 ? 0.9 : 0,
              transform: entranceStage >= 1 ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
            }}
          >
            विनायक
          </div>

          {/* Grand Game Title: VINAYAK */}
          <h1
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: 'clamp(3.6rem, 8vw, 6.2rem)',
              fontWeight: 800,
              letterSpacing: '0.14em',
              lineHeight: 0.92,
              margin: '0 0 16px 0',
              background: 'linear-gradient(180deg, #ffffff 0%, #faeedb 35%, #f2caa2 70%, #d89648 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 28px rgba(226, 168, 80, 0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
              opacity: entranceStage >= 2 ? 1 : 0,
              transform: entranceStage >= 2 ? 'translateX(0)' : 'translateX(-24px)',
              transition: 'opacity 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            VINAYAK
          </h1>

          {/* Subtitle: THE FIRST PRAYER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '48px',
              opacity: entranceStage >= 3 ? 1 : 0,
              transform: entranceStage >= 3 ? 'translateX(0)' : 'translateX(-16px)',
              transition: 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #e2a850)',
              }}
            />
            <p
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)',
                color: '#faeedb',
                letterSpacing: '0.36em',
                textTransform: 'uppercase',
                margin: 0,
                opacity: 0.88,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
              }}
            >
              The First Prayer
            </p>
            <div
              style={{
                width: '36px',
                height: '1px',
                background: 'linear-gradient(90deg, #e2a850, transparent)',
              }}
            />
          </div>

          {/* Clean Tactile Game Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              opacity: entranceStage >= 4 ? 1 : 0,
              transform: entranceStage >= 4 ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* PRIMARY ACTION: START (TACTILE, NO RECTANGULAR BUTTON BOX) */}
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button
                onClick={handleStartGame}
                onMouseEnter={handleHoverStart}
                onMouseLeave={() => setIsStartHovered(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                }}
              >
                {/* START Typography */}
                <span
                  style={{
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: 'clamp(1.25rem, 2.0vw, 1.55rem)',
                    fontWeight: 700,
                    letterSpacing: isStartHovered ? '0.28em' : '0.22em',
                    color: isStartHovered ? '#ffffff' : '#faeedb',
                    textTransform: 'uppercase',
                    transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    textShadow: isStartHovered
                      ? '0 0 16px rgba(247, 212, 134, 0.85), 0 2px 10px rgba(0, 0, 0, 0.9)'
                      : '0 2px 10px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  START
                </span>

                {/* Directional Indicator (Sliding Arrow) */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isStartHovered ? '#ffd580' : 'rgba(250, 238, 219, 0.65)'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isStartHovered ? 'translateX(8px)' : 'translateX(0)',
                    transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.35s ease',
                    filter: isStartHovered ? 'drop-shadow(0 0 8px #ffd580)' : 'none',
                  }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>

                {/* Subtle Extending Ornamental Line */}
                <div
                  style={{
                    height: '1px',
                    width: isStartHovered ? '68px' : '36px',
                    background: isStartHovered
                      ? 'linear-gradient(90deg, #ffd580, rgba(255, 213, 128, 0.1))'
                      : 'linear-gradient(90deg, rgba(250, 238, 219, 0.4), transparent)',
                    boxShadow: isStartHovered ? '0 0 8px rgba(255, 213, 128, 0.6)' : 'none',
                    transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.35s ease',
                  }}
                />
              </button>
            </div>

            {/* SECONDARY ACTIONS: CONTINUE · SETTINGS · CREDITS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginTop: '4px',
              }}
            >
              {/* CONTINUE */}
              <button
                onClick={handleStartGame}
                onMouseEnter={handleHoverSecondary}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '13px',
                    letterSpacing: '0.24em',
                    color: 'rgba(250, 238, 219, 0.6)',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffd580';
                    e.currentTarget.style.letterSpacing = '0.28em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(250, 238, 219, 0.6)';
                    e.currentTarget.style.letterSpacing = '0.24em';
                  }}
                >
                  CONTINUE
                </span>
              </button>

              <div
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(250, 238, 219, 0.3)',
                }}
              />

              {/* SETTINGS */}
              <button
                onClick={() => setActiveModal('settings')}
                onMouseEnter={handleHoverSecondary}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '13px',
                    letterSpacing: '0.24em',
                    color: 'rgba(250, 238, 219, 0.6)',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffd580';
                    e.currentTarget.style.letterSpacing = '0.28em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(250, 238, 219, 0.6)';
                    e.currentTarget.style.letterSpacing = '0.24em';
                  }}
                >
                  SETTINGS
                </span>
              </button>

              <div
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(250, 238, 219, 0.3)',
                }}
              />

              {/* CREATORS */}
              <button
                onClick={() => setActiveModal('creators')}
                onMouseEnter={handleHoverSecondary}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '13px',
                    letterSpacing: '0.24em',
                    color: 'rgba(250, 238, 219, 0.6)',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffd580';
                    e.currentTarget.style.letterSpacing = '0.28em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(250, 238, 219, 0.6)';
                    e.currentTarget.style.letterSpacing = '0.24em';
                  }}
                >
                  CREATORS
                </span>
              </button>

              {/* DOT SEPARATOR */}
              <div
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(250, 238, 219, 0.3)',
                }}
              />

              {/* GAME ARCADE */}
              <button
                onClick={() => {
                  audioManager.playCelebrationChime();
                  gameStateStore.enterArcade();
                }}
                onMouseEnter={handleHoverSecondary}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: '13px',
                    letterSpacing: '0.24em',
                    color: 'rgba(250, 238, 219, 0.6)',
                    textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffd580';
                    e.currentTarget.style.letterSpacing = '0.28em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(250, 238, 219, 0.6)';
                    e.currentTarget.style.letterSpacing = '0.24em';
                  }}
                >
                  GAME ARCADE
                </span>
              </button>
            </div>

            {/* SUBTLE DEVELOPER SIGNATURE TAGLINE */}
            <div
              style={{
                marginTop: '12px',
                fontFamily: "'Outfit', 'Marcellus', serif",
                fontSize: '11px',
                fontWeight: 400,
                color: 'rgba(250, 238, 219, 0.38)',
                letterSpacing: '0.14em',
                textTransform: 'none',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: entranceStage >= 4 ? 1 : 0,
                transition: 'opacity 1.2s ease 0.2s',
              }}
            >
              Built with love by NIATians
            </div>
          </div>
        </div>

        {/* SETTINGS MODAL */}
        {activeModal === 'settings' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(12, 6, 10, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '24px',
            }}
            onClick={() => setActiveModal('none')}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                background: 'linear-gradient(180deg, rgba(38, 16, 29, 0.95) 0%, rgba(20, 9, 16, 0.98) 100%)',
                border: '1px solid rgba(247, 212, 134, 0.35)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 24px rgba(247, 212, 134, 0.15)',
                borderRadius: '2px',
                padding: '32px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '26px',
                  borderBottom: '1px solid rgba(247, 212, 134, 0.18)',
                  paddingBottom: '14px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', 'Marcellus', serif",
                    fontSize: '17px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                  }}
                >
                  SETTINGS
                </span>

                <button
                  onClick={() => setActiveModal('none')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(250, 238, 219, 0.65)',
                    padding: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd580')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250, 238, 219, 0.65)')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Master Volume */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Marcellus', serif", fontSize: '12.5px', letterSpacing: '0.12em', color: '#faeedb' }}>
                      MASTER AUDIO
                    </span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#ffd580' }}>
                      {Math.round(masterVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#ffd580', cursor: 'pointer' }}
                  />
                </div>

                {/* Devotional Ambience Volume */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'Marcellus', serif", fontSize: '12.5px', letterSpacing: '0.12em', color: '#faeedb' }}>
                      DEVOTIONAL AMBIENCE (TANPURA)
                    </span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#ffd580' }}>
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#ffd580', cursor: 'pointer' }}
                  />
                </div>

                {/* Sample Bell Audio Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'rgba(250, 238, 219, 0.7)' }}>
                    Sample Temple Bell
                  </span>
                  <button
                    onClick={() => audioManager.playTempleBell()}
                    style={{
                      background: 'rgba(247, 212, 134, 0.1)',
                      border: '1px solid rgba(247, 212, 134, 0.35)',
                      padding: '6px 14px',
                      color: '#ffd580',
                      fontFamily: "'Marcellus', serif",
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    CHIME
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATORS MODAL */}
        {activeModal === 'creators' && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(12, 6, 10, 0.85)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              padding: '20px',
            }}
            onClick={() => setActiveModal('none')}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                background: 'linear-gradient(180deg, rgba(34, 15, 26, 0.96) 0%, rgba(18, 8, 14, 0.98) 100%)',
                border: '1px solid rgba(247, 212, 134, 0.35)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.88), 0 0 28px rgba(247, 212, 134, 0.14)',
                borderRadius: '4px',
                padding: '30px 34px',
                animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '22px',
                  borderBottom: '1px solid rgba(247, 212, 134, 0.18)',
                  paddingBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: "'Cinzel', 'Marcellus', serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                    }}
                  >
                    CREATORS
                  </span>
                </div>

                <button
                  onClick={() => setActiveModal('none')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(250, 238, 219, 0.65)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffd580')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250, 238, 219, 0.65)')}
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Creators Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Team Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '10.5px',
                      letterSpacing: '0.24em',
                      color: 'rgba(247, 212, 134, 0.65)',
                      textTransform: 'uppercase',
                    }}
                  >
                    TEAM
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cinzel', 'Marcellus', serif",
                      fontSize: '20px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: '#ffd580',
                      textShadow: '0 0 12px rgba(255, 213, 128, 0.35)',
                    }}
                  >
                    Mooor.janaaa
                  </span>
                </div>

                {/* Subtle Divider */}
                <div
                  style={{
                    height: '1px',
                    width: '100%',
                    background: 'linear-gradient(90deg, rgba(247, 212, 134, 0.25), transparent)',
                  }}
                />

                {/* Team Members */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '10.5px',
                      letterSpacing: '0.24em',
                      color: 'rgba(250, 238, 219, 0.45)',
                      textTransform: 'uppercase',
                    }}
                  >
                    MEMBERS
                  </span>

                  {/* Member 1: Satish with GitHub link */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(247, 212, 134, 0.12)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Marcellus', serif",
                        fontSize: '15px',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Satish
                    </span>

                    <a
                      href="https://github.com/Satishhhh989"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#ffd580',
                        textDecoration: 'none',
                        letterSpacing: '0.04em',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: 'rgba(247, 212, 134, 0.12)',
                        border: '1px solid rgba(247, 212, 134, 0.35)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(247, 212, 134, 0.24)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(247, 212, 134, 0.12)';
                        e.currentTarget.style.color = '#ffd580';
                      }}
                    >
                      <span>GitHub</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  </div>

                  {/* Member 2: Deval Gowda */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(247, 212, 134, 0.12)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Marcellus', serif",
                        fontSize: '15px',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Deval Gowda
                    </span>
                  </div>

                  {/* Member 3: Bhuvan Prasad */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(247, 212, 134, 0.12)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Marcellus', serif",
                        fontSize: '15px',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Bhuvan Prasad
                    </span>
                  </div>
                </div>

                {/* Footnote */}
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Marcellus', serif",
                    color: 'rgba(250, 238, 219, 0.42)',
                    letterSpacing: '0.14em',
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  ॥ श्री गणेशाय नमः ॥
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CINEMATIC DISSOLVE INTO HOME SCENE ON START */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#140910',
          zIndex: 150,
          pointerEvents: 'none',
          transition: 'opacity 0.95s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isTransitioning ? 1 : 0,
        }}
      />
    </>
  );
}
