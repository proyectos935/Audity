import React, { useRef, useState } from 'react';
import { Plus, Navigation } from 'lucide-react';
import { TrackItem } from './TrackItem';
import { Track, AudioResource } from '../types';
import { CustomPushPinIcon, CustomSparklesIcon } from './CustomIcons';

interface TimelineProps {
  tracks: Track[];
  resources: AudioResource[];
  playheadTime: number;
  totalDuration: number;
  zoom: number; // pixels per second
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onSeek: (time: number) => void;
  onUpdateTrack: (updatedTrack: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddTrack: (type: 'voice' | 'audio') => void;
  onMoveClip: (clipId: string, newStartTime: number) => void;
  onTrimClip: (clipId: string, newTrimOffset: number, newDuration: number) => void;
  onSplitClip: (clipId: string, playheadTime: number) => void;
  onDuplicateClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onDropOnTrack: (e: React.DragEvent, trackId: string) => void;
  onDropOnTimelineArea: (e: React.DragEvent) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  resources,
  playheadTime,
  totalDuration,
  zoom,
  selectedClipId,
  onSelectClip,
  onSeek,
  onUpdateTrack,
  onDeleteTrack,
  onAddTrack,
  onMoveClip,
  onTrimClip,
  onSplitClip,
  onDuplicateClip,
  onDeleteClip,
  onDropOnTrack,
  onDropOnTimelineArea,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  // Calculate ticks
  const timelineWidthPx = Math.max(1000, totalDuration * zoom);
  const stepSeconds = zoom >= 50 ? 5 : zoom >= 20 ? 10 : 30;
  const numTicks = Math.ceil(totalDuration / stepSeconds);

  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => i * stepSeconds);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRulerMouseDown = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    setIsSeeking(true);
    updateSeekFromEvent(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateSeekFromEvent(moveEvent);
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateSeekFromEvent = (e: MouseEvent | React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(clickX / zoom, totalDuration));
    onSeek(newTime);
  };

  const playheadLeftPx = playheadTime * zoom;

  return (
    <div
      className="flex-1 bg-[#1D006B] overflow-x-auto overflow-y-auto relative flex flex-col custom-scrollbar select-none"
      onClick={() => onSelectClip(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOnTimelineArea}
    >
      {/* REGLA DE TIEMPO HORIZONTAL Y HEADER DE TIEMPO */}
      <div className="sticky top-0 z-30 flex bg-[#1D006B] border-b-2 border-[#0A018A] shadow-md">
        {/* Track Controls Header Column */}
        <div className="w-80 flex-shrink-0 bg-[#0A018A] px-3 py-2 border-r-2 border-[#0A018A] flex items-center justify-between text-white font-mono text-xs font-bold">
          <span className="flex items-center space-x-1.5 text-[#1AA7C7]">
            <Navigation className="w-4 h-4" />
            <span>PISTAS Y CONTROLES</span>
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTrack('audio');
              }}
              className="px-2.5 py-1 bg-[#005B9E] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white text-[11px] rounded font-bold transition-colors cursor-pointer"
              title="Añadir nueva Pista"
            >
              + Nueva Pista
            </button>
          </div>
        </div>

        {/* Ruler Track Lane */}
        <div
          ref={rulerRef}
          onMouseDown={handleRulerMouseDown}
          className="flex-1 h-9 bg-[#0A018A]/60 relative cursor-pointer group/ruler"
          style={{ width: `${timelineWidthPx}px` }}
        >
          {ticks.map((t) => {
            const left = t * zoom;
            return (
              <div
                key={t}
                style={{ left: `${left}px` }}
                className="absolute top-0 bottom-0 border-l border-[#1AA7C7]/30 flex flex-col justify-between pl-1 pointer-events-none"
              >
                <span className="text-[10px] font-mono font-bold text-[#1AA7C7]">
                  {formatTime(t)}
                </span>
                <div className="h-2 w-[1px] bg-[#1AA7C7]/60 mb-0.5" />
              </div>
            );
          })}

          {/* AGUJA PLAYHEAD INDICATOR ON RULER */}
          <div
            style={{ left: `${playheadLeftPx}px` }}
            className="absolute top-0 bottom-0 z-40 flex flex-col items-center pointer-events-none transform -translate-x-1/2"
          >
            <div className="px-1.5 py-0.5 bg-red-600 text-white font-mono font-extrabold text-[10px] rounded shadow-lg flex items-center space-x-1 border border-white">
              <CustomPushPinIcon className="w-3.5 h-3.5 text-white" />
              <span>AGUJA ({formatTime(playheadTime)})</span>
            </div>
            <div className="w-[2px] bg-red-500 flex-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        </div>
      </div>

      {/* SISTEMA DE PISTAS DINÁMICAS E INTELIGENTES (#1AA7C7) */}
      <div className="flex-1 relative flex flex-col min-h-[300px]">
        {/* PLAYHEAD VERTICAL NEEDLE LINE ACROSS ALL TRACKS */}
        <div
          style={{ left: `${320 + playheadLeftPx}px` }}
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)]"
        />

        {tracks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#1AA7C7]">
            <Navigation className="w-12 h-12 mb-3 text-[#1AA7C7]/40" />
            <p className="text-base font-bold text-white font-mono">Línea de tiempo vacía</p>
            <p className="text-xs text-[#1AA7C7] mt-1 max-w-md font-mono">
              Haz clic en <span className="text-white font-bold">[ REC ]</span> para grabar voz en vivo o arrastra audios desde el panel de recursos.
            </p>

            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTrack('audio');
                }}
                className="px-4 py-2 bg-[#005B9E] hover:bg-[#1AA7C7] hover:text-[#1D006B] text-white font-bold text-xs rounded border border-[#1AA7C7]/50 shadow transition-all cursor-pointer"
              >
                + Crear Pista
              </button>
            </div>
          </div>
        ) : (
          tracks.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              zoom={zoom}
              totalDuration={totalDuration}
              resources={resources}
              selectedClipId={selectedClipId}
              onSelectClip={onSelectClip}
              onUpdateTrack={onUpdateTrack}
              onDeleteTrack={onDeleteTrack}
              onMoveClip={onMoveClip}
              onTrimClip={onTrimClip}
              onSplitClip={onSplitClip}
              onDuplicateClip={onDuplicateClip}
              onDeleteClip={onDeleteClip}
              onDropOnTrack={onDropOnTrack}
              playheadTime={playheadTime}
            />
          ))
        )}

        {/* Add Track Bottom Button */}
        {tracks.length > 0 && (
          <div className="p-3 bg-[#1D006B]/80 flex items-center space-x-2 border-t border-[#0A018A]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTrack('audio');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A018A] hover:bg-[#005B9E] text-[#1AA7C7] hover:text-white font-bold text-xs rounded border border-[#1AA7C7]/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Pista</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
