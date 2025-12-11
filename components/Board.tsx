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
  
  // We generate a fixed array of Tile IDs (0 to N-1) based on the size.
  // This ensures the Tile components are stable (same key) and just move around.
  const tileIds = useMemo(() => Array.from({ length: size * size }, (_, i) => i), [size]);

  // If solved, we show the full image nicely
  if (isSolved) {
    return (
      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-green-500/50 relative animate-pulse">
        <img src={imageUrl} alt="Completed Puzzle" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <h2 className="text-4xl font-extrabold text-white tracking-wider drop-shadow-lg animate-bounce">LÖST!</h2>
        </div>
      </div>
    );
  }

  // Calculate style for a tile based on its current index on the board
  const getTileStyle = (index: number) => {
    const col = index % size;
    const row = Math.floor(index / size);
    
    // Gap in pixels (must match the logic we used before for visual consistency)
    const gapVal = size > 5 ? 4 : 8; 
    
    // Logic:
    // Container width is 100%.
    // Total gap space = (size - 1) * gapVal.
    // Width of one tile = (100% - Total gap space) / size.
    // Position = col * (tileWidth + gapVal).
    
    // We use calc() extensively to keep it responsive without JS resize listeners.
    const tileWidth = `calc((100% - ${(size - 1) * gapVal}px) / ${size})`;
    const xPos = `calc(${col} * (${tileWidth} + ${gapVal}px))`;
    const yPos = `calc(${row} * (${tileWidth} + ${gapVal}px))`;

    return {
      width: tileWidth,
      height: tileWidth,
      transform: `translate3d(${xPos}, ${yPos}, 0)`,
    };
  };

  return (
    <div 
      className="relative w-full aspect-square bg-slate-800/50 p-2 sm:p-3 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 no-scroll overflow-hidden"
    >
      {/* Background slots for visual structure (optional, but nice) */}
      
      {tileIds.map((tileId) => {
        // tileId is the "Identity" of the tile (e.g., Piece #5).
        // currentIndex is where it currently sits on the board (e.g., Slot #2).
        const currentIndex = tiles.indexOf(tileId);
        
        // Safety check
        if (currentIndex === -1) return null;

        return (
          <Tile
            key={tileId} // Stable key is crucial for animation
            value={tileId}
            size={size}
            isEmpty={tileId === (size * size - 1)} // The last tile ID is always the empty one
            onClick={() => onMove(currentIndex)}
            imageUrl={imageUrl}
            style={getTileStyle(currentIndex)}
          />
        );
      })}
    </div>
  );
};

export default Board;
