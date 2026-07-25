import React, { useEffect, useState, useRef } from 'react';
import { Mic, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import {
  AudioResource,
  Track,
  AudioClip,
  MP3ExportOptions,
} from './types';
import {
  getAudioContext,
  decodeAudioFile,
  MultitrackPlayer,
  VoiceRecorder,
} from './utils/audioEngine';
import { createDefaultSampleAudios, extractPeaks } from './utils/sampleAudios';
import { renderAndEncodeToMP3 } from './utils/mp3Encoder';
import { saveProjectToALI, loadProjectFromALI } from './utils/projectSerializer';

import { Header } from './components/Header';
import { ResourcePanel } from './components/ResourcePanel';
import { Toolbar } from './components/Toolbar';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';
import { NoteSynthModal } from './components/NoteSynthModal';

export default function App() {
  const [projectTitle, setProjectTitle] = useState('Mi_Proyecto_Audity');
  const [resources, setResources] = useState<AudioResource[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(180); // 3 minutes default
  const [playheadTime, setPlayheadTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(30); // 30px per second default
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Note Synth Modal State
  const [isNoteSynthOpen, setIsNoteSynthOpen] = useState<boolean>(false);

  // Recording State & Error Feedback
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordingLevel, setRecordingLevel] = useState<number>(0);
  const [micErrorType, setMicErrorType] = useState<'PERMISO_DENEGADO' | 'DISPOSITIVO_NO_ENCONTRADO' | 'ERROR_GENERICO' | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // Preview Resource State
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Web Audio Context & Map
  const audioBufferMapRef = useRef<Map<string, AudioBuffer>>(new Map());
  const playerRef = useRef<MultitrackPlayer>(new MultitrackPlayer());
  const recorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sync playhead from MultitrackPlayer
  useEffect(() => {
    const player = playerRef.current;
    player.setTimeUpdateCallback((time) => {
      setPlayheadTime(time);
    });
    player.setEndedCallback(() => {
      setIsPlaying(false);
    });
  }, []);

  // Compute total project duration dynamically from real clip end times
  // Calculate total project timeline duration dynamically in real-time
  useEffect(() => {
    let max = 0;
    tracks.forEach((t) => {
      t.clips.forEach((c) => {
        const end = c.startTime + c.duration;
        if (end > max) max = end;
      });
    });
    // Calculate total project timeline duration dynamically in real-time
    const realDuration = max > 0 ? Math.max(5, Math.ceil(max + 2)) : 10;
    setTotalDuration(realDuration);

    if (isPlaying) {
      playerRef.current.syncTracks(tracks, audioBufferMapRef.current, realDuration);
    }
  }, [tracks]);

  // App starts clean with 0 sample data as requested
  useEffect(() => {
    setResources([]);
    setTracks([]);
  }, []);

  // Delete Clip Handler
  const handleDeleteClip = (clipId: string) => {
    setTracks((prevTracks) => {
      const nextTracks = prevTracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      }));
      if (isPlaying) {
        playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
      }
      return nextTracks;
    });
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  // Global AudioContext unlock for mobile devices
  useEffect(() => {
    const unlockAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        if (isPlaying) handlePause();
        else handlePlay();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        handleToggleRecord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedClipId, tracks, playheadTime, isRecording]);

  // Player Handlers
  const handlePlay = () => {
    playerRef.current.play(tracks, audioBufferMapRef.current, totalDuration);
    setIsPlaying(true);
  };

  const handlePause = () => {
    playerRef.current.pause();
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    playerRef.current.seek(time, tracks, audioBufferMapRef.current, totalDuration);
    setPlayheadTime(time);
  };

  const handleRewind5s = () => {
    const newTime = Math.max(0, playheadTime - 5);
    handleSeek(newTime);
  };

  const handleForward5s = () => {
    const newTime = Math.min(totalDuration, playheadTime + 5);
    handleSeek(newTime);
  };

  const handleResetOrigin = () => {
    handleSeek(0);
  };

  // Direct Voice Recording Handler
  const handleToggleRecord = async () => {
    if (isRecording) {
      // STOP Recording & place immediately in timeline on a new Voice Track
      try {
        const { buffer, duration } = await recorderRef.current.stopRecording();
        setIsRecording(false);

        // Store buffer in map
        const recId = `rec-${Date.now()}`;
        audioBufferMapRef.current.set(recId, buffer);

        // Create new Voice Clip
        const newClip: AudioClip = {
          id: `clip-rec-${Date.now()}`,
          resourceId: recId,
          name: `Grabación_${new Date().toLocaleTimeString().replace(/:/g, '-')}`,
          startTime: playheadTime,
          duration: duration,
          trimOffset: 0,
        };

        // Automatic Track Creation: Create new lower Voice Track without overwriting!
        const voiceTrackCount = tracks.filter((t) => t.type === 'voice').length + 1;
        const newVoiceTrack: Track = {
          id: `track-rec-${Date.now()}`,
          name: `PISTA ${tracks.length + 1}: VOZ`,
          type: 'voice',
          volume: 0.9,
          progressiveVolume: 'none',
          fadeDuration: 2.0,
          isMuted: false,
          isSolo: false,
          clips: [newClip],
        };

        setTracks((prev) => [...prev, newVoiceTrack]);
        setSelectedClipId(newClip.id);
      } catch (err) {
        console.error('Error stopping recording:', err);
        setIsRecording(false);
      }
    } else {
      // START Recording
      try {
        if (isPlaying) handlePause();
        setMicErrorType(null);
        setIsRecording(true);
        setRecordingDuration(0);
        await recorderRef.current.startRecording((dur, lvl) => {
          setRecordingDuration(dur);
          setRecordingLevel(lvl);
        });
      } catch (err: any) {
        setIsRecording(false);
        console.error('Recording start error:', err);
        const errStr = String(err?.message || err);
        if (errStr.includes('PERMISO_DENEGADO') || errStr.includes('Permission') || errStr.includes('NotAllowedError')) {
          setMicErrorType('PERMISO_DENEGADO');
        } else if (errStr.includes('DISPOSITIVO_NO_ENCONTRADO') || errStr.includes('NotFound')) {
          setMicErrorType('DISPOSITIVO_NO_ENCONTRADO');
        } else {
          setMicErrorType('PERMISO_DENEGADO');
        }
      }
    }
  };

  // Resource Panel Handlers
  const handleAddResource = async (files: FileList) => {
    const newResources: AudioResource[] = [];
    const newAutoTracks: Track[] = [];

    let currentTrackCount = tracks.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { buffer, duration } = await decodeAudioFile(file);
        const id = `res-${Date.now()}-${i}`;
        audioBufferMapRef.current.set(id, buffer);

        const resourceObj: AudioResource = {
          id,
          name: file.name,
          duration,
          sampleRate: buffer.sampleRate,
          numberOfChannels: buffer.numberOfChannels,
          audioBuffer: buffer,
          peaks: extractPeaks(buffer),
        };
        newResources.push(resourceObj);

        // Auto add to timeline directly as requested!
        currentTrackCount++;
        const newClip: AudioClip = {
          id: `clip-auto-${Date.now()}-${i}`,
          resourceId: id,
          name: file.name,
          startTime: playheadTime,
          duration: duration,
          trimOffset: 0,
        };

        newAutoTracks.push({
          id: `track-${Date.now()}-${i}`,
          name: `Pista ${currentTrackCount}`,
          type: 'audio',
          volume: 1.0,
          progressiveVolume: 'none',
          fadeDuration: 2.0,
          isMuted: false,
          isSolo: false,
          clips: [newClip],
        });
      } catch (err) {
        console.error('Error decoding audio file:', file.name, err);
      }
    }

    if (newResources.length > 0) {
      setResources((prev) => [...prev, ...newResources]);
      setTracks((prev) => [...prev, ...newAutoTracks]);
    }
  };

  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    audioBufferMapRef.current.delete(id);
    
    // Stop playback if playing
    if (isPlaying) {
      playerRef.current.stopNodesOnly();
      setIsPlaying(false);
    }

    // Remove clips referring to this resource
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.resourceId !== id),
      }))
    );
  };

  const handlePreviewResource = (id: string) => {
    if (previewingId === id) {
      if (previewSourceRef.current) {
        try {
          previewSourceRef.current.stop();
          previewSourceRef.current.disconnect();
        } catch {
          // ignore
        }
        previewSourceRef.current = null;
      }
      setPreviewingId(null);
      return;
    }

    const buffer = audioBufferMapRef.current.get(id);
    if (!buffer) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop();
        previewSourceRef.current.disconnect();
      } catch {
        // ignore
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setPreviewingId(null);
      previewSourceRef.current = null;
    };
    source.start(0);
    previewSourceRef.current = source;
    setPreviewingId(id);
  };

  const handleQuickAddToTimeline = (resource: AudioResource) => {
    const newClip: AudioClip = {
      id: `clip-quick-${Date.now()}`,
      resourceId: resource.id,
      name: resource.name,
      startTime: playheadTime,
      duration: resource.duration,
      trimOffset: 0,
    };

    // Auto create track or append
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `PISTA ${tracks.length + 1}: AUDIO`,
      type: 'audio',
      volume: 1.0,
      progressiveVolume: 'none',
      fadeDuration: 2.0,
      isMuted: false,
      isSolo: false,
      clips: [newClip],
    };

    setTracks((prev) => [...prev, newTrack]);
    setSelectedClipId(newClip.id);
  };

  // Drag & Drop Handlers
  const handleDragStartResource = (e: React.DragEvent, resource: AudioResource) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(resource));
  };

  const handleDropOnTrack = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const res: AudioResource = JSON.parse(data);

      let dropStartTime = playheadTime;
      if (e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        if (!isNaN(dropX) && dropX >= 0) {
          dropStartTime = Math.max(0, dropX / zoom);
        }
      }

      const newClip: AudioClip = {
        id: `clip-${Date.now()}`,
        resourceId: res.id,
        name: res.name,
        startTime: dropStartTime,
        duration: res.duration,
        trimOffset: 0,
      };

      setTracks((prev) =>
        prev.map((t) => {
          if (t.id === trackId) {
            return {
              ...t,
              clips: [...t.clips, newClip],
            };
          }
          return t;
        })
      );
      setSelectedClipId(newClip.id);
    } catch (err) {
      // ignore
    }
  };

  const handleDropOnTimelineArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const res: AudioResource = JSON.parse(data);

      let dropStartTime = playheadTime;
      if (e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const scrollLeft = e.currentTarget.scrollLeft || 0;
        const relativeX = e.clientX - rect.left + scrollLeft - 320; // 320px sidebar width
        if (relativeX >= 0) {
          dropStartTime = Math.max(0, relativeX / zoom);
        }
      }

      const newClip: AudioClip = {
        id: `clip-${Date.now()}`,
        resourceId: res.id,
        name: res.name,
        startTime: dropStartTime,
        duration: res.duration,
        trimOffset: 0,
      };

      const newTrack: Track = {
        id: `track-${Date.now()}`,
        name: `PISTA ${tracks.length + 1}: AUDIO`,
        type: 'audio',
        volume: 1.0,
        progressiveVolume: 'none',
        fadeDuration: 2.0,
        isMuted: false,
        isSolo: false,
        clips: [newClip],
      };

      setTracks((prev) => [...prev, newTrack]);
      setSelectedClipId(newClip.id);
    } catch (err) {
      // ignore
    }
  };

  // Track & Clip Editing Handlers
  const handleAddTrack = (type?: 'voice' | 'audio') => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `Pista ${tracks.length + 1}`,
      type: type || 'audio',
      volume: 1.0,
      progressiveVolume: 'none',
      fadeDuration: 2.0,
      isMuted: false,
      isSolo: false,
      clips: [],
    };
    setTracks((prev) => [...prev, newTrack]);
  };

  const handleUpdateTrack = (updatedTrack: Track) => {
    const nextTracks = tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    const nextTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  const handleMoveClip = (clipId: string, newStartTime: number) => {
    const nextTracks = tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) => (c.id === clipId ? { ...c, startTime: newStartTime } : c)),
    }));
    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  const handleTrimClip = (
    clipId: string,
    newTrimOffset: number,
    newDuration: number,
    newStartTime?: number
  ) => {
    const nextTracks = tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) =>
        c.id === clipId
          ? {
              ...c,
              trimOffset: newTrimOffset,
              duration: newDuration,
              startTime: newStartTime !== undefined ? newStartTime : c.startTime,
            }
          : c
      ),
    }));
    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  // Generated Audio from Note Synth Modal
  const handleGeneratedSynthResource = (name: string, buffer: AudioBuffer) => {
    const id = `res-synth-${Date.now()}`;
    audioBufferMapRef.current.set(id, buffer);

    const resourceObj: AudioResource = {
      id,
      name,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      numberOfChannels: buffer.numberOfChannels,
      audioBuffer: buffer,
      peaks: extractPeaks(buffer),
    };

    setResources((prev) => [...prev, resourceObj]);

    // Create a new track with this synthesized audio clip automatically
    const newClip: AudioClip = {
      id: `clip-synth-${Date.now()}`,
      resourceId: id,
      name,
      startTime: playheadTime,
      duration: buffer.duration,
      trimOffset: 0,
    };

    const newTrack: Track = {
      id: `track-synth-${Date.now()}`,
      name: `PISTA ${tracks.length + 1}: MELODÍA`,
      type: 'audio',
      volume: 1.0,
      progressiveVolume: 'none',
      fadeDuration: 2.0,
      isMuted: false,
      isSolo: false,
      clips: [newClip],
    };

    setTracks((prev) => [...prev, newTrack]);
    setSelectedClipId(newClip.id);
  };

  const handleSplitClip = (clipId: string, splitTimeOnTimeline: number) => {
    const nextTracks = tracks.map((t) => {
      const clipIdx = t.clips.findIndex((c) => c.id === clipId);
      if (clipIdx === -1) return t;

      const clip = t.clips[clipIdx];
      const clipEnd = clip.startTime + clip.duration;

      if (splitTimeOnTimeline <= clip.startTime || splitTimeOnTimeline >= clipEnd) {
        return t; // outside clip bounds
      }

      const leftDuration = splitTimeOnTimeline - clip.startTime;
      const rightDuration = clip.duration - leftDuration;

      const leftClip: AudioClip = {
        ...clip,
        duration: leftDuration,
      };

      const rightClip: AudioClip = {
        ...clip,
        id: `clip-split-${Date.now()}`,
        startTime: splitTimeOnTimeline,
        trimOffset: clip.trimOffset + leftDuration,
        duration: rightDuration,
      };

      const newClips = [...t.clips];
      newClips.splice(clipIdx, 1, leftClip, rightClip);

      return { ...t, clips: newClips };
    });

    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  const handleSplitAtPlayhead = () => {
    let clipToSplitId: string | null = null;

    if (selectedClipId) {
      for (const t of tracks) {
        const found = t.clips.find((c) => c.id === selectedClipId);
        if (found) {
          if (playheadTime > found.startTime + 0.05 && playheadTime < found.startTime + found.duration - 0.05) {
            clipToSplitId = found.id;
          }
          break;
        }
      }
    }

    if (!clipToSplitId) {
      for (const t of tracks) {
        const found = t.clips.find(
          (c) => playheadTime > c.startTime + 0.05 && playheadTime < c.startTime + c.duration - 0.05
        );
        if (found) {
          clipToSplitId = found.id;
          break;
        }
      }
    }

    if (clipToSplitId) {
      handleSplitClip(clipToSplitId, playheadTime);
    }
  };

  const handleDuplicateClip = (clipId: string) => {
    const nextTracks = tracks.map((t) => {
      const clip = t.clips.find((c) => c.id === clipId);
      if (!clip) return t;

      const dupClip: AudioClip = {
        ...clip,
        id: `clip-dup-${Date.now()}`,
        startTime: clip.startTime + clip.duration + 0.5,
      };

      return { ...t, clips: [...t.clips, dupClip] };
    });

    setTracks(nextTracks);
    if (isPlaying) {
      playerRef.current.syncTracks(nextTracks, audioBufferMapRef.current, totalDuration);
    }
  };

  // Save / Load Project .ALI
  const handleSaveProject = async () => {
    try {
      const blob = await saveProjectToALI(projectTitle, resources, tracks, totalDuration);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.replace(/\s+/g, '_')}.ali`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast('¡Proyecto .ALI guardado con éxito!', 'success');
    } catch (err) {
      console.error('Error saving project:', err);
      showToast('Error al guardar el proyecto .ALI', 'error');
    }
  };

  const handleLoadProject = async (file: File) => {
    try {
      const loaded = await loadProjectFromALI(file);
      setProjectTitle(loaded.title);
      setResources(loaded.resources);
      setTracks(loaded.tracks);
      setTotalDuration(loaded.totalDuration);

      // Merge buffer map
      loaded.audioBufferMap.forEach((buf, id) => {
        audioBufferMapRef.current.set(id, buf);
      });

      handleSeek(0);
      showToast('¡Proyecto .ALI cargado exitosamente!', 'success');
    } catch (err) {
      console.error('Error loading .ALI file:', err);
      showToast('Formato de archivo .ALI no válido', 'error');
    }
  };

  // Export MP3
  const handleExportMP3 = async (options: MP3ExportOptions) => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const blob = await renderAndEncodeToMP3(
        tracks,
        audioBufferMapRef.current,
        options,
        (p) => setExportProgress(p)
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setIsExporting(false);
      setIsExportModalOpen(false);
      showToast('¡Mezcla exportada a MP3 correctamente!', 'success');
    } catch (err) {
      console.error('Error exporting MP3:', err);
      showToast('Error durante la exportación a MP3', 'error');
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1D006B] font-sans overflow-hidden text-white">
      {/* 1. Header Minimalista */}
      <Header
        onLoadProject={handleLoadProject}
        onSaveProject={handleSaveProject}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        projectTitle={projectTitle}
        onTitleChange={setProjectTitle}
      />

      {/* 2. Workspace Layout: Panel Izquierdo (Recursos) + Area Derecha (Timeline) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel Izquierdo: Recursos (#41047D) */}
        <ResourcePanel
          resources={resources}
          onAddResource={handleAddResource}
          onRemoveResource={handleRemoveResource}
          onPreviewResource={handlePreviewResource}
          previewingId={previewingId}
          onDragStartResource={handleDragStartResource}
          onQuickAddToTimeline={handleQuickAddToTimeline}
          onOpenNoteSynth={() => setIsNoteSynthOpen(true)}
        />

        {/* Panel Derecho: Área de Trabajo y Línea de Tiempo */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1D006B]">
          {/* Toolbar & Controles */}
          <Toolbar
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            recordingLevel={recordingLevel}
            onToggleRecord={handleToggleRecord}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onRewind5s={handleRewind5s}
            onForward5s={handleForward5s}
            onResetOrigin={handleResetOrigin}
            onSplitAtPlayhead={handleSplitAtPlayhead}
            onDeleteSelectedClip={() => selectedClipId && handleDeleteClip(selectedClipId)}
            selectedClipId={selectedClipId}
            currentTime={playheadTime}
            totalDuration={totalDuration}
            zoom={zoom}
            onZoomChange={setZoom}
          />

          {/* Timeline & System of Dynamic Tracks */}
          <Timeline
            tracks={tracks}
            resources={resources}
            playheadTime={playheadTime}
            totalDuration={totalDuration}
            zoom={zoom}
            selectedClipId={selectedClipId}
            onSelectClip={setSelectedClipId}
            onSeek={handleSeek}
            onUpdateTrack={handleUpdateTrack}
            onDeleteTrack={handleDeleteTrack}
            onAddTrack={handleAddTrack}
            onMoveClip={handleMoveClip}
            onTrimClip={handleTrimClip}
            onSplitClip={handleSplitClip}
            onDuplicateClip={handleDuplicateClip}
            onDeleteClip={handleDeleteClip}
            onDropOnTrack={handleDropOnTrack}
            onDropOnTimelineArea={handleDropOnTimelineArea}
          />
        </main>
      </div>

      {/* Modal Ventana Emergente de Exportación MP3 */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportMP3}
        isExporting={isExporting}
        exportProgress={exportProgress}
        defaultTitle={projectTitle}
      />

      {/* Modal Sintetizador de Notas Musicales */}
      <NoteSynthModal
        isOpen={isNoteSynthOpen}
        onClose={() => setIsNoteSynthOpen(false)}
        onAddGeneratedAudio={handleGeneratedSynthResource}
      />

      {/* Modal de Error de Permiso de Micrófono */}
      {micErrorType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
          <div className="bg-[#1D006B] border-2 border-[#1AA7C7] text-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-full bg-red-950/80 border border-red-500/50">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  {micErrorType === 'DISPOSITIVO_NO_ENCONTRADO'
                    ? 'Micrófono no Encontrado'
                    : 'Acceso al Micrófono Bloqueado'}
                </h3>
                <p className="text-xs text-red-300 font-sans">
                  {micErrorType === 'DISPOSITIVO_NO_ENCONTRADO'
                    ? 'No se detectó entrada de audio en este dispositivo.'
                    : 'Permiso denegado o restringido por el navegador.'}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-200 bg-[#0A018A]/80 p-3.5 rounded-lg border border-[#1AA7C7]/30 space-y-2 leading-relaxed">
              {micErrorType === 'DISPOSITIVO_NO_ENCONTRADO' ? (
                <p>
                  Conecta un micrófono o auriculares con entrada de audio a tu dispositivo y vuelve a intentarlo.
                </p>
              ) : (
                <>
                  <p className="font-semibold text-[#1AA7C7]">
                    💡 Si estás usando la vista previa embebida:
                  </p>
                  <p>
                    Los navegadores a menudo bloquean el micrófono dentro de ventanas o recuadros embebidos por razones de privacidad.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-300">
                    <li>Haz clic en <strong>"Abrir en Nueva Pestaña"</strong> a continuación.</li>
                    <li>Concede el permiso de micrófono cuando el navegador lo solicite.</li>
                    <li>O haz clic en el candado 🔒 en la barra de direcciones para habilitar el micrófono.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.open(window.location.href, '_blank');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#005B9E] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white font-bold text-xs transition-all border border-[#1AA7C7]/50 shadow cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>🔗 Abrir en Nueva Pestaña</span>
              </button>

              <button
                onClick={() => {
                  setMicErrorType(null);
                  handleToggleRecord();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0A018A] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white font-bold text-xs transition-all border border-[#1AA7C7]/40 cursor-pointer flex items-center justify-center"
              >
                🔄 Reintentar
              </button>

              <button
                onClick={() => setMicErrorType(null)}
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-2xl border flex items-center space-x-3 text-xs font-bold transition-all ${
            toast.type === 'error'
              ? 'bg-red-900/90 border-red-500 text-white'
              : toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-400 text-white'
              : 'bg-[#005B9E] border-[#1AA7C7] text-white'
          }`}
        >
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-300" />}
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-300" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-300" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
