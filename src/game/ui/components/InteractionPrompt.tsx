import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';
import { ASSET_CONFIG } from '../../core/assetConfig';

export function InteractionPrompt() {
  const { activeInteraction, gameState, presentScenePhase, playerPos } = useGameState();

  if (gameState !== 'PLAYING' || presentScenePhase !== 'APPROACH') {
    return null;
  }

  // Check distance to Dada directly as a robust guarantee
  const dadaPos = ASSET_CONFIG.staging.oldManStanding;
  const dx = (playerPos ? playerPos[0] : 0.6) - dadaPos[0];
  const dz = (playerPos ? playerPos[2] : 5.2) - dadaPos[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  const isNearby = dist <= 3.8 || activeInteraction !== null;

  if (!isNearby) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeInteraction?.onInteract) {
      activeInteraction.onInteract();
    } else {
      audioManager.playTempleBell();
      gameStateStore.setPresentScenePhase('INITIAL_DIALOGUE');
      gameStateStore.startDialogue();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 70,
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: 'rgba(18, 13, 10, 0.94)',
          border: '2px solid #f5b041',
          padding: '14px 32px',
          borderRadius: '36px',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.85), 0 0 28px rgba(245, 176, 65, 0.55)',
          transition: 'all 0.25s ease-in-out',
          outline: 'none',
          animation: 'promptButtonGlow 2s infinite ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.backgroundColor = 'rgba(28, 18, 12, 0.98)';
          e.currentTarget.style.borderColor = '#ffcf70';
          e.currentTarget.style.boxShadow =
            '0 12px 48px rgba(0, 0, 0, 0.95), 0 0 36px rgba(245, 176, 65, 0.85)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(18, 13, 10, 0.94)';
          e.currentTarget.style.borderColor = '#f5b041';
          e.currentTarget.style.boxShadow =
            '0 10px 40px rgba(0, 0, 0, 0.85), 0 0 28px rgba(245, 176, 65, 0.55)';
        }}
      >
        {/* Key Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(224, 106, 32, 0.35)',
            border: '1.5px solid #f5b041',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 0 10px rgba(245, 176, 65, 0.4)',
          }}
        >
          E
        </div>

        {/* Action Label */}
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: "'Marcellus', serif",
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            Talk to Dada
          </div>
          <div
            style={{
              color: '#f5ca75',
              fontSize: '12px',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.05em',
            }}
          >
            Click here or press [E] to start story ➔
          </div>
        </div>

        {/* Big Animated Arrow */}
        <div
          style={{
            color: '#f5b041',
            fontSize: '22px',
            fontWeight: 'bold',
            animation: 'arrowBounce 1.2s infinite ease-in-out',
          }}
        >
          ➔
        </div>
      </button>

      <style>{`
        @keyframes promptButtonGlow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85), 0 0 28px rgba(245, 176, 65, 0.45);
          }
          50% {
            box-shadow: 0 10px 44px rgba(0, 0, 0, 0.9), 0 0 38px rgba(245, 176, 65, 0.8);
          }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
