import React from 'react';

interface TileProps {
  value: number; // The correct index of this tile (determines image slice)
  size: number; // Grid size (e.g., 4 for 4x4)
  isEmpty: boolean;
  onClick: () => void;
  imageUrl: string;
  style?: React.CSSProperties;
}

const Tile: React.FC<TileProps> = ({ value, size, isEmpty, onClick, imageUrl, style }) => {
  // If empty, we render it invisible but present in the DOM for animations (if we wanted to animate the hole)
  // or just hidden. For the "sliding" effect, the hole "moves" to the tile's old spot.
  // We'll render it as a placeholder that moves, but make it invisible so we see the board background.
  if (isEmpty) {
    return (
      <div 
        className="absolute rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]"
        style={{ ...style, zIndex: 0, opacity: 0 }} 
      />
    );
  }

  // Calculate position in percentage for background image
  // value 0 is top-left, value size*size-1 is bottom-right
  const colIndex = value % size;
  const rowIndex = Math.floor(value / size);

  const xPercent = (colIndex / (size - 1)) * 100;
  const yPercent = (rowIndex / (size - 1)) * 100;

  return (
    <button
      onClick={onClick}
      className="absolute group transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] cursor-pointer"
      style={{
        ...style,
        zIndex: 10, // Ensure tiles are above the empty slot background if they cross
      }}
      aria-label={`Tile ${value + 1}`}
    >
      <div 
        className="w-full h-full rounded-md overflow-hidden shadow-lg border border-white/10 relative transform transition-transform duration-150 active:scale-95 hover:scale-[1.02]"
      >
        <div
          className="absolute inset-0 bg-cover no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            backgroundSize: `${size * 100}%`,
          }}
        />
        
        {/* Number overlay */}
        <div className="absolute top-1 left-1 bg-black/40 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm opacity-50 group-hover:opacity-100 transition-opacity">
          {value + 1}
        </div>
        
        {/* Glossy effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
    </button>
  );
};

export default Tile;
