import { useState, useEffect } from 'react';
import { useGameState, gameStateStore } from '../../core/GameState';
import { audioManager } from '../../audio/AudioManager';

interface ActiveInteraction {
  id: 'dada' | 'ganesha' | 'diya' | 'sharma' | 'amit';
  label: string;
  actionKey: string;
}

const INTERACTION_POINTS = [
  { id: 'dada' as const, label: 'Talk with Dada', actionKey: 'E', pos: [-1.1, 0, 0.2], radius: 2.6 },
  { id: 'ganesha' as const, label: 'Pray to Lord Ganesha', actionKey: 'E', pos: [0, 0, -1.0], radius: 2.6 },
  { id: 'diya' as const, label: 'Light Sacred Brass Samai', actionKey: 'E', pos: [1.6, 0, 0.4], radius: 2.2 },
  { id: 'sharma' as const, label: 'Greet Sharma Family', actionKey: 'E', pos: [2.2, 0, 0.4], radius: 2.2 },
  { id: 'amit' as const, label: 'Talk to Amit', actionKey: 'E', pos: [-2.4, 0, 1.2], radius: 2.2 },
];

export function CelebrationHUD() {
  const { currentScene, presentScenePhase, playerPos } = useGameState();

  const [nearbyInteraction, setNearbyInteraction] = useState<ActiveInteraction | null>(null);
  const [activeModal, setActiveModal] = useState<'dada' | 'ganesha' | 'diya' | 'sharma' | 'amit' | null>(null);
  const [dadaDialogueStep, setDadaDialogueStep] = useState(0);
  const [hasTalkedWithDada, setHasTalkedWithDada] = useState(false);
  const [diyaLit, setDiyaLit] = useState(false);
  const [prayed, setPrayed] = useState(false);

  const isActive = currentScene === 'PANDAL' && presentScenePhase === 'GANESH_CHATURTHI_CELEBRATION';

  // Distance check for proximity interactions
  useEffect(() => {
    if (!isActive || activeModal) {
      setNearbyInteraction(null);
      return;
    }

    let closest: ActiveInteraction | null = null;
    let minDist = 999;

    for (const point of INTERACTION_POINTS) {
      const dx = playerPos[0] - point.pos[0];
      const dz = playerPos[2] - point.pos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < point.radius && dist < minDist) {
        minDist = dist;
        closest = {
          id: point.id,
          label: point.label,
          actionKey: point.actionKey,
        };
      }
    }

    setNearbyInteraction(closest);
  }, [playerPos, isActive, activeModal]);

  // Key press handling
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, advance or close it
      if (activeModal === 'dada') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
          e.preventDefault();
          handleNextDadaLine();
        }
        return;
      }

      if (activeModal) {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.code === 'Escape') {
          e.preventDefault();
          setActiveModal(null);
        }
        return;
      }

      // Proximity interaction trigger
      if (nearbyInteraction && (e.code === 'KeyE' || e.code === 'Space')) {
        e.preventDefault();
        openInteraction(nearbyInteraction.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nearbyInteraction, activeModal, dadaDialogueStep]);

  if (!isActive) return null;

  const openInteraction = (id: 'dada' | 'ganesha' | 'diya' | 'sharma' | 'amit') => {
    audioManager.playUIClick();
    setActiveModal(id);

    if (id === 'dada') {
      setDadaDialogueStep(0);
      audioManager.playTempleBell();
    } else if (id === 'ganesha') {
      setPrayed(true);
      audioManager.playSacredArtiBell();
      audioManager.playFloralChime();
    } else if (id === 'diya') {
      setDiyaLit(true);
      audioManager.playDiyaLightChime();
    } else if (id === 'sharma') {
      audioManager.playCelebrationChime();
    } else if (id === 'amit') {
      audioManager.playCelebrationChime();
    }
  };

  const handleNextDadaLine = () => {
    audioManager.playUIClick();
    if (dadaDialogueStep < 6) {
      setDadaDialogueStep((prev) => prev + 1);
      if (dadaDialogueStep === 2) audioManager.playTempleBell();
    } else {
      // Finished talking with Dada
      setHasTalkedWithDada(true);
      setActiveModal(null);
      audioManager.playSacredArtiBell();
    }
  };

  const triggerGrandAarti = () => {
    audioManager.playUIClick();
    audioManager.playDevotionalChorus();
    gameStateStore.setFestivalTimeOfDay('NIGHT');
    gameStateStore.completeCelebration();
    gameStateStore.advancePresentPhase('FINAL_CINEMATIC');
  };

  const DADA_CONVERSATION = [
    {
      speaker: 'Dada (Grandfather)',
      text: 'Vinay... Look at this courtyard, beta. When the colony committee announced yesterday morning that the pandal funds had fallen short, my heart felt so heavy. I thought for the first time in twenty years our Bappa would have no home. But you... how did you manage to build all this alone in one day?',
      avatar: '👴',
      highlight: false,
    },
    {
      speaker: 'Vinay',
      text: 'Dada, do you remember that rainy afternoon twelve years ago when I was a child? You sat by the window and told me the sacred legend of Ganesha, Goddess Parvati, and Lord Shiva.',
      avatar: '🧑',
      highlight: false,
    },
    {
      speaker: 'Vinay',
      text: 'You taught me that Ganesha was blessed as Vighnaharta not because he never faced obstacles, but because he met every hardship with courage, pure devotion, and an unyielding spirit. When I saw our neighborhood struggling, I knew I could not let that tradition break.',
      avatar: '🧑',
      highlight: true,
    },
    {
      speaker: 'Vinay',
      text: 'I sat at my desk all night, poured everything I knew into my game development project, and entered the NIAT National Game Making Championship. And Dada... this morning, the results came in: I won the First Place Grand Prize of ₹15,000!',
      avatar: '🧑',
      highlight: true,
    },
    {
      speaker: 'Dada (Grandfather)',
      text: 'You won the NIAT Championship?! With your own hands, your sleepless nights, and your honest passion?! ...Oh, Vinay... come give your old Dada a hug...',
      avatar: '👴',
      highlight: false,
    },
    {
      speaker: 'Dada (Grandfather)',
      text: 'You didn’t just buy bamboo, flowers, and satin, my boy. You brought the essence of Vighnaharta to life right here. You turned our hardship into our colony’s greatest blessing. Your grandmother in heaven is smiling down upon you today.',
      avatar: '👴',
      highlight: true,
    },
    {
      speaker: 'Vinay',
      text: 'Every line of code, every bamboo pole, and every marigold was inspired by that childhood promise I made to you, Dada. This celebration is my gift to Bappa, to our colony, and to you.',
      avatar: '🧑',
      highlight: false,
    },
  ];

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
      {/* ─── TOP FESTIVAL BANNER ─── */}
      <div
        style={{
          width: '100%',
          padding: '16px 36px',
          background: 'linear-gradient(to bottom, rgba(11, 8, 6, 0.95), rgba(11, 8, 6, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffb703 0%, #fb8500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 0 16px rgba(255, 183, 3, 0.6)',
            }}
          >
            🕉️
          </div>
          <div>
            <div
              style={{
                color: '#ffb703',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              Ganesh Chaturthi Annual Celebration · Community Pandal
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              An Eternal Promise Fulfilled
            </div>
          </div>
        </div>

        {/* Action Button: Trigger Grand Evening Aarti */}
        <button
          onClick={triggerGrandAarti}
          style={{
            background: hasTalkedWithDada
              ? 'linear-gradient(135deg, #ffb703, #fb8500)'
              : 'linear-gradient(135deg, rgba(255, 183, 3, 0.3), rgba(251, 133, 0, 0.2))',
            color: hasTalkedWithDada ? '#1a1005' : '#ffb703',
            border: '1px solid #ffb703',
            borderRadius: '24px',
            padding: '10px 24px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: hasTalkedWithDada ? '0 0 20px rgba(255, 183, 3, 0.5)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
        >
          <span>✨ Begin Grand Evening Aarti & Illumination Ceremony →</span>
        </button>
      </div>

      {/* ─── PROXIMITY INTERACTION HINT IN VIEWPORT ─── */}
      {nearbyInteraction && !activeModal && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            background: 'rgba(15, 12, 9, 0.88)',
            border: '1.5px solid #ffb703',
            borderRadius: '30px',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(255, 183, 3, 0.3)',
            animation: 'pulse 1.8s infinite alternate',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              color: '#1a1005',
              fontWeight: 900,
              fontSize: '13px',
              padding: '4px 10px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {nearbyInteraction.actionKey}
          </div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
            {nearbyInteraction.label}
          </div>
        </div>
      )}

      {/* ─── DADA EMOTIONAL DIALOGUE MODAL ─── */}
      {activeModal === 'dada' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 150,
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '680px',
              background: 'linear-gradient(145deg, #18120b, #0d0a07)',
              border: '1.5px solid rgba(255, 183, 3, 0.6)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 183, 3, 0.25)',
              position: 'relative',
            }}
          >
            {/* Header / Speaker Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255, 183, 3, 0.15)',
                  border: '1px solid #ffb703',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                {DADA_CONVERSATION[dadaDialogueStep].avatar}
              </div>
              <div>
                <div style={{ color: '#ffb703', fontSize: '16px', fontWeight: 800 }}>
                  {DADA_CONVERSATION[dadaDialogueStep].speaker}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  Step {dadaDialogueStep + 1} of {DADA_CONVERSATION.length} · Sacred Courtyard Altar
                </div>
              </div>
            </div>

            {/* Dialogue text */}
            <p
              style={{
                color: DADA_CONVERSATION[dadaDialogueStep].highlight ? '#ffd166' : '#f4ede2',
                fontSize: '17px',
                lineHeight: '1.8',
                margin: '0 0 28px 0',
                fontWeight: DADA_CONVERSATION[dadaDialogueStep].highlight ? 500 : 400,
                minHeight: '80px',
              }}
            >
              {DADA_CONVERSATION[dadaDialogueStep].text}
            </p>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '12px' }}>
                Press [Space] or click Next to continue
              </div>
              <button
                onClick={handleNextDadaLine}
                style={{
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  color: '#1a1005',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 28px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 183, 3, 0.4)',
                }}
              >
                {dadaDialogueStep < DADA_CONVERSATION.length - 1
                  ? 'Next →'
                  : 'Embrace Dada & Conclude Conversation ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LORD GANESHA PRAYER MODAL ─── */}
      {activeModal === 'ganesha' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 150,
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '560px',
              background: 'linear-gradient(145deg, #18120b, #0d0a07)',
              border: '1.5px solid #ffb703',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 183, 3, 0.3)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>🌺</div>
            <h3 style={{ color: '#ffb703', fontSize: '22px', margin: '0 0 12px 0' }}>
              Divine Blessing of Lord Ganesha
            </h3>
            <p style={{ color: '#f5ebe0', fontSize: '15.5px', lineHeight: '1.8', margin: '0 0 24px 0' }}>
              You fold your hands before the consecrated eco-friendly clay idol. Fresh red hibiscus petals
              and sweet modaks rest at Bappa’s feet. A profound peace washes over you, knowing that
              the ancient teachings of resilience and humility guided you to this very moment.
              <br />
              <br />
              <em style={{ color: '#ffb703', fontWeight: 600 }}>
                “Vakratunda Mahakaya Suryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada”
              </em>
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Bow in Reverence & Close [Esc / Enter]
            </button>
          </div>
        </div>
      )}

      {/* ─── BRASS DIYA LIGHTING MODAL ─── */}
      {activeModal === 'diya' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 150,
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '520px',
              background: 'linear-gradient(145deg, #18120b, #0d0a07)',
              border: '1.5px solid #ffb703',
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 183, 3, 0.3)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>🪔</div>
            <h3 style={{ color: '#ffb703', fontSize: '21px', margin: '0 0 12px 0' }}>
              The Sacred Brass Samai Awakens
            </h3>
            <p style={{ color: '#f5ebe0', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
              You strike a match and light the cotton wick resting in pure sesame oil.
              The golden flame rises steadily, casting an auspicious glow across the teak throne and
              reflecting in the eyes of everyone gathered in the courtyard.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#1a1005',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Continue [Esc / Enter]
            </button>
          </div>
        </div>
      )}

      {/* ─── MRS. SHARMA GREETING MODAL ─── */}
      {activeModal === 'sharma' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 150,
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '540px',
              background: 'linear-gradient(145deg, #18120b, #0d0a07)',
              border: '1.5px solid #e63946',
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(230, 57, 70, 0.3)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>🙏</div>
            <h3 style={{ color: '#ffb703', fontSize: '21px', margin: '0 0 12px 0' }}>
              Mrs. Sharma & Neighbor Family
            </h3>
            <p style={{ color: '#f5ebe0', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
              “Vinay beta! Words cannot express our gratitude. When we heard yesterday that the colony
              was short on funds, our children were in tears. But you took all the responsibility on your shoulders.
              This pandal is the most beautiful our lane has ever seen! Ganpati Bappa Morya!”
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'linear-gradient(135deg, #e63946, #b7094c)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Greet Warmly [Esc / Enter]
            </button>
          </div>
        </div>
      )}

      {/* ─── AMIT CONVERSATION MODAL ─── */}
      {activeModal === 'amit' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 150,
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '540px',
              background: 'linear-gradient(145deg, #18120b, #0d0a07)',
              border: '1.5px solid #2a9d8f',
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(42, 157, 143, 0.3)',
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>📸</div>
            <h3 style={{ color: '#2a9d8f', fontSize: '21px', margin: '0 0 12px 0' }}>
              Amit (Childhood Friend)
            </h3>
            <p style={{ color: '#f5ebe0', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
              “Vinay! Dada just told me you won the NIAT National Game Making Championship with ₹15,000!
              I remember how you used to sketch game levels in your school notebook after school.
              You proved that games aren’t just entertainment—they can bring an entire community together!”
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'linear-gradient(135deg, #2a9d8f, #264653)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Smile & High Five [Esc / Enter]
            </button>
          </div>
        </div>
      )}

      {/* ─── BOTTOM CONTROLS HINT ─── */}
      <div
        style={{
          width: '100%',
          padding: '16px 36px',
          background: 'linear-gradient(to top, rgba(11, 8, 6, 0.95), rgba(11, 8, 6, 0))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#bbb' }}>
          <span><strong>WASD / Arrow Keys:</strong> Explore Courtyard</span>
          <span><strong>[E]:</strong> Interact with Neighbors & Dada</span>
          {hasTalkedWithDada && (
            <span style={{ color: '#ffb703' }}>✓ Heartfelt talk with Dada completed</span>
          )}
          {diyaLit && (
            <span style={{ color: '#ffb703' }}>✓ Sacred Samai Diya Lit</span>
          )}
          {prayed && (
            <span style={{ color: '#ffb703' }}>✓ Prayers Offered to Bappa</span>
          )}
        </div>

        <div style={{ fontSize: '12px', color: '#888' }}>
          Phase 7: Ganesh Chaturthi Celebration
        </div>
      </div>
    </div>
  );
}
