export type CeremonyBeat =
  | 'AUDITORIUM_ESTABLISHING' // Shot 1: Wide establishing shot of auditorium, looking around
  | 'STAGE_AWAKENING'        // Shot 2: Spotlights flare, screen powers up: "N-I-A-T GRAND FINALE 2024"
  | 'HOST_WELCOME'           // Shot 3: Host speaks from podium: "Ladies & gentlemen, welcome..."
  | 'VINAY_IN_AUDIENCE'      // Shot 4: Cut to Vinay seated, nervous & hopeful, reflecting stage glow
  | 'FINALISTS_THEME'        // Shot 5: Screen reveals "Theme: Indian Heritage & Ancient Lore · Top 3 Finalists"
  | 'SUSPENSE_TENSION'       // Shot 6: Lights dim slightly, suspense swell, screen: "AND THE WINNER IS..."
  | 'WINNER_REVEAL'          // Shot 7: Light sweep, confetti explosion, screen: "THE LEGEND OF VINAYAKA · VINAY"
  | 'VINAY_CELEBRATION'      // Shot 8: Vinay stands up in shock & joy, radiant golden halo, audience erupts
  | 'PRIZE_AWARD'            // Shot 9: Screen reveals ₹15,000 grant, Vinay takes stage center, host announces
  | 'CEREMONY_COMPLETE';     // Shot 10: Celebration breathes, crowd warm applause, ready to return home

export interface SubtitleData {
  speaker: string;
  text: string;
  duration?: number;
}

export const CEREMONY_SUBTITLES: Record<CeremonyBeat, SubtitleData | null> = {
  AUDITORIUM_ESTABLISHING: null,
  STAGE_AWAKENING: {
    speaker: 'HOST',
    text: '“Ladies and gentlemen... Welcome to the N-I-A-T Championship Grand Finale.”',
  },
  HOST_WELCOME: {
    speaker: 'HOST',
    text: '“Tonight, we celebrate the ideas, stories, and games created by the next generation of creators.”',
  },
  VINAY_IN_AUDIENCE: {
    speaker: 'HOST',
    text: '“Over three hundred fifty student creators submitted their dreams from across the country.”',
  },
  FINALISTS_THEME: {
    speaker: 'HOST',
    text: '“Our theme: Indian Heritage & Ancient Lore. Three outstanding finalists reached this grand stage.”',
  },
  SUSPENSE_TENSION: {
    speaker: 'HOST',
    text: '“And now, after rigorous scoring by our national jury... The 2024 First Place Winner is...”',
  },
  WINNER_REVEAL: {
    speaker: 'HOST',
    text: '“THE LEGEND OF VINAYAKA — created by Vinay!”',
  },
  VINAY_CELEBRATION: {
    speaker: 'HOST',
    text: '“A breathtaking journey capturing the eternal spirit of Lord Ganesha, devotion, and living tradition!”',
  },
  PRIZE_AWARD: {
    speaker: 'HOST',
    text: '“Awarded the official National Production Grant of ₹15,000 to bring this cultural vision to life!”',
  },
  CEREMONY_COMPLETE: {
    speaker: 'VINAY',
    text: '“We did it, Dada... Bappa’s pandal will shine brighter than ever before.”',
  },
};

export const BEAT_ORDER: CeremonyBeat[] = [
  'AUDITORIUM_ESTABLISHING',
  'STAGE_AWAKENING',
  'HOST_WELCOME',
  'VINAY_IN_AUDIENCE',
  'FINALISTS_THEME',
  'SUSPENSE_TENSION',
  'WINNER_REVEAL',
  'VINAY_CELEBRATION',
  'PRIZE_AWARD',
  'CEREMONY_COMPLETE',
];

export const BEAT_DURATIONS: Record<CeremonyBeat, number> = {
  AUDITORIUM_ESTABLISHING: 7.5,
  STAGE_AWAKENING: 7.0,
  HOST_WELCOME: 7.5,
  VINAY_IN_AUDIENCE: 7.0,
  FINALISTS_THEME: 8.0,
  SUSPENSE_TENSION: 8.0,
  WINNER_REVEAL: 8.5,
  VINAY_CELEBRATION: 8.0,
  PRIZE_AWARD: 9.0,
  CEREMONY_COMPLETE: 6.5,
};

class CompetitionCeremonyStore {
  private currentBeat: CeremonyBeat = 'AUDITORIUM_ESTABLISHING';
  private beatTime: number = 0;
  private listeners: Set<() => void> = new Set();

  getBeat(): CeremonyBeat {
    return this.currentBeat;
  }

  getBeatTime(): number {
    return this.beatTime;
  }

  getBeatIndex(): number {
    return BEAT_ORDER.indexOf(this.currentBeat);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  setBeat(beat: CeremonyBeat) {
    if (this.currentBeat !== beat) {
      this.currentBeat = beat;
      this.beatTime = 0;
      this.notify();
    }
  }

  advanceBeat(): boolean {
    const currentIndex = BEAT_ORDER.indexOf(this.currentBeat);
    if (currentIndex < BEAT_ORDER.length - 1) {
      this.setBeat(BEAT_ORDER[currentIndex + 1]);
      return true;
    }
    return false;
  }

  tick(delta: number) {
    this.beatTime += delta;
    const duration = BEAT_DURATIONS[this.currentBeat];
    if (duration && this.beatTime >= duration) {
      this.advanceBeat();
    }
  }

  reset() {
    this.currentBeat = 'AUDITORIUM_ESTABLISHING';
    this.beatTime = 0;
    this.notify();
  }
}

export const competitionCeremonyStore = new CompetitionCeremonyStore();

import { useSyncExternalStore } from 'react';

export function useCompetitionCeremony(): CeremonyBeat {
  return useSyncExternalStore(
    (cb) => competitionCeremonyStore.subscribe(cb),
    () => competitionCeremonyStore.getBeat()
  );
}
