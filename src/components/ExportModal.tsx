import React, { useState } from 'react';
import { Download, X, Settings2, Disc, Layers, Music } from 'lucide-react';
import { MP3ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: MP3ExportOptions) => void;
  isExporting: boolean;
  exportProgress: number;
  defaultTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  exportProgress,
  defaultTitle,
}) => {
  const [filename, setFilename] = useState(`${defaultTitle || 'Audity_Proyecto'}.mp3`);
  const [bitrate, setBitrate] = useState<number>(192);
  const [channels, setChannels] = useState<'stereo' | 'mono'>('stereo');
  const [sampleRate, setSampleRate] = useState<number>(44100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalName = filename.trim();
    if (!finalName.endsWith('.mp3')) {
      finalName += '.mp3';
    }
    onExport({
      filename: finalName,
      bitrate,
      channels,
      sampleRate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1D006B] border-2 border-[#1AA7C7] rounded-xl w-full max-w-md p-6 shadow-2xl relative text-white">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#0A018A] pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#005B9E] text-white">
              <Download className="w-5 h-5 text-[#1AA7C7]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase font-mono tracking-wider">
                Configuración de Exportación MP3
              </h3>
              <p className="text-xs text-[#1AA7C7]">Renderizado y mezcla multitrama final</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded bg-[#0A018A] hover:bg-red-600/80 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Options */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Filename */}
          <div>
            <label className="block text-xs font-bold text-[#1AA7C7] font-mono mb-1">
              Nombre del Archivo Final
            </label>
            <div className="relative">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isExporting}
                required
                className="w-full bg-[#0A018A] text-white font-mono text-sm px-3 py-2 rounded-md border border-[#1AA7C7]/50 focus:outline-none focus:border-[#1AA7C7] transition-colors"
                placeholder="Audity_Mezcla.mp3"
              />
              <Music className="w-4 h-4 text-[#1AA7C7] absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Bitrate / Quality */}
          <div>
            <label className="block text-xs font-bold text-[#1AA7C7] font-mono mb-1">
              Calidad de Audio (Bitrate kbps)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[128, 192, 256, 320].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setBitrate(rate)}
                  disabled={isExporting}
                  className={`py-2 text-xs font-bold font-mono rounded border transition-all cursor-pointer ${
                    bitrate === rate
                      ? 'bg-[#005B9E] text-white border-[#1AA7C7] shadow-md'
                      : 'bg-[#0A018A] text-[#1AA7C7] border-[#0A018A] hover:bg-[#005B9E]/50'
                  }`}
                >
                  {rate} kbps
                </button>
              ))}
            </div>
          </div>

          {/* Channels & Sample Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1AA7C7] font-mono mb-1">
                Canales
              </label>
              <select
                value={channels}
                onChange={(e) => setChannels(e.target.value as 'stereo' | 'mono')}
                disabled={isExporting}
                className="w-full bg-[#0A018A] text-white font-mono text-xs px-3 py-2 rounded-md border border-[#1AA7C7]/50 focus:outline-none focus:border-[#1AA7C7]"
              >
                <option value="stereo">Estéreo (2 canales)</option>
                <option value="mono">Mono (1 canal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1AA7C7] font-mono mb-1">
                Frecuencia Muestreo
              </label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(parseInt(e.target.value))}
                disabled={isExporting}
                className="w-full bg-[#0A018A] text-white font-mono text-xs px-3 py-2 rounded-md border border-[#1AA7C7]/50 focus:outline-none focus:border-[#1AA7C7]"
              >
                <option value={44100}>44.1 kHz (CD Standard)</option>
                <option value={48000}>48.0 kHz (Estudio Pro)</option>
              </select>
            </div>
          </div>

          {/* Progress Bar when exporting */}
          {isExporting && (
            <div className="bg-[#0A018A] p-3 rounded-lg border border-[#1AA7C7] space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold text-[#1AA7C7]">
                <span>Renderizando y codificando MP3...</span>
                <span>{Math.round(exportProgress * 100)}%</span>
              </div>
              <div className="w-full bg-[#1D006B] h-2.5 rounded-full overflow-hidden border border-[#1AA7C7]/40">
                <div
                  className="bg-gradient-to-r from-[#005B9E] to-[#1AA7C7] h-full transition-all duration-150"
                  style={{ width: `${exportProgress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#0A018A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-[#0A018A] hover:bg-[#005B9E] rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isExporting}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#005B9E] to-[#1AA7C7] hover:from-[#1AA7C7] hover:to-[#005B9E] rounded-md border border-[#1AA7C7] shadow-lg flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Procesando...' : 'Descargar MP3 Final'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
