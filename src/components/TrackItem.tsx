import React, { useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Trash2,
  Edit2,
  Scissors,
  Copy,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { Track, AudioClip, AudioResource, ProgressiveVolumeMode } from '../types';

interface TrackItemProps {
  track: Track;
  index: number;
  zoom: number; // pixels per second
  totalDuration: number;
  resources: AudioResource[];
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onUpdateTrack: (updatedTrack: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveClip: (clipId: string, newStartTime: number) => void;
  onTrimClip: (clipId: string, newTrimOffset: number, newDuration: number) => void;
  onSplitClip: (clipId: string, playheadTime: number) => void;
  onDuplicateClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onDropOnTrack: (e: React.DragEvent, trackId: string) => void;
  playheadTime: number;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  zoom,
  totalDuration,
  resources,
  selectedClipId,
  onSelectClip,
  onUpdateTrack,
  onDeleteTrack,
  onMoveClip,
  onTrimClip,
  onSplitClip,
  onDuplicateClip,
  onDeleteClip,
  onDropOnTrack,
  playheadTime,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [trackName, setTrackName] = useState(track.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const trackLaneRef = useRef<HTMLDivElement>(null);

  const resourceMap = new Map<string, AudioResource>(resources.map(r => [r.id, r]));

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateTrack({ ...track, volume: val });
  };

  const handleProgressiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ProgressiveVolumeMode;
    onUpdateTrack({ ...track, progressiveVolume: val });
  };

  const handleFadeDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0.5, Math.min(10, parseFloat(e.target.value) || 2.0));
    onUpdateTrack({ ...track, fadeDuration: val });
  };

  const toggleMute = () => {
    onUpdateTrack({ ...track, isMuted: !track.isMuted });
  };

  const toggleSolo = () => {
    onUpdateTrack({ ...track, isSolo: !track.isSolo });
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (trackName.trim()) {
      onUpdateTrack({ ...track, name: trackName.trim() });
    } else {
      setTrackName(track.name);
    }
  };

  const handleClipMouseDown = (e: React.MouseEvent | React.TouchEvent, clip: AudioClip) => {
    e.stopPropagation();
    onSelectClip(clip.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startClipTime = clip.startTime;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = curX - clientX;
      const deltaTime = deltaX / zoom;
      const newStart = Math.max(0, startClipTime + deltaTime);
      onMoveClip(clip.id, newStart);
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  // Left Trim (Recortar Inicio)
  const handleTrimLeftMouseDown = (e: React.MouseEvent | React.TouchEvent, clip: AudioClip) => {
    e.stopPropagation();
    onSelectClip(clip.id);

    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const originalStartTime = clip.startTime;
    const originalTrimOffset = clip.trimOffset;
    const originalDuration = clip.duration;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = curX - startX;
      const deltaTime = deltaX / zoom;

      const maxShiftRight = originalDuration - 0.2;
      const maxShiftLeft = Math.min(originalStartTime, originalTrimOffset);
      const clampedDeltaTime = Math.max(-maxShiftLeft, Math.min(maxShiftRight, deltaTime));

      const newStart = originalStartTime + clampedDeltaTime;
      const newOffset = originalTrimOffset + clampedDeltaTime;
      const newDuration = originalDuration - clampedDeltaTime;

      onTrimClip(clip.id, newOffset, newDuration, newStart);
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  // Right Trim (Recortar Fin)
  const handleTrimRightMouseDown = (e: React.MouseEvent | React.TouchEvent, clip: AudioClip) => {
    e.stopPropagation();
    onSelectClip(clip.id);

    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const originalDuration = clip.duration;
    const resource = resourceMap.get(clip.resourceId);
    const totalResourceDuration = resource ? resource.duration : 9999;
    const maxAvail = Math.max(0.2, totalResourceDuration - clip.trimOffset);

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const deltaX = curX - startX;
      const deltaTime = deltaX / zoom;

      const newDuration = Math.min(maxAvail, Math.max(0.2, originalDuration + deltaTime));
      onTrimClip(clip.id, clip.trimOffset, newDuration, clip.startTime);
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div className="flex border-b border-[#0A018A] bg-[#1D006B]/90 hover:bg-[#1D006B] min-h-[90px] transition-colors group/track">
      {/* CONTROLES POR PISTA (1 Fila Compacta Izquierda) */}
      <div className="w-80 flex-shrink-0 bg-[#0A018A]/40 border-r-2 border-[#0A018A] p-2 flex flex-col justify-between select-none">
        {/* Track Title & Controls Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 flex-1 overflow-hidden mr-1">
            <span className="text-[10px] px-1 py-0.5 rounded bg-[#1AA7C7] text-[#1D006B] font-extrabold uppercase font-mono">
              🎵 #{index + 1}
            </span>

            {isEditingName ? (
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
                className="text-xs font-bold text-white bg-[#1D006B] border border-[#1AA7C7] rounded px-1 w-28 focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="text-xs font-bold text-white truncate cursor-pointer hover:text-[#1AA7C7] font-mono flex items-center space-x-1"
                title="Haz clic para renombrar pista"
              >
                <span>{track.name}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover/track:opacity-100 text-[#1AA7C7]" />
              </div>
            )}
          </div>

          <button
            onClick={() => onDeleteTrack(track.id)}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            title="Eliminar pista completa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Controls Row (Volumen, M, S) */}
        <div className="flex items-center justify-between my-1 text-[11px] font-mono">
          {/* Static Volume Slider */}
          <div className="flex items-center space-x-1 bg-[#1D006B] p-1 rounded border border-[#0A018A] flex-1 mr-2">
            <Volume2 className="w-3.5 h-3.5 text-[#1AA7C7] flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={track.volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#1AA7C7] h-1.5 bg-[#0A018A] rounded cursor-pointer"
              title={`Volumen total: ${Math.round(track.volume * 100)}%`}
            />
            <span className="text-[10px] text-white font-bold w-7 text-right">
              {Math.round(track.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMute}
              className={`px-2 py-0.5 rounded font-extrabold border transition-colors cursor-pointer ${
                track.isMuted
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-[#1D006B] text-[#1AA7C7] border-[#0A018A] hover:bg-[#005B9E] hover:text-white'
              }`}
              title="Mute (Silenciar esta pista)"
            >
              [M]
            </button>
            <button
              onClick={toggleSolo}
              className={`px-2 py-0.5 rounded font-extrabold border transition-colors cursor-pointer ${
                track.isSolo
                  ? 'bg-yellow-500 text-[#1D006B] border-yellow-300'
                  : 'bg-[#1D006B] text-[#1AA7C7] border-[#0A018A] hover:bg-[#005B9E] hover:text-white'
              }`}
              title="Solo (Escuchar únicamente esta pista)"
            >
              [S]
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DE TRABAJO / CLIPS DE LA PISTA (Línea de Tiempo Derecha) */}
      <div
        ref={trackLaneRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          onDropOnTrack(e, track.id);
        }}
        className={`flex-1 relative min-h-[90px] bg-[#1D006B]/50 transition-colors ${
          isDragOver ? 'bg-[#005B9E]/30 border-2 border-dashed border-[#1AA7C7]' : ''
        }`}
        style={{ width: `${totalDuration * zoom}px` }}
      >
        {/* Clips visuales en la pista */}
        {track.clips.map((clip) => {
          const res = resourceMap.get(clip.resourceId);
          const isSelected = selectedClipId === clip.id;
          const clipWidthPx = clip.duration * zoom;
          const clipLeftPx = clip.startTime * zoom;
          const isNarrow = clipWidthPx < 70;

          return (
            <div
              key={clip.id}
              onMouseDown={(e) => handleClipMouseDown(e, clip)}
              onTouchStart={(e) => handleClipMouseDown(e, clip)}
              style={{
                left: `${clipLeftPx}px`,
                width: `${Math.max(50, clipWidthPx)}px`,
              }}
              className={`absolute top-1.5 bottom-1.5 rounded-lg border-2 shadow-lg transition-all flex flex-col justify-between p-1 cursor-grab active:cursor-grabbing select-none ${
                isSelected
                  ? 'bg-[#005B9E] border-[#1AA7C7] ring-2 ring-[#1AA7C7]/80 z-20 overflow-visible'
                  : 'bg-[#1AA7C7]/80 hover:bg-[#1AA7C7] border-[#0A018A] text-[#1D006B] overflow-hidden z-10'
              }`}
            >
              {/* Floating Delete Badge for Selected Clip (Guaranteed Clickable on Any Clip Size) */}
              {isSelected && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    onDeleteClip(clip.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClip(clip.id);
                  }}
                  className="absolute -top-2.5 -right-2.5 z-50 p-1 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl hover:scale-125 transition-all cursor-pointer border-2 border-white flex items-center justify-center min-w-[24px] min-h-[24px]"
                  title="ELIMINAR ESTE CLIP"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Left Trim Handle (Recortar Inicio) */}
              <div
                onMouseDown={(e) => handleTrimLeftMouseDown(e, clip)}
                onTouchStart={(e) => handleTrimLeftMouseDown(e, clip)}
                className={`absolute left-0 top-0 bottom-0 ${
                  isNarrow ? 'w-2 z-20' : 'w-3 z-20'
                } bg-[#0A018A] hover:bg-[#1AA7C7] cursor-ew-resize flex items-center justify-center opacity-80 hover:opacity-100 border-r border-[#1AA7C7]/80 rounded-l-md transition-all shadow`}
                title="Arrastra para recortar el inicio del audio"
              >
                <div className="w-[1.5px] h-3 bg-white rounded-full" />
              </div>

              {/* Right Trim Handle (Recortar Fin) */}
              <div
                onMouseDown={(e) => handleTrimRightMouseDown(e, clip)}
                onTouchStart={(e) => handleTrimRightMouseDown(e, clip)}
                className={`absolute right-0 top-0 bottom-0 ${
                  isNarrow ? 'w-2 z-20' : 'w-3 z-20'
                } bg-[#0A018A] hover:bg-[#1AA7C7] cursor-ew-resize flex items-center justify-center opacity-80 hover:opacity-100 border-l border-[#1AA7C7]/80 rounded-r-md transition-all shadow`}
                title="Arrastra para recortar el final del audio"
              >
                <div className="w-[1.5px] h-3 bg-white rounded-full" />
              </div>

              {/* Header Clip Info & In-Card Delete Button */}
              <div className="flex items-center justify-between px-2.5 pt-0.5 z-30 pointer-events-none">
                {!isNarrow && (
                  <span
                    className={`text-[10px] font-extrabold truncate font-mono max-w-[60%] ${
                      isSelected ? 'text-white' : 'text-[#1D006B]'
                    }`}
                  >
                    {clip.name}
                  </span>
                )}

                <div className="flex items-center space-x-1 ml-auto pointer-events-auto">
                  {!isNarrow && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded ${
                        isSelected ? 'bg-[#1D006B] text-[#1AA7C7]' : 'bg-[#1D006B]/80 text-white'
                      }`}
                    >
                      {clip.duration.toFixed(1)}s
                    </span>
                  )}

                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="p-1 rounded bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow hover:scale-110 active:scale-95 flex items-center justify-center z-40 min-w-[20px] min-h-[20px]"
                    title="Eliminar este clip"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Waveform Visualization */}
              {res && res.peaks && res.peaks.length > 0 ? (
                <div className="h-6 w-full flex items-center space-x-[1px] my-0.5 px-3 overflow-hidden pointer-events-none">
                  {res.peaks.slice(0, Math.floor(clipWidthPx / 3)).map((p, idx) => (
                    <div
                      key={idx}
                      className={`w-full rounded-full transition-all ${
                        isSelected ? 'bg-white opacity-90' : 'bg-[#1D006B] opacity-80'
                      }`}
                      style={{ height: `${Math.max(15, p * 100)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-6 w-full flex items-center justify-center font-mono text-[9px] text-[#1D006B]/60 italic pointer-events-none">
                  [ ░▒▓▒░ ]
                </div>
              )}

              {/* Clip Floating Actions (On Selection) */}
              {isSelected && (
                <div className="flex items-center justify-end space-x-1 px-2 pb-0.5 z-40 pointer-events-auto">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      onSplitClip(clip.id, playheadTime);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplitClip(clip.id, playheadTime);
                    }}
                    className="p-1 rounded bg-[#1D006B] hover:bg-[#1AA7C7] text-white hover:text-[#1D006B] text-[9px] font-bold transition-colors cursor-pointer shadow"
                    title="Dividir clip en posición actual de la aguja"
                  >
                    <Scissors className="w-3 h-3" />
                  </button>

                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      onDuplicateClip(clip.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateClip(clip.id);
                    }}
                    className="p-1 rounded bg-[#1D006B] hover:bg-[#1AA7C7] text-white hover:text-[#1D006B] text-[9px] font-bold transition-colors cursor-pointer shadow"
                    title="Duplicar clip"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="p-1 rounded bg-red-700 hover:bg-red-600 text-white text-[9px] font-bold transition-colors cursor-pointer shadow"
                    title="Eliminar clip"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
