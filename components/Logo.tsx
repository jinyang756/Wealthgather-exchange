
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex-shrink-0 ${className}`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            {/* Light Gold Gradient (Top/Highlight) */}
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            
            {/* Medium Gold Gradient (Left Side) */}
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>

            {/* Dark Gold Gradient (Right Side/Shadow) */}
            <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#8B6508" />
            </linearGradient>
          </defs>

          {/* 
             Design Concept: "Wealth Gathering Hexagon" 
             Three diamond shapes converging to the center, forming a 3D Cube/Hexagon.
             Symbolizes: Stability, Convergence, Wealth Management.
          */}

          {/* Left Wing */}
          <path 
            d="M50 50 L10 28 L10 72 L50 95 Z" 
            fill="url(#grad2)" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="1"
          />

          {/* Right Wing */}
          <path 
            d="M50 50 L90 28 L90 72 L50 95 Z" 
            fill="url(#grad3)" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="1"
          />

          {/* Top Wing */}
          <path 
            d="M50 50 L10 28 L50 5 L90 28 Z" 
            fill="url(#grad1)" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"
          />

          {/* Inner Core Glow (Subtle) */}
          <circle cx="50" cy="50" r="5" fill="#FFF" fillOpacity="0.3" filter="blur(4px)" />
        </svg>
      </div>
      
      {/* Optional Text for Sidebar/Header usage */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-bold text-white leading-none tracking-wide font-sans">聚财众发</span>
          <span className="text-[9px] text-primary-gold leading-none scale-90 origin-left mt-0.5 font-mono tracking-widest opacity-80">EXCHANGE</span>
        </div>
      )}
    </div>
  );
};
