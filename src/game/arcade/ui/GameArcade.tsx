/**
 * GameArcade — The main immersive arcade experience.
 * Festival-inspired game hall with 10 game stations, ambient particles, and rich atmosphere.
 */
import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import type { MiniGameId, ArcadePhase } from '../ArcadeTypes';
import { GAME_REGISTRY } from '../GameRegistry';
import { scoreManager } from '../ScoreManager';
import { MiniGameProvider } from '../MiniGameManager';
import { arcadeAudio } from '../ArcadeAudioController';
import { ArcadeEntrance } from './ArcadeEntrance';
import { GameCard } from './GameCard';
import { MiniGameShell } from './MiniGameShell';

// Lazy-loaded mini-games
const ModakCatch = lazy(() => import('../games/ModakCatch'));
const MushakDash = lazy(() => import('../games/MushakDash'));
const PandalBuilder = lazy(() => import('../games/PandalBuilder'));
const RangoliMemory = lazy(() => import('../games/RangoliMemory'));
const DholRhythm = lazy(() => import('../games/DholRhythm'));
const EcoMurti = lazy(() => import('../games/EcoMurti'));
const VinayakaQuiz = lazy(() => import('../games/VinayakaQuiz'));
const VisarjanJourney = lazy(() => import('../games/VisarjanJourney'));
const PujaCollector = lazy(() => import('../games/PujaCollector'));
const ObstaclePath = lazy(() => import('../games/ObstaclePath'));

const GAME_COMPONENTS: Record<MiniGameId, React.LazyExoticComponent<any>> = {
  'modak-catch': ModakCatch,
  'mushak-dash': MushakDash,
  'pandal-builder': PandalBuilder,
  'rangoli-memory': RangoliMemory,
  'dhol-rhythm': DholRhythm,
  'eco-murti': EcoMurti,
  'vinayaka-quiz': VinayakaQuiz,
  'visarjan': VisarjanJourney,
  'puja-collector': PujaCollector,
  'obstacle-path': ObstaclePath,
};

interface GameArcadeProps {
  onComplete: () => void;
}

// Floating particle for the arcade atmosphere
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'petal' | 'ember' | 'dust';
}

