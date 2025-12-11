export interface Tile {
  value: number; // The correct position index (0 to size*size - 1)
  currentPos: number; // Where it is currently
}

export interface Level {
  level: number;
  gridSize: number;
  name: string;
  description: string;
  parMoves: number; // Target moves for 3 stars
}

export interface GameState {
  gridSize: number;
  tiles: number[]; // Array of values. Index is position. Value is the correct ID.
  emptySlotIndex: number;
  isSolved: boolean;
  moves: number;
  isPlaying: boolean;
  startTime: number | null;
  elapsedTime: number;
}

export type Theme = {
  id: string;
  name: string;
  imageUrl: string;
};
