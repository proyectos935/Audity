import { Track, ProgressiveVolumeMode } from '../types';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export async function decodeAudioFile(file: File): Promise<{ buffer: AudioBuffer; duration: number }> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  return {
    buffer,
    duration: buffer.duration,
  };
}

interface ActiveNode {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

export class MultitrackPlayer {
  private activeNodes: ActiveNode[] = [];
  private isPlaying: boolean = false;
  private currentTime: number = 0; // seconds
  private startTimeOffset: number = 0; // AudioContext currentTime when playback started
  private animFrameId: number | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private maxDuration: number = 10;

  constructor() {
    this.activeNodes = [];
  }

  public setTimeUpdateCallback(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setEndedCallback(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public getCurrentTime(): number {
    if (!this.isPlaying) return this.currentTime;
    const ctx = getAudioContext();
    const elapsed = ctx.currentTime - this.startTimeOffset;
    return Math.min(this.currentTime + elapsed, this.maxDuration);
  }

  public seek(time: number, tracks: Track[], audioBufferMap: Map<string, AudioBuffer>, maxDuration: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.stop();
    }
    this.currentTime = Math.max(0, Math.min(time, maxDuration));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime);
    }
    if (wasPlaying) {
      this.play(tracks, audioBufferMap, maxDuration);
    }
  }

  public play(tracks: Track[], audioBufferMap: Map<string, AudioBuffer>, maxDuration: number) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.stopNodesOnly();

    this.maxDuration = maxDuration;
    const startSeek = this.currentTime >= maxDuration ? 0 : this.currentTime;
    this.currentTime = startSeek;
    this.startTimeOffset = ctx.currentTime;
    this.isPlaying = true;

    // Determine solo status
    const hasSolo = tracks.some(t => t.isSolo);

    tracks.forEach(track => {
      // Check mute / solo logic
      if (track.isMuted) return;
      if (hasSolo && !track.isSolo) return;

      const trackBaseVolume = Math.max(0, Math.min(1.5, track.volume));

      track.clips.forEach(clip => {
        const buffer = audioBufferMap.get(clip.resourceId);
        if (!buffer) return;

        const clipStartOnTimeline = clip.startTime;
        const clipEndOnTimeline = clip.startTime + clip.duration;

        // Skip clips that ended before current playhead seek
        if (clipEndOnTimeline <= startSeek) return;

        // Calculate offset within clip and buffer
        let delayInSeconds = 0;
        let offsetInBuffer = clip.trimOffset;

        if (clipStartOnTimeline >= startSeek) {
          // Clip starts in the future relative to playhead
          delayInSeconds = clipStartOnTimeline - startSeek;
        } else {
          // Clip is currently playing
          offsetInBuffer += (startSeek - clipStartOnTimeline);
        }

        const playDuration = clip.duration - (offsetInBuffer - clip.trimOffset);
        if (playDuration <= 0) return;

        // Create Web Audio nodes
        const sourceNode = ctx.createBufferSource();
        sourceNode.buffer = buffer;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(trackBaseVolume, ctx.currentTime + delayInSeconds);

        // Connect graph
        sourceNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Schedule playback
        sourceNode.start(ctx.currentTime + delayInSeconds, offsetInBuffer, playDuration);

        this.activeNodes.push({ source: sourceNode, gainNode });
      });
    });

    this.startTickLoop();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.currentTime = this.getCurrentTime();
    this.stopNodesOnly();
    this.isPlaying = false;
  }

  public stop() {
    this.currentTime = 0;
    this.stopNodesOnly();
    this.isPlaying = false;
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
  }

  public stopNodesOnly() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.source.stop();
        node.source.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeNodes = [];
  }

  public syncTracks(tracks: Track[], audioBufferMap: Map<string, AudioBuffer>, maxDuration: number) {
    if (this.isPlaying) {
      const savedTime = this.getCurrentTime();
      this.stopNodesOnly();
      this.currentTime = savedTime;
      this.play(tracks, audioBufferMap, maxDuration);
    }
  }

  private startTickLoop() {
    const tick = () => {
      if (!this.isPlaying) return;
      const cur = this.getCurrentTime();
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(cur);
      }

      if (cur >= this.maxDuration) {
        this.pause();
        this.currentTime = 0;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(0);
        }
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
        return;
      }

      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

/**
 * Microphone Recorder Class
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;
  private timerInterval: number | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  public async startRecording(
    onProgress: (duration: number, level: number) => void
  ): Promise<void> {
    this.chunks = [];
    this.audioCtx = getAudioContext();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NO_SUPPORT');
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || String(err).includes('Permission denied')) {
        throw new Error('PERMISO_DENEGADO');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('DISPOSITIVO_NO_ENCONTRADO');
      } else {
        throw new Error(err?.message || 'PERMISO_DENEGADO');
      }
    }

    // Audio level meter visualization
    try {
      this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.sourceNode.connect(this.analyser);
    } catch (e) {
      console.warn('Analyser setup warning:', e);
    }

    // Determine supported MIME types for mobile (iOS Safari, Android Chrome, Desktop)
    let options: MediaRecorderOptions | undefined;
    if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
      ];
      for (const type of candidateTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          break;
        }
      }
    }

    try {
      this.mediaRecorder = options
        ? new MediaRecorder(this.stream, options)
        : new MediaRecorder(this.stream);
    } catch {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.startTime = Date.now();
    
    // Start MediaRecorder cleanly without timeslice (prevents iOS Safari NotSupportedError)
    try {
      this.mediaRecorder.start();
    } catch (startErr) {
      console.warn('MediaRecorder start error:', startErr);
    }

    const dataArray = this.analyser ? new Uint8Array(this.analyser.frequencyBinCount) : null;

    this.timerInterval = window.setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      let level = 0;
      if (this.analyser && dataArray) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        level = sum / (dataArray.length * 255);
      }
      onProgress(elapsed, level);
    }, 100);
  }

  public async stopRecording(): Promise<{ buffer: AudioBuffer; duration: number; blob: Blob }> {
    return new Promise((resolve) => {
      if (this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.sourceNode) {
        try {
          this.sourceNode.disconnect();
        } catch {}
        this.sourceNode = null;
      }

      const processAndResolve = async () => {
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = this.chunks.length > 0 ? new Blob(this.chunks, { type: mimeType }) : new Blob([]);

        let buffer: AudioBuffer | null = null;

        if (blob.size > 0) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            if (arrayBuffer.byteLength > 0) {
              buffer = await ctx.decodeAudioData(arrayBuffer);
            }
          } catch (e) {
            console.warn('Native Blob decode failed:', e);
          }
        }

        // Fallback synthetic 1s buffer if blob empty or decode fails
        if (!buffer || buffer.duration === 0) {
          const sampleRate = ctx.sampleRate || 44100;
          buffer = ctx.createBuffer(1, sampleRate, sampleRate);
        }

        const duration = Math.max(0.2, buffer.duration);

        resolve({
          buffer,
          duration,
          blob,
        });
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          processAndResolve();
        };
        try {
          this.mediaRecorder.stop();
        } catch {
          processAndResolve();
        }
      } else {
        processAndResolve();
      }
    });
  }
}
