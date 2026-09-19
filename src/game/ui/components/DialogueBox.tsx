import { useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { CinematicDialogue } from './CinematicDialogue';
import { audioManager } from '../../audio/AudioManager';

function SofaNextSceneButton({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div
      onClick={onNext}
      style={{
        position: 'absolute',
        bottom: 'clamp(28px, 5vh, 52px)',
        right: 'clamp(28px, 6vw, 84px)',
        zIndex: 90,
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'rgba(18, 12, 8, 0.82)',
        border: '1px solid rgba(229, 192, 123, 0.55)',
        borderRadius: '24px',
        padding: '12px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(229, 192, 123, 0.2)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.04)';
        e.currentTarget.style.borderColor = '#f5ca75';
        e.currentTarget.style.boxShadow = '0 10px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(245, 202, 117, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'rgba(229, 192, 123, 0.55)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(229, 192, 123, 0.2)';
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
          background: 'rgba(229, 192, 123, 0.2)',
          border: '1px solid rgba(229, 192, 123, 0.65)',
          borderRadius: '4px',
          color: '#f8f4ec',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        Space / E
      </span>
      <span
        style={{
          fontFamily: "'Marcellus', serif",
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#f5ca75',
        }}
      >
        Next Scene →
      </span>
    </div>
  );
}

export function DialogueBox() {
  const { gameState, activeDialogue, dialogueIndex, presentScenePhase } = useGameState();

  if (gameState !== 'DIALOGUE' || !activeDialogue) {
    return null;
  }

  // When seated on sofa (STORY_MODE): Cut the dialogue lines and show clean Next prompt directly to next scene
  if (presentScenePhase === 'STORY_MODE') {
    const handleNextScene = () => {
      audioManager.playUIClick();
      gameStateStore.startMythologyTransition();
    };

    return <SofaNextSceneButton onNext={handleNextScene} />;
  }

  const currentLine = activeDialogue.lines[dialogueIndex];
  if (!currentLine) return null;

  const isLastLine = dialogueIndex + 1 === activeDialogue.lines.length;

  const handleNext = () => {
    gameStateStore.advanceDialogue();
  };

  return (
    <CinematicDialogue
      speaker={currentLine.speaker}
      text={currentLine.text}
      onNext={handleNext}
      isLastLine={isLastLine}
      audioFile={currentLine.audioFile}
      audioCue={currentLine.audioCue}
      visible={true}
    />
  );
}
