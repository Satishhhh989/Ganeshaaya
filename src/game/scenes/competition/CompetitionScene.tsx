import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStateStore } from '../../core/GameState';
import { AdultCharacter } from '../../characters/ProceduralCharacters';
import { audioManager } from '../../audio/AudioManager';
import {
  competitionCeremonyStore,
  useCompetitionCeremony,
  type CeremonyBeat,
} from './competitionState';

// ─── Dynamic Canvas Stage Screen Generator ───
function renderStageScreen(
  canvas: HTMLCanvasElement,
  beat: CeremonyBeat,
  time: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Rich metallic background gradient with high vibrancy
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (beat === 'SUSPENSE_TENSION') {
    bgGrad.addColorStop(0, '#0c1527');
    bgGrad.addColorStop(0.5, '#172554');
    bgGrad.addColorStop(1, '#070f1e');
  } else if (beat === 'WINNER_REVEAL' || beat === 'VINAY_CELEBRATION') {
    bgGrad.addColorStop(0, '#2e1800');
    bgGrad.addColorStop(0.5, '#451a03');
    bgGrad.addColorStop(1, '#1a0d00');
  } else if (beat === 'PRIZE_AWARD') {
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#021814');
  } else {
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Decorative Golden Border Frame
  ctx.save();
  ctx.strokeStyle = beat === 'WINNER_REVEAL' || beat === 'VINAY_CELEBRATION' ? '#ffb703' : '#38bdf8';
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, w - 56, h - 56);

  // Corner Indian Motif Flourishes
  const cornerSize = 44;
  ctx.fillStyle = '#ffb703';
  [
    [28, 28],
    [w - 28 - cornerSize, 28],
    [28, h - 28 - cornerSize],
    [w - 28 - cornerSize, h - 28 - cornerSize],
  ].forEach(([cx, cy]) => {
    ctx.fillRect(cx, cy, cornerSize, 5);
    ctx.fillRect(cx, cy, 5, cornerSize);
  });
  ctx.restore();

  // Screen Content by Beat
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (beat === 'AUDITORIUM_ESTABLISHING') {
    // Ambient Standby Display
    const pulse = 0.8 + Math.sin(time * 2.5) * 0.2;
    ctx.fillStyle = `rgba(255, 183, 3, ${pulse})`;
    ctx.font = 'bold 40px "Outfit", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('N · I · A · T   C H A M P I O N S H I P', w / 2, h / 2 - 45);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '600 26px "Outfit", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('NATIONAL GRAND FINALE 2024', w / 2, h / 2 + 18);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 18px "Outfit", sans-serif';
    ctx.fillText('LIVE EVENT BROADCAST ACTIVE', w / 2, h / 2 + 75);
  } else if (beat === 'STAGE_AWAKENING' || beat === 'HOST_WELCOME') {
    // Grand Finale Opening Screen
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 46px "Outfit", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('N-I-A-T CHAMPIONSHIP 2024', w / 2, h / 2 - 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px "Georgia", serif';
    ctx.fillText('GRAND FINALE', w / 2, h / 2 - 5);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('NATIONAL AUDITORIUM · LIVE STAGE', w / 2, h / 2 + 75);
  } else if (beat === 'VINAY_IN_AUDIENCE' || beat === 'FINALISTS_THEME') {
    // Theme & Live Game Demo Presentation
    ctx.fillStyle = '#ffb703';
    ctx.font = '700 20px "Outfit", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('LIVE PROJECT DEMO · THE LEGEND OF VINAYAKA', w / 2, h / 2 - 105);

    // Live Gameplay Preview Screen Container
    const gw = 420;
    const gh = 180;
    const gx = (w - gw) / 2;
    const gy = h / 2 - 80;

    ctx.fillStyle = '#08170e';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, gw, gh);

    // Mini avatar & modak preview in gameplay screen
    const pWalkX = gx + 100 + Math.sin(time * 3) * 60;
    const pWalkY = gy + 90;

    // Altar shrine
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪷', gx + 330, gy + 90);

    // Modak
    ctx.fillText('🥟', gx + 220, gy + 88 + Math.sin(time * 5) * 4);

    // Little Vinayaka avatar
    ctx.beginPath();
    ctx.arc(pWalkX, pWalkY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillText('🕉', pWalkX, pWalkY);

    // Subtitle below preview
    ctx.fillStyle = '#bae6fd';
    ctx.font = '600 18px "Outfit", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('HERITAGE STORYTELLING & REAL-TIME INTERACTIVITY', w / 2, h / 2 + 120);
  } else if (beat === 'SUSPENSE_TENSION') {
    // Suspense Beat: "AND THE WINNER IS..."
    const glow = Math.sin(time * 5.0) * 0.25 + 0.75;
    ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
    ctx.font = 'bold 52px "Georgia", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('AND THE WINNER IS...', w / 2, h / 2 - 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '600 22px "Outfit", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('VERDICT OF THE NATIONAL JURY', w / 2, h / 2 + 48);
  } else if (beat === 'WINNER_REVEAL' || beat === 'VINAY_CELEBRATION') {
    // Golden Winner Reveal Screen
    const sweep = Math.sin(time * 3) * 100;
    const radial = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 450);
    radial.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('🏆  1ST PLACE NATIONAL CHAMPION  🏆', w / 2, h / 2 - 105);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px "Georgia", serif';
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 28;
    ctx.fillText('THE LEGEND OF VINAYAKA', w / 2 + sweep * 0.05, h / 2 - 28);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 34px "Outfit", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('CREATOR: VINAY', w / 2, h / 2 + 52);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '500 19px "Outfit", sans-serif';
    ctx.fillText('EXCELLENCE IN HERITAGE, ART & INTERACTIVE STORYTELLING', w / 2, h / 2 + 98);
  } else if (beat === 'PRIZE_AWARD' || beat === 'CEREMONY_COMPLETE') {
    // Grand Prize Reveal Screen: ₹15,000
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('OFFICIAL NATIONAL PRODUCTION GRANT', w / 2, h / 2 - 100);

    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 88px "Georgia", serif';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 32;
    ctx.fillText('₹15,000', w / 2, h / 2 - 8);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f0fdf4';
    ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('DEDICATED TO LIVING TRADITION & GANESH CHATURTHI', w / 2, h / 2 + 78);
  }
}

