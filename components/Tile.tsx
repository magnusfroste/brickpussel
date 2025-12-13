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

  // Calculate position in percentage for background image
  // This maps the image slice to the tile position
  const colIndex = value % size;
  const rowIndex = Math.floor(value / size);

  const xPercent = (colIndex / (size - 1)) * 100;
  const yPercent = (rowIndex / (size - 1)) * 100;

  return (
    <button
      onClick={onClick}
      className="absolute transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer" // Custom bezier for a slight "snap" effect
      style={{
        ...style,
        zIndex: 10,
        // We use left/top for positioning now, which is passed in via style
      }}
      aria-label={`Flytta bricka ${value + 1}`}
    >
      <div 
        className="w-full h-full rounded-md sm:rounded-lg overflow-hidden shadow-md border border-white/10 relative group transform transition-transform duration-100 active:scale-95 hover:brightness-110"
      >
        <div
          className="absolute inset-0 bg-cover no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            // Scale image to cover the "conceptual" board area roughly
            backgroundSize: `${size * 100}%`,
          }}
        />
        
        {/* Subtle Number overlay */}
        <div className="absolute top-1 left-1 bg-black/30 text-white/90 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity">
          {value + 1}
        </div>
        
        {/* Highlight/Gloss */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20 pointer-events-none" />
      </div>
    </button>
  );
};

export default Tile;