import { useEffect, useState, useRef } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function DialogueBox() {
  const { gameState, activeDialogue, dialogueIndex } = useGameState();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  const currentLine = activeDialogue?.lines[dialogueIndex];

  // Typewriter effect when line changes
  useEffect(() => {
    if (!currentLine) {
      setDisplayedText('');
      return;
    }

    // If an external audio voice line is configured, trigger it through the audio engine
    if (currentLine.audioFile) {
      audioManager.playVoiceLine(currentLine.audioFile);
    }

    const fullText = currentLine.text;
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = window.setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      // Play subtle voice synthesizer blip only if external voice audio is not playing
      if (!currentLine.audioFile && charIndex % 3 === 0) {
        audioManager.playSpeechBlip(currentLine.speaker);
      }

      if (charIndex >= fullText.length) {
        if (typingTimerRef.current) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 28);

    return () => {
      audioManager.stopVoiceLine();
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, [currentLine]);

  // Keyboard navigation: Space, Enter, or E to advance
  useEffect(() => {
    if (gameState !== 'DIALOGUE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (gameState !== 'DIALOGUE' || !currentLine) {
    return null;
  }

  const handleAdvance = () => {
    if (isTyping && currentLine) {
      // If still typing, immediately complete the line
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      audioManager.playUIClick();
      gameStateStore.advanceDialogue();
    }
  };

  const isChild = currentLine.speaker === 'Child';

  return (
    <>
      {/* Top Cinematic Letterbox Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '7.5vh',
          backgroundColor: '#070504',
          zIndex: 80,
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom Cinematic Letterbox Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '7.5vh',
          backgroundColor: '#070504',
          zIndex: 80,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}
      />

      {/* Dialogue Container */}
      <div
        onClick={handleAdvance}
        style={{
          position: 'absolute',
          bottom: '9vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(780px, 92vw)',
          backgroundColor: 'rgba(15, 11, 9, 0.92)',
          border: '1px solid rgba(224, 106, 32, 0.35)',
          borderRadius: '16px',
          padding: '24px 30px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(224, 106, 32, 0.12)',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          zIndex: 90,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Speaker Name Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isChild ? 'rgba(224, 106, 32, 0.18)' : 'rgba(216, 150, 52, 0.18)',
            border: `1px solid ${isChild ? 'rgba(224, 106, 32, 0.6)' : 'rgba(216, 150, 52, 0.6)'}`,
            borderRadius: '20px',
            padding: '3px 14px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isChild ? '#ff8c20' : '#f5b041',
            }}
          />
          <span
            style={{
              fontFamily: "'Marcellus', serif",
              color: isChild ? '#ffb070' : '#f5ca75',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {currentLine.speaker === 'Child' ? 'Child' : 'Dada'}
          </span>
        </div>

        {/* Dialogue Text */}
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.28rem',
            lineHeight: 1.55,
            color: '#faf4e8',
            minHeight: '44px',
            fontWeight: 400,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {displayedText}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                height: '1.1em',
                backgroundColor: '#e06a20',
                marginLeft: '4px',
                verticalAlign: 'middle',
                animation: 'blink 0.8s infinite',
              }}
            />
          )}
        </p>

        {/* Continue indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '8px',
            marginTop: '14px',
            color: 'rgba(245, 238, 219, 0.6)',
            fontSize: '13px',
            letterSpacing: '0.03em',
          }}
        >
          <span>
            {isTyping
              ? 'Click to Skip'
              : dialogueIndex + 1 === activeDialogue.lines.length
              ? 'Press [Space] or Click Next →'
              : 'Press [Space] or Click to Continue'}
          </span>
          <span
            style={{
              fontSize: '14px',
              color: '#e06a20',
              animation: 'bounceIndicator 1.2s infinite ease-in-out',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounceIndicator {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </>
  );
}
