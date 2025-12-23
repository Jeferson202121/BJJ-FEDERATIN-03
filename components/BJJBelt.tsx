
import React from 'react';

interface BJJBeltProps {
  belt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BJJBelt: React.FC<BJJBeltProps> = ({ belt = 'Branca', size = 'md', className = "" }) => {
  const getBeltStyles = (b: string) => {
    const lower = b.toLowerCase().trim();
    
    // Cores Base (Hex para controle preciso do gradiente)
    const colors = {
      white: '#f4f4f5',
      gray: '#9ca3af',
      yellow: '#fbbf24',
      orange: '#f97316',
      green: '#16a34a',
      blue: '#1d4ed8',
      purple: '#6b21a8',
      brown: '#451a03',
      black: '#09090b',
      red: '#b91c1c'
    };

    let mainStyle: string | any = "";
    let tipColor = colors.black;

    // Identificação de bicolores infantis (Ex: "Cinza/Branca" ou "Verde/Preta")
    const isStripedWhite = lower.includes('/branca');
    const isStripedBlack = lower.includes('/preta') && 
                          !lower.includes('preta ') && 
                          lower !== 'preta';
    
    // Identificar cor base
    let baseColor = colors.white;
    if (lower.includes('cinza')) baseColor = colors.gray;
    else if (lower.includes('amarela')) baseColor = colors.yellow;
    else if (lower.includes('laranja')) baseColor = colors.orange;
    else if (lower.includes('verde')) baseColor = colors.green;
    else if (lower.includes('azul')) baseColor = colors.blue;
    else if (lower.includes('roxa')) baseColor = colors.purple;
    else if (lower.includes('marrom')) baseColor = colors.brown;
    else if (lower.includes('preta') || lower.includes('professor') || lower.includes('instrutor') || lower.includes('monitor')) {
       baseColor = colors.black;
       tipColor = colors.red;
    } else if (lower.includes('vermelha')) {
       baseColor = colors.red;
       tipColor = colors.yellow;
    } else if (lower.includes('coral')) {
       const stripeColor = lower.includes('8') ? colors.white : colors.black;
       return { 
         custom: `linear-gradient(90deg, ${colors.red} 0%, ${colors.red} 20%, ${stripeColor} 20%, ${stripeColor} 40%, ${colors.red} 40%, ${colors.red} 60%, ${stripeColor} 60%, ${stripeColor} 80%, ${colors.red} 80%, ${colors.red} 100%)`, 
         tip: colors.white 
       };
    }

    // Renderização do gradiente para faixas bicolores
    if (isStripedWhite) {
      mainStyle = `linear-gradient(to bottom, ${baseColor} 0%, ${baseColor} 33%, ${colors.white} 33%, ${colors.white} 66%, ${baseColor} 66%, ${baseColor} 100%)`;
    } else if (isStripedBlack) {
      mainStyle = `linear-gradient(to bottom, ${baseColor} 0%, ${baseColor} 33%, ${colors.black} 33%, ${colors.black} 66%, ${baseColor} 66%, ${baseColor} 100%)`;
    } else {
      mainStyle = baseColor;
    }

    return { main: mainStyle, tip: tipColor };
  };

  const styles = getBeltStyles(belt);
  const heightClass = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12'
  }[size];

  const degreeMatch = belt.match(/(\d+)º/);
  const degrees = degreeMatch ? parseInt(degreeMatch[1]) : 0;
  const isBlackBelt = belt.toLowerCase().includes('preta');
  const totalSlots = isBlackBelt ? Math.max(degrees, 6) : Math.max(degrees, 4);

  return (
    <div 
      className={`relative w-full ${heightClass} rounded-sm shadow-2xl overflow-hidden border border-white/10 flex transition-all duration-500 ${className}`}
      style={{ background: styles.custom || 'none' }}
    >
      {!styles.custom && (
        <div className="flex-1" style={{ background: styles.main }}>
          <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
      )}
      
      <div 
        className={`h-full flex items-center justify-evenly px-2 border-l-[3px] border-black/30 shadow-inner transition-all duration-500 ${totalSlots > 6 ? 'w-1/3' : 'w-1/4'}`}
        style={{ backgroundColor: styles.tip }}
      >
        {[...Array(totalSlots)].map((_, i) => (
          <div 
            key={i} 
            className={`w-0.5 md:w-1 h-3/5 rounded-full transition-all duration-700 ${i < degrees ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)] scale-y-110' : 'bg-white/10'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default BJJBelt;
