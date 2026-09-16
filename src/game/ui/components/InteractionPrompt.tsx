import { useGameState } from '../../core/GameState';
import { interactionManager } from '../../interaction/useInteraction';

export function InteractionPrompt() {
  const { activeInteraction, gameState } = useGameState();

  if (!activeInteraction || gameState !== 'PLAYING') {
    return null;
  }

  const handleClick = () => {
    interactionManager.triggerCurrentInteraction();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: '22%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(10, 8, 6, 0.78)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        padding: '6px 18px 6px 10px',
        borderRadius: '24px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
        e.currentTarget.style.borderColor = '#f5c338';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(212, 175, 55, 0.18)',
          border: '1px solid #d4af37',
          color: '#f7d486',
          fontWeight: 600,
          fontSize: '12px',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {activeInteraction.actionKey || 'E'}
      </div>
      <span
        style={{
          color: '#fdf6ea',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: "'Marcellus', serif",
        }}
      >
        {activeInteraction.prompt}
      </span>
    </div>
  );
}
