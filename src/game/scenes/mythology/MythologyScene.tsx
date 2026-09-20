import { useState } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import type { StoryState } from '../../story/storyTypes';
import { StoryCanvas } from '../../story/StoryCanvas';
import { audioManager } from '../../audio/AudioManager';

export function MythologyScene() {
  const { storyState } = useGameState();
  const [internalState, setInternalState] = useState<StoryState>(
    (storyState as StoryState) || 'MYTHOLOGY_INTRO'
  );

  const handleAdvance = (nextState: StoryState) => {
    setInternalState(nextState);
    gameStateStore.setStoryState(nextState);
  };

  const handleSkip = () => {
    audioManager.playUIClick();
    audioManager.stopVoiceLine();
    setInternalState('SHIVA_SEQUENCE_READY');
    gameStateStore.setStoryState('SHIVA_SEQUENCE_READY');
  };

  // When Phase 2 reaches the terminal milestone: SHIVA_SEQUENCE_READY
  if (internalState === 'SHIVA_SEQUENCE_READY' || storyState === 'SHIVA_SEQUENCE_READY') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050302',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          color: '#faf4e8',
          padding: '24px',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* Distant Lightning Glow Accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 35%, rgba(60, 100, 200, 0.25) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '680px',
            backgroundColor: 'rgba(12, 9, 7, 0.92)',
            border: '1px solid rgba(220, 160, 60, 0.4)',
            borderRadius: '20px',
            padding: '40px 48px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(60, 100, 200, 0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#f5b041',
              fontSize: '14px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Phase 2 Milestone Reached
          </div>

          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '2.2rem',
              color: '#ffffff',
              margin: '0 0 16px 0',
              letterSpacing: '0.08em',
              textShadow: '0 2px 12px rgba(245, 176, 65, 0.4)',
            }}
          >
            The Herald of Mahadev
          </h2>

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.14rem',
              lineHeight: 1.65,
              color: '#e4d8c8',
              margin: '0 0 28px 0',
            }}
          >
            The steadfast boy Ganesha guards the sacred cave of Mata Parvati.
            Through the gathering Himalayan mist, the Trishul of Mahadev looms on the horizon.
            <br />
            <br />
            <span style={{ color: '#9bc4e2', fontStyle: 'italic' }}>
              System State: <strong>SHIVA_SEQUENCE_READY</strong>. Prepared for the upcoming 3D Shiva confrontation.
            </span>
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                audioManager.playUIClick();
                gameStateStore.startShivaSequence();
              }}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.35)',
                border: '1.5px solid #60a5fa',
                borderRadius: '24px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '12px 32px',
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.45)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.6)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.35)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Ascend Mount Kailash (Play as Shiva) ➔
            </button>

            <button
              onClick={() => {
                audioManager.playUIClick();
                setInternalState('MYTHOLOGY_INTRO');
                gameStateStore.setStoryState('MYTHOLOGY_INTRO');
              }}
              style={{
                backgroundColor: 'rgba(224, 106, 32, 0.2)',
                border: '1px solid rgba(224, 106, 32, 0.6)',
                borderRadius: '24px',
                color: '#ffbe76',
                fontFamily: "'Marcellus', serif",
                fontSize: '14px',
                letterSpacing: '0.08em',
                padding: '12px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(224, 106, 32, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(224, 106, 32, 0.2)';
              }}
            >
              ↺ Replay Story
            </button>

            <button
              onClick={() => {
                audioManager.playUIClick();
                gameStateStore.returnToHomeScene();
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                color: '#faf4e8',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                letterSpacing: '0.04em',
                padding: '12px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              Return to Living Room ⌂
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoryCanvas
      currentStoryState={internalState}
      onAdvanceState={handleAdvance}
      onSkipStory={handleSkip}
    />
  );
}
