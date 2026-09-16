import { audioManager } from '../../audio/AudioManager';

interface ControlsModalProps {
  onClose: () => void;
}

export function ControlsModal({ onClose }: ControlsModalProps) {
  const controlItems = [
    { key: 'W / A / S / D', action: 'Move Character' },
    { key: 'Mouse Move', action: 'Look / Rotate Camera' },
    { key: 'Shift (Hold)', action: 'Run / Sprint' },
    { key: 'E', action: 'Interact / Talk' },
    { key: 'Space / Enter', action: 'Advance Dialogue' },
    { key: 'Mouse Wheel', action: 'Zoom In / Out' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 5, 4, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(480px, 90vw)',
          backgroundColor: 'rgba(22, 16, 12, 0.95)',
          border: '1px solid rgba(224, 106, 32, 0.4)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(224, 106, 32, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '1.4rem',
              color: '#f5c338',
              letterSpacing: '0.04em',
            }}
          >
            Game Controls
          </h2>
          <button
            onClick={() => {
              audioManager.playUIClick();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a89d8f',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {controlItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(224, 106, 32, 0.2)',
                  border: '1px solid rgba(224, 106, 32, 0.4)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#ffc17a',
                  fontWeight: 600,
                }}
              >
                {item.key}
              </span>
              <span style={{ color: '#e8dec8', fontSize: '14px' }}>{item.action}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            audioManager.playUIClick();
            onClose();
          }}
          style={{
            width: '100%',
            marginTop: '22px',
            padding: '12px',
            backgroundColor: '#e06a20',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2782e')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e06a20')}
        >
          Got It
        </button>
      </div>
    </div>
  );
}
