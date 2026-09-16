/**
 * Zero-dependency Web Audio API Engine
 * Produces ambient Indian Tanpura drone, temple bell resonance, footsteps, and speech cues.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private isDronePlaying: boolean = false;
  private currentVoiceAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
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
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Bell partials (fundamental and non-harmonic overtones)
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

  // Footstep sound on wooden/carpet floor
  playFootstep() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Low thump with gentle noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
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

  // External audio file hook for voice acting
  playVoiceLine(audioUrl: string) {
    if (this.isMuted || !audioUrl) return;
    try {
      this.stopVoiceLine();
      this.currentVoiceAudio = new Audio(audioUrl);
      this.currentVoiceAudio.volume = this.masterGain ? this.masterGain.gain.value : 0.8;
      this.currentVoiceAudio.play().catch(() => {
        // Safe fallback if audio file not yet present or blocked by browser policy
      });
    } catch {
      // Safe fallback
    }
  }

  stopVoiceLine() {
    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio = null;
      } catch {
        // Ignore
      }
    }
  }
}

export const audioManager = new AudioManager();
