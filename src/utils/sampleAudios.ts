import { AudioResource } from '../types';

/**
 * Helper to compute downsampled peaks from AudioBuffer
 */
export function extractPeaks(buffer: AudioBuffer, numPeaks: number = 200): number[] {
  const channelData = buffer.getChannelData(0);
  const step = Math.ceil(channelData.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step && start + j < channelData.length; j++) {
      const val = Math.abs(channelData[start + j]);
      if (val > max) max = val;
    }
    peaks.push(max);
  }
  return peaks;
}

/**
 * Converts AudioBuffer to WAV data URL for storing in .ALI projects
 */
export function audioBufferToWavDataUrl(buffer: AudioBuffer): string {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset++, str.charCodeAt(i));
    }
  }

  /* RIFF identifier */
  writeString('RIFF');
  /* RIFF chunk length */
  view.setUint32(offset, length - 8, true);
  offset += 4;
  /* RIFF type */
  writeString('WAVE');
  /* format chunk identifier */
  writeString('fmt ');
  /* format chunk length */
  view.setUint32(offset, 16, true);
  offset += 4;
  /* sample format (raw) */
  view.setUint16(offset, 1, true);
  offset += 2;
  /* channel count */
  view.setUint16(offset, numOfChan, true);
  offset += 2;
  /* sample rate */
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  /* byte rate (sample rate * block align) */
  view.setUint32(offset, sampleRate * 2 * numOfChan, true);
  offset += 4;
  /* block align (channel count * bytes per sample) */
  view.setUint16(offset, numOfChan * 2, true);
  offset += 2;
  /* bits per sample */
  view.setUint16(offset, 16, true);
  offset += 2;
  /* data chunk identifier */
  writeString('data');
  /* data chunk length */
  view.setUint32(offset, length - offset - 4, true);
  offset += 4;

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let sample = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      sample = Math.max(-1, Math.min(1, channels[ch][i])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  const blob = new Blob([outBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Synthesizes default sample audios so user immediately has playable items
 */
export async function createDefaultSampleAudios(audioCtx: AudioContext): Promise<AudioResource[]> {
  const sampleRate = audioCtx.sampleRate;

  // 1. Oveja_Minecraft.mp3 (Funny synthesized baa sound effect)
  const duration1 = 2.5;
  const length1 = Math.floor(sampleRate * duration1);
  const buffer1 = audioCtx.createBuffer(1, length1, sampleRate);
  const data1 = buffer1.getChannelData(0);
  for (let i = 0; i < length1; i++) {
    const t = i / sampleRate;
    // Vibrato pitch drop baaaa
    const freq = 180 + Math.sin(t * 25) * 15 - t * 20;
    const env = Math.exp(-t * 0.8) * Math.min(1, t * 20);
    const wave = (Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(4 * Math.PI * freq * t)) * 0.4;
    data1[i] = wave * env;
  }

  // 2. Musica_Fondo.mp3 (Calm chord progression)
  const duration2 = 8.0;
  const length2 = Math.floor(sampleRate * duration2);
  const buffer2 = audioCtx.createBuffer(2, length2, sampleRate);
  const left2 = buffer2.getChannelData(0);
  const right2 = buffer2.getChannelData(1);
  const chordFreqs = [
    [261.63, 329.63, 392.0], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66], // G
  ];
  for (let i = 0; i < length2; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor(t / 2.0) % chordFreqs.length;
    const freqs = chordFreqs[chordIdx];
    let valL = 0;
    let valR = 0;
    freqs.forEach((f, idx) => {
      const pulse = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
      valL += pulse * (idx % 2 === 0 ? 0.3 : 0.15);
      valR += pulse * (idx % 2 === 1 ? 0.3 : 0.15);
    });
    const subLfo = 0.6 + 0.4 * Math.sin(t * 4);
    left2[i] = valL * 0.2 * subLfo;
    right2[i] = valR * 0.2 * subLfo;
  }

  // 3. Efecto_Sonido.wav (Futuristic sweep/chime sound effect)
  const duration3 = 3.5;
  const length3 = Math.floor(sampleRate * duration3);
  const buffer3 = audioCtx.createBuffer(2, length3, sampleRate);
  const left3 = buffer3.getChannelData(0);
  const right3 = buffer3.getChannelData(1);
  for (let i = 0; i < length3; i++) {
    const t = i / sampleRate;
    const sweep = 300 + Math.pow(t, 2) * 400;
    const env = Math.sin(Math.PI * (t / duration3));
    left3[i] = Math.sin(2 * Math.PI * sweep * t) * env * 0.3;
    right3[i] = Math.cos(2 * Math.PI * (sweep * 1.01) * t) * env * 0.3;
  }

  const res1: AudioResource = {
    id: 'sample-1',
    name: 'Oveja_Minecraft.mp3',
    duration: duration1,
    sampleRate,
    numberOfChannels: 1,
    audioBuffer: buffer1,
    peaks: extractPeaks(buffer1),
  };

  const res2: AudioResource = {
    id: 'sample-2',
    name: 'Musica_Fondo.mp3',
    duration: duration2,
    sampleRate,
    numberOfChannels: 2,
    audioBuffer: buffer2,
    peaks: extractPeaks(buffer2),
  };

  const res3: AudioResource = {
    id: 'sample-3',
    name: 'Efecto_Sonido.wav',
    duration: duration3,
    sampleRate,
    numberOfChannels: 2,
    audioBuffer: buffer3,
    peaks: extractPeaks(buffer3),
  };

  return [res1, res2, res3];
}
