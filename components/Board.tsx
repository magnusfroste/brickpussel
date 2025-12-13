import React, { useMemo } from 'react';
import Tile from './Tile';

interface BoardProps {
  tiles: number[];
  size: number;
  emptyIndex: number;
  onMove: (index: number) => void;
  imageUrl: string;
  isSolved: boolean;
}

const Board: React.FC<BoardProps> = ({ tiles, size, emptyIndex, onMove, imageUrl, isSolved }) => {
  
  const tileIds = useMemo(() => Array.from({ length: size * size }, (_, i) => i), [size]);

  // If solved, show the complete image
  if (isSolved) {
    return (
      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/20 relative animate-pulse group">
        <img src={imageUrl} alt="Completed Puzzle" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-green-500/90 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-bounce backdrop-blur-md">
            LÖST!
          </div>
        </div>
      </div>
    );
  }

  // Calculate style for a tile based on its current index using percentages
  const getTileStyle = (index: number) => {
    const col = index % size;
    const row = Math.floor(index / size);
    
    // Dynamic gap: Larger grids need tighter spacing to look good
    // 2x2 -> ~3% gap
    // 8x8 -> ~1% gap
    const gapPercent = Math.max(1, 6 / size);
    
    // Calculate tile size
    // Total width (100%) = size * tileWidth + (size - 1) * gapPercent
    // tileWidth = (100 - (size - 1) * gapPercent) / size
    const totalGap = (size - 1) * gapPercent;
    const tileSize = (100 - totalGap) / size;
    
    const left = col * (tileSize + gapPercent);
    const top = row * (tileSize + gapPercent);

    return {
      width: `${tileSize}%`,
      height: `${tileSize}%`,
      left: `${left}%`,
      top: `${top}%`,
    };
  };

  return (
    <div 
      className="relative w-full aspect-square bg-black/40 p-2 sm:p-3 rounded-xl shadow-inner border border-white/5 backdrop-blur-sm overflow-hidden"
    >
      {/* Container for the tiles */}
      <div className="relative w-full h-full">
        {tileIds.map((tileId) => {
          const currentIndex = tiles.indexOf(tileId);
          if (currentIndex === -1) return null;

          return (
            <Tile
              key={tileId}
              value={tileId}
              size={size}
              isEmpty={tileId === (size * size - 1)}
              onClick={() => onMove(currentIndex)}
              imageUrl={imageUrl}
              style={getTileStyle(currentIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;