/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioService {
  private audioCtx: AudioContext | null = null;
  private ambienceGain: GainNode | null = null;
  private isPlaying = false;

  private levelsStarted = false;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.ambienceGain = this.audioCtx.createGain();
      this.ambienceGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.ambienceGain.connect(this.audioCtx.destination);
    }
  }

  private createNoiseBuffer() {
    if (!this.audioCtx) return null;
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private triggerBirds() {
    if (!this.audioCtx || !this.ambienceGain || !this.isPlaying) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    const baseFreq = 2000 + Math.random() * 2000;
    osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 1000, this.audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, this.audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ambienceGain);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);

    setTimeout(() => this.triggerBirds(), 3000 + Math.random() * 6000);
  }

  private startContinuousLayers() {
    if (!this.audioCtx || !this.ambienceGain || this.levelsStarted) return;
    this.levelsStarted = true;

    // Stream Layer (Filtered Noise with subtle modulation)
    const noise = this.audioCtx.createBufferSource();
    const buffer = this.createNoiseBuffer();
    if (buffer) {
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      const modulation = this.audioCtx.createOscillator();
      const modGain = this.audioCtx.createGain();
      modulation.frequency.value = 0.2;
      modGain.gain.value = 100;
      
      modulation.connect(modGain);
      modGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(this.ambienceGain);
      
      noise.start();
      modulation.start();
    }

    // Soft Piano Pad (Sine harmonics - E-Major Pentatonic)
    [164.81, 220.00, 246.94, 329.63].forEach(f => {
      const osc = this.audioCtx!.createOscillator();
      const g = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0.012;
      osc.connect(g);
      g.connect(this.ambienceGain!);
      osc.start();
    });
  }

  public async startAmbience() {
    this.init();
    if (!this.audioCtx || !this.ambienceGain) return;

    this.startContinuousLayers();
    
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.triggerBirds();
      // Use setTargetAtTime for exponential, pop-free transitions
      this.ambienceGain.gain.setTargetAtTime(0.2, this.audioCtx.currentTime, 0.8);
    }
  }

  public stopAmbience() {
    if (!this.ambienceGain || !this.audioCtx) return;
    this.ambienceGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.6);
    this.isPlaying = false;
  }

  public playStrokeSound() {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  public playEraserSound() {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  public playClearSound() {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  public speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const audioService = new AudioService();
