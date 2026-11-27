// Synthesised sound: every effect is a WebAudio oscillator envelope, so
// the game ships no audio files and plays with zero network requests.
// Created lazily on the first user gesture (browsers require that).
export function createSoundBank() {
  let audioContext = null;
  let muted = false;

  function context() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(freqStart, freqEnd, durationSec, type, volume) {
    if (muted) return;
    const ctx = context();
    if (!ctx) return;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freqStart, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + durationSec);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + durationSec + 0.02);
  }

  function gobble() {
    // A turkey gobble: three fast descending blips.
    tone(320, 180, 0.09, 'sawtooth', 0.12);
    setTimeout(() => tone(300, 160, 0.09, 'sawtooth', 0.12), 90);
    setTimeout(() => tone(280, 120, 0.14, 'sawtooth', 0.14), 180);
  }

  return {
    unlock() { context(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    jump() { tone(280, 620, 0.16, 'sine', 0.16); },
    flap() { tone(420, 760, 0.12, 'triangle', 0.12); },
    corn() { tone(880, 1320, 0.1, 'sine', 0.14); },
    feather() { tone(660, 990, 0.12, 'sine', 0.14); setTimeout(() => tone(990, 1480, 0.14, 'sine', 0.12), 110); },
    thud() { tone(160, 60, 0.22, 'square', 0.18); },
    spotted() { tone(520, 260, 0.3, 'sawtooth', 0.14); },
    hide() { tone(500, 900, 0.18, 'triangle', 0.1); },
    caught() {
      tone(392, 392, 0.16, 'square', 0.16);
      setTimeout(() => tone(311, 311, 0.16, 'square', 0.16), 160);
      setTimeout(() => tone(233, 150, 0.4, 'square', 0.18), 320);
    },
    escaped() {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => tone(freq, freq, 0.22, 'triangle', 0.16), i * 130);
      });
    },
    gobble,
  };
}
