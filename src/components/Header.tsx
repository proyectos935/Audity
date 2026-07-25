import React, { useRef } from 'react';
import { AppLogo } from './AppLogo';
import { CustomFolderIcon, CustomFloppySaveIcon, CustomExportDownloadIcon } from './CustomIcons';

interface HeaderProps {
  onLoadProject: (file: File) => void;
  onSaveProject: () => void;
  onOpenExportModal: () => void;
  projectTitle: string;
  onTitleChange: (title: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadProject,
  onSaveProject,
  onOpenExportModal,
  projectTitle,
  onTitleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLoadProject(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 bg-[#1D006B] border-b-2 border-[#0A018A] px-4 flex items-center justify-between shadow-lg select-none z-20">
      {/* Esquina Izquierda: Logo & Chiquitos Botones .ALI */}
      <div className="flex items-center space-x-4">
        {/* Logo Container Area */}
        <div className="flex items-center">
          <AppLogo className="w-10 h-10" />
        </div>

        <div className="h-6 w-[1px] bg-[#0A018A] mx-1" />

        {/* Project Title Input */}
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-[#0A018A]/40 text-sm font-medium text-white px-2 py-1 rounded border border-[#0A018A] focus:outline-none focus:border-[#1AA7C7] w-36 sm:w-48 transition-colors"
          placeholder="Nombre del proyecto"
        />

        {/* Botones Chiquitos .ALI */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0A018A] hover:bg-[#005B9E] rounded border border-[#1AA7C7]/40 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Cargar archivo ejecutable de proyecto .ALI"
          >
            <CustomFolderIcon className="w-5 h-5 text-white" />
            <span>[ Cargar .ALI ]</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".ali,.json"
            className="hidden"
          />

          <button
            onClick={onSaveProject}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0A018A] hover:bg-[#005B9E] rounded border border-[#1AA7C7]/40 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Guardar estado del proyecto en archivo ejecutable .ALI"
          >
            <CustomFloppySaveIcon className="w-5 h-5 text-white" />
            <span>[ Guardar .ALI ]</span>
          </button>
        </div>
      </div>

      {/* Esquina Superior Derecha: Botón EXPORTAR MP3 */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#005B9E] to-[#1AA7C7] hover:from-[#1AA7C7] hover:to-[#005B9E] rounded-md shadow-md border border-[#1AA7C7]/50 transition-all active:scale-95 cursor-pointer"
        >
          <CustomExportDownloadIcon className="w-6 h-6 text-white animate-bounce" />
          <span className="tracking-wide uppercase">[ EXPORTAR MP3 ]</span>
        </button>
      </div>
    </header>
  );
};

