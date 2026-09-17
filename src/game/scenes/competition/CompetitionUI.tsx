import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function CompetitionUI() {
  const { currentScene, presentScenePhase } = useGameState();
  const [speechStep, setSpeechStep] = useState(0);

  const isCompetition = currentScene === 'NIAT_COMPETITION';

  // Sound effects on stage steps
  useEffect(() => {
    if (presentScenePhase === 'COMPETITION') {
      audioManager.playTransitionSwell();
    } else if (presentScenePhase === 'COMPETITION_WIN') {
      audioManager.playCelebrationChime();
      audioManager.playCrowdApplause();
    }
  }, [presentScenePhase]);

  // Keyboard navigation for competition dialog
  useEffect(() => {
    if (!isCompetition) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isCompetition) return null;

  const handleAdvance = () => {
    audioManager.playUIClick();

    if (presentScenePhase === 'COMPETITION') {
      if (speechStep < 2) {
        setSpeechStep((s) => s + 1);
        if (speechStep === 1) {
          audioManager.playSuspensePulse();
        }
      } else {
        // Announce win!
        gameStateStore.advancePresentPhase('COMPETITION_WIN');
      }
    } else if (presentScenePhase === 'COMPETITION_WIN') {
      // Transition to home with prize received
      gameStateStore.advancePresentPhase('PRIZE_RECEIVED');
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
      {/* Top Stage Header */}
      <div
        style={{
          width: '100%',
          height: '60px',
          background: 'linear-gradient(to bottom, rgba(5, 8, 15, 0.95), rgba(5, 8, 15, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ffb703', fontSize: '18px' }}>🏆</span>
          <span
            style={{
              color: '#dbeafe',
              fontSize: '13px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            NIAT National Championship 2024 · Grand Finale
          </span>
        </div>

        <div
          style={{
            background: 'rgba(255, 183, 3, 0.15)',
            border: '1px solid rgba(255, 183, 3, 0.4)',
            borderRadius: '20px',
            padding: '4px 16px',
            color: '#ffb703',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          Theme: Indian Heritage & Ancient Lore
        </div>
      </div>

      {/* Center Cinematic Announcement Stage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          pointerEvents: 'auto',
        }}
      >
        {presentScenePhase === 'COMPETITION' && (
          <div
            style={{
              background: 'rgba(10, 14, 24, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 180, 216, 0.4)',
              borderRadius: '16px',
              padding: '32px 42px',
              maxWidth: '640px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 180, 216, 0.2)',
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div
              style={{
                color: '#00b4d8',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Auditorium Jury Announcement
            </div>
            <h3 style={{ color: '#fff', fontSize: '22px', margin: '0 0 14px 0' }}>
              Host at the Main Stage
            </h3>

            <p style={{ color: '#e0d6c8', fontSize: '15px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
              {speechStep === 0 &&
                '“Ladies and gentlemen, esteemed judges, and student developers from all across India — welcome to the 2024 NIAT National Championship Awards!”'}
              {speechStep === 1 &&
                '“Over 350 games were submitted this year celebrating our history and folklore. But one project captured the pure reverence, atmospheric majesty, and emotional soul of our traditions.”'}
              {speechStep === 2 &&
                '“After rigorous scoring by our national jury... The 2024 First Place National Championship Award goes to...”'}
            </p>

            <button
              onClick={handleAdvance}
              style={{
                background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0, 180, 216, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{speechStep < 2 ? 'Listen to Jury →' : 'Reveal Winner! 🏆'}</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
            </button>
          </div>
        )}

        {presentScenePhase === 'COMPETITION_WIN' && (
          <div
            style={{
              background: 'rgba(12, 10, 6, 0.95)',
              backdropFilter: 'blur(18px)',
              border: '2px solid #ffb703',
              borderRadius: '16px',
              padding: '36px 48px',
              maxWidth: '660px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(255, 183, 3, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9)',
              animation: 'scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🏆</div>
            <div
              style={{
                color: '#ffb703',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              National Championship Winner
            </div>
            <h1
              style={{
                color: '#fff',
                fontSize: '30px',
                margin: '0 0 8px 0',
                fontFamily: "'Georgia', serif",
              }}
            >
              FIRST PLACE: “THE LEGEND OF VINAYAKA”
            </h1>
            <div style={{ color: '#ffd166', fontSize: '17px', fontWeight: 600, marginBottom: '14px' }}>
              Creator: Vinay
            </div>

            <div
              style={{
                background: 'rgba(42, 157, 143, 0.2)',
                border: '1px solid #2a9d8f',
                borderRadius: '10px',
                padding: '12px 24px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Official Prize Grant: </span>
              <span style={{ color: '#2a9d8f', fontSize: '24px', fontWeight: 800 }}>₹15,000</span>
            </div>

            <p style={{ color: '#f0e6d2', fontSize: '15px', lineHeight: '1.7', margin: '0 0 22px 0' }}>
              The entire auditorium erupts into applause as your name echoes across the hall.
              Holding the championship trophy, your thoughts rush home to grandfather’s living room:
              <br />
              <em style={{ color: '#ffb703' }}>
                “We did it, Dada... Bappa's pandal will be brighter than ever before.”
              </em>
            </p>

            <button
              onClick={handleAdvance}
              style={{
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '26px',
                padding: '14px 38px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 25px rgba(255, 183, 3, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Accept Award & Return Home →</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>[Space / Enter]</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty bottom spacer for balance */}
      <div style={{ height: '60px' }} />
    </div>
  );
}