export function CompetitionScene() {
  const currentBeat = useCompetitionCeremony();
  const { camera } = useThree();

  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const spotLight1Ref = useRef<THREE.SpotLight>(null);
  const spotLight2Ref = useRef<THREE.SpotLight>(null);
  const hostMicArmRef = useRef<THREE.Group>(null);
  const confettiGroupRef = useRef<THREE.Group>(null);
  const crowdGroupRef = useRef<THREE.Group>(null);
  const vinayGroupRef = useRef<THREE.Group>(null);
  const flashGroupRef = useRef<THREE.Group>(null);

  // Mouse look parallax for player involvement in Shot 1
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    competitionCeremonyStore.reset();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseParallax({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Canvas Texture for dynamic stage screen
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    screenCanvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    screenTextureRef.current = tex;
    return tex;
  }, []);

  // Confetti particles for winning celebration
  const confettiData = useMemo(() => {
    return Array.from({ length: 90 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 11,
        4.0 + Math.random() * 4.5,
        (Math.random() - 0.5) * 6
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      speed: 0.9 + Math.random() * 1.6,
      rotSpeed: 1.8 + Math.random() * 3.5,
      color:
        Math.random() > 0.5
          ? '#ffb703'
          : Math.random() > 0.4
          ? '#ffd166'
          : Math.random() > 0.3
          ? '#f97316'
          : '#34d399',
    }));
  }, []);

  // Ambient floating stage dust particles
  const dustParticles = useMemo(() => {
    return Array.from({ length: 45 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        0.5 + Math.random() * 5.5,
        (Math.random() - 0.5) * 10
      ),
      speed: 0.15 + Math.random() * 0.25,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Audience mobile phone camera glow & flashes
  const phoneScreens = useMemo(() => {
    return [
      { pos: [-3.2, 0.65, 5.2], color: '#67e8f9' },
      { pos: [-1.8, 0.68, 6.6], color: '#fde047' },
      { pos: [1.8, 0.66, 5.2], color: '#a7f3d0' },
      { pos: [3.2, 0.67, 6.6], color: '#bae6fd' },
      { pos: [-0.6, 0.65, 8.0], color: '#fef08a' },
      { pos: [2.2, 0.68, 8.0], color: '#67e8f9' },
    ];
  }, []);

  // Sound triggers on ceremony beat transitions
  useEffect(() => {
    if (currentBeat === 'AUDITORIUM_ESTABLISHING') {
      audioManager.playTransitionSwell();
    } else if (currentBeat === 'STAGE_AWAKENING') {
      audioManager.playHoverChime();
    } else if (currentBeat === 'SUSPENSE_TENSION') {
      audioManager.playSuspensePulse();
    } else if (currentBeat === 'WINNER_REVEAL') {
      audioManager.playCelebrationChime();
      audioManager.playCrowdApplause();
      gameStateStore.advancePresentPhase('COMPETITION_WIN');
    } else if (currentBeat === 'PRIZE_AWARD') {
      audioManager.playTempleBell();
    } else if (currentBeat === 'CEREMONY_COMPLETE') {
      audioManager.playCrowdApplause();
    }
  }, [currentBeat]);

  // Track target lookAt smoothly
  const currentLookAt = useRef(new THREE.Vector3(0, 2.2, -1.0));

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Tick ceremony store for auto-advance progression
    competitionCeremonyStore.tick(delta);

    // ─── 1. DYNAMIC SCREEN CANVAS UPDATE ───
    if (screenCanvasRef.current && screenTextureRef.current) {
      renderStageScreen(screenCanvasRef.current, currentBeat, t);
      screenTextureRef.current.needsUpdate = true;
    }

    // ─── 2. CINEMATIC MULTI-SHOT CAMERA CHOREOGRAPHY ───
    let targetPos = new THREE.Vector3(0, 3.4, 11.2);
    let targetLook = new THREE.Vector3(0, 2.3, -1.0);
    let lerpSpeed = 0.045;

    switch (currentBeat) {
      case 'AUDITORIUM_ESTABLISHING':
        // SHOT 1: Wide establishing shot, slow glide toward stage with player look-around
        targetPos.set(
          mouseParallax.x * 0.9,
          3.6 - mouseParallax.y * 0.4,
          11.8 - Math.min(t * 0.18, 1.8)
        );
        targetLook.set(mouseParallax.x * 1.5, 2.3 - mouseParallax.y * 0.6, -1.0);
        lerpSpeed = 0.04;
        break;

      case 'STAGE_AWAKENING':
        // SHOT 2: Move toward the main stage, spotlights activate, screen comes alive
        targetPos.set(-2.0, 2.2, 5.6);
        targetLook.set(-0.3, 2.8, -3.2);
        lerpSpeed = 0.04;
        break;

      case 'HOST_WELCOME':
        // SHOT 4: Cut back to stage, host at podium speaking
        targetPos.set(-2.4, 1.6, 2.6);
        targetLook.set(-3.8, 1.45, 0.8);
        lerpSpeed = 0.05;
        break;

      case 'VINAY_IN_AUDIENCE':
        // SHOT 3: Cut to Vinay in the audience, nervous & hopeful
        targetPos.set(1.4, 1.3, 4.1);
        targetLook.set(0.6, 1.25, 5.0);
        lerpSpeed = 0.055;
        break;

      case 'FINALISTS_THEME':
        // Medium wide shot framing stage finalists and big theme screen
        targetPos.set(0, 2.1, 5.2);
        targetLook.set(0, 2.7, -3.0);
        lerpSpeed = 0.04;
        break;

      case 'SUSPENSE_TENSION':
        // SHOT 5: Slow push-in toward podium & screen as announcement begins
        targetPos.set(0, 1.6, 4.0 - Math.sin(t * 0.3) * 0.3);
        targetLook.set(0, 3.0, -3.4);
        lerpSpeed = 0.035;
        break;

      case 'WINNER_REVEAL':
        // Low angle dramatic push-in to the dazzling winner screen
        targetPos.set(0, 1.5, 3.6);
        targetLook.set(0, 3.2, -3.4);
        lerpSpeed = 0.06;
        break;

      case 'VINAY_CELEBRATION':
        // Cut back to Vinay in audience standing in joy & awe
        targetPos.set(0.6, 1.4, 3.8);
        targetLook.set(0.6, 1.4, 5.0);
        lerpSpeed = 0.055;
        break;

      case 'PRIZE_AWARD':
        // Majestic view framing Vinay on stage under gold spotlight with ₹15,000 on screen
        targetPos.set(0, 1.9, 4.2);
        targetLook.set(0, 2.2, -1.0);
        lerpSpeed = 0.045;
        break;

      case 'CEREMONY_COMPLETE':
        // Smooth celebratory pull-out
        targetPos.set(0, 2.8, 7.8);
        targetLook.set(0, 2.0, -0.5);
        lerpSpeed = 0.035;
        break;
    }

    camera.position.lerp(targetPos, lerpSpeed);
    currentLookAt.current.lerp(targetLook, lerpSpeed);
    camera.lookAt(currentLookAt.current);

    // ─── 3. VINAY'S 3D STAGING & ANIMATIONS ───
    const isVinayOnStage =
      currentBeat === 'PRIZE_AWARD' || currentBeat === 'CEREMONY_COMPLETE';
    if (vinayGroupRef.current) {
      if (isVinayOnStage) {
        // Vinay takes stage center
        vinayGroupRef.current.position.lerp(new THREE.Vector3(0, 0.4, 0.6), 0.05);
        vinayGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          vinayGroupRef.current.rotation.y,
          0,
          0.06
        );
      } else {
        // Seated in the front row of the auditorium
        vinayGroupRef.current.position.set(0.6, 0.35, 5.0);
        vinayGroupRef.current.rotation.y = Math.PI; // facing towards the stage (-Z)
      }
    }

    // ─── 4. MOVING HEAD SPOTLIGHTS SWEEP ───
    const isSuspense = currentBeat === 'SUSPENSE_TENSION';
    const isWin =
      currentBeat === 'WINNER_REVEAL' ||
      currentBeat === 'VINAY_CELEBRATION' ||
      currentBeat === 'PRIZE_AWARD' ||
      currentBeat === 'CEREMONY_COMPLETE';

    if (spotLight1Ref.current) {
      if (isSuspense) {
        // Spotlight locks on podium
        spotLight1Ref.current.target.position.set(-3.8, 1.2, 0.8);
      } else if (isWin) {
        // Sweeping celebratory beams
        spotLight1Ref.current.target.position.set(
          Math.sin(t * 1.8) * 4.0,
          2.2,
          Math.cos(t * 1.4) * 2.0
        );
      } else {
        // Subtle ambient sweep
        spotLight1Ref.current.target.position.set(
          Math.sin(t * 0.8) * 2.5,
          1.6,
          Math.cos(t * 0.6) * 1.0
        );
      }
      spotLight1Ref.current.target.updateMatrixWorld();
    }

    if (spotLight2Ref.current) {
      if (isSuspense) {
        // Spotlight locks on LED screen center
        spotLight2Ref.current.target.position.set(0, 3.6, -3.4);
      } else if (isWin) {
        // Spotlight pins on Vinay
        const targetX = isVinayOnStage ? 0 : 0.6;
        const targetZ = isVinayOnStage ? 0.6 : 5.0;
        spotLight2Ref.current.target.position.set(targetX, 1.4, targetZ);
      } else {
        spotLight2Ref.current.target.position.set(
          Math.cos(t * 0.7) * 3.0,
          2.0,
          Math.sin(t * 0.5) * 1.0
        );
      }
      spotLight2Ref.current.target.updateMatrixWorld();
    }

    // ─── 5. HOST MICROPHONE ARM GESTURE ───
    if (hostMicArmRef.current) {
      hostMicArmRef.current.rotation.x = -0.3 + Math.sin(t * 2.2) * 0.08;
      hostMicArmRef.current.rotation.y = Math.sin(t * 1.5) * 0.06;
    }

    // ─── 6. AUDIENCE BOBBING & CHEERING REACTION ───
    if (crowdGroupRef.current) {
      crowdGroupRef.current.children.forEach((row, rIdx) => {
        row.children.forEach((person, cIdx) => {
          const sway = Math.sin(t * 2.0 + rIdx * 1.2 + cIdx * 0.8) * 0.015;
          person.position.y = sway;
          if (isWin) {
            person.position.y += Math.abs(Math.sin(t * 4.0 + cIdx * 0.9)) * 0.05;
          }
        });
      });
    }

    // ─── 7. CAMERA FLASHES IN AUDIENCE ───
    if (isWin && flashGroupRef.current) {
      flashGroupRef.current.children.forEach((flashLight: any, idx) => {
        const flash = Math.sin(t * 12.0 + idx * 3.14) > 0.85 ? 2.5 : 0.0;
        flashLight.intensity = flash;
      });
    }

    // ─── 8. FALLING CONFETTI IN CELEBRATION ───
    if (isWin && confettiGroupRef.current) {
      confettiGroupRef.current.children.forEach((mesh, idx) => {
        const d = confettiData[idx];
        mesh.position.y -= d.speed * 0.024;
        mesh.rotation.x += d.rotSpeed * 0.02;
        mesh.rotation.y += d.rotSpeed * 0.02;
        if (mesh.position.y < 0.3) {
          mesh.position.y = 5.5 + Math.random() * 2.5;
        }
      });
    }
  });

  const isSuspense = currentBeat === 'SUSPENSE_TENSION';
  const isWin =
    currentBeat === 'WINNER_REVEAL' ||
    currentBeat === 'VINAY_CELEBRATION' ||
    currentBeat === 'PRIZE_AWARD' ||
    currentBeat === 'CEREMONY_COMPLETE';
  const isVinayStanding =
    currentBeat === 'WINNER_REVEAL' ||
    currentBeat === 'VINAY_CELEBRATION' ||
    currentBeat === 'PRIZE_AWARD' ||
    currentBeat === 'CEREMONY_COMPLETE';

  // Palette of audience clothes: modern, dignified, visible tones
  const audienceColors = [
    '#334155', // slate blue
    '#475569', // cool steel
    '#3b4252', // nord dark slate
    '#1e293b', // midnight
    '#52525b', // warm zinc
    '#b45309', // warm amber kurta
    '#0f766e', // deep teal
    '#4338ca', // royal indigo
  ];

  const skinTones = ['#e29578', '#d4a373', '#c68b59', '#f4a261', '#e0ac69'];

  return (
    <group name="CompetitionScene">
      {/* ─── 1. AUDITORIUM GLOBAL LIGHTING (Warm, Vibrant, Layered - NO CRUSHED BLACKS) ─── */}
      <ambientLight intensity={1.15} color="#252a3d" />

      {/* Main Overhead Stage Key Light */}
      <directionalLight
        position={[0, 11, 7]}
        intensity={isSuspense ? 1.6 : isWin ? 2.8 : 2.4}
        color={isWin ? '#fffbeb' : '#fff7ed'}
        castShadow
      />

      {/* Stage Rim / Backlight (Celestial Blue Hair & Shoulder Rim) */}
      <directionalLight
        position={[0, 6.5, -5.5]}
        intensity={1.6}
        color="#7dd3fc"
      />

      {/* Auditorium Hall Fill Light (Overhead wash across audience rows) */}
      <pointLight
        position={[0, 6.5, 7.0]}
        intensity={2.2}
        color="#fed7aa"
        distance={18}
      />

      {/* ─── 2. DEDICATED CHARACTER LIGHTS ─── */}
      {/* Dedicated Key Light for Vinay in Audience */}
      <pointLight
        position={[0.6, 2.6, 4.3]}
        intensity={isSuspense ? 1.8 : isWin ? 3.4 : 2.6}
        color="#fff7ed"
        distance={6}
      />

      {/* Dedicated Key & Fill Light for Host & Podium */}
      <spotLight
        position={[-3.8, 5.2, 2.6]}
        target-position={[-3.8, 1.2, 0.8]}
        intensity={3.8}
        angle={0.44}
        penumbra={0.65}
        color="#fffbeb"
      />
      <pointLight
        position={[-3.8, 2.2, 0.9]}
        intensity={2.0}
        color="#fed7aa"
        distance={4.5}
      />

      {/* Dedicated Light for Judges Table */}
      <pointLight
        position={[3.8, 2.4, -0.3]}
        intensity={2.0}
        color="#fffbeb"
        distance={4.5}
      />

      {/* Dynamic Screen Under-Glow projecting warm gold onto the stage floor */}
      <pointLight
        position={[0, 1.2, -2.8]}
        intensity={2.6}
        color="#ffb703"
        distance={6}
      />

      {/* Traditional Indian Samai Brass Diya Lamps on Stage Lip (Left & Right) */}
      <pointLight position={[-5.8, 0.9, 3.4]} intensity={1.8} color="#f59e0b" distance={4} />
      <pointLight position={[5.8, 0.9, 3.4]} intensity={1.8} color="#f59e0b" distance={4} />

      {/* Sweeping Moving-Head Stage Spotlights */}
      <spotLight
        ref={spotLight1Ref}
        position={[-3.5, 7.5, 4.2]}
        angle={0.42}
        penumbra={0.65}
        intensity={isSuspense ? 3.0 : isWin ? 5.5 : 4.0}
        color={isWin ? '#fde047' : '#38bdf8'}
        castShadow
      />
      <spotLight
        ref={spotLight2Ref}
        position={[3.5, 7.5, 4.2]}
        angle={0.42}
        penumbra={0.65}
        intensity={isSuspense ? 3.0 : isWin ? 5.5 : 4.0}
        color={isWin ? '#ffb703' : '#fed7aa'}
        castShadow
      />

      {/* ─── 3. AUDITORIUM ARCHITECTURAL INTERIOR & WALLS ─── */}
      {/* Rear Acoustic Wood Wall with Vertical Gold Fins */}
      <mesh position={[0, 4.5, -5.0]} receiveShadow>
        <planeGeometry args={[26, 10]} />
        <meshStandardMaterial color="#271c19" roughness={0.6} />
      </mesh>
      {[-8, -5, -2, 2, 5, 8].map((fx, idx) => (
        <mesh key={idx} position={[fx, 4.5, -4.92]}>
          <boxGeometry args={[0.15, 9.8, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Auditorium Side Walls with Warm Sconces */}
      <mesh position={[-11.0, 4.5, 3.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#1f1816" roughness={0.7} />
      </mesh>
      <mesh position={[11.0, 4.5, 3.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial color="#1f1816" roughness={0.7} />
      </mesh>

      {/* Side Wall Warm Sconces */}
      {[-1, 3, 7].map((sz, idx) => (
        <group key={idx}>
          {/* Left wall sconce */}
          <mesh position={[-10.9, 3.2, sz]}>
            <boxGeometry args={[0.12, 0.6, 0.25]} />
            <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[-10.6, 3.2, sz]} intensity={1.5} color="#fed7aa" distance={5} />

          {/* Right wall sconce */}
          <mesh position={[10.9, 3.2, sz]}>
            <boxGeometry args={[0.12, 0.6, 0.25]} />
            <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[10.6, 3.2, sz]} intensity={1.5} color="#fed7aa" distance={5} />
        </group>
      ))}

      {/* Auditorium Tiered Slate Carpet Floor */}
      <mesh position={[0, -0.05, 5.0]} receiveShadow>
        <boxGeometry args={[24, 0.1, 14]} />
        <meshStandardMaterial color="#242132" roughness={0.75} />
      </mesh>

      {/* ─── 4. AUDITORIUM STAGE ─── */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[13, 0.4, 7.5]} />
        <meshStandardMaterial color="#2d2d3a" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Stage Front Golden Trim & Brass Molding */}
      <mesh position={[0, 0.38, 3.73]}>
        <boxGeometry args={[13, 0.05, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Stage Central Steps Leading into Audience Aisle */}
      <group position={[0, 0.1, 3.9]}>
        <mesh receiveShadow>
          <boxGeometry args={[3.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#343a40" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.08, 0.22]}>
          <boxGeometry args={[3.2, 0.04, 0.04]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} />
        </mesh>
      </group>

      {/* Traditional Indian Festive Marigold Garlands along stage lip */}
      <group position={[0, 0.38, 3.76]}>
        {[-5.0, -3.5, -2.0, 2.0, 3.5, 5.0].map((gx, idx) => (
          <group key={idx} position={[gx, -0.05, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 8, 6]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#f97316' : '#ffb703'} roughness={0.7} />
            </mesh>
            <mesh position={[0.15, 0.02, 0]}>
              <sphereGeometry args={[0.065, 8, 6]} />
              <meshStandardMaterial color="#ea580c" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Brass Samai Diya Props on Stage Corners */}
      {[-5.8, 5.8].map((sx, idx) => (
        <group key={idx} position={[sx, 0.4, 3.4]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.12, 0.4, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.14, 0.06, 0.08, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Flame mesh */}
          <mesh position={[0, 0.29, 0]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshBasicMaterial color="#ffedd5" />
          </mesh>
        </group>
      ))}

      {/* ─── 5. DYNAMIC GIANT LED BACKDROP SCREEN ─── */}
      <group position={[0, 3.6, -3.4]}>
        {/* Screen Frame Bezel */}
        <mesh castShadow>
          <boxGeometry args={[9.5, 4.7, 0.14]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Gold Trim around LED Screen */}
        <mesh position={[0, 0, 0.072]}>
          <boxGeometry args={[9.54, 4.74, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Active Display Panel with Animated Canvas Texture */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[9.3, 4.5]} />
          <meshStandardMaterial
            ref={screenMatRef}
            map={screenTexture}
            emissiveMap={screenTexture}
            emissive="#ffffff"
            emissiveIntensity={isWin ? 1.25 : 1.05}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Side LED Banner Pillars */}
      <mesh position={[-5.8, 3.2, -3.2]} castShadow>
        <boxGeometry args={[0.9, 3.8, 0.1]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[5.8, 3.2, -3.2]} castShadow>
        <boxGeometry args={[0.9, 3.8, 0.1]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>

      {/* Overhead Lighting Truss */}
      <group position={[0, 7.0, 0]}>
        <mesh>
          <boxGeometry args={[14, 0.25, 0.25]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        {[-5, -2.5, 0, 2.5, 5].map((tx, idx) => (
          <group key={idx} position={[tx, -0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.16, 0.35, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <pointLight position={[0, -0.25, 0]} intensity={0.6} color="#fde047" distance={5} />
          </group>
        ))}
      </group>

      {/* ─── 6. SPEAKER PODIUM & HOST (STAGE LEFT) ─── */}
      <group position={[-3.8, 0.4, 0.8]}>
        {/* Podium Base & Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.75, 1.05, 0.55]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.3} />
        </mesh>
        {/* NIAT Logo Gold Emblem */}
        <mesh position={[0, 0.25, 0.28]}>
          <planeGeometry args={[0.45, 0.2]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Microphone */}
        <mesh position={[0, 0.65, 0.1]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.28, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>

        {/* Host Character (Clearly visible and illuminated) */}
        <group position={[0, 0.95, -0.42]}>
          {/* Blazer Suit */}
          <mesh castShadow>
            <capsuleGeometry args={[0.19, 0.52, 8, 12]} />
            <meshStandardMaterial color="#2d3748" roughness={0.5} />
          </mesh>
          {/* Host Head */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.115, 12, 10]} />
            <meshStandardMaterial color="#e0ac69" roughness={0.45} />
          </mesh>
          {/* Host Hair */}
          <mesh position={[0, 0.55, -0.02]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color="#1e1e24" roughness={0.8} />
          </mesh>
          {/* Animated Host Arm Gesturing */}
          <group ref={hostMicArmRef} position={[0.22, 0.2, 0]}>
            <mesh position={[0, -0.15, 0.1]} rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.32, 8]} />
              <meshStandardMaterial color="#2d3748" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ─── 7. JURY / JUDGES' TABLE (STAGE RIGHT) ─── */}
      <group position={[3.8, 0.4, -0.4]}>
        {/* Modern Jury Desk */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.9, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Desk Nameplate */}
        <mesh position={[0, 0.2, 0.41]}>
          <planeGeometry args={[1.2, 0.15]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} />
        </mesh>
        {/* 3 Judges */}
        {[-0.7, 0, 0.7].map((jx, idx) => (
          <group key={idx} position={[jx, 0.5, -0.42]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.16, 0.38, 6, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.44, 0]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshStandardMaterial color={skinTones[idx]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── 8. OTHER STUDENT FINALISTS ON STAGE ─── */}
      <group position={[-1.6, 0.4, -0.2]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.55, 8, 10]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
      </group>
      <group position={[1.6, 0.4, -0.2]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.55, 8, 10]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#e8b88a" />
        </mesh>
      </group>

      {/* ─── 9. PROTAGONIST VINAY (AUDIENCE FIRST, THEN TAKES STAGE) ─── */}
      <group ref={vinayGroupRef} position={[0.6, 0.35, 5.0]}>
        <AdultCharacter
          speed={0}
          isRunning={false}
          isSitting={!isVinayStanding}
          isTalking={isWin}
        />
        {/* Radiant golden halo when won */}
        {isWin && (
          <pointLight
            position={[0, 1.4, 0.4]}
            color="#ffb703"
            intensity={3.4}
            distance={4.0}
          />
        )}
      </group>

      {/* ─── 10. AUDIENCE SILHOUETTES & DETAILS (WARM, VISIBLE, VIBRANT) ─── */}
      <group ref={crowdGroupRef} position={[0, 0, 5.0]}>
        {[0, 1, 2, 3].map((row) => (
          <group key={row} position={[0, -row * 0.22, row * 1.4]}>
            {[-4.8, -3.5, -2.2, -0.9, 0.5, 1.8, 3.2, 4.5].map((x, col) => {
              // Skip the exact seat where Vinay sits in row 0
              if (row === 0 && Math.abs(x - 0.5) < 0.3) return null;
              const colorIdx = (row * 3 + col) % audienceColors.length;
              const skinIdx = (row * 2 + col) % skinTones.length;
              return (
                <group key={col} position={[x, 0.4, 0]}>
                  {/* Body with varied clothing tones */}
                  <mesh castShadow receiveShadow>
                    <capsuleGeometry args={[0.15, 0.38, 6, 6]} />
                    <meshStandardMaterial
                      color={audienceColors[colorIdx]}
                      roughness={0.65}
                    />
                  </mesh>
                  {/* Head with skin tones */}
                  <mesh position={[0, 0.4, 0]} castShadow>
                    <sphereGeometry args={[0.085, 8, 6]} />
                    <meshStandardMaterial color={skinTones[skinIdx]} roughness={0.5} />
                  </mesh>
                  {/* Hair cap */}
                  <mesh position={[0, 0.43, -0.01]}>
                    <sphereGeometry args={[0.088, 8, 6]} />
                    <meshStandardMaterial color="#1e1e24" roughness={0.8} />
                  </mesh>
                </group>
              );
            })}
          </group>
        ))}
      </group>

      {/* Audience Smartphone Recording Screens */}
      {phoneScreens.map((phone, idx) => (
        <group key={idx} position={phone.pos as [number, number, number]}>
          <mesh rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.08, 0.14]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={phone.color}
              emissiveIntensity={1.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Flashing camera strobe lights during celebration */}
      <group ref={flashGroupRef}>
        {phoneScreens.map((phone, idx) => (
          <pointLight
            key={idx}
            position={[phone.pos[0], phone.pos[1] + 0.1, phone.pos[2]]}
            intensity={0}
            color="#ffffff"
            distance={3.5}
          />
        ))}
      </group>

      {/* ─── 11. AMBIENT STAGE DUST / GOLD PARTICLES ─── */}
      <group>
        {dustParticles.map((d, i) => (
          <mesh
            key={i}
            position={[
              d.pos.x + Math.sin(d.offset) * 0.2,
              d.pos.y,
              d.pos.z,
            ]}
          >
            <sphereGeometry args={[0.018, 4, 4]} />
            <meshBasicMaterial color="#fef08a" opacity={0.45} transparent />
          </mesh>
        ))}
      </group>

      {/* ─── 12. CELEBRATORY GOLDEN CONFETTI PARTICLES ─── */}
      {isWin && (
        <group ref={confettiGroupRef}>
          {confettiData.map((d, i) => (
            <mesh key={i} position={d.pos} rotation={d.rot}>
              <planeGeometry args={[0.09, 0.06]} />
              <meshBasicMaterial color={d.color} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
