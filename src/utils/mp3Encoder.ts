import lamejs from 'lamejs';
import { Track, MP3ExportOptions } from '../types';
import { applyEQPresetNodes } from './eqPresets';

// Fix global variable references for lamejs in bundler contexts
if (typeof window !== 'undefined') {
  const lameObj = lamejs as any;
  if (lameObj) {
    if (!('MPEGMode' in window) && lameObj.MPEGMode) (window as any).MPEGMode = lameObj.MPEGMode;
    if (!('Lame' in window) && lameObj.Lame) (window as any).Lame = lameObj.Lame;
    if (!('BitStream' in window) && lameObj.BitStream) (window as any).BitStream = lameObj.BitStream;
    if (!('Header' in window) && lameObj.Header) (window as any).Header = lameObj.Header;
  }
}

export async function renderAndEncodeToMP3(
  tracks: Track[],
  audioBufferMap: Map<string, AudioBuffer>,
  options: MP3ExportOptions,
  onProgress?: (progress: number) => void,
  eqPreset: string = 'none'
): Promise<Blob> {
  // 1. Calculate total duration from max clip end
  let maxTime = 1.0;
  tracks.forEach(t => {
    t.clips.forEach(c => {
      const end = c.startTime + c.duration;
      if (end > maxTime) maxTime = end;
    });
  });

  const numChannels = options.channels === 'stereo' ? 2 : 1;
  const sampleRate = options.sampleRate || 44100;
  const totalLengthSamples = Math.ceil(maxTime * sampleRate);

  if (onProgress) onProgress(0.1);

  // 2. Mix tracks in OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(numChannels, totalLengthSamples, sampleRate);

  const hasSolo = tracks.some(t => t.isSolo);

  tracks.forEach(track => {
    if (track.isMuted) return;
    if (hasSolo && !track.isSolo) return;

    const trackVol = Math.max(0, Math.min(1.5, track.volume));

    track.clips.forEach(clip => {
      const buffer = audioBufferMap.get(clip.resourceId);
      if (!buffer) return;

      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = offlineCtx.createGain();
      const startTime = clip.startTime;
      gainNode.gain.setValueAtTime(trackVol, startTime);

      source.connect(gainNode);

      // Apply EQ Preset Nodes
      const { outputNode, detuneCents } = applyEQPresetNodes(offlineCtx, gainNode, eqPreset);

      if (detuneCents && source.detune) {
        source.detune.value = detuneCents;
      }

      outputNode.connect(offlineCtx.destination);

      source.start(startTime, clip.trimOffset, clip.duration);
    });
  });

  if (onProgress) onProgress(0.3);

  // Render audio mix
  const renderedBuffer = await offlineCtx.startRendering();

  if (onProgress) onProgress(0.6);

  // Helper to encode WAV
  const encodeWAV = (buffer: AudioBuffer): Blob => {
    const wavLength = buffer.length * numChannels * 2 + 44;
    const wavBuffer = new ArrayBuffer(wavLength);
    const view = new DataView(wavBuffer);
    let offset = 0;
    function writeString(str: string) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset++, str.charCodeAt(i));
    }
    writeString('RIFF');
    view.setUint32(offset, wavLength - 8, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * 2 * numChannels, true); offset += 4;
    view.setUint16(offset, numChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString('data');
    view.setUint32(offset, wavLength - offset - 4, true); offset += 4;

    const left = buffer.getChannelData(0);
    const right = numChannels === 2 ? buffer.getChannelData(1) : left;

    for (let i = 0; i < buffer.length; i++) {
      let sL = Math.max(-1, Math.min(1, left[i]));
      view.setInt16(offset, sL < 0 ? sL * 32768 : sL * 32767, true); offset += 2;
      if (numChannels === 2) {
        let sR = Math.max(-1, Math.min(1, right[i]));
        view.setInt16(offset, sR < 0 ? sR * 32768 : sR * 32767, true); offset += 2;
      }
    }
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // 3. Try encoding to MP3 or WAV
  try {
    const Mp3EncoderClass = (lamejs as any)?.Mp3Encoder || (lamejs as any)?.default?.Mp3Encoder;
    if (!Mp3EncoderClass) {
      if (onProgress) onProgress(1.0);
      return encodeWAV(renderedBuffer);
    }

    const mp3encoder = new Mp3EncoderClass(numChannels, sampleRate, options.bitrate || 192);
    const mp3Data: Uint8Array[] = [];

    const leftChannel = renderedBuffer.getChannelData(0);
    const rightChannel = numChannels === 2 ? renderedBuffer.getChannelData(1) : leftChannel;

    const sampleBlockSize = 1152;
    const numSamples = leftChannel.length;

    const leftInt16 = new Int16Array(sampleBlockSize);
    const rightInt16 = new Int16Array(sampleBlockSize);

    for (let i = 0; i < numSamples; i += sampleBlockSize) {
      const chunkLength = Math.min(sampleBlockSize, numSamples - i);

      for (let j = 0; j < chunkLength; j++) {
        let sL = Math.max(-1, Math.min(1, leftChannel[i + j]));
        leftInt16[j] = sL < 0 ? sL * 0x8000 : sL * 0x7fff;

        if (numChannels === 2) {
          let sR = Math.max(-1, Math.min(1, rightChannel[i + j]));
          rightInt16[j] = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
        }
      }

      let mp3buf: Int8Array | Uint8Array;
      if (numChannels === 2) {
        mp3buf = mp3encoder.encodeBuffer(
          leftInt16.subarray(0, chunkLength),
          rightInt16.subarray(0, chunkLength)
        );
      } else {
        mp3buf = mp3encoder.encodeBuffer(leftInt16.subarray(0, chunkLength));
      }

      if (mp3buf && mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }

      if (onProgress && i % (sampleBlockSize * 10) === 0) {
        const p = 0.6 + 0.35 * (i / numSamples);
        onProgress(p);
      }
    }

    const endBuf = mp3encoder.flush();
    if (endBuf && endBuf.length > 0) {
      mp3Data.push(new Uint8Array(endBuf));
    }

    if (onProgress) onProgress(1.0);
    return new Blob(mp3Data, { type: 'audio/mp3' });
  } catch (err) {
    console.warn('MP3 encoding error, falling back to WAV:', err);
    if (onProgress) onProgress(1.0);
    return encodeWAV(renderedBuffer);
  }
}
