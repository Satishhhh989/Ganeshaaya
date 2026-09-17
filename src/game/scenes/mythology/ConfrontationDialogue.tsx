import { useEffect, useState, useRef, useCallback } from 'react';
import { audioManager } from '../../audio/AudioManager';

interface ConfrontationLine {
  id: string;
  speaker: 'Shiva' | 'Ganesha';
  text: string;
}

const CONFRONTATION_LINES: ConfrontationLine[] = [
  {
    id: 'conf_1',
    speaker: 'Shiva',
    text: 'Stand aside, young guardian. I must enter my sacred sanctuary.',
  },
  {
    id: 'conf_2',
    speaker: 'Ganesha',
    text: 'My Mother has commanded that none may enter while she bathes. I cannot break my vow.',
  },
  {
    id: 'conf_3',
    speaker: 'Shiva',
    text: 'I am Shiva, Lord of Mount Kailash. This mountain is my eternal home.',
  },
  {
    id: 'conf_4',
    speaker: 'Ganesha',
    text: 'Whoever you may be, my Mother’s honor and decree are absolute. You shall not pass!',
  },
];

interface ConfrontationDialogueProps {
  onComplete: () => void;
}

export function ConfrontationDialogue({ onComplete }: ConfrontationDialogueProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  const currentLine = CONFRONTATION_LINES[lineIndex];
  const isShiva = currentLine.speaker === 'Shiva';

  // Typewriter effect
  useEffect(() => {
    const fullText = currentLine.text;
    setDisplayedText('');
    setIsTyping(true);
    let charIdx = 0;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = window.setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));

      if (charIdx % 3 === 0) {
        audioManager.playSpeechBlip(isShiva ? 'Old Man' : 'Child');
      }

      if (charIdx >= fullText.length) {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 24);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [currentLine, isShiva]);

  const handleAdvance = useCallback(() => {
    if (isTyping) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      audioManager.playUIClick();
      if (lineIndex + 1 < CONFRONTATION_LINES.length) {
        setLineIndex(lineIndex + 1);
      } else {
        onComplete();
      }
    }
  }, [isTyping, currentLine, lineIndex, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  return (
    <div
      onClick={handleAdvance}
      style={{
        position: 'absolute',
        bottom: '8vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(840px, 92vw)',
        backgroundColor: isShiva
          ? 'rgba(10, 14, 24, 0.92)'
          : 'rgba(24, 14, 8, 0.92)',
        border: `1.5px solid ${isShiva ? 'rgba(96, 165, 250, 0.6)' : 'rgba(245, 176, 65, 0.6)'}`,
        borderRadius: '20px',
        padding: '24px 32px',
        boxShadow: `0 16px 48px rgba(0, 0, 0, 0.9), 0 0 28px ${
          isShiva ? 'rgba(59, 130, 246, 0.25)' : 'rgba(245, 176, 65, 0.25)'
        }`,
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        zIndex: 80,
        userSelect: 'none',
      }}
    >
      {/* Speaker Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isShiva
            ? 'rgba(59, 130, 246, 0.2)'
            : 'rgba(245, 176, 65, 0.2)',
          border: `1px solid ${isShiva ? '#60a5fa' : '#f5ca75'}`,
          borderRadius: '20px',
          padding: '4px 16px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isShiva ? '#60a5fa' : '#f5b041',
            boxShadow: `0 0 8px ${isShiva ? '#60a5fa' : '#f5b041'}`,
          }}
        />
        <span
          style={{
            fontFamily: "'Marcellus', serif",
            color: isShiva ? '#93c5fd' : '#fde047',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {isShiva ? 'Lord Shiva • महादेव' : 'Young Ganesha • द्वारपाल गणेश'}
        </span>
      </div>

      {/* Dialogue Text */}
      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.26rem',
          lineHeight: 1.6,
          color: '#ffffff',
          minHeight: '44px',
          margin: '0 0 14px 0',
          fontWeight: 400,
          textShadow: '0 2px 6px rgba(0,0,0,0.8)',
        }}
      >
        {displayedText}
        {isTyping && (
          <span
            style={{
              display: 'inline-block',
              width: '3px',
              height: '1.1em',
              backgroundColor: isShiva ? '#60a5fa' : '#f59e0b',
              marginLeft: '4px',
              verticalAlign: 'middle',
              animation: 'dialogueBlink 0.8s infinite',
            }}
          />
        )}
      </p>

      {/* Explicit Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAdvance();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isShiva
              ? 'rgba(59, 130, 246, 0.3)'
              : 'rgba(245, 176, 65, 0.3)',
            border: `1px solid ${isShiva ? '#93c5fd' : '#fef08a'}`,
            borderRadius: '24px',
            padding: '8px 24px',
            color: '#ffffff',
            fontFamily: "'Marcellus', serif",
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>
            {isTyping
              ? 'Skip Typing ↷'
              : lineIndex + 1 === CONFRONTATION_LINES.length
              ? 'Trishul Escalation ➔'
              : 'Next ➔'}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes dialogueBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
