import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function FinalCelebrationCinematic() {
  const { currentScene, presentScenePhase } = useGameState();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFadingToMenu, setIsFadingToMenu] = useState(false);

  const isActive =
    currentScene === 'PANDAL' &&
    (presentScenePhase === 'FINAL_CINEMATIC' || presentScenePhase === 'GAME_COMPLETE');

  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0);
      setIsFadingToMenu(false);
      return;
    }

    // Play sacred arti bells and devotional chorus on cinematic start
    audioManager.playDevotionalChorus();
    audioManager.playSacredArtiBell();
    gameStateStore.setFestivalTimeOfDay('NIGHT');

    const startTime = performance.now();
    const interval = setInterval(() => {
      const current = (performance.now() - startTime) / 1000;
      setElapsedTime(current);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  // Keyboard navigation to return to menu once ending is displayed
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (elapsedTime >= 24 && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        e.preventDefault();
        handleReturnToMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, elapsedTime]);

  if (!isActive) return null;

  const handleReturnToMenu = () => {
    if (isFadingToMenu) return;
    setIsFadingToMenu(true);
    audioManager.playUIClick();
    audioManager.fadeAmbientVolume(0, 1.2);

    setTimeout(() => {
      gameStateStore.completeGame();
      gameStateStore.openMenu();
    }, 1200);
  };

  // Phase timings:
  // 0.0s - 4.5s: Close up on Vinay & Dada
  // 4.5s - 11.0s: Wide reveal of illuminated pandal
  // 11.0s - 16.5s: Hold on Ganesha
  // 16.5s - 21.0s: Tilt up to night sky
  // 21.0s - 26.5s: "Ganpati Bappa Morya"
  // 26.5s+: "THE END"
  const showBappaText = elapsedTime >= 20.5 && elapsedTime < 27.0;
  const showTheEnd = elapsedTime >= 27.0;
  const showMenuButton = elapsedTime >= 29.5;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 150,
        pointerEvents: showMenuButton ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
        fontFamily: "'Marcellus', 'Cinzel', serif",
      }}
    >
      {/* ─── TOP CINEMATIC LETTERBOX BAR ─── */}
      <div
        style={{
          width: '100%',
          height: '64px',
          background: 'linear-gradient(to bottom, rgba(5, 3, 2, 0.95), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 220, 150, 0.65)',
          fontSize: '12px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          transition: 'opacity 1.5s ease',
          opacity: elapsedTime < 16.5 ? 0.8 : 0,
        }}
      >
        {elapsedTime < 4.5 && 'Twilight Aarti · The Sacred Promise Fulfilled'}
        {elapsedTime >= 4.5 && elapsedTime < 11.0 && 'The Illuminated Pandal · Community & Faith Reunited'}
        {elapsedTime >= 11.0 && elapsedTime < 16.5 && 'Sri Ganesha · The Remover of All Obstacles'}
      </div>

      {/* ─── CENTER TYPOGRAPHY SEQUENCE ─── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        {/* "Ganpati Bappa Morya" Title */}
        <div
          style={{
            transition: 'all 2.0s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: showBappaText ? 1 : 0,
            transform: showBappaText ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              color: '#fdf3e2',
              letterSpacing: '0.14em',
              textShadow: '0 0 35px rgba(255, 183, 3, 0.6), 0 4px 18px rgba(0, 0, 0, 0.9)',
              marginBottom: '10px',
              lineHeight: 1.1,
            }}
          >
            Ganpati Bappa Morya
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
              color: '#ffb703',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            Pudhchya Varshi Lavkar Ya
          </div>
        </div>

        {/* "THE END" Title */}
        <div
          style={{
            position: 'absolute',
            transition: 'all 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: showTheEnd ? 1 : 0,
            transform: showTheEnd ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            pointerEvents: showMenuButton ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
              color: '#ffffff',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.5), 0 4px 20px rgba(0, 0, 0, 0.95)',
              margin: 0,
            }}
          >
            THE END
          </div>

          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 183, 3, 0.8), transparent)',
            }}
          />

          {/* Minimal Return to Menu Action */}
          <div
            style={{
              transition: 'opacity 1.8s ease',
              opacity: showMenuButton ? 1 : 0,
              marginTop: '16px',
            }}
          >
            <button
              onClick={handleReturnToMenu}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 183, 3, 0.45)',
                color: '#fdf7ea',
                borderRadius: '30px',
                padding: '12px 36px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13.5px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 183, 3, 0.2)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ffb703';
                e.currentTarget.style.backgroundColor = 'rgba(255, 183, 3, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 183, 3, 0.45)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Return to Main Menu
            </button>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.12em',
                marginTop: '10px',
              }}
            >
              [Press Space or Enter]
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM LETTERBOX BAR ─── */}
      <div
        style={{
          width: '100%',
          height: '64px',
          background: 'linear-gradient(to top, rgba(5, 3, 2, 0.95), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: '11.5px',
          letterSpacing: '0.22em',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        A Story of Devotion, Family & Perseverance
      </div>

      {/* ─── FULL SCREEN FADE TO BLACK TRANSITION TO MENU ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#050302',
          zIndex: 200,
          pointerEvents: 'none',
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isFadingToMenu ? 1 : 0,
        }}
      />
    </div>
  );
}
