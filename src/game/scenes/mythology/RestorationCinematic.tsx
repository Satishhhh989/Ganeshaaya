import { useEffect, useState } from 'react';
import type { ShivaStoryPhase } from '../../core/types';
import { STORY_ASSETS } from '../../story/storyAssets';
import { audioManager } from '../../audio/AudioManager';

interface RestorationCinematicProps {
  phase: ShivaStoryPhase;
  onAdvance: (nextPhase: ShivaStoryPhase) => void;
  onReturnHome: () => void;
  onReplaySearch: () => void;
}

export function RestorationCinematic({
  phase,
  onAdvance,
  onReturnHome,
  onReplaySearch,
}: RestorationCinematicProps) {
  const [glowPulse, setGlowPulse] = useState(false);

  useEffect(() => {
    if (phase === 'DIVINE_TRANSITION') {
      audioManager.playDivineAwakeningPulse();
    } else if (phase === 'DIVINE_RESTORATION') {
      audioManager.playTransitionSwell();
      setGlowPulse(true);
    } else if (phase === 'GANESHA_DIVINE_AWAKENING') {
      audioManager.playTempleBell();
    }
  }, [phase]);

  // Only render during Phase 4 cinematic stages
  const activeCinematicPhases = [
    'DIVINE_TRANSITION',
    'DIVINE_RESTORATION',
    'GANESHA_DIVINE_AWAKENING',
    'FAMILY_REUNION',
    'DIVINE_BLESSING',
    'RETURN_TO_PRESENT_READY',
  ];

  if (!activeCinematicPhases.includes(phase)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 92,
        overflow: 'hidden',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* ─── Cinematic Letterbox Widescreen Bars (2.39:1) ─── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '7.5vh',
          backgroundColor: '#050302',
          zIndex: 96,
          boxShadow: '0 4px 24px rgba(0,0,0,0.9)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '7.5vh',
          backgroundColor: '#050302',
          zIndex: 96,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.9)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1: DIVINE_TRANSITION (Communing with Sacred Elephant)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'DIVINE_TRANSITION' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: '12vh',
            background:
              'radial-gradient(circle at 50% 60%, rgba(254, 240, 138, 0.15) 0%, rgba(10, 20, 15, 0.6) 70%, rgba(5, 10, 8, 0.9) 100%)',
            animation: 'fadeIn 1.2s ease-out',
          }}
        >
          <div
            style={{
              maxWidth: '780px',
              textAlign: 'center',
              backgroundColor: 'rgba(8, 14, 10, 0.88)',
              border: '1px solid rgba(253, 224, 71, 0.5)',
              borderRadius: '20px',
              padding: '24px 36px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(253, 224, 71, 0.25)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#fef08a',
                fontSize: '13px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              The Sacred Offering • दिव्य समर्पण
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.22rem',
                lineHeight: 1.65,
                color: '#f8fafc',
                margin: '0 0 20px 0',
              }}
            >
              In the sacred stillness of the cedar grove, the celestial Gajaraj peacefully bows its head, willingly offering its noble spirit so the devoted child may be reborn.
            </p>
            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvance('DIVINE_RESTORATION');
              }}
              style={{
                backgroundColor: 'rgba(253, 224, 71, 0.25)',
                border: '1px solid #fef08a',
                borderRadius: '24px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '10px 28px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Bestow the Sacred Head ➔
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 2: DIVINE_RESTORATION (Layered 2.5D Transformation)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'DIVINE_RESTORATION' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#080504',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Layer 1: Background Abode */}
          <img
            src={STORY_ASSETS.backgrounds.kailashAbode.url}
            alt="Kailash Abode"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
              filter: 'brightness(0.7) blur(2px)',
            }}
          />

          {/* Layer 2: Golden Prana Radiant Burst */}
          <img
            src={STORY_ASSETS.effects.divineGoldenAura.url}
            alt="Divine Prana"
            style={{
              position: 'absolute',
              width: '110vmax',
              height: '110vmax',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              opacity: glowPulse ? 0.85 : 0.4,
              animation: 'spinAura 20s linear infinite, breathe 3s ease-in-out infinite alternate',
            }}
          />

          {/* Layer 3: Central Symbolic Restoration Vessel */}
          <div
            style={{
              position: 'relative',
              width: 'min(580px, 85vw)',
              height: 'min(580px, 60vh)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {/* Sacred Lotus Blossom base */}
            <div
              style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 176, 65, 0.5) 0%, transparent 70%)',
                animation: 'pulseGlow 2s ease-in-out infinite alternate',
              }}
            />

            {/* Guarding Ganesha form bathed in celestial light */}
            <img
              src={STORY_ASSETS.characters.ganeshaGuarding.url}
              alt="Child Ganesha Restoring"
              style={{
                maxWidth: '65%',
                maxHeight: '65%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 35px rgba(255, 215, 0, 0.8)) brightness(1.2)',
                animation: 'levitate 3s ease-in-out infinite alternate',
              }}
            />
          </div>

          {/* Layer 4: Drifting Sacred Lotus Petals */}
          <img
            src={STORY_ASSETS.props.lotusPetalsForeground.url}
            alt="Lotus Petals"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              mixBlendMode: 'screen',
              opacity: 0.65,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />

          {/* Bottom Subtitle & Action */}
          <div
            style={{
              position: 'absolute',
              bottom: '10vh',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '740px',
              textAlign: 'center',
              backgroundColor: 'rgba(12, 9, 6, 0.88)',
              border: '1px solid rgba(245, 176, 65, 0.5)',
              borderRadius: '20px',
              padding: '20px 32px',
              zIndex: 5,
              backdropFilter: 'blur(16px)',
            }}
          >
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.2rem',
                lineHeight: 1.6,
                color: '#ffffff',
                margin: '0 0 16px 0',
              }}
            >
              Mahadev gently places the noble elephant head upon the boy’s shoulders. Sacred Prana currents surge as cosmic power binds life back to form.
            </p>
            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvance('GANESHA_DIVINE_AWAKENING');
              }}
              style={{
                backgroundColor: 'rgba(245, 176, 65, 0.3)',
                border: '1px solid #ffd700',
                borderRadius: '24px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '10px 30px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Awaken Sri Ganesha ➔
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3: GANESHA_DIVINE_AWAKENING (Awakened Lotus Masterpiece)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'GANESHA_DIVINE_AWAKENING' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0a0806',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={STORY_ASSETS.characters.ganeshaAwakened.url}
            alt="Ganesha Awakened"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'zoomSlow 8s ease-out forwards',
            }}
          />

          {/* Radiant Gold Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(10, 8, 6, 0.75) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Subtitle & Advance */}
          <div
            style={{
              position: 'absolute',
              bottom: '10vh',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '760px',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 12, 8, 0.9)',
              border: '1px solid rgba(254, 240, 138, 0.6)',
              borderRadius: '24px',
              padding: '24px 36px',
              zIndex: 10,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 30px rgba(254, 240, 138, 0.25)',
            }}
          >
            <div
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#fde047',
                fontSize: '13px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              The Divine Awakening • पुनर्जीवन
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.24rem',
                lineHeight: 1.6,
                color: '#ffffff',
                margin: '0 0 20px 0',
              }}
            >
              With wise, gentle eyes and an innocent radiant smile, Lord Ganesha breathes again upon the blooming lotus. Divine peace and celestial melodies fill Mount Kailash!
            </p>
            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvance('FAMILY_REUNION');
              }}
              style={{
                backgroundColor: 'rgba(250, 204, 21, 0.3)',
                border: '1px solid #fef08a',
                borderRadius: '24px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '10px 30px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Reunite with Mata Parvati ➔
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4: FAMILY_REUNION (Shiva, Parvati, Ganesha Together)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'FAMILY_REUNION' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0a0705',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={STORY_ASSETS.characters.shivaParvatiReunion.url}
            alt="Shiva Parvati Ganesha Reunion"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'zoomSlow 10s ease-out forwards',
            }}
          />

          {/* Subtitle & Advance */}
          <div
            style={{
              position: 'absolute',
              bottom: '10vh',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '780px',
              textAlign: 'center',
              backgroundColor: 'rgba(14, 9, 6, 0.92)',
              border: '1px solid rgba(245, 176, 65, 0.6)',
              borderRadius: '24px',
              padding: '24px 38px',
              zIndex: 10,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.9), 0 0 30px rgba(245, 176, 65, 0.25)',
            }}
          >
            <div
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#f5b041',
                fontSize: '13px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              The Divine Reunion • शिव-पार्वती-गणेश मिलन
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.24rem',
                lineHeight: 1.6,
                color: '#ffffff',
                margin: '0 0 20px 0',
              }}
            >
              Mata Parvati rushes to her son, her sorrow melting into boundless joy as she tenderly embraces Ganesha. Mahadev smiles with cosmic grace as the celestial family is united in eternal bliss.
            </p>
            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvance('DIVINE_BLESSING');
              }}
              style={{
                backgroundColor: 'rgba(245, 176, 65, 0.3)',
                border: '1px solid #ffd700',
                borderRadius: '24px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '10px 32px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Receive the Supreme Blessing ➔
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5: DIVINE_BLESSING (Prathama Pujya Declaration)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'DIVINE_BLESSING' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0a0705',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={STORY_ASSETS.characters.shivaParvatiReunion.url}
            alt="Shiva Parvati Ganesha Blessing"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.85)',
            }}
          />

          {/* Golden Divine Blessing Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(245, 176, 65, 0.2) 0%, rgba(10, 8, 6, 0.8) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Blessing Card */}
          <div
            style={{
              position: 'relative',
              maxWidth: '780px',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 10, 7, 0.94)',
              border: '1.5px solid rgba(255, 215, 0, 0.7)',
              borderRadius: '24px',
              padding: '36px 44px',
              zIndex: 10,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.95), 0 0 40px rgba(245, 176, 65, 0.3)',
            }}
          >
            <div
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#fde047',
                fontSize: '14px',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              The Supreme Declaration • प्रथम पूज्य वरदान
            </div>

            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '2.1rem',
                color: '#ffffff',
                margin: '0 0 16px 0',
                letterSpacing: '0.06em',
                textShadow: '0 0 18px rgba(250, 204, 21, 0.5)',
              }}
            >
              “You Shall Be Prathama Pujya”
            </h2>

            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.22rem',
                lineHeight: 1.7,
                color: '#f1f5f9',
                margin: '0 0 24px 0',
              }}
            >
              Mahadev proclaims before all celestial realms: <br />
              <strong style={{ color: '#fef08a' }}>
                “Before any prayer, any journey, or any endeavor begins, you shall be invoked first of all. You are Vighnaharta — the eternal remover of obstacles.”
              </strong>
            </p>

            <button
              onClick={() => {
                audioManager.playUIClick();
                onAdvance('RETURN_TO_PRESENT_READY');
              }}
              style={{
                backgroundColor: 'rgba(250, 204, 21, 0.35)',
                border: '1.5px solid #ffd700',
                borderRadius: '26px',
                color: '#ffffff',
                fontFamily: "'Marcellus', serif",
                fontSize: '15px',
                letterSpacing: '0.08em',
                padding: '12px 34px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Conclude the Sacred Tale ➔
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 6: RETURN_TO_PRESENT_READY (Phase 4 Completion Milestone)
          ═══════════════════════════════════════════════════════════════ */}
      {phase === 'RETURN_TO_PRESENT_READY' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(8, 5, 4, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
            color: '#faf4e8',
            padding: '24px',
            textAlign: 'center',
            backdropFilter: 'blur(16px)',
            animation: 'fadeIn 1s ease-out',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '740px',
              backgroundColor: 'rgba(16, 11, 8, 0.95)',
              border: '1.5px solid rgba(245, 176, 65, 0.7)',
              borderRadius: '24px',
              padding: '44px 48px',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 176, 65, 0.25)',
            }}
          >
            <div
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#f5b041',
                fontSize: '13px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Phase 4 Milestone Reached
            </div>

            <h2
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '2.4rem',
                color: '#ffffff',
                margin: '0 0 16px 0',
                letterSpacing: '0.06em',
                textShadow: '0 2px 14px rgba(245, 176, 65, 0.5)',
              }}
            >
              The Legend of Vinayaka
            </h2>

            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.18rem',
                lineHeight: 1.7,
                color: '#e4d8c8',
                margin: '0 0 28px 0',
              }}
            >
              The camera softly pulls away as the echoes of Dada’s narration return to the living room:
              <br />
              <em style={{ color: '#fef08a' }}>
                “And that, my child, is how Lord Ganesha was blessed as the First Deity of all prayers. In every home and community, we celebrate His arrival with boundless joy.”
              </em>
              <br />
              <br />
              <span style={{ color: '#93c5fd', fontStyle: 'italic', display: 'block' }}>
                System State Reached: <strong>RETURN_TO_PRESENT_READY</strong>.
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '0.98rem' }}>
                Ready to transition back to the present-day home for Phase 5 (Ganesh Chaturthi celebrations & pandal preparations).
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
                  onReturnHome();
                }}
                style={{
                  backgroundColor: 'rgba(245, 176, 65, 0.35)',
                  border: '1.5px solid #ffd700',
                  borderRadius: '24px',
                  color: '#ffffff',
                  fontFamily: "'Marcellus', serif",
                  fontSize: '15px',
                  letterSpacing: '0.08em',
                  padding: '12px 32px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 176, 65, 0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Return to Dada in Living Room ⌂
              </button>

              <button
                onClick={() => {
                  audioManager.playUIClick();
                  onReplaySearch();
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '24px',
                  color: '#faf4e8',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0.04em',
                  padding: '12px 26px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              >
                ↺ Replay Elephant Search
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes spinAura {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes breathe {
          0% { transform: scale(0.96); }
          100% { transform: scale(1.04); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes levitate {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-12px); }
        }
        @keyframes zoomSlow {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
