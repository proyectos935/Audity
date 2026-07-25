import React from 'react';

interface AppLogoProps {
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform hover:scale-105 shrink-0`}
    >
      <defs>
        <linearGradient id="userLogoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00F5D4" />
          <stop offset="35%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#005B9E" />
        </linearGradient>
      </defs>

      {/* Musical Note Contour */}
      <path
        d="M218 85
           C230 85, 275 110, 315 160
           C324 172, 324 200, 314 212
           C302 185, 280 168, 250 166
           V330
           C250 375, 225 415, 185 418
           C142 421, 110 392, 110 352
           C110 312, 142 282, 185 282
           C202 282, 212 288, 218 295
           V85 Z"
        fill="url(#userLogoGradient)"
      />

      {/* 5 Audio Waveform Equalizer Bars */}
      {/* Bar 1 */}
      <rect x="280" y="210" width="20" height="105" rx="10" fill="url(#userLogoGradient)" />
      {/* Bar 2 */}
      <rect x="322" y="130" width="22" height="235" rx="11" fill="url(#userLogoGradient)" />
      {/* Bar 3 (Tallest) */}
      <rect x="364" y="86" width="22" height="328" rx="11" fill="url(#userLogoGradient)" />
      {/* Bar 4 */}
      <rect x="406" y="165" width="20" height="165" rx="10" fill="url(#userLogoGradient)" />
      {/* Bar 5 */}
      <rect x="448" y="212" width="20" height="72" rx="10" fill="url(#userLogoGradient)" />
    </svg>
  );
};

