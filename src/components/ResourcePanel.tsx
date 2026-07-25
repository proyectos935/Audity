import React, { useRef } from 'react';
import { Music, Play, Pause, Trash2, GripVertical, FileAudio } from 'lucide-react';
import { AudioResource } from '../types';
import { CustomPlusIcon, PlusMusicNoteIcon } from './CustomIcons';

interface ResourcePanelProps {
  resources: AudioResource[];
  onAddResource: (files: FileList) => void;
  onRemoveResource: (id: string) => void;
  onPreviewResource: (id: string) => void;
  previewingId: string | null;
  onDragStartResource: (e: React.DragEvent, resource: AudioResource) => void;
  onQuickAddToTimeline: (resource: AudioResource) => void;
  onOpenNoteSynth?: () => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  resources,
  onAddResource,
  onRemoveResource,
  onPreviewResource,
  previewingId,
  onDragStartResource,
  onQuickAddToTimeline,
  onOpenNoteSynth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddResource(e.target.files);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="w-72 sm:w-80 bg-[#1D006B] border-r-2 border-[#0A018A] flex flex-col h-full shadow-2xl select-none">
      {/* Container Header */}
      <div className="p-3 bg-[#1D006B]/60 border-b border-[#0A018A] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileAudio className="w-4 h-4 text-[#1AA7C7]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Panel de Recursos
            </h2>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0A018A] text-[#1AA7C7] font-semibold border border-[#1AA7C7]/30">
            {resources.length} Audios
          </span>
        </div>

        {/* Botones Añadir Audio & Crear Notas */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#005B9E] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white text-xs font-bold rounded border border-[#1AA7C7]/50 shadow transition-all active:scale-98 cursor-pointer"
          >
            <CustomPlusIcon className="w-6 h-6 text-white" />
            <span>[ Añadir Audio ]</span>
          </button>

          {onOpenNoteSynth && (
            <button
              onClick={onOpenNoteSynth}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#0A018A] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white text-xs font-bold rounded border border-[#1AA7C7]/40 shadow transition-all active:scale-98 cursor-pointer"
            >
              <PlusMusicNoteIcon className="w-6 h-6 text-white" />
              <span>[ Crear Notas Musicales ]</span>
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Lista de Archivos en Cuadro #1D006B */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {resources.length === 0 ? (
          <div className="h-48 border-2 border-dashed border-[#0A018A] rounded-lg flex flex-col items-center justify-center p-4 text-center text-xs text-[#1AA7C7]/70">
            <Music className="w-8 h-8 mb-2 opacity-50 text-[#1AA7C7]" />
            <p className="font-medium text-white">No hay recursos importados</p>
            <p className="text-[11px] mt-1 text-[#1AA7C7]">
              Haz clic en [ Añadir Audio ] o arrastra archivos de tu PC aquí.
            </p>
          </div>
        ) : (
          resources.map((res) => {
            const isPreviewing = previewingId === res.id;
            return (
              <div
                key={res.id}
                draggable
                onDragStart={(e) => onDragStartResource(e, res)}
                className="group relative bg-[#1D006B]/80 hover:bg-[#005B9E]/40 border border-[#0A018A] hover:border-[#1AA7C7] rounded-md p-2.5 transition-all shadow-md cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2 overflow-hidden flex-1">
                    <GripVertical className="w-4 h-4 text-[#1AA7C7]/50 group-hover:text-[#1AA7C7] flex-shrink-0" />
                    <Music className="w-4 h-4 text-[#1AA7C7] flex-shrink-0" />
                    <div className="truncate flex-1">
                      <p className="text-xs font-semibold text-white truncate font-mono">
                        {res.name}
                      </p>
                      <p className="text-[10px] text-[#1AA7C7] font-mono">
                        Duración: {formatDuration(res.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Preview button */}
                    <button
                      onClick={() => onPreviewResource(res.id)}
                      className={`p-1 rounded text-white transition-colors ${
                        isPreviewing ? 'bg-[#1AA7C7] text-[#1D006B]' : 'bg-[#0A018A] hover:bg-[#005B9E]'
                      }`}
                      title="Escuchar vista previa"
                    >
                      {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* Quick Add Button */}
                    <button
                      onClick={() => onQuickAddToTimeline(res)}
                      className="px-1.5 py-1 text-[10px] bg-[#0A018A] hover:bg-[#005B9E] text-[#1AA7C7] hover:text-white font-bold rounded border border-[#1AA7C7]/30 transition-colors"
                      title="Añadir directo a línea de tiempo"
                    >
                      + Pista
                    </button>

                    {/* Delete Resource */}
                    <button
                      onClick={() => onRemoveResource(res.id)}
                      className="p-1 rounded bg-[#0A018A]/60 hover:bg-red-600/80 text-gray-300 hover:text-white transition-colors"
                      title="Eliminar recurso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mini waveform representation */}
                {res.peaks && res.peaks.length > 0 && (
                  <div className="mt-2 h-4 w-full flex items-center space-x-[1px] bg-[#0A018A]/40 rounded px-1 overflow-hidden pointer-events-none">
                    {res.peaks.slice(0, 40).map((peak, idx) => (
                      <div
                        key={idx}
                        className="w-full bg-[#1AA7C7] rounded-full opacity-80"
                        style={{ height: `${Math.max(15, peak * 100)}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
