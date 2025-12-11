/**
 * Checks if a move is valid based on the empty slot position.
 */
export const canMove = (index: number, emptyIndex: number, size: number): boolean => {
  const row = Math.floor(index / size);
  const col = index % size;
  const emptyRow = Math.floor(emptyIndex / size);
  const emptyCol = emptyIndex % size;

  const isRowNeighbor = row === emptyRow && Math.abs(col - emptyCol) === 1;
  const isColNeighbor = col === emptyCol && Math.abs(row - emptyRow) === 1;

  return isRowNeighbor || isColNeighbor;
};

/**
 * Creates a solved grid array [0, 1, 2, ... size*size-1]
 */
export const createSolvedGrid = (size: number): number[] => {
  return Array.from({ length: size * size }, (_, i) => i);
};

/**
 * Shuffles the grid by performing random valid moves.
 * This guarantees the puzzle is solvable.
 */
export const shuffleGrid = (size: number, complexity: number = 100): { tiles: number[], emptyIndex: number } => {
  const tiles = createSolvedGrid(size);
  let emptyIndex = size * size - 1; // Last one is empty by default
  let previousIndex = -1;

  for (let i = 0; i < complexity; i++) {
    const neighbors: number[] = [];
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    if (row > 0) neighbors.push(emptyIndex - size); // Up
    if (row < size - 1) neighbors.push(emptyIndex + size); // Down
    if (col > 0) neighbors.push(emptyIndex - 1); // Left
    if (col < size - 1) neighbors.push(emptyIndex + 1); // Right

    // Filter out the tile we just moved to prevent immediate backtracking (makes shuffle better)
    const validNeighbors = neighbors.filter(n => n !== previousIndex);
    
    // Pick a random neighbor to swap
    const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

    // Swap
    tiles[emptyIndex] = tiles[randomNeighbor];
    tiles[randomNeighbor] = size * size - 1; // The empty value (conceptually)

    previousIndex = emptyIndex;
    emptyIndex = randomNeighbor;
  }

  return { tiles, emptyIndex };
};

/**
 * Checks if the grid is in the solved state
 */
export const checkWin = (tiles: number[]): boolean => {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
};
