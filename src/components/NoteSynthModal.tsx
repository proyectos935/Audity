import React, { useState, useRef } from 'react';
import { Music, X, Play, Plus, Volume2, Sparkles, Trash2 } from 'lucide-react';
import { AudioResource, AudioClip, Track } from '../types';
import { getAudioContext } from '../utils/audioEngine';
import { extractPeaks } from '../utils/sampleAudios';
import {
  FluteIcon,
  ChiptuneControllerIcon,
  GuitarIcon,
  PipeOrganIcon,
  CustomSparklesIcon,
  CustomPlayTriangleIcon,
  CustomPlusIcon,
} from './CustomIcons';

interface NoteSynthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedAudio?: (name: string, buffer: AudioBuffer) => void;
  onAddResource?: (resource: AudioResource, autoAddToTrack?: boolean) => void;
}

export interface NoteItem {
  id: string;
  note: string; // e.g. C4, D4, E4
  freq: number;
  duration: number; // in seconds
}

// Frequency map for standard notes
const NOTE_FREQS: Record<string, { label: string; freq: number; isBlack?: boolean }> = {
  C4: { label: 'Do (C4)', freq: 261.63 },
  'C#4': { label: 'Do#', freq: 277.18, isBlack: true },
  D4: { label: 'Re (D4)', freq: 293.66 },
  'D#4': { label: 'Re#', freq: 311.13, isBlack: true },
  E4: { label: 'Mi (E4)', freq: 329.63 },
  F4: { label: 'Fa (F4)', freq: 349.23 },
  'F#4': { label: 'Fa#', freq: 369.99, isBlack: true },
  G4: { label: 'Sol (G4)', freq: 392.0 },
  'G#4': { label: 'Sol#', freq: 415.3, isBlack: true },
  A4: { label: 'La (A4)', freq: 440.0 },
  'A#4': { label: 'La#', freq: 466.16, isBlack: true },
  B4: { label: 'Si (B4)', freq: 493.88 },
  C5: { label: 'Do (C5)', freq: 523.25 },
  'C#5': { label: 'Do#', freq: 554.37, isBlack: true },
  D5: { label: 'Re (D5)', freq: 587.33 },
  'D#5': { label: 'Re#', freq: 622.25, isBlack: true },
  E5: { label: 'Mi (E5)', freq: 659.25 },
  F5: { label: 'Fa (F5)', freq: 698.46 },
  G5: { label: 'Sol (G5)', freq: 783.99 },
  A5: { label: 'La (A5)', freq: 880.0 },
};

const PRESETS: Record<string, { name: string; notes: { note: string; duration: number }[] }> = {
  escala: {
    name: 'Escala Do Mayor',
    notes: [
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'A4', duration: 0.4 },
      { note: 'B4', duration: 0.4 },
      { note: 'C5', duration: 0.8 },
    ],
  },
  acorde: {
    name: 'Arpegio Brillante',
    notes: [
      { note: 'C4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'C5', duration: 0.3 },
      { note: 'E5', duration: 0.5 },
    ],
  },
  chiptune: {
    name: 'Melodía 8-Bit',
    notes: [
      { note: 'E5', duration: 0.2 },
      { note: 'E5', duration: 0.2 },
      { note: 'E5', duration: 0.2 },
      { note: 'C5', duration: 0.2 },
      { note: 'E5', duration: 0.3 },
      { note: 'G5', duration: 0.5 },
    ],
  },
};

