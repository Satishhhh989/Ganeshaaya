import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { ShivaStoryPhase } from '../../core/types';
import { STORY_ASSETS } from '../../story/storyAssets';
import { StoryParticles } from '../../story/StoryParticles';
import { audioManager } from '../../audio/AudioManager';
import { AUDIO_SCENE_MAP } from '../../audio/audioSceneMap';

export interface RestorationCinematicProps {
  phase: ShivaStoryPhase;
  onAdvance: (nextPhase: ShivaStoryPhase) => void;
  onReturnHome: () => void;
  onReplaySearch?: () => void;
}

/**
 * Story beat narration content
 */
interface StoryBeatData {
  chapter: string;
  lines: string[];
  particleType: 'golden_prana' | 'lotus_drift';
  audioFile?: string;
}

const CINEMATIC_BEATS: Record<string, StoryBeatData> = {
  DIVINE_TRANSITION: {
    chapter: 'THE AWAKENING',
    lines: ['Cosmic prana flowed through the sacred form, and Ganesha breathed once more.'],
    particleType: 'golden_prana',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[0].url, // v1
  },
  DIVINE_RESTORATION: {
    chapter: 'THE AWAKENING',
    lines: ['Cosmic prana flowed through the sacred form, and Ganesha breathed once more.'],
    particleType: 'golden_prana',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[0].url, // v1
  },
  GANESHA_DIVINE_AWAKENING: {
    chapter: 'THE AWAKENING',
    lines: ['Ganesha opened his gentle eyes, restored to life.'],
    particleType: 'golden_prana',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[1].url, // v2
  },
  FAMILY_REUNION: {
    chapter: 'THE REUNION',
    lines: ['Parvati embraced her beloved son — sorrow dissolving into boundless joy.'],
    particleType: 'lotus_drift',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[2].url, // v3
  },
  DIVINE_BLESSING: {
    chapter: 'PRATHAMA PUJYA',
    lines: [
      'Shiva blessed Ganesha and declared that he would be worshipped first before every new beginning.',
    ],
    particleType: 'lotus_drift',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[3].url, // v4
  },
  RETURN_TO_PRESENT_READY: {
    chapter: 'PRATHAMA PUJYA',
    lines: [
      'Shiva blessed Ganesha and declared that he would be worshipped first before every new beginning.',
    ],
    particleType: 'golden_prana',
    audioFile: AUDIO_SCENE_MAP.HEAD_JOIN[3].url, // v4
  },
};

