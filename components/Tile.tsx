import React from 'react';

interface TileProps {
  value: number;
  size: number;
  isEmpty: boolean;
  onClick: () => void;
  imageUrl: string;
  style?: React.CSSProperties;
}

const Tile: React.FC<TileProps> = ({ value, size, isEmpty, onClick, imageUrl, style }) => {
  // If empty, render nothing (invisible), allowing the board background (the "hole") to show.
  if (isEmpty) {
    return null;
  }

  const isNumbersTheme = imageUrl === 'numbers';
  const isGradientTheme = imageUrl === 'gradient';

  // Calculate position in percentage for background image (only used if not numbers/gradient theme)
  const colIndex = value % size;
  const rowIndex = Math.floor(value / size);
  const xPercent = (colIndex / (size - 1)) * 100;
  const yPercent = (rowIndex / (size - 1)) * 100;

  // Calculate gradient color
  // We map the value (0 to size*size) to a hue (0 to 360)
  // This creates a continuous spectrum across the grid when solved.
  const hue = Math.floor((value / (size * size)) * 340);
  const backgroundColor = isGradientTheme ? `hsl(${hue}, 75%, 55%)` : undefined;

  return (
    <button
      onClick={onClick}
      className="absolute transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer select-none"
      style={{
        ...style,
        zIndex: 10,
        touchAction: 'manipulation', // Helps with touch on mobile
      }}
      aria-label={`Flytta bricka ${value + 1}`}
    >
      <div 
        className={`w-full h-full rounded-md sm:rounded-lg overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.06)] border relative group transform transition-transform duration-100 active:scale-95 hover:brightness-110
          ${isNumbersTheme 
            ? 'bg-[#f4e4bc] border-[#e0c080] text-slate-900' // Creamy classic plastic color
            : isGradientTheme
              ? 'border-white/20' // Gradient border
              : 'border-white/10' // Image border
          }`}
        style={{ 
          containerType: 'size',
          backgroundColor: backgroundColor 
        }} 
      >
        {isNumbersTheme ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Inner bevel effects for 3D plastic look */}
            <div className="absolute inset-0 border-t-2 border-l-2 border-white/60 opacity-80 rounded-sm pointer-events-none"></div>
            <div className="absolute inset-0 border-b-2 border-r-2 border-black/10 opacity-60 rounded-sm pointer-events-none"></div>
            
            <span 
              className="font-bold font-mono tracking-tighter drop-shadow-sm leading-none"
              style={{ fontSize: '50cqw' }} // Responsive font size based on tile width
            >
              {value + 1}
            </span>
          </div>
        ) : isGradientTheme ? (
           <div className="absolute inset-0 flex items-center justify-center text-white/90">
             {/* Subtle bevel for gradient tiles too */}
             <div className="absolute inset-0 border-t border-l border-white/40 opacity-50 rounded-sm pointer-events-none"></div>
             <div className="absolute inset-0 border-b border-r border-black/20 opacity-30 rounded-sm pointer-events-none"></div>
             <span className="font-bold font-mono drop-shadow-md" style={{ fontSize: '40cqw' }}>{value + 1}</span>
           </div>
        ) : (
          <>
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `${xPercent}% ${yPercent}%`,
                // FORCE exact scaling to match the grid aspect ratio (1:1). 
                // Using 100% 100% ensures the image is stretched to fit the logical grid perfectly,
                // preventing repeats or misalignment if the source image isn't square.
                backgroundSize: `${size * 100}% ${size * 100}%`,
              }}
            />
            {/* Number overlay for image themes */}
            <div className="absolute top-1 left-1 bg-black/40 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity border border-white/20">
              {value + 1}
            </div>
          </>
        )}
        
        {/* Common Highlight/Gloss for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none" />
      </div>
    </button>
  );
};

export default Tile;