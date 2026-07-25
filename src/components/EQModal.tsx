import React from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Mic,
  Wind,
  Sun,
  VolumeX,
  Disc,
  Radio,
  Bot,
  Phone,
  Ghost,
  Smile,
  Repeat,
  Megaphone,
  Waves,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { EQ_PRESETS, EQPreset } from '../utils/eqPresets';

interface EQModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const EQModal: React.FC<EQModalProps> = ({
  isOpen,
  onClose,
  currentPresetId,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Mic':
        return <Mic className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'VolumeX':
        return <VolumeX className={className} />;
      case 'Disc':
        return <Disc className={className} />;
      case 'Volume2':
        return <Volume2 className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'Bot':
        return <Bot className={className} />;
      case 'Phone':
        return <Phone className={className} />;
      case 'Ghost':
        return <Ghost className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'Echo':
      case 'Repeat':
        return <Repeat className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'Waves':
        return <Waves className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Sliders className={className} />;
    }
  };

  const utilesPresets = EQ_PRESETS.filter((p) => p.group === 'utiles');
  const divertidosPresets = EQ_PRESETS.filter((p) => p.group === 'divertidos');
  const normalPreset = EQ_PRESETS.find((p) => p.group === 'ninguno');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1D006B] border-2 border-[#1AA7C7]/60 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0A018A] border-b-2 border-[#1AA7C7]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1AA7C7]/20 rounded-lg border border-[#1AA7C7]/50 text-white">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                [ ECUALIZADOR Y EFECTOS DE AUDIO (EQ) ]
              </h2>
              <p className="text-xs text-[#1AA7C7] font-mono">
                Selecciona un efecto activo para aplicarlo en tiempo real a la reproducción y exportación MP3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Cerrar ecualizador"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Normal Option */}
          {normalPreset && (
            <div>
              <button
                onClick={() => onSelectPreset('none')}
                className={`w-full p-3.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                  currentPresetId === 'none'
                    ? 'bg-[#1AA7C7]/20 border-[#1AA7C7] shadow-lg shadow-[#1AA7C7]/20 ring-1 ring-[#1AA7C7]'
                    : 'bg-[#0A018A]/40 border-[#0A018A] hover:border-[#1AA7C7]/50 hover:bg-[#0A018A]/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#0A018A] rounded border border-[#1AA7C7]/30 text-white">
                    {renderIcon(normalPreset.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{normalPreset.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-600/50 text-gray-200 border border-gray-500 font-mono">
                        {normalPreset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">{normalPreset.description}</p>
                  </div>
                </div>

                {currentPresetId === 'none' && (
                  <div className="flex items-center space-x-1.5 text-[#1AA7C7] font-bold text-xs bg-[#1AA7C7]/20 px-3 py-1 rounded-full border border-[#1AA7C7]/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACTIVADO</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Sección: útiles */}
          <div>
            <div className="border-b border-[#0A018A] pb-2 mb-4">
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                útiles
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {utilesPresets.map((preset) => {
                const isActive = currentPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`p-3.5 rounded-lg border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1AA7C7]/25 border-[#1AA7C7] shadow-lg shadow-[#1AA7C7]/25 ring-2 ring-[#1AA7C7]'
                        : 'bg-[#0A018A]/50 border-[#0A018A] hover:border-[#1AA7C7]/50 hover:bg-[#0A018A]/80'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded border mt-0.5 ${
                          isActive
                            ? 'bg-[#1AA7C7] text-white border-white'
                            : 'bg-[#0A018A] text-white border-[#1AA7C7]/30'
                        }`}
                      >
                        {renderIcon(preset.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{preset.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-[#1AA7C7] block mt-0.5">
                          {preset.subtitle}
                        </span>
                        <p className="text-xs text-white/70 mt-1 leading-snug">{preset.description}</p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="p-1 text-[#1AA7C7]">
                        <CheckCircle2 className="w-5 h-5 fill-current text-[#1AA7C7] bg-[#1D006B] rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección: divertidos */}
          <div>
            <div className="border-b border-[#0A018A] pb-2 mb-4">
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                divertidos
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {divertidosPresets.map((preset) => {
                const isActive = currentPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`p-3.5 rounded-lg border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1AA7C7]/25 border-[#1AA7C7] shadow-lg shadow-[#1AA7C7]/25 ring-2 ring-[#1AA7C7]'
                        : 'bg-[#0A018A]/50 border-[#0A018A] hover:border-[#1AA7C7]/50 hover:bg-[#0A018A]/80'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded border mt-0.5 ${
                          isActive
                            ? 'bg-[#1AA7C7] text-white border-white'
                            : 'bg-[#0A018A] text-white border-[#1AA7C7]/30'
                        }`}
                      >
                        {renderIcon(preset.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{preset.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-[#1AA7C7] block mt-0.5">
                          {preset.subtitle}
                        </span>
                        <p className="text-xs text-white/70 mt-1 leading-snug">{preset.description}</p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="p-1 text-[#1AA7C7]">
                        <CheckCircle2 className="w-5 h-5 fill-current text-[#1AA7C7] bg-[#1D006B] rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0A018A] border-t border-[#0A018A] flex items-center justify-between">
          <div className="text-xs text-white/70 font-mono">
            {currentPresetId === 'none' ? (
              <span>Sin efecto activo (Modo Normal)</span>
            ) : (
              <span className="text-[#1AA7C7] font-bold">
                Efecto seleccionado: {EQ_PRESETS.find((p) => p.id === currentPresetId)?.name}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#005B9E] hover:bg-[#1AA7C7] rounded-md transition-colors cursor-pointer border border-[#1AA7C7]/40 shadow"
          >
            Aceptar / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
