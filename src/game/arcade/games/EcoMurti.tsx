/**
 * GAME 06: ECO MURTI MAKER — Creative eco-friendly idol builder
 * Choose materials and design elements, system calculates eco/creativity/festival scores.
 */
import { useState, useEffect, useCallback } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface MaterialChoice {
  id: string;
  name: string;
  icon: string;
  ecoScore: number;
  creativityScore: number;
  festivalScore: number;
  selected: boolean;
  category: 'base' | 'color' | 'decoration' | 'finish';
}

const MATERIALS: MaterialChoice[] = [
  // Base materials
  { id: 'clay', name: 'Natural Clay', icon: '🏺', ecoScore: 10, creativityScore: 5, festivalScore: 8, selected: false, category: 'base' },
  { id: 'papermache', name: 'Paper Mâché', icon: '📃', ecoScore: 8, creativityScore: 7, festivalScore: 6, selected: false, category: 'base' },
  { id: 'plaster', name: 'Plaster of Paris', icon: '⬜', ecoScore: 2, creativityScore: 5, festivalScore: 7, selected: false, category: 'base' },
  // Colors
  { id: 'turmeric', name: 'Turmeric Yellow', icon: '💛', ecoScore: 10, creativityScore: 6, festivalScore: 8, selected: false, category: 'color' },
  { id: 'kumkum', name: 'Kumkum Red', icon: '❤️', ecoScore: 9, creativityScore: 7, festivalScore: 9, selected: false, category: 'color' },
  { id: 'chemical', name: 'Chemical Paint', icon: '🎨', ecoScore: 1, creativityScore: 8, festivalScore: 8, selected: false, category: 'color' },
  { id: 'natural_green', name: 'Leaf Green', icon: '💚', ecoScore: 10, creativityScore: 7, festivalScore: 7, selected: false, category: 'color' },
  // Decorations
  { id: 'flowers', name: 'Fresh Flowers', icon: '🌸', ecoScore: 10, creativityScore: 8, festivalScore: 10, selected: false, category: 'decoration' },
  { id: 'leaves', name: 'Sacred Leaves', icon: '🌿', ecoScore: 10, creativityScore: 6, festivalScore: 7, selected: false, category: 'decoration' },
  { id: 'seeds', name: 'Seed Beads', icon: '🌱', ecoScore: 10, creativityScore: 9, festivalScore: 6, selected: false, category: 'decoration' },
  { id: 'glitter', name: 'Plastic Glitter', icon: '✨', ecoScore: 1, creativityScore: 7, festivalScore: 8, selected: false, category: 'decoration' },
  { id: 'coconut', name: 'Coconut Fiber', icon: '🥥', ecoScore: 9, creativityScore: 8, festivalScore: 7, selected: false, category: 'decoration' },
  // Finish
  { id: 'polish_natural', name: 'Beeswax Polish', icon: '🐝', ecoScore: 9, creativityScore: 7, festivalScore: 8, selected: false, category: 'finish' },
  { id: 'lacquer', name: 'Chemical Lacquer', icon: '🧪', ecoScore: 1, creativityScore: 5, festivalScore: 7, selected: false, category: 'finish' },
  { id: 'sandalwood', name: 'Sandalwood Paste', icon: '🪵', ecoScore: 10, creativityScore: 9, festivalScore: 10, selected: false, category: 'finish' },
];

const CATEGORIES = [
  { id: 'base', label: 'Base Material', icon: '🏗️' },
  { id: 'color', label: 'Sacred Colors', icon: '🎨' },
  { id: 'decoration', label: 'Decorations', icon: '💐' },
  { id: 'finish', label: 'Final Touch', icon: '✨' },
];

