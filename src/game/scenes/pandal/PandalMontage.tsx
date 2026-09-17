import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

export function PandalMontage() {
  const { isPandalMontagePlaying } = useGameState();
  const [cutIndex, setCutIndex] = useState(0);

  const CUTS = [
    {
      title: 'Phase I: Hoisting the Bamboo Framework',
      desc: 'Securing the eight sacred pillars with coir ropes and raising the timber platform.',
      sfx: () => audioManager.playWoodCraft(),
      timeOfDay: 'Late Afternoon · 4:30 PM',
      color: '#d4a373',
    },
    {
      title: 'Phase II: Draping Saffron & Crimson Satin',
      desc: 'Pleated silk cascades around the pillars, fluttering gently in the pre-festival breeze.',
      sfx: () => audioManager.playFabricRustle(),
      timeOfDay: 'Golden Hour · 5:45 PM',
      color: '#e76f51',
    },
    {
      title: 'Phase III: Stringing Fragrant Marigold Garlands',
      desc: 'Fresh yellow and orange genda phool with mango leaf torans adorn the entrance arch.',
      sfx: () => audioManager.playFloralChime(),
      timeOfDay: 'Sunset Glow · 6:30 PM',
      color: '#ffb703',
    },
    {
      title: 'Phase IV: Drawing the Sacred Rangoli & Fairy Lights',
      desc: 'Intricate peacock and lotus sacred kolam powders laid by hand, ringed with glowing clay diyas.',
      sfx: () => audioManager.playLightsIgnite(),
      timeOfDay: 'Twilight · 7:15 PM',
      color: '#2a9d8f',
    },
  ];

  useEffect(() => {
    if (!isPandalMontagePlaying) {
      setCutIndex(0);
      return;
    }

    CUTS[0].sfx();

    const interval = setInterval(() => {
      setCutIndex((prev) => {
        const next = prev + 1;
        if (next >= CUTS.length) {
          clearInterval(interval);
          setTimeout(() => {
            gameStateStore.setPandalMontage(false);
          }, 800);
          return prev;
        }
        CUTS[next].sfx();
        return next;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPandalMontagePlaying]);

  if (!isPandalMontagePlaying) return null;

  const currentCut = CUTS[cutIndex];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 120,
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Cinematic Bar */}
      <div
        style={{
          width: '100%',
          height: '80px',
          background: 'rgba(5, 4, 3, 0.96)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255, 183, 3, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🎬</span>
          <span
            style={{
              color: '#ffb703',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
            }}
          >
            Cinematic Construction Montage · Cut {cutIndex + 1} of {CUTS.length}
          </span>
        </div>

        <button
          onClick={() => gameStateStore.setPandalMontage(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#eee',
            borderRadius: '16px',
            padding: '6px 18px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Skip Montage [Esc]
        </button>
      </div>

      {/* Center Cinematic Card */}
      <div
        style={{
          alignSelf: 'center',
          maxWidth: '620px',
          width: '88%',
          background: 'rgba(10, 8, 6, 0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${currentCut.color}`,
          borderRadius: '16px',
          padding: '28px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 183, 3, 0.2)',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div
          style={{
            color: currentCut.color,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {currentCut.timeOfDay}
        </div>

        <h2 style={{ color: '#fff', fontSize: '22px', margin: '0 0 12px 0' }}>
          {currentCut.title}
        </h2>

        <p style={{ color: '#e0d6c8', fontSize: '14.5px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
          {currentCut.desc}
        </p>

        {/* Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {CUTS.map((_, idx) => (
            <div
              key={`montage_dot_${idx}`}
              style={{
                width: idx === cutIndex ? '28px' : '8px',
                height: '6px',
                borderRadius: '3px',
                background: idx === cutIndex ? '#ffb703' : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Cinematic Bar */}
      <div
        style={{
          width: '100%',
          height: '80px',
          background: 'rgba(5, 4, 3, 0.96)',
          borderTop: '1px solid rgba(255, 183, 3, 0.25)',
        }}
      />
    </div>
  );
}
