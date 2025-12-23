
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = "", showText = false }) => {
  return (
    <div className={`flex flex-col items-center gap-3 mx-auto ${className}`}>
      <div 
        className="relative flex items-center justify-center animate-float"
        style={{ width: size, height: size }}
      >
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
        
        {/* Base do Escudo/Logo */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
        >
          {/* Escudo Exterior */}
          <path 
            d="M50 5L85 20V45C85 68.33 70.08 89.8 50 95C29.92 89.8 15 68.33 15 45V20L50 5Z" 
            fill="#050505" 
            stroke="#D4AF37" 
            strokeWidth="4"
          />
          
          {/* Detalhe Tecnológico (Circuitos/Linhas) */}
          <path 
            d="M30 35H70M30 50H70M30 65H55" 
            stroke="#D4AF37" 
            strokeWidth="1" 
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          
          {/* O Nó da Faixa Estilizado */}
          <path 
            d="M40 40C45 35 55 35 60 40C65 45 65 55 60 60C55 65 45 65 40 60C35 55 35 45 40 40Z" 
            fill="#D4AF37"
          />
          <path 
            d="M40 40L25 25M60 40L75 25M40 60L25 75M60 60L75 75" 
            stroke="#D4AF37" 
            strokeWidth="6" 
            strokeLinecap="round"
          />
          
          {/* Brilho Central */}
          <circle cx="50" cy="50" r="5" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black italic tracking-tighter text-white leading-none">
            BJJ <span className="text-yellow-500">PRO</span>
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">
            Academy Manager
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
