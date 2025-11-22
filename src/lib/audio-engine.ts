"use client";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5; // Default volume
      }
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        mute ? 0 : 0.5,
        this.ctx?.currentTime || 0
      );
    }
  }

  // --- Piano Synthesis ---
  public playPianoNote(frequency: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Triangle wave sounds slightly more like a piano than sine
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, t);

    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.02); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5); // Decay

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.5);
  }

  // --- Tabla Synthesis ---
  public playTablaSound(type: "dha" | "tin" | "ke" | "na") {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;

    if (type === "dha" || type === "na") {
      // High pitched metallic sound (Na)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(type === "na" ? 3000 : 150, t);
      
      // Pitch envelope for "Dha" (bass slide)
      if (type === "dha") {
         osc.type = "sine";
         osc.frequency.setValueAtTime(150, t);
         osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
      }

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (type === "dha" ? 0.5 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    }
    
    if (type === "ke" || type === "tin") {
      // Muted / Resonant sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type === "ke" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(type === "ke" ? 100 : 400, t);
      
      gain.gain.setValueAtTime(type === "ke" ? 0.3 : 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }
}

export const soundEngine = new SoundEngine();

// Helper frequencies for C Major Scale
export const PIANO_NOTES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};