export const NoteSynthModal: React.FC<NoteSynthModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedAudio,
  onAddResource,
}) => {
  const [title, setTitle] = useState('Melodia_Notas.wav');
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [sequence, setSequence] = useState<NoteItem[]>([
    { id: '1', note: 'C4', freq: 261.63, duration: 0.4 },
    { id: '2', note: 'E4', freq: 329.63, duration: 0.4 },
    { id: '3', note: 'G4', freq: 392.0, duration: 0.4 },
    { id: '4', note: 'C5', freq: 523.25, duration: 0.8 },
  ]);
  const [noteDuration, setNoteDuration] = useState<number>(0.4);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);

  if (!isOpen) return null;

  const handlePlaySingleNote = (noteKey: string) => {
    const noteData = NOTE_FREQS[noteKey];
    if (!noteData) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.value = noteData.freq;

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + noteDuration);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNoteToSequence = (noteKey: string) => {
    const noteData = NOTE_FREQS[noteKey];
    if (!noteData) return;

    handlePlaySingleNote(noteKey);

    const newItem: NoteItem = {
      id: `note-${Date.now()}-${Math.random()}`,
      note: noteKey,
      freq: noteData.freq,
      duration: noteDuration,
    };

    setSequence((prev) => [...prev, newItem]);
  };

  const handleRemoveNote = (id: string) => {
    setSequence((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const newSeq: NoteItem[] = preset.notes.map((item, idx) => ({
      id: `preset-${idx}-${Date.now()}`,
      note: item.note,
      freq: NOTE_FREQS[item.note]?.freq || 440,
      duration: item.duration,
    }));

    setSequence(newSeq);
  };

  const handlePreviewMelody = async () => {
    if (sequence.length === 0 || isPlaying) return;
    setIsPlaying(true);

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();

      let currentTime = ctx.currentTime;

      sequence.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveform;
        osc.frequency.value = item.freq;

        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + item.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + item.duration);

        activeOscillatorsRef.current.push(osc);
        currentTime += item.duration;
      });

      const totalTimeMs = (currentTime - ctx.currentTime) * 1000;
      setTimeout(() => {
        setIsPlaying(false);
        activeOscillatorsRef.current = [];
      }, Math.max(100, totalTimeMs));
    } catch (err) {
      console.error('Error playing preview melody:', err);
      setIsPlaying(false);
    }
  };

  const handleGenerateAudioResource = async () => {
    if (sequence.length === 0) {
      alert('Añade al menos una nota a la secuencia');
      return;
    }

    try {
      const totalDuration = sequence.reduce((sum, item) => sum + item.duration, 0);
      const sampleRate = 44100;
      const numSamples = Math.ceil(totalDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);
      let currentTime = 0;

      sequence.forEach((item) => {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = waveform;
        osc.frequency.value = item.freq;

        gain.gain.setValueAtTime(0.4, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + item.duration);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + item.duration);

        currentTime += item.duration;
      });

      const renderedBuffer = await offlineCtx.startRendering();

      let cleanName = title.trim();
      if (!cleanName.endsWith('.wav')) {
        cleanName += '.wav';
      }

      if (onAddGeneratedAudio) {
        onAddGeneratedAudio(cleanName, renderedBuffer);
      } else if (onAddResource) {
        const id = `res-synth-${Date.now()}`;
        const newResource: AudioResource = {
          id,
          name: cleanName,
          duration: renderedBuffer.duration,
          sampleRate: renderedBuffer.sampleRate,
          numberOfChannels: renderedBuffer.numberOfChannels,
          audioBuffer: renderedBuffer,
          peaks: extractPeaks(renderedBuffer),
        };
        onAddResource(newResource, true);
      }
      onClose();
    } catch (err) {
      console.error('Error generating synth audio:', err);
      alert('Error al sintetizar el audio de notas musicales');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1D006B] border-2 border-[#1AA7C7] rounded-xl w-full max-w-2xl p-5 shadow-2xl relative text-white flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#0A018A] pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#005B9E] text-white">
              <Music className="w-5 h-5 text-[#1AA7C7]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase font-mono tracking-wider">
                Creador de Audios con Notas Musicales
              </h3>
              <p className="text-xs text-[#1AA7C7]">Sintetizador de Melodías y Teclado Piano</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#0A018A] hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Config & Waveform */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-[#1AA7C7] font-mono mb-1">
              Nombre de Pista Audio
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0A018A] text-white font-mono text-xs px-2.5 py-1.5 rounded border border-[#1AA7C7]/40 focus:outline-none focus:border-[#1AA7C7]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1AA7C7] font-mono mb-1">
              Selecciona Instrumento / Tipo de Sonido:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setWaveform('sine')}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  waveform === 'sine'
                    ? 'bg-[#005B9E] border-[#1AA7C7] ring-2 ring-[#1AA7C7] text-white'
                    : 'bg-[#0A018A] border-[#1AA7C7]/30 hover:bg-[#005B9E]/50 text-white/80'
                }`}
              >
                <FluteIcon className="w-8 h-8 text-white" />
                <span className="text-[10px] font-bold font-mono">Flauta</span>
              </button>

              <button
                type="button"
                onClick={() => setWaveform('square')}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  waveform === 'square'
                    ? 'bg-[#005B9E] border-[#1AA7C7] ring-2 ring-[#1AA7C7] text-white'
                    : 'bg-[#0A018A] border-[#1AA7C7]/30 hover:bg-[#005B9E]/50 text-white/80'
                }`}
              >
                <ChiptuneControllerIcon className="w-8 h-8 text-white" />
                <span className="text-[10px] font-bold font-mono">Chiptune 8-Bit</span>
              </button>

              <button
                type="button"
                onClick={() => setWaveform('sawtooth')}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  waveform === 'sawtooth'
                    ? 'bg-[#005B9E] border-[#1AA7C7] ring-2 ring-[#1AA7C7] text-white'
                    : 'bg-[#0A018A] border-[#1AA7C7]/30 hover:bg-[#005B9E]/50 text-white/80'
                }`}
              >
                <GuitarIcon className="w-8 h-8 text-white" />
                <span className="text-[10px] font-bold font-mono">Guitarra</span>
              </button>

              <button
                type="button"
                onClick={() => setWaveform('triangle')}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  waveform === 'triangle'
                    ? 'bg-[#005B9E] border-[#1AA7C7] ring-2 ring-[#1AA7C7] text-white'
                    : 'bg-[#0A018A] border-[#1AA7C7]/30 hover:bg-[#005B9E]/50 text-white/80'
                }`}
              >
                <PipeOrganIcon className="w-8 h-8 text-white" />
                <span className="text-[10px] font-bold font-mono">Órgano Tubos</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1AA7C7] font-mono mb-1">
              Duración por Nota: {noteDuration}s
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={noteDuration}
              onChange={(e) => setNoteDuration(parseFloat(e.target.value))}
              className="w-full accent-[#1AA7C7] cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="flex items-center space-x-2 mb-3 bg-[#0A018A]/60 p-2 rounded-lg border border-[#0A018A]">
          <span className="text-xs font-bold text-[#1AA7C7] font-mono flex items-center gap-1">
            <CustomSparklesIcon className="w-4 h-4 text-[#1AA7C7]" /> Plantillas:
          </span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleLoadPreset(key)}
              className="px-2.5 py-1 bg-[#005B9E] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white text-xs font-bold font-mono rounded transition-colors cursor-pointer"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Interactive Piano Keyboard */}
        <div className="mb-3 bg-[#0A018A] p-3 rounded-lg border border-[#1AA7C7]/40">
          <div className="text-xs font-bold text-[#1AA7C7] font-mono mb-2 flex justify-between">
            <span>Teclado Interactivo (Haz clic para agregar notas):</span>
            <span className="text-white/60">Octava 4 y 5</span>
          </div>

          <div className="flex justify-center overflow-x-auto py-1 custom-scrollbar gap-1">
            {Object.entries(NOTE_FREQS).map(([key, data]) => {
              const isBlack = data.isBlack;
              return (
                <button
                  key={key}
                  onClick={() => handleAddNoteToSequence(key)}
                  className={`flex-shrink-0 transition-all cursor-pointer font-bold font-mono flex flex-col justify-end p-1 rounded-b shadow ${
                    isBlack
                      ? 'w-7 h-16 bg-black hover:bg-gray-800 text-white border border-gray-700 text-[9px]'
                      : 'w-9 h-22 bg-white hover:bg-gray-200 text-[#1D006B] border border-gray-300 text-[10px]'
                  }`}
                  title={`Añadir ${data.label}`}
                >
                  <span className="text-center truncate">{key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secuencia Creada */}
        <div className="flex-1 overflow-y-auto mb-3 bg-[#0A018A]/80 p-2.5 rounded-lg border border-[#0A018A] min-h-[100px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#1AA7C7] font-mono">
              Secuencia de Melodía ({sequence.length} notas - Total:{' '}
              {sequence.reduce((s, n) => s + n.duration, 0).toFixed(1)}s):
            </span>
            {sequence.length > 0 && (
              <button
                onClick={() => setSequence([])}
                className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold underline cursor-pointer"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {sequence.length === 0 ? (
            <div className="h-16 flex items-center justify-center text-xs text-[#1AA7C7]/60 italic font-mono">
              Haz clic en las teclas del piano para construir y escuchar tu melodía
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1">
              {sequence.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-[#005B9E] hover:bg-[#005B9E]/90 border border-[#1AA7C7]/60 px-2 py-1 rounded flex items-center space-x-1.5 text-xs font-mono shadow transition-all"
                >
                  <span className="text-[#1AA7C7] font-extrabold">{idx + 1}.</span>
                  <button
                    onClick={() => handlePlaySingleNote(item.note)}
                    className="flex items-center space-x-1 text-white hover:text-[#1AA7C7] font-bold cursor-pointer"
                    title={`Escuchar nota ${item.note}`}
                  >
                    <Volume2 className="w-3 h-3 text-[#1AA7C7]" />
                    <span>{item.note}</span>
                  </button>
                  <span className="text-[10px] text-gray-300">({item.duration}s)</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNote(item.id);
                    }}
                    className="text-red-300 hover:text-white transition-colors cursor-pointer ml-1"
                    title="Eliminar nota"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#0A018A] pt-3">
          <button
            onClick={handlePreviewMelody}
            disabled={isPlaying || sequence.length === 0}
            className="px-4 py-2 bg-[#0A018A] hover:bg-[#005B9E] text-white text-xs font-bold rounded-md border border-[#1AA7C7]/40 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <CustomPlayTriangleIcon className="w-4 h-4 text-white" />
            <span>{isPlaying ? 'Reproduciendo...' : 'Probar Melodía'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-[#0A018A] rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerateAudioResource}
              disabled={sequence.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#005B9E] to-[#1AA7C7] hover:from-[#1AA7C7] hover:to-[#005B9E] rounded-md border border-[#1AA7C7] shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <CustomPlusIcon className="w-4 h-4 text-white" />
              <span>Guardar y Añadir a Pista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