export default function EcoMurti() {
  const { gameState, isPaused, addScore, completeGame } = useMiniGame();
  const [materials, setMaterials] = useState<MaterialChoice[]>(MATERIALS.map(m => ({ ...m })));
  const [step, setStep] = useState(0); // 0-3: categories, 4: reveal
  const [scores, setScores] = useState({ eco: 0, creativity: 0, festival: 0 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      setMaterials(MATERIALS.map(m => ({ ...m, selected: false })));
      setStep(0);
      setScores({ eco: 0, creativity: 0, festival: 0 });
      setRevealed(false);
    }
  }, [gameState]);

  const currentCategory = CATEGORIES[step];
  const categoryMaterials = materials.filter(m => m.category === currentCategory?.id);

  const handleToggle = useCallback((id: string) => {
    if (isPaused) return;
    arcadeAudio.playClick();
    setMaterials(prev => prev.map(m =>
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  }, [isPaused]);

  const handleNext = useCallback(() => {
    if (step < 3) {
      arcadeAudio.playPlaceSnap();
      setStep(step + 1);
    } else {
      // Calculate final scores
      const selected = materials.filter(m => m.selected);
      let eco = 0, creativity = 0, festival = 0;
      selected.forEach(m => {
        eco += m.ecoScore;
        creativity += m.creativityScore;
        festival += m.festivalScore;
      });

      const count = Math.max(1, selected.length);
      const finalScores = {
        eco: Math.min(100, Math.round(eco / count * 10)),
        creativity: Math.min(100, Math.round((creativity / count) * 10 + (count > 3 ? 10 : 0))),
        festival: Math.min(100, Math.round(festival / count * 10)),
      };

      setScores(finalScores);
      setStep(4);
      setRevealed(true);

      const totalScore = finalScores.eco + finalScores.creativity + finalScores.festival;
      addScore(totalScore);
      setTimeout(() => completeGame(), 3000);
    }
  }, [step, materials, addScore, completeGame, isPaused]);

  if (gameState !== 'PLAYING') return null;

  // Murti visual representation
  const selectedMaterials = materials.filter(m => m.selected);
  const hasBase = selectedMaterials.some(m => m.category === 'base');
  const baseColor = selectedMaterials.find(m => m.category === 'base')?.id === 'clay'
    ? '#C4A26E' : selectedMaterials.find(m => m.category === 'base')?.id === 'papermache' ? '#E8DCC8' : '#E0E0E0';
  const paintColor = selectedMaterials.find(m => m.category === 'color')?.id === 'turmeric'
    ? '#E8B71A' : selectedMaterials.find(m => m.category === 'color')?.id === 'kumkum'
    ? '#DC143C' : selectedMaterials.find(m => m.category === 'color')?.id === 'natural_green'
    ? '#4CAF50' : selectedMaterials.find(m => m.category === 'color')?.id === 'chemical' ? '#9C27B0' : baseColor;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0d1117 0%, #0d2818 50%, #0d1117 100%)',
      overflow: 'hidden',
    }}>
      {/* Murti Preview */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Murti shape */}
        <div style={{
          width: '140px',
          height: '180px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Head */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: hasBase ? paintColor : 'rgba(255,255,255,0.08)',
            border: hasBase ? `2px solid ${paintColor}` : '2px dashed rgba(255,255,255,0.15)',
            transition: 'all 0.5s ease',
            position: 'relative',
            boxShadow: hasBase ? `0 0 20px ${paintColor}33` : undefined,
          }}>
            {/* Trunk */}
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '20px',
              background: hasBase ? paintColor : 'transparent',
              borderRadius: '0 0 6px 6px',
              transition: 'all 0.5s ease',
            }} />
            {/* Crown */}
            {selectedMaterials.some(m => m.category === 'decoration') && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '16px',
              }}>👑</div>
            )}
          </div>

          {/* Body */}
          <div style={{
            width: '80px',
            height: '90px',
            marginTop: '10px',
            borderRadius: '10px 10px 0 0',
            background: hasBase ? paintColor : 'rgba(255,255,255,0.05)',
            border: hasBase ? `2px solid ${paintColor}` : '2px dashed rgba(255,255,255,0.1)',
            transition: 'all 0.5s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Decorations */}
            <div style={{ fontSize: '20px', opacity: selectedMaterials.some(m => m.category === 'decoration') ? 1 : 0.1, transition: 'opacity 0.5s ease' }}>
              {selectedMaterials.filter(m => m.category === 'decoration').map(m => m.icon).join('') || '💐'}
            </div>

            {/* Finish shimmer */}
            {selectedMaterials.some(m => m.category === 'finish') && (
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                animation: 'shimmer 2s ease infinite',
              }} />
            )}
          </div>

          {/* Base/pedestal */}
          <div style={{
            width: '100px',
            height: '16px',
            borderRadius: '4px',
            background: 'rgba(139,69,19,0.4)',
            border: '1px solid rgba(139,69,19,0.6)',
          }} />
        </div>

        {/* Score display (on reveal) */}
        {revealed && (
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            animation: 'resultSlideIn 0.6s ease',
          }}>
            {[
              { label: 'Eco Score', value: scores.eco, color: '#22c55e' },
              { label: 'Creativity', value: scores.creativity, color: '#a78bfa' },
              { label: 'Festival', value: scores.festival, color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '2px' }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "'Cinzel', serif",
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material Selection Panel */}
      {step < 4 && (
        <div style={{
          padding: '16px',
          background: 'rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Category header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              color: '#fef08a',
              letterSpacing: '0.1em',
            }}>
              {currentCategory.icon} {currentCategory.label}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Step {step + 1} of 4
            </div>
          </div>

          {/* Material options */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            {categoryMaterials.map(mat => (
              <button
                key={mat.id}
                onClick={() => handleToggle(mat.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: mat.selected ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  border: mat.selected ? '1.5px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                  color: mat.selected ? '#fef08a' : 'rgba(255,255,255,0.7)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: mat.selected ? 'scale(1.05)' : 'scale(1)',
                  textAlign: 'center',
                  minWidth: '80px',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{mat.icon}</div>
                {mat.name}
                {mat.ecoScore >= 8 && (
                  <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '2px' }}>🌿 Eco</div>
                )}
              </button>
            ))}
          </div>

          {/* Next button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleNext}
              style={{
                padding: '8px 36px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #0d9488, #5eead4aa)',
                border: '1px solid #5eead466',
                color: '#000',
                fontFamily: "'Cinzel', serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {step < 3 ? 'Next Step →' : 'Reveal Murti ✨'}
            </button>
          </div>
        </div>
      )}

      {/* Revealed summary */}
      {revealed && (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.3)',
          fontFamily: "'Cinzel', serif",
          fontSize: '16px',
          color: '#fef08a',
          letterSpacing: '0.1em',
        }}>
          Your Eco Murti is Complete! 🕉️
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateX(20px) translateY(-50%); }
          to { opacity: 1; transform: translateX(0) translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