export function GameArcade({ onComplete }: GameArcadeProps) {
  const [phase, setPhase] = useState<ArcadePhase>('ENTRANCE');
  const [activeGameId, setActiveGameId] = useState<MiniGameId | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const arcadeRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);

  // Generate ambient particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      const types: Particle['type'][] = ['petal', 'ember', 'dust'];
      const type = types[Math.floor(Math.random() * types.length)];
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.03,
        vy: -0.02 - Math.random() * 0.04,
        size: type === 'ember' ? 2 + Math.random() * 3 : 4 + Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.5,
        color: type === 'ember' ? '#fbbf24' : type === 'petal' ? '#f97316' : '#fef3c7',
        type,
      });
    }
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    if (phase !== 'BROWSING') return;

    const animate = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + p.vx + 100) % 100,
          y: p.y + p.vy < -5 ? 105 : p.y + p.vy,
          opacity: 0.15 + Math.sin(Date.now() * 0.002 + p.x) * 0.25,
        }))
      );
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase]);

  const handleEntranceComplete = useCallback(() => {
    setPhase('BROWSING');
  }, []);

  const handleSelectGame = useCallback((id: MiniGameId) => {
    arcadeAudio.playClick();
    setActiveGameId(id);
    setPhase('GAME_ACTIVE');
  }, []);

  const handleExitToArcade = useCallback(() => {
    setActiveGameId(null);
    setPhase('BROWSING');
  }, []);

  const handleExitArcade = useCallback(() => {
    setPhase('EXITING');
    setTimeout(onComplete, 800);
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (phase !== 'BROWSING') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExitArcade();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleExitArcade]);

  // Scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollY((e.target as HTMLDivElement).scrollTop);
  }, []);

  if (phase === 'ENTRANCE') {
    return <ArcadeEntrance onComplete={handleEntranceComplete} />;
  }

  if (phase === 'GAME_ACTIVE' && activeGameId) {
    const GameComponent = GAME_COMPONENTS[activeGameId];
    return (
      <MiniGameProvider onExitToArcade={handleExitToArcade}>
        <MiniGameShell gameId={activeGameId}>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: '#0c0a0f',
              color: '#fef08a',
              fontFamily: "'Cinzel', serif",
              fontSize: '18px',
              letterSpacing: '0.15em',
            }}>
              Loading...
            </div>
          }>
            <GameComponent />
          </Suspense>
        </MiniGameShell>
      </MiniGameProvider>
    );
  }

  const completedCount = GAME_REGISTRY.filter(g => scoreManager.isCompleted(g.id)).length;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a0e08 0%, #2d1810 30%, #1a0e08 70%, #0c0604 100%)',
        opacity: phase === 'EXITING' ? 0 : 1,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* Atmospheric Background Elements */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Temple silhouette gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(139, 69, 19, 0.08) 100%)',
        }} />

        {/* Warm ambient glow */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '60vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.type === 'ember' ? '50%' : '40%',
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: p.type === 'petal' ? `rotate(${p.x * 36}deg)` : undefined,
              boxShadow: p.type === 'ember' ? `0 0 ${p.size * 2}px ${p.color}` : undefined,
              transition: 'opacity 0.5s ease',
            }}
          />
        ))}

        {/* Hanging marigold garland (top decorative border) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '12px',
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 20px, #d97706 20px, #f59e0b 26px, #d97706 32px, transparent 32px, transparent 52px)',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute',
          top: '12px',
          left: 0,
          right: 0,
          height: '8px',
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, #ea580c 18px, #f97316 24px, #ea580c 30px, transparent 30px, transparent 48px)',
          opacity: 0.4,
        }} />
      </div>

      {/* Scrollable Content */}
      <div
        ref={arcadeRef}
        onScroll={handleScroll}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Arcade Header */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px 16px',
          transform: `translateY(${scrollY * -0.2}px)`,
        }}>
          {/* Decorative Om motif */}
          <div style={{
            fontSize: '36px',
            marginBottom: '8px',
            filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.4))',
            animation: 'floatGently 4s ease-in-out infinite',
          }}>
            🕉️
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: "'Cinzel', 'Marcellus', serif",
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 800,
            color: '#fef08a',
            letterSpacing: '0.15em',
            textShadow: '0 2px 16px rgba(251, 191, 36, 0.3), 0 4px 32px rgba(0,0,0,0.7)',
            textTransform: 'uppercase',
          }}>
            Game Arcade
          </h1>

          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(11px, 1.5vw, 14px)',
            color: 'rgba(254, 240, 138, 0.6)',
            letterSpacing: '0.3em',
            marginTop: '4px',
            textTransform: 'uppercase',
          }}>
            विनायक · The First Prayer
          </div>

          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '12px',
          }}>
            {completedCount}/10 Games Completed
          </div>
        </div>

        {/* Game Grid — Staggered Festival Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          padding: '20px clamp(16px, 4vw, 60px) 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {GAME_REGISTRY.map((game, index) => (
            <GameCard
              key={game.id}
              config={game}
              bestScore={scoreManager.getBestScore(game.id)}
              completed={scoreManager.isCompleted(game.id)}
              isHovered={hoveredGame === game.id}
              onHover={() => setHoveredGame(game.id)}
              onLeave={() => setHoveredGame(null)}
              onSelect={() => handleSelectGame(game.id)}
              delay={index * 80}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(12,6,4,0.95) 40%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'auto',
      }}>
        <button
          onClick={handleExitArcade}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(254, 240, 138, 0.2)',
            borderRadius: '8px',
            padding: '8px 20px',
            color: 'rgba(254, 240, 138, 0.7)',
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            letterSpacing: '0.15em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(251,191,36,0.15)';
            e.currentTarget.style.borderColor = 'rgba(254,240,138,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(254,240,138,0.2)';
          }}
        >
          ← Exit Arcade · ESC
        </button>

        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
        }}>
          Select a game to play
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes floatGently {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
