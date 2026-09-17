import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function FestivalArrivalModal() {
  const { currentScene, presentScenePhase } = useGameState();
  const [step, setStep] = useState(0);

  const isActive = currentScene === 'PANDAL' && presentScenePhase === 'FESTIVAL_PREPARATION';

  useEffect(() => {
    if (isActive) {
      audioManager.playDholTashaBeat();
      audioManager.playShehnaiMelody();
      gameStateStore.setFestivalTimeOfDay('MORNING');
    }
  }, [isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, step]);

  if (!isActive) return null;

  const handleNext = () => {
    audioManager.playUIClick();

    if (step === 0) {
      // Step 0 -> Step 1: Vinay helps guide the palanquin
      setStep(1);
      audioManager.playSacredArtiBell();
    } else {
      // Final placement: Consecrate Lord Ganesha on the Singhasan!
      audioManager.playSacredArtiBell();
      audioManager.playCelebrationChime();
      audioManager.playLightsIgnite();
      gameStateStore.setGaneshaInstalled(true);
      gameStateStore.advancePresentPhase('GANESH_CHATURTHI_CELEBRATION');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 110,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          width: '100%',
          height: '70px',
          background: 'linear-gradient(to bottom, rgba(8, 6, 4, 0.95), rgba(8, 6, 4, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffb703', fontSize: '18px' }}>☀️</span>
          <span
            style={{
              color: '#fefae0',
              fontSize: '13px',
              letterSpacing: '2.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Ganesh Chaturthi Morning · Auspicious Arrival
          </span>
        </div>

        <div
          style={{
            background: 'rgba(255, 183, 3, 0.2)',
            border: '1px solid #ffb703',
            borderRadius: '20px',
            padding: '4px 16px',
            color: '#ffb703',
            fontSize: '12px',
            fontWeight: 800,
          }}
        >
          {step === 0 ? 'Idol Arrival Procession' : 'Final Singhasan Placement'}
        </div>
      </div>

      {/* Center Arrival Sequence Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: 'rgba(14, 10, 7, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 183, 3, 0.5)',
            borderRadius: '18px',
            padding: '28px 36px',
            maxWidth: '680px',
            width: '92%',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 183, 3, 0.25)',
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          {/* Hero Procession Photo */}
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 183, 3, 0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              marginBottom: '16px',
              maxHeight: '230px',
            }}
          >
            <img
              src="/assets/story/ganesha_arrival_procession.jpg"
              alt="Ganesha Arrival Procession"
              style={{
                width: '100%',
                height: '230px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                padding: '8px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#ffb703', fontSize: '11px', fontWeight: 700 }}>
                Shri Ganesha Welcomed into Colony Courtyard
              </span>
              <span style={{ color: '#ffd166', fontSize: '11px', fontWeight: 800 }}>
                Dhol Tasha & Gulal
              </span>
            </div>
          </div>

          {step === 0 ? (
            <div>
              <h2 style={{ color: '#fff', fontSize: '22px', margin: '0 0 10px 0' }}>
                “Ganpati Bappa Morya!”
              </h2>
              <p style={{ color: '#e0d6c8', fontSize: '14.5px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
                As crisp golden morning sunlight spills between the apartment terraces, the rhythm of
                dhol drums echoes through the street. Neighbors shower fragrant marigold petals from balconies as the
                sacred clay Ganesha is borne toward your handcrafted pandal on a decorated palanquin.
              </p>

              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  color: '#1a1005',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 34px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 183, 3, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Help Place Ganesha on the Singhasan →</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{ color: '#fff', fontSize: '22px', margin: '0 0 10px 0' }}>
                Consecration at the Sacred Altar
              </h2>
              <p style={{ color: '#e0d6c8', fontSize: '14.5px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
                Gently lifting the eco-friendly clay murti with trembling hands and deep gratitude,
                you place Lord Ganesha upon the carved wooden throne. As Bappa settles onto the singhasan,
                the tall brass samai lamps are lit, incense curls toward the canopy, and the entire pandal blooms with divine warmth.
              </p>

              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #2a9d8f, #264653)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 36px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(42, 157, 143, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Consecrate & Open the Community Celebration ✓</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Spacer */}
      <div style={{ height: '50px' }} />
    </div>
  );
}
