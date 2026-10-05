/**
 * Procedural Audio Synthesizer for Demo Tracks matching user reference:
 * - "soft spot" by Piri, Tommy Villiers (Liquid D&B / Pop)
 * - "The Devil in I" by Slipknot (Driving Rock / Heavy Riff)
 * - "Wolfcat" by Still Woozy (Chill Indie Pop / Funk)
 * - "Friendly Sex" by Caity Baser (Bouncy Upbeat Pop)
 */

function bufferToWave(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let sampleRate = abuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  const channels: Float32Array[] = [];
  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < abuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}

function m2f(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 1. soft spot - Piri, Tommy Villiers (174 BPM Liquid Drum and Bass)
export async function generateSoftSpotTrack(): Promise<string> {
  const sampleRate = 44100;
  const duration = 22;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
  const bpm = 174;
  const beatSec = 60 / bpm;

  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  // Soft vocal/flute synth melody (F#m / Dmaj7 / A / E)
  const notes = [69, 73, 76, 73, 69, 71, 74, 71, 66, 69, 73, 69, 64, 68, 71, 68];
  const stepTime = beatSec / 2;
  for (let s = 0; s < Math.floor(duration / stepTime); s++) {
    const t = s * stepTime;
    const note = notes[s % notes.length];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(m2f(note + 12), t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + stepTime);
  }

  // D&B Reese bass
  const bassNotes = [42, 42, 38, 38, 45, 45, 40, 40];
  const barSec = beatSec * 4;
  for (let b = 0; b < Math.floor(duration / barSec); b++) {
    const t = b * barSec;
    const note = bassNotes[b % bassNotes.length];
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(m2f(note), t);
    osc2.frequency.setValueAtTime(m2f(note) * 1.01, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.05, t + barSec);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + barSec);
    osc2.stop(t + barSec);
  }

  // D&B Fast Breakbeat (Kick on 1 & 2.5, Snare on 2 & 4)
  for (let b = 0; b < Math.floor(duration / beatSec); b++) {
    const t = b * beatSec;
    // Kick
    if (b % 4 === 0 || b % 4 === 2.5) {
      const kick = ctx.createOscillator();
      const kickG = ctx.createGain();
      kick.frequency.setValueAtTime(140, t);
      kick.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      kickG.gain.setValueAtTime(0.8, t);
      kickG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kick.connect(kickG);
      kickG.connect(master);
      kick.start(t);
      kick.stop(t + 0.15);
    }
  }

  const rendered = await ctx.startRendering();
  return URL.createObjectURL(bufferToWave(rendered));
}

// 2. The Devil in I - Slipknot (Heavy Drop B Rock Riff)
export async function generateDevilInITrack(): Promise<string> {
  const sampleRate = 44100;
  const duration = 20;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
  const bpm = 128;
  const beatSec = 60 / bpm;

  const master = ctx.createGain();
  master.gain.value = 0.65;
  master.connect(ctx.destination);

  // Heavy distorted guitar riff
  const riffNotes = [35, 35, 35, 38, 35, 41, 40, 35, 35, 35, 38, 35, 37, 36];
  const stepTime = beatSec / 2;
  for (let s = 0; s < Math.floor(duration / stepTime); s++) {
    const t = s * stepTime;
    const note = riffNotes[s % riffNotes.length];
    const osc = ctx.createOscillator();
    const dist = ctx.createWaveShaper();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(m2f(note), t);

    // Distortion curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 5) * x) / (Math.PI + 5 * Math.abs(x));
    }
    dist.curve = curve;

    filter.type = 'lowpass';
    filter.frequency.value = 2400;

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.02, t + stepTime * 0.9);

    osc.connect(dist);
    dist.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(t);
    osc.stop(t + stepTime);
  }

  // Rock drums
  for (let b = 0; b < Math.floor(duration / beatSec); b++) {
    const t = b * beatSec;
    // Heavy Kick
    if (b % 2 === 0) {
      const kick = ctx.createOscillator();
      const kickG = ctx.createGain();
      kick.frequency.setValueAtTime(160, t);
      kick.frequency.exponentialRampToValueAtTime(38, t + 0.15);
      kickG.gain.setValueAtTime(0.9, t);
      kickG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      kick.connect(kickG);
      kickG.connect(master);
      kick.start(t);
      kick.stop(t + 0.2);
    }
  }

  const rendered = await ctx.startRendering();
  return URL.createObjectURL(bufferToWave(rendered));
}

