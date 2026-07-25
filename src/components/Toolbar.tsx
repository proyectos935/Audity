import React from 'react';
import {
  Square,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Trash2,
} from 'lucide-react';
import {
  CustomStudioMicIcon,
  CustomRedRecordIcon,
  CustomLeftArrowIcon,
  CustomPlayTriangleIcon,
  CustomRightArrowIcon,
  CustomScissorsIcon,
} from './CustomIcons';

interface ToolbarProps {
  isRecording: boolean;
  recordingDuration: number;
  recordingLevel: number;
  onToggleRecord: () => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRewind5s: () => void;
  onForward5s: () => void;
  onResetOrigin: () => void;
  onSplitAtPlayhead?: () => void;
  onDeleteSelectedClip?: () => void;
  selectedClipId?: string | null;
  currentTime: number;
  totalDuration: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isRecording,
  recordingDuration,
  recordingLevel,
  onToggleRecord,
  isPlaying,
  onPlay,
  onPause,
  onRewind5s,
  onForward5s,
  onResetOrigin,
  onSplitAtPlayhead,
  onDeleteSelectedClip,
  selectedClipId,
  currentTime,
  totalDuration,
  zoom,
  onZoomChange,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#1D006B] border-b-2 border-[#0A018A] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md z-10 select-none">
      {/* Control de Grabación Directa */}
      <div className="flex items-center space-x-2 bg-[#0A018A]/60 p-1.5 rounded-lg border border-[#0A018A]">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#1D006B] rounded border border-[#1AA7C7]/30">
          <CustomStudioMicIcon
            className={`w-6 h-6 ${
              isRecording ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          />
          <span className="text-xs font-bold text-white font-mono">[ Grabación ]</span>
        </div>

        <button
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleRecord();
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shadow active:scale-95 cursor-pointer ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse border border-red-400'
              : 'bg-[#005B9E] hover:bg-[#1AA7C7] text-white border border-[#1AA7C7]/40'
          }`}
          title={isRecording ? 'Detener y colocar directo en Pista de Voz' : 'Iniciar grabación en vivo'}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current text-white" />
              <span>[ DETENER ]</span>
            </>
          ) : (
            <>
              <CustomRedRecordIcon className="w-4 h-4" />
              <span>[ REC ]</span>
            </>
          )}
        </button>

        {/* Recording status indicator */}
        {isRecording && (
          <div className="flex items-center space-x-2 pl-2">
            <span className="text-xs font-mono font-bold text-red-400">
              {formatTime(recordingDuration)}
            </span>
            <div className="w-16 h-2 bg-[#1D006B] rounded-full overflow-hidden border border-red-500/50">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
                style={{ width: `${Math.min(100, recordingLevel * 300)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controles de Reproducción Centrales */}
      <div className="flex items-center space-x-1 bg-[#0A018A]/60 p-1.5 rounded-lg border border-[#0A018A]">
        <button
          onClick={onResetOrigin}
          className="p-1.5 rounded bg-[#1D006B] hover:bg-[#005B9E] text-[#1AA7C7] hover:text-white transition-colors cursor-pointer"
          title="Ir al inicio (00:00)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRewind5s}
          className="px-2 py-1 rounded bg-[#1D006B] hover:bg-[#005B9E] text-xs font-bold text-white hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
          title="Rebobinar 5 segundos"
        >
          <CustomLeftArrowIcon className="w-4 h-4" />
          <span>[ -5s ]</span>
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            className="px-3.5 py-1.5 rounded bg-[#005B9E] hover:bg-[#1AA7C7] text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow active:scale-95 cursor-pointer"
            title="Pausar reproducción"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>[ PAUSA ]</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="px-3.5 py-1.5 rounded bg-[#1AA7C7] hover:bg-[#005B9E] text-[#1D006B] hover:text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow active:scale-95 cursor-pointer"
            title="Iniciar reproducción"
          >
            <CustomPlayTriangleIcon className="w-4 h-4 text-white" />
            <span>[ PLAY ]</span>
          </button>
        )}

        <button
          onClick={onForward5s}
          className="px-2 py-1 rounded bg-[#1D006B] hover:bg-[#005B9E] text-xs font-bold text-white hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
          title="Adelantar 5 segundos"
        >
          <CustomRightArrowIcon className="w-4 h-4" />
          <span>[ +5s ]</span>
        </button>

        {onSplitAtPlayhead && (
          <button
            onClick={onSplitAtPlayhead}
            className="px-3 py-1.5 rounded bg-[#005B9E] hover:bg-[#1AA7C7] text-white hover:text-[#1D006B] font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow active:scale-95 cursor-pointer border border-[#1AA7C7]/50 ml-1"
            title="Cortar/Dividir el clip seleccionado o que está bajo la aguja con las Tijeras"
          >
            <CustomScissorsIcon className="w-4 h-4 text-white" />
            <span>[ CORTAR EN AGUJA ]</span>
          </button>
        )}

        {selectedClipId && onDeleteSelectedClip && (
          <button
            onClick={(e) => {
              e.currentTarget.blur();
              onDeleteSelectedClip();
            }}
            className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow active:scale-95 cursor-pointer border border-red-500/50 ml-1"
            title="Eliminar el clip actualmente seleccionado"
          >
            <Trash2 className="w-4 h-4" />
            <span>[ ELIMINAR CLIP ]</span>
          </button>
        )}
      </div>

      {/* Contador de Tiempo Actual / Total */}
      <div className="flex items-center space-x-4">
        <div className="bg-[#0A018A] px-3.5 py-1.5 rounded-lg border border-[#1AA7C7]/40 flex items-center space-x-2 shadow-inner">
          <span className="text-[10px] text-[#1AA7C7] uppercase tracking-wider font-semibold">
            TIEMPO:
          </span>
          <span className="text-sm font-mono font-extrabold text-white tracking-widest">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-[#0A018A]/60 p-1 rounded-lg border border-[#0A018A]">
          <button
            onClick={() => onZoomChange(Math.max(10, zoom - 10))}
            className="p-1 rounded bg-[#1D006B] hover:bg-[#005B9E] text-[#1AA7C7] hover:text-white transition-colors cursor-pointer"
            title="Alejar zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-[#1AA7C7] px-1 font-bold">
            {zoom}px/s
          </span>
          <button
            onClick={() => onZoomChange(Math.min(100, zoom + 10))}
            className="p-1 rounded bg-[#1D006B] hover:bg-[#005B9E] text-[#1AA7C7] hover:text-white transition-colors cursor-pointer"
            title="Acercar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
