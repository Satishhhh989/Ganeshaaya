import { useEffect, useState, useRef, useCallback } from 'react';
import { audioManager } from '../../audio/AudioManager';

export interface CinematicDialogueProps {
  speaker: string;
  text: string;
  onNext: () => void;
  isLastLine?: boolean;
  audioFile?: string;
  audioCue?: string;
  visible?: boolean;
  className?: string;
}

/**
 * Clean uppercase speaker identification:
 * - 'Child' / 'Vinay' -> 'VINAY'
 * - 'Old Man' / 'Dada' / 'Ajja' -> 'AJJA'
 * - 'Shiva' -> 'LORD SHIVA'
 * - 'Ganesha' -> 'BAL GANESHA'
 */
function formatSpeakerName(speaker: string): string {
  const s = speaker.trim().toLowerCase();
  if (s === 'child' || s === 'vinay') return 'VINAY';
  if (s === 'old man' || s === 'dada' || s === 'ajja') return 'AJJA';
  if (s === 'shiva') return 'LORD SHIVA';
  if (s === 'ganesha') return 'BAL GANESHA';
  return speaker.trim().toUpperCase();
}

export function CinematicDialogue({
  speaker,
  text,
  onNext,
  isLastLine = false,
  audioFile,
  visible = true,
}: CinematicDialogueProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [lineAnimationKey, setLineAnimationKey] = useState(0);
  const revealTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  // Smooth ambient music ducking during dialogue
  useEffect(() => {
    if (visible) {
      audioManager.fadeAmbientVolume(0.38, 0.8);
      const enterTimer = window.setTimeout(() => setIsEntering(true), 20);
      return () => {
        window.clearTimeout(enterTimer);
      };
    } else {
      setIsEntering(false);
      audioManager.fadeAmbientVolume(1.0, 1.2);
    }
  }, [visible]);

  // Advance dialogue handler: if mid-reveal, immediately reveal full text; otherwise advance line
  const handleAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (isRevealing) {
      if (revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      setDisplayedText(text);
      setIsRevealing(false);
    } else {
      audioManager.playUIClick();
      onNext();
    }
  }, [isRevealing, text, onNext]);

  // Handle line transitions & natural text reveal & voice playback
  useEffect(() => {
    if (!visible || !text) {
      setDisplayedText('');
      return;
    }

    setLineAnimationKey((prev) => prev + 1);

    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (audioFile) {
      // Synchronized audio: when audio finishes, pause naturally (~750ms) then auto-advance
      audioManager.playVoiceLine(audioFile, () => {
        if (autoAdvanceTimerRef.current) {
          window.clearTimeout(autoAdvanceTimerRef.current);
        }
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          onNext();
        }, 750);
      });
    }

    setDisplayedText('');
    setIsRevealing(true);
    let charIdx = 0;

    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
    }

    // Graceful character reveal (~24ms per char, smooth and non-intrusive)
    revealTimerRef.current = window.setInterval(() => {
      charIdx++;
      setDisplayedText(text.slice(0, charIdx));

      if (charIdx >= text.length) {
        if (revealTimerRef.current) {
          window.clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
        }
        setIsRevealing(false);
      }
    }, 24);

    return () => {
      if (audioFile) {
        audioManager.stopVoiceLine();
      }
      if (revealTimerRef.current) {
        window.clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [text, visible, audioFile, onNext]);

  // Keyboard navigation: E, Space, Enter advance dialogue
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleAdvance]);

  if (!visible) return null;

  const formattedSpeaker = formatSpeakerName(speaker);

  return (
    <>
      {/* ─── FULL-WIDTH CINEMATIC LOWER GRADIENT ─── */}
      {/* Occupies bottom ~30% of screen. No card, no rectangular box. Pure atmospheric wash */}
      <div
        data-ui="cinematic-backdrop"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32vh',
          background:
            'linear-gradient(to top, rgba(14, 6, 12, 0.92) 0%, rgba(22, 9, 18, 0.58) 45%, rgba(14, 6, 12, 0.15) 80%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 85,
          opacity: isEntering ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />

      {/* ─── FLOATING CINEMATIC LOWER THIRD (NO RECTANGLE CARD) ─── */}
      <div
        key={lineAnimationKey}
        data-ui="cinematic-dialogue"
        onClick={handleAdvance}
        style={{
          position: 'fixed',
          bottom: 'clamp(28px, 4.5vh, 48px)',
          left: 'clamp(28px, 6vw, 84px)',
          right: 'clamp(28px, 6vw, 84px)',
          maxWidth: '860px',
          zIndex: 90,
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          opacity: isEntering ? 1 : 0,
          transform: `translateY(${isEntering ? '0px' : '8px'})`,
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ─── SPEAKER NAME & MINIMAL DELICATE LINE ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              color: '#eed7a1',
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
            }}
          >
            {formattedSpeaker}
          </span>
          <div
            style={{
              width: '38px',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(229, 192, 123, 0.75), transparent)',
              marginTop: '4px',
            }}
          />
        </div>

        {/* ─── DIALOGUE TEXT (WARM IVORY / SOFT CREAM) ─── */}
        <p
          style={{
            margin: 0,
            padding: 0,
            fontFamily: "'Marcellus', serif",
            fontSize: 'clamp(1.18rem, 1.45vw, 1.35rem)',
            lineHeight: 1.62,
            letterSpacing: '0.015em',
            color: '#f8f4ec',
            minHeight: '44px',
            fontWeight: 400,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9)',
            maxWidth: '820px',
          }}
        >
          {displayedText}
          {isRevealing && (
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1.05em',
                backgroundColor: '#e5c07b',
                marginLeft: '4px',
                verticalAlign: 'middle',
                opacity: 0.8,
              }}
            />
          )}
        </p>

        {/* ─── NEXT / ADVANCE CONTINUATION INDICATOR ─── */}
        <div
          style={{
            alignSelf: 'flex-end',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '14px',
            padding: '4px 0',
            opacity: isRevealing ? 0.45 : 1,
            transition: 'opacity 0.25s ease, transform 0.2s ease',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '20px',
              height: '19px',
              padding: '0 5px',
              background: 'rgba(22, 10, 18, 0.75)',
              border: '1px solid rgba(229, 192, 123, 0.55)',
              borderRadius: '3px',
              color: '#f8f4ec',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
            }}
          >
            E
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Marcellus', serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#e5c07b',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            {isLastLine ? 'CONTINUE ➔' : 'NEXT →'}
          </span>
        </div>
      </div>
    </>
  );
}
