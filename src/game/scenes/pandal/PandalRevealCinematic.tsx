import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function PandalRevealCinematic() {
  const { currentScene, presentScenePhase } = useGameState();
  const [step, setStep] = useState(0);

  const isActive =
    currentScene === 'PANDAL' &&
    (presentScenePhase === 'PANDAL_COMPLETE' || presentScenePhase === 'GANESH_CHATURTHI_READY');

  useEffect(() => {
    if (presentScenePhase === 'PANDAL_COMPLETE') {
      audioManager.playSacredArtiBell();
      audioManager.playCelebrationChime();
    }
  }, [presentScenePhase]);

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
  }, [isActive, step, presentScenePhase]);

  if (!isActive) return null;

  const handleNext = () => {
    audioManager.playUIClick();

    if (step < 2) {
      setStep((prev) => prev + 1);
      if (step === 0) audioManager.playTempleBell();
    } else {
      // Advance to FESTIVAL_PREPARATION (Morning Ganesh Chaturthi arrival)
      audioManager.playSacredArtiBell();
      audioManager.playDholTashaBeat();
      gameStateStore.advancePresentPhase('FESTIVAL_PREPARATION');
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
        zIndex: 100,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Cinematic Letterbox Bar */}
      <div
        style={{
          width: '100%',
          height: '70px',
          background: 'linear-gradient(to bottom, rgba(5, 4, 3, 0.95), rgba(5, 4, 3, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffb703', fontSize: '18px' }}>🕉</span>
          <span
            style={{
              color: '#f0e6d2',
              fontSize: '13px',
              letterSpacing: '2.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Ganesh Chaturthi Pandal · Grand Consecration
          </span>
        </div>

        <div
          style={{
            background: 'rgba(255, 183, 3, 0.15)',
            border: '1px solid #ffb703',
            borderRadius: '20px',
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#ffb703', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
            ✨ Sacred Pandal Complete
          </span>
        </div>
      </div>

      {/* Center Cinematic Dialogue & Remembrance Card */}
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
            background: 'rgba(12, 9, 6, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 183, 3, 0.5)',
            borderRadius: '16px',
            padding: '32px 42px',
            maxWidth: '680px',
            width: '92%',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255, 183, 3, 0.25)',
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          {/* STEP 0: The Finished Pandal Reveal */}
          {step === 0 && (
            <div>
              <div
                style={{
                  color: '#ffb703',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Pandal Consecration Complete
              </div>
              <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
                The Courtyard Shimmers with Devotion
              </h2>

              <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
                The warm micro-LED lights ignite in gentle unison along the bamboo eaves.
                The scent of fresh marigolds and sweet modaks drifts into the evening air.
                Before you, on the carved wooden singhasan, the eco-friendly clay murti of Lord Ganesha
                radiates a peaceful golden aura.
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
                }}
              >
                <span>Remember Dada's Words →</span>
              </button>
            </div>
          )}

          {/* STEP 1: Remembering Grandfather's Story */}
          {step === 1 && (
            <div>
              <div
                style={{
                  color: '#2a9d8f',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Echoes from Childhood
              </div>
              <h2 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px 0' }}>
                “Vignaharta Removes All Hurdles”
              </h2>

              <p style={{ color: '#f3e9dc', fontSize: '15px', lineHeight: '1.8', margin: '0 0 24px 0' }}>
                Standing before the altar, you close your eyes and hear Dada's gentle voice from twelve years ago:
                <br />
                <br />
                <em style={{ color: '#ffb703' }}>
                  “Vinay, my boy... Ganesha was not revered because he never met an obstacle.
                  He was revered because with courage, steadfast love for his mother Parvati, and wisdom,
                  he faced every storm until peace was restored. When your intentions are pure, the universe clears your path.”
                </em>
              </p>

              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #2a9d8f, #264653)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 34px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(42, 157, 143, 0.4)',
                }}
              >
                <span>Complete the Preparation →</span>
              </button>
            </div>
          )}

          {/* STEP 2: GANESH_CHATURTHI_READY Milestone */}
          {step === 2 && (
            <div>
              <div
                style={{
                  color: '#ffb703',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Community Courtyard Celebration
              </div>
              <h2 style={{ color: '#fff', fontSize: '26px', margin: '0 0 16px 0' }}>
                Ganesh Chaturthi Ready!
              </h2>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  margin: '14px 0 20px 0',
                  textAlign: 'left',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#ddd',
                }}
              >
                <div>✓ <strong>Pandal:</strong> Bamboo frame, canopy roof, satin drapes, and marigolds complete</div>
                <div>✓ <strong>Art & Lighting:</strong> Sacred floor rangoli drawn, rice fairy lights ignited</div>
                <div>✓ <strong>Murti Consecration:</strong> Eco-friendly clay Ganesha placed upon the singhasan</div>
                <div>✓ <strong>Budget Account:</strong> ₹15,000 prize from NIAT fully and faithfully invested</div>
              </div>

              <p style={{ color: '#e0d6c8', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
                The evening bells echo across the colony. Children laugh as neighbors gather on balconies.
                The community is ready to welcome Lord Ganesha for the grand annual celebration.
              </p>

              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  color: '#1a1005',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '14px 38px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(255, 183, 3, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Begin Ganesh Chaturthi Morning Celebration →</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '50px' }} />
    </div>
  );
}
