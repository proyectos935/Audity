import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Flute Icon (Flauta) - White SVG matching user image
export const FluteIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Body tube outline & translucent fill */}
    <line
      x1="20"
      y1="80"
      x2="80"
      y2="20"
      stroke="white"
      strokeWidth="14"
      strokeLinecap="round"
      opacity="0.2"
    />
    <line
      x1="20"
      y1="80"
      x2="80"
      y2="20"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* 4 solid finger hole dots along the tube */}
    <circle cx="38" cy="62" r="4.5" fill="white" />
    <circle cx="48" cy="52" r="4.5" fill="white" />
    <circle cx="58" cy="42" r="4.5" fill="white" />
    <circle cx="70" cy="30" r="4.5" fill="white" />
  </svg>
);

// 2. Chiptune / Gamepad Controller Icon - White SVG matching user image
export const ChiptuneControllerIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Outer controller body */}
    <rect x="4" y="6" width="92" height="48" rx="24" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="5" />
    {/* D-Pad / Left Button */}
    <circle cx="30" cy="30" r="11" fill="white" />
    {/* Right Action Buttons */}
    <circle cx="64" cy="30" r="11" fill="white" />
    <circle cx="82" cy="30" r="7" fill="white" />
  </svg>
);

// 3. Guitar Icon (Guitarra) - White SVG matching user image
export const GuitarIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Guitar Body & Neck Contour */}
    <path
      d="M34 50 C20 56, 18 74, 26 86 C18 98, 22 114, 50 114 C78 114, 82 98, 74 86 C82 74, 80 56, 66 50 L60 14 C64 8, 64 2, 50 2 C36 2, 36 8, 40 14 Z"
      fill="white"
      fillOpacity="0.2"
      stroke="white"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Soundhole */}
    <circle cx="50" cy="72" r="9" fill="white" stroke="white" strokeWidth="2" />
    {/* Bridge */}
    <rect x="36" y="98" width="28" height="6" rx="3" fill="white" />

    {/* Strings flaring at top headstock and running down to bridge */}
    <path
      d="M38 2 C42 8, 44 14, 44 98"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M45 2 C47 8, 48 14, 48 98"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M55 2 C53 8, 52 14, 52 98"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M62 2 C58 8, 56 14, 56 98"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// 4. Pipe Organ Icon (Órgano de Tubos) - White SVG matching user image
export const PipeOrganIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Pipes */}
    <rect x="10" y="25" width="9" height="42" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="22" y="18" width="9" height="49" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="34" y="10" width="9" height="57" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="46" y="2" width="9" height="65" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="58" y="10" width="9" height="57" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="70" y="18" width="9" height="49" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    <rect x="82" y="25" width="9" height="42" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3" />
    {/* Base console */}
    <path d="M6 68 L94 68 L98 96 L2 96 Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="4" />
    <line x1="16" y1="78" x2="84" y2="78" stroke="white" strokeWidth="3" />
    <line x1="16" y1="87" x2="84" y2="87" stroke="white" strokeWidth="3" />
  </svg>
);

// 5. Plus + Music Note Icon (+ 🎵) - White SVG matching user image
export const PlusMusicNoteIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Bold Plus */}
    <rect x="8" y="32" width="36" height="16" rx="8" fill="white" />
    <rect x="18" y="22" width="16" height="36" rx="8" fill="white" />

    {/* Musical Note */}
    <path d="M74 15 V48" stroke="white" strokeWidth="7" strokeLinecap="round" />
    <circle cx="62" cy="52" r="12" fill="white" />
    <path d="M74 15 C86 18, 92 26, 92 34" stroke="white" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

// 6. Custom Folder Icon - White SVG matching user image
export const CustomFolderIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Back folder */}
    <path
      d="M8 18 L36 18 L46 28 L92 28 L92 72 L8 72 Z"
      fill="white"
      fillOpacity="0.2"
      stroke="white"
      strokeWidth="5"
      strokeLinejoin="round"
    />
    {/* Open front flap */}
    <path
      d="M12 36 L96 36 L84 72 L12 72 Z"
      fill="white"
      fillOpacity="0.4"
      stroke="white"
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

// 7. Custom Floppy Save Icon - White SVG matching user image
export const CustomFloppySaveIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    <path
      d="M10 8 L76 8 L92 24 L92 92 L10 92 Z"
      fill="white"
      stroke="white"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    {/* Metal shutter top slot */}
    <rect x="28" y="8" width="40" height="32" fill="#0A018A" rx="2" />
    <rect x="52" y="16" width="10" height="18" fill="white" rx="1" />
    {/* Bottom label box */}
    <rect x="22" y="52" width="56" height="38" rx="4" fill="#0A018A" />
  </svg>
);

