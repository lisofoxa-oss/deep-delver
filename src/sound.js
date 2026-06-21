/**
 * Simple Web Audio sound manager.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Play a tone of given frequency and duration.
 */
function playTone(freq, duration, type = 'square', volume = 0.1) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio not available
  }
}

export const SFX = {
  hit() { playTone(120, 0.08, 'square', 0.08); },
  kill() { playTone(200, 0.15, 'sawtooth', 0.06); playTone(100, 0.2, 'sawtooth', 0.05); },
  playerHit() { playTone(80, 0.12, 'square', 0.1); },
  pickup() { playTone(440, 0.06, 'sine', 0.08); playTone(660, 0.06, 'sine', 0.06); },
  levelUp() { playTone(523, 0.1, 'sine', 0.08); setTimeout(() => playTone(659, 0.1, 'sine', 0.08), 100); setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 200); },
  stairs() { playTone(300, 0.2, 'triangle', 0.07); setTimeout(() => playTone(400, 0.2, 'triangle', 0.06), 150); },
  death() { playTone(200, 0.3, 'sawtooth', 0.08); setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.06), 200); },
  heal() { playTone(400, 0.1, 'sine', 0.07); setTimeout(() => playTone(600, 0.15, 'sine', 0.06), 80); },
};

/**
 * Resume audio context (must be called from user gesture).
 */
export function resumeAudio() {
  try { getCtx().resume(); } catch {}
}