// 3. Wolfcat - Still Woozy (Chill Bedroom Pop)
export async function generateWolfcatTrack(): Promise<string> {
  const sampleRate = 44100;
  const duration = 22;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
  const bpm = 95;
  const beatSec = 60 / bpm;

  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  // Warbly Rhodes chords (Emaj7 / G#m7 / Amaj7)
  const chords = [
    [52, 59, 63, 68], // Emaj7
    [56, 59, 63, 66], // G#m7
    [57, 61, 64, 68], // Amaj7
    [54, 57, 61, 66]  // F#m7
  ];

  const barSec = beatSec * 4;
  for (let b = 0; b < Math.floor(duration / barSec); b++) {
    const chord = chords[b % chords.length];
    const t = b * barSec;
    chord.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      // subtle vibrato
      osc.frequency.setValueAtTime(m2f(note), t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + barSec * 0.95);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + barSec);
    });
  }

  const rendered = await ctx.startRendering();
  return URL.createObjectURL(bufferToWave(rendered));
}

// 4. golden hour - JVKE (Emotional cinematic piano arpeggios & warm bass)
export async function generateGoldenHourTrack(): Promise<string> {
  const sampleRate = 44100;
  const duration = 24;
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
  const bpm = 94;
  const beatSec = 60 / bpm;

  const master = ctx.createGain();
  master.gain.value = 0.75;
  master.connect(ctx.destination);

  // Iconic arpeggiated piano progression: Eb -> Gm -> Ab -> Fm
  const chords = [
    [51, 55, 58, 63, 67, 70], // Ebmaj
    [50, 55, 58, 62, 67, 70], // Gm/D
    [44, 48, 51, 56, 60, 63], // Abmaj
    [41, 44, 48, 53, 56, 60], // Fm
  ];

  const barSec = beatSec * 4;
  for (let b = 0; b < Math.floor(duration / barSec); b++) {
    const chord = chords[b % chords.length];
    const barStart = b * barSec;
    const rootNote = chord[0];

    // Deep warm piano bass
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(m2f(rootNote - 12), barStart);
    bassGain.gain.setValueAtTime(0.4, barStart);
    bassGain.gain.exponentialRampToValueAtTime(0.01, barStart + barSec * 0.95);
    bassOsc.connect(bassGain);
    bassGain.connect(master);
    bassOsc.start(barStart);
    bassOsc.stop(barStart + barSec);

    // Fast glittering 16th note piano arpeggios
    const arpeggioNotes = [...chord.slice(1), ...chord.slice(1).reverse()];
    const step = barSec / 16;
    for (let s = 0; s < 16; s++) {
      const t = barStart + s * step;
      const note = arpeggioNotes[s % arpeggioNotes.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m2f(note), t);
      
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + step * 1.8);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + step * 2);
    }
  }

  const rendered = await ctx.startRendering();
  return URL.createObjectURL(bufferToWave(rendered));
}

// Backwards compatibility alias
export const generateFriendlySexTrack = generateGoldenHourTrack;

// Tactile Click
let clickAudioCtx: AudioContext | null = null;
export function playTactileClick() {
  try {
    if (!clickAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      clickAudioCtx = new AudioCtxClass();
    }
    if (clickAudioCtx.state === 'suspended') {
      clickAudioCtx.resume();
    }
    const t = clickAudioCtx.currentTime;
    const osc = clickAudioCtx.createOscillator();
    const gain = clickAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(clickAudioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  } catch {
    // Ignore
  }
}
