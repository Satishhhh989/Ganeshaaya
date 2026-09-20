/**
 * Zero-dependency Web Audio API Engine
 * Produces ambient Indian Tanpura drone, temple bell resonance, footsteps, speech cues,
 * and audio hooks for scene background music, narration, and sound effects.
 */

export interface StoryAudioHooks {
  bgm?: string;
  ambient?: string;
  sfx?: string;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private isDronePlaying: boolean = false;
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private currentBgmAudio: HTMLAudioElement | null = null;
  private currentAmbientAudio: HTMLAudioElement | null = null;
  private currentSfxAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.45;
      this.droneGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
    if (this.currentVoiceAudio) this.currentVoiceAudio.muted = muted;
    if (this.currentBgmAudio) this.currentBgmAudio.muted = muted;
    if (this.currentAmbientAudio) this.currentAmbientAudio.muted = muted;
    if (this.currentSfxAudio) this.currentSfxAudio.muted = muted;
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(muted ? 0 : 0.45, this.ctx.currentTime);
    }
    if (this.currentBgmAudio) this.currentBgmAudio.muted = muted;
    if (this.currentAmbientAudio) this.currentAmbientAudio.muted = muted;
  }

  toggleMusic(): boolean {
    this.setMusicMuted(!this.isMusicMuted);
    return this.isMusicMuted;
  }

  getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  setSfxMuted(muted: boolean) {
    this.isSfxMuted = muted;
    if (this.currentSfxAudio) this.currentSfxAudio.muted = muted;
  }

  toggleSfx(): boolean {
    this.setSfxMuted(!this.isSfxMuted);
    return this.isSfxMuted;
  }

  getSfxMuted(): boolean {
    return this.isSfxMuted;
  }

  // Smoothly adjust ambient/drone volume (e.g. decrease during transitions)
  fadeAmbientVolume(targetVolume: number, durationSec: number = 2.0) {
    this.initContext();
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;
    this.droneGain.gain.cancelScheduledValues(now);
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(Math.max(0, targetVolume), now + durationSec);
  }

  // Atmospheric meditative Tanpura drone
  startAmbientMusic() {
    if (this.isDronePlaying) return;
    this.initContext();
    if (!this.ctx || !this.droneGain) return;

    this.isDronePlaying = true;
    const now = this.ctx.currentTime;

    // Tanpura frequencies: Pa (G2 ~ 98Hz), Sa (C3 ~ 130.81Hz), high Sa (C4 ~ 261.63Hz)
    const freqs = [65.4, 98.0, 130.81, 196.0, 261.63];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.droneGain) return;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle LFO for breathing warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12 + idx * 0.04, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(osc.detune);
      lfo.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 60, now);

      gain.gain.setValueAtTime(0.08 / (idx + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain);

      osc.start();
    });
  }

  // Temple bell / ghanti chime on interaction
  playTempleBell() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const partials = [
      { f: 587.33, g: 0.35, d: 2.8 }, // D5 fundamental
      { f: 1174.66, g: 0.22, d: 2.2 },
      { f: 1620.0, g: 0.15, d: 1.6 },
      { f: 2350.0, g: 0.08, d: 1.2 },
    ];

    partials.forEach((p) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(p.g, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + p.d);
    });
  }

  // Very subtle, delicate brass bell chime on menu hover
  playHoverChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // High delicate glass/brass ping (A6)
    osc.frequency.exponentialRampToValueAtTime(1560, now + 0.18);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Deep divine transition swell sound
  playTransitionSwell() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 3.0);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(164.81, now);
    osc2.frequency.exponentialRampToValueAtTime(329.63, now + 3.0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 2.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.6);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.7);
    osc2.stop(now + 3.7);
  }

  // Divine awakening pulse sound for Scene 4
  playDivineAwakeningPulse() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25]; // C major divine shimmer

    chord.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.05 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 2.5);
    });
  }

  // Distant thunder / Damru rumble for Scene 7
  playDistantThunderDamru() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(48, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 3.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 3.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 4.0);
  }

  // Powerful Trishul throw whoosh sound
  playTrishulWhoosh() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Swept oscillator for resonant air slice
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.55);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(950, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.55);
    filter.Q.value = 3.0;

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.35, now + 0.12);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);

    // Filtered noise burst for weapon friction
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(600, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 0.35);
      noiseFilter.Q.value = 1.8;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.22, now + 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.4);
    } catch {
      // Fallback safe
    }
  }

  // Deep divine cinematic impact sound (non-violent, sacred sub-bass and celestial bloom)
  playTrishulImpact() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Sub-bass heavy thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 1.3);

    // Divine golden chime shimmer on contact
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.1);
    });
  }

  // Trishul striking mountain rock on miss
  playTrishulMiss() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Subtle aim focus feedback chime
  playAimFocus() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Majestic sacred elephant trumpet & harmonic resonance call
  playElephantCall(intensity: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const duration = 1.6;

    // Dual vocal-tract oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Trumpet pitch bend envelope
    const baseFreq = 140;
    const peakFreq = 340;
    const endFreq = 160;

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    osc2.frequency.setValueAtTime(baseFreq * 0.98, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 0.98, now + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 0.98, now + duration);

    // Resonant formant filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(820, now + 0.4);
    filter.frequency.linearRampToValueAtTime(400, now + duration);
    filter.Q.value = 2.8;

    const vol = Math.min(0.35, Math.max(0.05, 0.22 * intensity));
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.25);
    gain.gain.setValueAtTime(vol, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Subtle clue discovery chime
  playClueDiscovered() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);
  }

  // Deep, peaceful elephant breathing sound
  playElephantBreath() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.linearRampToValueAtTime(280, now + 1.1);
    filter.frequency.linearRampToValueAtTime(140, now + 2.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 2.2);
  }

  // Subtle branch/leaf rustle
  playFoliageRustle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.35);
  }

  // Footstep sound (distinguishes running vs walking pacing and tone)
  playFootstep(isRunning: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isSfxMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isRunning ? 'triangle' : 'sine';
    const startFreq = isRunning ? 95 : 75;
    const endFreq = isRunning ? 42 : 32;
    const duration = isRunning ? 0.07 : 0.09;
    const volume = isRunning ? 0.16 : 0.11;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isRunning ? 290 : 220, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Keyboard typing click for development console
  playKeyboardType() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const freq = 1200 + Math.random() * 600;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Diya wick lighting sound: soft flame ignition & sizzle
  playDiyaLighting() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Gentle sitting rustle sound
  playGentleSit() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Dialogue speech blip
  playSpeechBlip(speaker: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const isChild = speaker === 'Child';
    const freq = isChild ? 440 + Math.random() * 40 : 170 + Math.random() * 20;

    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // UI button click
  playUIClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Celebratory victory chime (for competition win / prize received)
  playCelebrationChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.1);
    });
  }

  // Mechanical keyboard typing click
  playKeyboardClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const randFreq = 1800 + (Math.random() - 0.5) * 600;
    osc.frequency.setValueAtTime(randFreq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(randFreq, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Compiler success chime
  playCompileSuccess() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
    chord.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.85);
    });
  }

  // Tension heartbeat / suspense pulse for competition
  playSuspensePulse() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Crowd cheer / auditorium applause
  playCrowdApplause() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Generate soft bursts resembling audience applause
    for (let i = 0; i < 12; i++) {
      const burstTime = now + i * 0.18 + Math.random() * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200 + Math.random() * 400, burstTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 600, burstTime);

      gain.gain.setValueAtTime(0.001, burstTime);
      gain.gain.linearRampToValueAtTime(0.08, burstTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, burstTime + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(burstTime);
      osc.stop(burstTime + 0.55);
    }
  }


  // Comprehensive Story Audio Hooks: handles scene bgm, ambient, and sfx
  playStoryAudioHooks(hooks?: StoryAudioHooks) {
    if (!hooks) return;

    if (hooks.sfx) {
      this.playAudioFile(hooks.sfx, 'sfx');
    }
    if (hooks.bgm) {
      this.playAudioFile(hooks.bgm, 'bgm');
    }
    if (hooks.ambient) {
      this.playAudioFile(hooks.ambient, 'ambient');
    }
  }

  // Pandal crafting sound: wooden bamboo knocks
  playWoodCraft() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [0, 0.12, 0.22].forEach((offset, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + idx * 40, now + offset);
      osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.08);

      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    });
  }

  // Festive cloth drapery rustle
  playFabricRustle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Marigold & flower placement chime
  playFloralChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.16, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.65);
    });
  }

  // Fairy lights electric shimmer & ignite
  playLightsIgnite() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Initial soft warm surge
    const buzz = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(120, now);
    buzzGain.gain.setValueAtTime(0.04, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    buzz.connect(buzzGain);
    buzzGain.connect(this.masterGain);
    buzz.start(now);
    buzz.stop(now + 0.2);

    // Followed by shimmering ascending chords
    const chord = [440, 554.37, 659.25, 880, 1108.73];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.05);

      gain.gain.setValueAtTime(0.14, now + 0.1 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + idx * 0.05 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + 0.1 + idx * 0.05);
      osc.stop(now + 0.1 + idx * 0.05 + 1.25);
    });
  }

  // Sacred brass temple ghanti arti bell
  playSacredArtiBell() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const partials = [
      { freq: 880, gain: 0.28, decay: 2.2 },
      { freq: 1760, gain: 0.16, decay: 1.6 },
      { freq: 2640, gain: 0.08, decay: 1.1 },
      { freq: 3520, gain: 0.04, decay: 0.8 },
    ];

    partials.forEach(({ freq, gain: vol, decay }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  }

  // Authentic festive Dhol-Tasha percussion rhythm
  playDholTashaBeat() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Dhol deep bass strikes + Tasha sharp clatter
    const beats = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
    beats.forEach((offset, idx) => {
      if (!this.ctx || !this.masterGain) return;

      // Deep Dhol bass
      const dholOsc = this.ctx.createOscillator();
      const dholGain = this.ctx.createGain();
      dholOsc.type = 'sine';
      dholOsc.frequency.setValueAtTime(idx % 2 === 0 ? 80 : 100, now + offset);
      dholOsc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.12);

      dholGain.gain.setValueAtTime(0.28, now + offset);
      dholGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

      dholOsc.connect(dholGain);
      dholGain.connect(this.masterGain);
      dholOsc.start(now + offset);
      dholOsc.stop(now + offset + 0.16);

      // Sharp Tasha rim crack
      const tashaOsc = this.ctx.createOscillator();
      const tashaFilter = this.ctx.createBiquadFilter();
      const tashaGain = this.ctx.createGain();

      tashaOsc.type = 'triangle';
      tashaOsc.frequency.setValueAtTime(450 + (idx % 3) * 120, now + offset + 0.04);

      tashaFilter.type = 'bandpass';
      tashaFilter.frequency.setValueAtTime(1600, now + offset + 0.04);
      tashaFilter.Q.value = 4;

      tashaGain.gain.setValueAtTime(0.18, now + offset + 0.04);
      tashaGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

      tashaOsc.connect(tashaFilter);
      tashaFilter.connect(tashaGain);
      tashaGain.connect(this.masterGain);

      tashaOsc.start(now + offset + 0.04);
      tashaOsc.stop(now + offset + 0.1);
    });
  }

  // Auspicious Shehnai melodic motif
  playShehnaiMelody() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Raga Bilawal / Bhupali auspicious notes: Sa, Re, Ga, Pa, Dha
    const notes = [
      { freq: 523.25, time: 0, dur: 0.28 },
      { freq: 587.33, time: 0.25, dur: 0.26 },
      { freq: 659.25, time: 0.5, dur: 0.35 },
      { freq: 783.99, time: 0.85, dur: 0.45 },
      { freq: 659.25, time: 1.3, dur: 0.25 },
      { freq: 523.25, time: 1.55, dur: 0.7 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Nasal rich reed tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.12, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  // Devotional chorus harmony & temple bells
  playDevotionalChorus() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    this.playSacredArtiBell();
    setTimeout(() => this.playShehnaiMelody(), 250);
  }

  // Diya lighting flame chime
  playDiyaLightChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.3); // E6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }
  playNarrationAudio(url?: string) {
    if (!url) return;
    this.playAudioFile(url, 'voice');
  }

  // Safely play an external audio file with fallback
  private playAudioFile(url: string, channel: 'voice' | 'bgm' | 'ambient' | 'sfx', onEnded?: () => void) {
    if (this.isMuted || !url) return;

    try {
      const audio = new Audio(url);
      audio.volume = this.masterGain ? this.masterGain.gain.value : 0.8;
      audio.muted = this.isMuted;

      if (channel === 'voice') {
        this.stopVoiceLine();
        if (onEnded) {
          audio.onended = () => {
            onEnded();
          };
        }
        this.currentVoiceAudio = audio;
      } else if (channel === 'bgm') {
        if (this.currentBgmAudio) {
          this.currentBgmAudio.pause();
        }
        audio.loop = true;
        this.currentBgmAudio = audio;
      }

      audio.play().catch(() => {
        // Graceful fallback if audio file is not present on disk yet
      });
    } catch {
      // Safe fallback
    }
  }

  // ─── DYNAMIC SCENE AMBIENCE ENGINE ───
  private currentAmbienceType: 'HOME' | 'MYTHOLOGY' | 'GAME_DEV' | 'COMPETITION' | 'GANESH_CHATURTHI' | null = null;
  private ambienceActiveGains: GainNode[] = [];
  private ambienceIntervals: number[] = [];

  setSceneAmbience(type: 'HOME' | 'MYTHOLOGY' | 'GAME_DEV' | 'COMPETITION' | 'GANESH_CHATURTHI') {
    if (this.currentAmbienceType === type) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentAmbienceType = type;
    const now = this.ctx.currentTime;
    const fadeDuration = 1.6;

    // Fade out previous ambience nodes
    this.ambienceActiveGains.forEach((gain) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      } catch {
        // Safe ignore
      }
    });

    // Clear any active intervals for procedural background triggers (e.g. key clicks, distant bells)
    this.ambienceIntervals.forEach((id) => clearInterval(id));
    this.ambienceIntervals = [];

    // Create new ambience gain node
    const groupGain = this.ctx.createGain();
    groupGain.gain.setValueAtTime(0.0001, now);
    groupGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);
    groupGain.connect(this.masterGain);

    this.ambienceActiveGains = [groupGain];

    switch (type) {
      case 'HOME':
        this.startHomeAmbience(groupGain);
        break;
      case 'MYTHOLOGY':
        this.startMythologyAmbience(groupGain);
        break;
      case 'GAME_DEV':
        this.startGameDevAmbience(groupGain);
        break;
      case 'COMPETITION':
        this.startCompetitionAmbience(groupGain);
        break;
      case 'GANESH_CHATURTHI':
        this.startGaneshChaturthiAmbience(groupGain);
        break;
    }
  }

  // 1. HOME: Ceiling fan hum, room acoustic tone, subtle wood warmth
  private startHomeAmbience(parentGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Ceiling fan dual motor tone
    [62, 124].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(idx === 0 ? 0.08 : 0.04, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(parentGain);

      osc.start(now);
    });

    // Room air presence
    this.createNoiseTrack(parentGain, 160, 'lowpass', 0.04);
  }

  // 2. MYTHOLOGY: Resonant Tanpura drone, Himalayan mountain wind, celestial harmonics
  private startMythologyAmbience(parentGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Tanpura frequencies: Sa, Pa, high Sa
    const freqs = [65.4, 98.0, 130.81, 196.0, 261.63];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.045, now);

      // Subtle LFO detune for breathing warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.03, now);
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(osc.detune);
      lfo.start(now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(parentGain);

      osc.start(now);
    });

    // Sacred mountain wind
    this.createNoiseTrack(parentGain, 420, 'bandpass', 0.06);
  }

  // 3. GAME DEVELOPMENT: Computer fan hum, subtle keyboard taps, mouse clicks
  private startGameDevAmbience(parentGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Computer cooling fan
    const fanOsc = this.ctx.createOscillator();
    const fanFilter = this.ctx.createBiquadFilter();
    const fanGain = this.ctx.createGain();

    fanOsc.type = 'triangle';
    fanOsc.frequency.setValueAtTime(118, now);

    fanFilter.type = 'lowpass';
    fanFilter.frequency.setValueAtTime(320, now);

    fanGain.gain.setValueAtTime(0.035, now);

    fanOsc.connect(fanFilter);
    fanFilter.connect(fanGain);
    fanGain.connect(parentGain);
    fanOsc.start(now);

    this.createNoiseTrack(parentGain, 800, 'bandpass', 0.02);

    // Subtle intermittent keyboard typing taps in background
    const keyInterval = window.setInterval(() => {
      if (this.currentAmbienceType !== 'GAME_DEV' || Math.random() > 0.4) return;
      this.playKeyStrokeSound();
    }, 2800);
    this.ambienceIntervals.push(keyInterval);
  }

  // 4. COMPETITION: Auditorium hall murmur, stage presence, acoustics
  private startCompetitionAmbience(parentGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Hall acoustics low rumble
    const hallOsc = this.ctx.createOscillator();
    const hallGain = this.ctx.createGain();
    hallOsc.type = 'sine';
    hallOsc.frequency.setValueAtTime(74, now);
    hallGain.gain.setValueAtTime(0.04, now);
    hallOsc.connect(hallGain);
    hallGain.connect(parentGain);
    hallOsc.start(now);

    // Auditorium crowd murmur
    this.createNoiseTrack(parentGain, 480, 'bandpass', 0.08);
  }

  // 5. GANESH CHATURTHI: Festive crowd, distant bells, dhol warmth, devotional atmosphere
  private startGaneshChaturthiAmbience(parentGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep festive dhol undertone
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(55, now);
    bassGain.gain.setValueAtTime(0.05, now);
    bassOsc.connect(bassGain);
    bassGain.connect(parentGain);
    bassOsc.start(now);

    // Festive crowd chatter murmur
    this.createNoiseTrack(parentGain, 650, 'bandpass', 0.09);

    // Periodic gentle sacred bell resonance
    const bellInterval = window.setInterval(() => {
      if (this.currentAmbienceType !== 'GANESH_CHATURTHI') return;
      this.playSacredArtiBell();
    }, 14000);
    this.ambienceIntervals.push(bellInterval);
  }

  // Helper to generate seamless looping noise tracks (wind, crowd, fan)
  private createNoiseTrack(
    parentGain: GainNode,
    cutoffFreq: number,
    filterType: BiquadFilterType,
    volume: number
  ) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise filter
      lastOut = data[i];
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(cutoffFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(parentGain);

    noise.start();
  }

  playKeyStrokeSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + Math.random() * 200, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  private currentVoiceUrl: string | null = null;

  /**
   * Play a voice line with natural audio.ended callback.
   * Ensures single source of truth, cancels prior playback cleanly,
   * prevents duplicate playback across React re-renders, and logs dev warnings if missing.
   */
  playVoiceLine(audioUrl?: string, onEnded?: () => void): HTMLAudioElement | null {
    if (!audioUrl) return null;

    // Deduplication guard: if this exact voice clip is already playing and active, don't restart it
    if (this.currentVoiceAudio && this.currentVoiceUrl === audioUrl && !this.currentVoiceAudio.paused && !this.currentVoiceAudio.ended) {
      return this.currentVoiceAudio;
    }

    this.stopVoiceLine();
    this.currentVoiceUrl = audioUrl;

    try {
      const audio = new Audio(audioUrl);
      audio.volume = this.masterGain ? this.masterGain.gain.value : 0.85;
      audio.muted = this.isMuted;

      let hasEnded = false;
      const handleEnded = () => {
        if (hasEnded) return;
        hasEnded = true;
        audio.onended = null;
        if (this.currentVoiceAudio === audio) {
          this.currentVoiceAudio = null;
          this.currentVoiceUrl = null;
        }
        if (onEnded) {
          onEnded();
        }
      };

      audio.onended = handleEnded;

      audio.onerror = () => {
        console.warn(`[AudioManager] Voice audio failed to load: ${audioUrl}`);
        if (this.currentVoiceAudio === audio) {
          this.currentVoiceAudio = null;
          this.currentVoiceUrl = null;
        }
      };

      this.currentVoiceAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Check if abort was intentional due to rapid transition
          if (err.name !== 'AbortError') {
            console.warn(`[AudioManager] Playback prevented for ${audioUrl}:`, err);
          }
        });
      }

      return audio;
    } catch (err) {
      console.warn(`[AudioManager] Error initializing audio for ${audioUrl}:`, err);
      return null;
    }
  }

  stopVoiceLine() {
    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.onended = null;
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentVoiceAudio = null;
      this.currentVoiceUrl = null;
    }
  }

  getCurrentVoiceUrl(): string | null {
    return this.currentVoiceUrl;
  }
}

export const audioManager = new AudioManager();
