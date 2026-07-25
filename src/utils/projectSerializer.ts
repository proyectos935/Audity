import { AudioResource, Track, ProjectState } from '../types';
import { audioBufferToWavDataUrl, extractPeaks } from './sampleAudios';
import { getAudioContext } from './audioEngine';

export async function saveProjectToALI(
  title: string,
  resources: AudioResource[],
  tracks: Track[],
  totalDuration: number,
  masterEQPreset: string = 'none'
): Promise<Blob> {
  const serializedResources = await Promise.all(
    resources.map(async (res) => {
      let dataUrl = res.dataUrl;
      if (!dataUrl && res.audioBuffer) {
        dataUrl = audioBufferToWavDataUrl(res.audioBuffer);
      }
      return {
        id: res.id,
        name: res.name,
        duration: res.duration,
        sampleRate: res.sampleRate,
        numberOfChannels: res.numberOfChannels,
        dataUrl: dataUrl,
      };
    })
  );

  const projectData: ProjectState = {
    version: '1.0',
    title: title || 'Audity_Proyecto',
    resources: serializedResources,
    tracks: tracks,
    totalDuration: totalDuration,
    masterEQPreset: masterEQPreset,
  };

  const jsonString = JSON.stringify(projectData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

export async function loadProjectFromALI(
  file: File
): Promise<{
  title: string;
  resources: AudioResource[];
  tracks: Track[];
  totalDuration: number;
  masterEQPreset: string;
  audioBufferMap: Map<string, AudioBuffer>;
}> {
  const text = await file.text();
  const project: ProjectState = JSON.parse(text);

  const ctx = getAudioContext();
  const audioBufferMap = new Map<string, AudioBuffer>();
  const restoredResources: AudioResource[] = [];

  for (const res of project.resources) {
    let buffer: AudioBuffer | undefined = undefined;

    if (res.dataUrl) {
      try {
        const resp = await fetch(res.dataUrl);
        const arrayBuf = await resp.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf);
      } catch (err) {
        console.warn('Could not decode audio data URL for resource', res.name, err);
      }
    }

    if (buffer) {
      audioBufferMap.set(res.id, buffer);
    }

    restoredResources.push({
      id: res.id,
      name: res.name,
      duration: res.duration,
      sampleRate: res.sampleRate,
      numberOfChannels: res.numberOfChannels,
      dataUrl: res.dataUrl,
      audioBuffer: buffer,
      peaks: buffer ? extractPeaks(buffer) : [],
    });
  }

  return {
    title: project.title || 'Proyecto Cargado',
    resources: restoredResources,
    tracks: project.tracks || [],
    totalDuration: project.totalDuration || 180,
    masterEQPreset: project.masterEQPreset || 'none',
    audioBufferMap,
  };
}