// 8. Custom Export Download Icon - White SVG matching user image
export const CustomExportDownloadIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Downward Arrow */}
    <path d="M50 10 V58" stroke="white" strokeWidth="12" strokeLinecap="round" />
    <path d="M26 38 L50 62 L74 38" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    {/* Tray */}
    <path d="M16 68 V84 H84 V68" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// 9. Custom Plus Icon - White SVG matching user image
export const CustomPlusIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    <rect x="15" y="40" width="70" height="20" rx="10" fill="white" />
    <rect x="40" y="15" width="20" height="70" rx="10" fill="white" />
  </svg>
);

// 10. Studio Condenser Mic Icon - White SVG matching user image
export const CustomStudioMicIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Mic Capsule Body */}
    <rect x="26" y="8" width="48" height="72" rx="14" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="4" />
    {/* Mesh grille horizontal line */}
    <line x1="26" y1="42" x2="74" y2="42" stroke="white" strokeWidth="3" />
    {/* Mesh pattern lines */}
    <line x1="38" y1="8" x2="38" y2="42" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="50" y1="8" x2="50" y2="42" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="62" y1="8" x2="62" y2="42" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
    {/* Gain switch box */}
    <rect x="40" y="54" width="20" height="14" rx="3" fill="white" />
    {/* U-Bracket Mount */}
    <path d="M14 48 V86 C14 104, 86 104, 86 86 V48" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
    {/* Base Stand */}
    <line x1="50" y1="102" x2="50" y2="116" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <line x1="30" y1="116" x2="70" y2="116" stroke="white" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

// 11. Red Record Circle Icon (Image 1)
export const CustomRedRecordIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} shrink-0 drop-shadow`}
  >
    <circle cx="50" cy="50" r="42" fill="#D30000" />
  </svg>
);

// 12. Thick White Left Arrow Icon (Image 2)
export const CustomLeftArrowIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    <path
      d="M42 8 L12 30 L42 52 M16 30 H88"
      stroke="white"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 13. White Play Triangle Icon (Image 3)
export const CustomPlayTriangleIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    <path
      d="M28 15 C28 10, 34 7, 38 10 L82 45 C86 48, 86 52, 82 55 L38 90 C34 93, 28 90, 28 85 Z"
      fill="white"
      fillOpacity="0.2"
      stroke="white"
      strokeWidth="6"
      strokeLinejoin="round"
    />
  </svg>
);

// 14. Thick White Right Arrow Icon (Image 4)
export const CustomRightArrowIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    <path
      d="M58 8 L88 30 L58 52 M84 30 H12"
      stroke="white"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 15. White Scissors Icon (Image 5)
export const CustomScissorsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Handles */}
    <circle cx="30" cy="25" r="14" stroke="white" strokeWidth="6" fill="none" />
    <circle cx="70" cy="25" r="14" stroke="white" strokeWidth="6" fill="none" />
    {/* Blades crossing */}
    <path d="M38 34 L62 90" stroke="white" strokeWidth="7" strokeLinecap="round" />
    <path d="M62 34 L38 90" stroke="white" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

// 16. White Push Pin / Needle Icon (Image 6)
export const CustomPushPinIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Round Head */}
    <circle cx="50" cy="30" r="24" stroke="white" strokeWidth="5" fill="white" fillOpacity="0.2" />
    {/* Stem neck */}
    <path d="M38 52 C38 58, 25 60, 25 64 H75 C75 60, 62 58, 62 52 Z" stroke="white" strokeWidth="4" fill="white" fillOpacity="0.3" />
    {/* Sharp Needle Pin Point */}
    <path d="M50 64 V112" stroke="white" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

// 17. White Sparkles Icon (Image 7)
export const CustomSparklesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} text-white shrink-0 drop-shadow`}
  >
    {/* Center large sparkle */}
    <path d="M50 15 C50 35, 65 50, 85 50 C65 50, 50 65, 50 85 C50 65, 35 50, 15 50 C35 50, 50 35, 50 15 Z" fill="white" />
    {/* Top right small sparkle */}
    <path d="M78 12 C78 20, 84 26, 92 26 C84 26, 78 32, 78 40 C78 32, 72 26, 64 26 C72 26, 78 20, 78 12 Z" fill="white" />
    {/* Bottom left tiny sparkle */}
    <path d="M22 68 C22 74, 26 78, 32 78 C26 78, 22 82, 22 88 C22 82, 18 78, 12 78 C18 78, 22 74, 22 68 Z" fill="white" />
  </svg>
);
