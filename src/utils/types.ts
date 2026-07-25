export type ProgressiveVolumeMode = 'none' | 'fade-in' | 'fade-out' | 'fade-both';

export interface AudioResource {
  id: string;
  name: string;
  duration: number; // in seconds
  sampleRate: number;
  numberOfChannels: number;
  dataUrl?: string; // base64 / blob URL for persistence
  audioBuffer?: AudioBuffer;
  peaks?: number[]; // pre-computed waveform peak array
}

export interface AudioClip {
  id: string;
  resourceId: string;
  name: string;
  startTime: number; // Start time on timeline (seconds)
  duration: number; // Duration of clip (seconds)
  trimOffset: number; // Start offset within original audio buffer (seconds)
}

export interface Track {
  id: string;
  name: string;
  type: 'voice' | 'audio';
  volume: number; // 0 to 1 (or up to 1.5)
  progressiveVolume: ProgressiveVolumeMode;
  fadeDuration: number; // in seconds, default 2.0
  isMuted: boolean;
  isSolo: boolean;
  clips: AudioClip[];
}

export interface ProjectState {
  version: string;
  title: string;
  resources: AudioResource[];
  tracks: Track[];
  tempo?: number;
  timeSignature?: string;
  totalDuration: number; // in seconds
  masterEQPreset?: string;
}

export interface MP3ExportOptions {
  filename: string;
  bitrate: number; // 128, 192, 256, 320 kbps
  channels: 'stereo' | 'mono';
  sampleRate: number; // 44100, 48000
}