export function RestorationCinematic({
  phase,
  onAdvance,
  onReturnHome,
}: RestorationCinematicProps) {
  // Active cinematic phases
  const activeCinematicPhases = useMemo(
    () => [
      'DIVINE_TRANSITION',
      'DIVINE_RESTORATION',
      'GANESHA_DIVINE_AWAKENING',
      'FAMILY_REUNION',
      'DIVINE_BLESSING',
      'RETURN_TO_PRESENT_READY',
    ],
    []
  );

  const isCinematicActive = activeCinematicPhases.includes(phase);

  // Sub-beat indexing for multi-line cinematic pacing
  const [subBeatIndex, setSubBeatIndex] = useState(0);

  // Parallax & smooth drift coordinates
  const mousePos = useRef({ x: 0, y: 0 });
  const currentParallax = useRef({ x: 0, y: 0 });
  const [renderOffset, setRenderOffset] = useState({ x: 0, y: 0 });

  // Camera progression state (0 to 1) for smooth cinematic push-in
  const [cameraProgress, setCameraProgress] = useState(0);

  // Awakening divine light flash & glow
  const [awakeningFlash, setAwakeningFlash] = useState(false);
  const [isAwakenedLit, setIsAwakenedLit] = useState(false);

  // Dissolve transition flag
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Subtitle reveal animation key
  const [textAnimKey, setTextAnimKey] = useState(0);

  // Reset sub-beat index when phase changes
  useEffect(() => {
    setSubBeatIndex(0);
    setCameraProgress(0);
    setTextAnimKey((prev) => prev + 1);
  }, [phase]);

  // Audio orchestration & synchronized voice playback
  useEffect(() => {
    if (!isCinematicActive) return;

    if (phase === 'DIVINE_TRANSITION') {
      audioManager.fadeAmbientVolume(0.35, 1.5);
      audioManager.playTransitionSwell();
    } else if (phase === 'DIVINE_RESTORATION') {
      audioManager.playTransitionSwell();
    } else if (phase === 'GANESHA_DIVINE_AWAKENING') {
      // Awakening sequence: soft silence -> breath -> golden pulse -> temple bell -> peaceful resolution
      audioManager.fadeAmbientVolume(0.12, 0.8);
      audioManager.playElephantBreath();

      const timer1 = setTimeout(() => {
        setAwakeningFlash(true);
        setIsAwakenedLit(true);
        audioManager.playDivineAwakeningPulse();
      }, 1100);

      const timer2 = setTimeout(() => {
        setAwakeningFlash(false);
        audioManager.playTempleBell();
        audioManager.fadeAmbientVolume(0.38, 2.5);
      }, 2300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (phase === 'FAMILY_REUNION') {
      audioManager.playTempleBell();
    } else if (phase === 'DIVINE_BLESSING') {
      audioManager.playDivineAwakeningPulse();
    }
  }, [phase, isCinematicActive]);

  // Mouse tracking for subtle 2.5D parallax depth
  useEffect(() => {
    if (!isCinematicActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x: normX, y: normY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCinematicActive]);

  // Parallax animation & natural breathing drift loop
  useEffect(() => {
    if (!isCinematicActive) return;

    let animId: number;
    const startTime = performance.now();

    const updateLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Restrained, heavy cinematic lerp factor
      const lerpFactor = 0.032;
      currentParallax.current.x += (mousePos.current.x - currentParallax.current.x) * lerpFactor;
      currentParallax.current.y += (mousePos.current.y - currentParallax.current.y) * lerpFactor;

      // Autonomous gentle ambient drift (breathing atmosphere even without mouse interaction)
      const driftX = Math.sin(elapsed * 0.45) * 5.0;
      const driftY = Math.cos(elapsed * 0.35) * 3.5;

      setRenderOffset({
        x: currentParallax.current.x * 20 + driftX,
        y: currentParallax.current.y * 14 + driftY,
      });

      // Smooth camera progression over 14 seconds
      const cam = Math.min(1, elapsed / 14);
      setCameraProgress(cam);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isCinematicActive, phase]);

  // Advance narration or move to next phase
  const handleAdvance = useCallback(() => {
    if (isTransitioning) return;

    const beatData = CINEMATIC_BEATS[phase];
    if (!beatData) return;

    audioManager.playUIClick();

    if (subBeatIndex < beatData.lines.length - 1) {
      // Advance to next subtitle line in current phase
      setSubBeatIndex((prev) => prev + 1);
      setTextAnimKey((prev) => prev + 1);
    } else {
      // Advance to next story phase
      setIsTransitioning(true);

      setTimeout(() => {
        setIsTransitioning(false);

        if (phase === 'DIVINE_TRANSITION' || phase === 'DIVINE_RESTORATION') {
          onAdvance('GANESHA_DIVINE_AWAKENING');
        } else if (phase === 'GANESHA_DIVINE_AWAKENING') {
          onAdvance('FAMILY_REUNION');
        } else if (phase === 'FAMILY_REUNION') {
          onAdvance('DIVINE_BLESSING');
        } else if (phase === 'DIVINE_BLESSING' || phase === 'RETURN_TO_PRESENT_READY') {
          onReturnHome();
        }
      }, 550);
    }
  }, [phase, subBeatIndex, isTransitioning, onAdvance, onReturnHome]);

  // Play corresponding head join voice file and automatically advance on audio completion
  useEffect(() => {
    if (!isCinematicActive) return;

    const beatData = CINEMATIC_BEATS[phase];
    if (beatData?.audioFile) {
      let advanceTimer: number | null = null;
      audioManager.playVoiceLine(beatData.audioFile, () => {
        // Natural brief pause (~800ms) after audio finishes before advancing
        advanceTimer = window.setTimeout(() => {
          handleAdvance();
        }, 800);
      });

      return () => {
        audioManager.stopVoiceLine();
        if (advanceTimer) {
          window.clearTimeout(advanceTimer);
        }
      };
    }
  }, [phase, isCinematicActive, handleAdvance]);

  // Keyboard navigation listener: Space, Enter, or KeyE to continue; Escape to skip
  useEffect(() => {
    if (!isCinematicActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.code === 'Enter' ||
        e.code === 'KeyE' ||
        e.key === 'e' ||
        e.key === 'E'
      ) {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        audioManager.stopVoiceLine();
        onReturnHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinematicActive, handleAdvance, onReturnHome]);

  if (!isCinematicActive) {
    return null;
  }

  const currentBeat = CINEMATIC_BEATS[phase] || CINEMATIC_BEATS.DIVINE_TRANSITION;
  const currentLine = currentBeat.lines[subBeatIndex] || currentBeat.lines[0];

  // Camera zoom & pan calculations per phase
  let cameraScale = 1.02 + cameraProgress * 0.05;
  let cameraOrigin = '50% 50%';
  let cameraPanY = 0;

  if (phase === 'GANESHA_DIVINE_AWAKENING') {
    // Focused push toward Ganesha's face
    cameraScale = 1.02 + cameraProgress * 0.08;
    cameraOrigin = '50% 34%';
    cameraPanY = -cameraProgress * 1.8;
  } else if (phase === 'FAMILY_REUNION') {
    // Gentle drift across the sacred family
    cameraScale = 1.03 + cameraProgress * 0.04;
    cameraOrigin = '50% 40%';
  } else if (phase === 'DIVINE_BLESSING') {
    // Majestic slow pull-back to reveal full Kailash glory
    cameraScale = 1.07 - cameraProgress * 0.04;
    cameraOrigin = '50% 45%';
  }

  return (
    <div
      onClick={handleAdvance}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 92,
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
        backgroundColor: '#070406',
        cursor: 'pointer',
      }}
    >
      {/* ─── FULL-SCREEN LIVING ARTWORK CANVAS (2.5D PARALLAX & SMOOTH CAMERA) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: '-6%',
          width: '112%',
          height: '112%',
          transformOrigin: cameraOrigin,
          transform: `scale(${cameraScale}) translateY(${cameraPanY}%)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            STAGE 1 & 2: DIVINE_TRANSITION & DIVINE_RESTORATION
            ═══════════════════════════════════════════════════════════════ */}
        {(phase === 'DIVINE_TRANSITION' || phase === 'DIVINE_RESTORATION') && (
          <>
            {/* Background Layer: Mount Kailash Abode */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.backgrounds.kailashAbode.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                transform: `translate(${renderOffset.x * 0.25}px, ${renderOffset.y * 0.2}px)`,
                filter: phase === 'DIVINE_RESTORATION' ? 'brightness(0.82)' : 'brightness(0.92)',
                transition: 'transform 0.2s ease-out, filter 1s ease',
              }}
            />

            {/* Radiant Golden Prana Layer */}
            {phase === 'DIVINE_RESTORATION' && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-10%',
                  width: '120%',
                  height: '120%',
                  backgroundImage: `url("${STORY_ASSETS.effects.divineGoldenAura.url}")`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  mixBlendMode: 'screen',
                  opacity: 0.65,
                  transform: `translate(${renderOffset.x * 0.45}px, ${renderOffset.y * 0.35}px)`,
                  animation: 'auraBreathe 4s ease-in-out infinite alternate',
                }}
              />
            )}

            {/* Sacred Resting Form at Threshold */}
            {phase === 'DIVINE_RESTORATION' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translate(${renderOffset.x * 0.6}px, ${renderOffset.y * 0.48}px)`,
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={STORY_ASSETS.characters.ganeshaGuarding.url}
                  alt="Child Form at Kailash Threshold"
                  style={{
                    maxWidth: '48%',
                    maxHeight: '48%',
                    objectFit: 'contain',
                    filter:
                      'drop-shadow(0 0 45px rgba(254, 240, 138, 0.75)) drop-shadow(0 0 90px rgba(234, 179, 8, 0.45)) brightness(1.15)',
                    animation: 'restingFloat 4.5s ease-in-out infinite alternate',
                  }}
                />
              </div>
            )}

            {/* Drifting Lotus Petals Foreground */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.props.lotusPetalsForeground.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'screen',
                opacity: 0.6,
                transform: `translate(${renderOffset.x * 0.9}px, ${renderOffset.y * 0.75}px)`,
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STAGE 3: GANESHA_DIVINE_AWAKENING (Emotional Centerpiece)
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'GANESHA_DIVINE_AWAKENING' && (
          <>
            {/* Primary Full-Bleed Artwork: Lord Ganesha Awakened */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.characters.ganeshaAwakened.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: '50% 32%',
                transform: `translate(${renderOffset.x * 0.3}px, ${renderOffset.y * 0.25}px)`,
                filter: isAwakenedLit
                  ? 'brightness(1.05) contrast(1.03)'
                  : 'brightness(0.92) contrast(1.0)',
                transition: 'filter 1.8s ease-out, transform 0.25s ease-out',
              }}
            />

            {/* Warm Golden Sunlight Stream from Upper Right */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at 78% 22%, rgba(254, 240, 138, 0.32) 0%, rgba(251, 191, 36, 0.16) 38%, transparent 72%)',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                transform: `translate(${renderOffset.x * 0.45}px, ${renderOffset.y * 0.35}px)`,
              }}
            />

            {/* Drifting Petals Foreground */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.props.lotusPetalsForeground.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'screen',
                opacity: 0.52,
                transform: `translate(${renderOffset.x * 0.85}px, ${renderOffset.y * 0.7}px)`,
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STAGE 4 & 5: FAMILY_REUNION, DIVINE_BLESSING & RETURN READY
            ═══════════════════════════════════════════════════════════════ */}
        {(phase === 'FAMILY_REUNION' ||
          phase === 'DIVINE_BLESSING' ||
          phase === 'RETURN_TO_PRESENT_READY') && (
          <>
            {/* Primary Full-Bleed Artwork: Shiva, Parvati & Ganesha Reunion */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.characters.shivaParvatiReunion.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: '50% 36%',
                transform: `translate(${renderOffset.x * 0.3}px, ${renderOffset.y * 0.24}px)`,
                filter:
                  phase === 'DIVINE_BLESSING'
                    ? 'brightness(1.08) contrast(1.04)'
                    : 'brightness(0.96) contrast(1.02)',
                transition: 'filter 1.5s ease-out, transform 0.25s ease-out',
              }}
            />

            {/* Celestial Golden Light for Blessing */}
            {phase === 'DIVINE_BLESSING' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(254, 240, 138, 0.28) 0%, rgba(245, 158, 11, 0.12) 50%, transparent 80%)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                  animation: 'auraBreathe 5s ease-in-out infinite alternate',
                }}
              />
            )}

            {/* Drifting Petals Foreground */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${STORY_ASSETS.props.lotusPetalsForeground.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'screen',
                opacity: 0.58,
                transform: `translate(${renderOffset.x * 0.85}px, ${renderOffset.y * 0.72}px)`,
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>

      {/* ─── PROCEDURAL ATMOSPHERIC PARTICLES ─── */}
      <StoryParticles type={currentBeat.particleType} />

      {/* ─── SOFT DIVINE AWAKENING FLASH (NON-BLINDING GOLDEN SHIMMER) ─── */}
      {awakeningFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#fef9c3',
            mixBlendMode: 'screen',
            opacity: 0.85,
            pointerEvents: 'none',
            animation: 'flashBloom 1.2s ease-out forwards',
            zIndex: 94,
          }}
        />
      )}

      {/* ─── CINEMATIC WIDESCREEN LETTERBOX BARS (2.39:1 FILM RATIO) ─── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6.5vh',
          backgroundColor: '#050304',
          zIndex: 96,
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6.5vh',
          backgroundColor: '#050304',
          zIndex: 96,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.85)',
          pointerEvents: 'none',
        }}
      />

      {/* ─── UNOBTRUSIVE TOP CORNER CONTROLS ─── */}
      {/* Chapter Indicator (Tiny & Tasteful) */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(14px, 2.5vh, 22px)',
          left: 'clamp(20px, 3.5vw, 44px)',
          zIndex: 97,
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.35em',
          color: 'rgba(254, 240, 138, 0.72)',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
          pointerEvents: 'none',
        }}
      >
        {currentBeat.chapter}
      </div>

      {/* Discreet Skip Control */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          audioManager.stopVoiceLine();
          onReturnHome();
        }}
        style={{
          position: 'absolute',
          top: 'clamp(14px, 2.5vh, 22px)',
          right: 'clamp(20px, 3.5vw, 44px)',
          zIndex: 97,
          fontFamily: "'Cinzel', 'Marcellus', serif",
          fontSize: '12px',
          letterSpacing: '0.22em',
          color: 'rgba(250, 245, 235, 0.48)',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '4px 8px',
          transition: 'color 0.2s ease, transform 0.2s ease',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fef08a';
          e.currentTarget.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(250, 245, 235, 0.48)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Skip →
      </div>

      {/* ─── FULL-WIDTH LOWER ATMOSPHERIC GRADIENT WASH (NO BOX / NO CONTAINER) ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38vh',
          background:
            'linear-gradient(to top, rgba(7, 4, 6, 0.94) 0%, rgba(18, 10, 16, 0.62) 48%, rgba(7, 4, 6, 0.15) 80%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 93,
        }}
      />

      {/* ─── FLOATING CINEMATIC SUBTITLE NARRATION (NO BOX / DIRECT OVER ART) ─── */}
      <div
        key={textAnimKey}
        style={{
          position: 'absolute',
          bottom: 'clamp(44px, 8.5vh, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '860px',
          textAlign: 'center',
          zIndex: 95,
          pointerEvents: 'none',
          animation: 'fadeInUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <p
          style={{
            margin: 0,
            padding: 0,
            fontFamily: "'Cinzel', 'Marcellus', 'Georgia', serif",
            fontSize: 'clamp(1.22rem, 1.85vw, 1.58rem)',
            lineHeight: 1.62,
            letterSpacing: '0.025em',
            color: '#fcf8f0',
            fontWeight: 500,
            textShadow:
              '0 2px 14px rgba(0, 0, 0, 0.98), 0 0 28px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(254, 240, 138, 0.25)',
          }}
        >
          {currentLine}
        </p>
      </div>

      {/* ─── SUBTLE DISCREET CONTINUE PROMPT (NEVER LOOKS LIKE A BUTTON) ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(14px, 2.8vh, 26px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 97,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'subtlePromptPulse 3.2s ease-in-out infinite alternate',
        }}
      >
        <span
          style={{
            padding: '2px 7px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            borderRadius: '3px',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          SPACE
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'rgba(254, 240, 138, 0.82)',
            textTransform: 'uppercase',
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
          }}
        >
          CONTINUE
        </span>
      </div>

      {/* ─── SEAMLESS DISSOLVE OVERLAY (USED BETWEEN BEATS / SCENES) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#070406',
          opacity: isTransitioning ? 0.95 : 0,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'none',
          zIndex: 99,
        }}
      />

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes auraBreathe {
          0% {
            transform: scale(0.96) rotate(0deg);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.06) rotate(15deg);
            opacity: 0.85;
          }
        }
        @keyframes restingFloat {
          0% {
            transform: translateY(0px) scale(1);
          }
          100% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        @keyframes subtlePromptPulse {
          0% {
            opacity: 0.55;
          }
          100% {
            opacity: 0.92;
          }
        }
        @keyframes flashBloom {
          0% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
