import { Level, ScoreDetails } from "../types";

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
 * Calculates inversion count to check solvability.
 */
const getInversionCount = (arr: number[], size: number): number => {
  let invCount = 0;
  const total = size * size;
  // Iterate through the array (ignoring the empty slot represented by total-1)
  for (let i = 0; i < total - 1; i++) {
    for (let j = i + 1; j < total; j++) {
      // Skip the empty tile in comparison
      if (arr[i] !== total - 1 && arr[j] !== total - 1 && arr[i] > arr[j]) {
        invCount++;
      }
    }
  }
  return invCount;
};

/**
 * Checks if a given grid configuration is solvable.
 * Rules:
 * 1. If N is Odd: Solvable if Inversion Count is Even.
 * 2. If N is Even:
 *    - If Empty is on Even row from bottom: Solvable if Inversion Count is Odd.
 *    - If Empty is on Odd row from bottom: Solvable if Inversion Count is Even.
 */
const isSolvable = (tiles: number[], size: number): boolean => {
  const invCount = getInversionCount(tiles, size);
  const emptyValue = size * size - 1;
  
  if (size % 2 !== 0) {
    // Odd grid size
    return invCount % 2 === 0;
  } else {
    // Even grid size
    const emptyIndex = tiles.indexOf(emptyValue);
    const rowFromBottom = size - Math.floor(emptyIndex / size); // 1-based index from bottom
    
    if (rowFromBottom % 2 === 0) {
      return invCount % 2 !== 0;
    } else {
      return invCount % 2 === 0;
    }
  }
};

/**
 * Shuffles the grid by placing ALL tiles randomly (Fisher-Yates) and fixing solvability.
 * This guarantees a truly random "scattered" board where the hole can be anywhere.
 */
export const shuffleGrid = (size: number): { tiles: number[], emptyIndex: number } => {
  const totalTiles = size * size;
  const emptyValue = totalTiles - 1;
  
  // 1. Create array of ALL available numbers including the hole
  let tiles = Array.from({ length: totalTiles }, (_, i) => i);
  
  // 2. Fisher-Yates Shuffle EVERYTHING
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // 3. Check Solvability
  if (!isSolvable(tiles, size)) {
    // If not solvable, we simply swap the first two tiles (that are NOT the empty one).
    // Swapping any two adjacent tiles changes inversion parity by 1, making it solvable.
    
    let i = 0;
    let j = 1;
    
    // Find two indices that are not the empty tile
    while (tiles[i] === emptyValue) i++;
    while (tiles[j] === emptyValue || j === i) j++;
    
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  const emptyIndex = tiles.indexOf(emptyValue);
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

/**
 * Calculates score based on level difficulty, moves, and time.
 */
export const calculateScore = (level: Level, moves: number, timeSeconds: number, currentHighScore: number): ScoreDetails => {
  // 1. Base Points: Higher levels give significantly more points
  // Level 1 (2x2) = 500
  // Level 7 (8x8) = 3500
  const basePoints = level.level * 500;

  // 2. Move Bonus:
  // Par moves gives a baseline. Beating par gives bonus. 
  // Being way over par reduces bonus to 0.
  // Formula: Starting buffer is (Par * 2). Subtract actual moves. Multiply by weight.
  const movesWeight = 10 * level.level; // Harder levels reward move efficiency more
  const moveDiff = Math.max(0, (level.parMoves * 2) - moves);
  const moveBonus = Math.floor(moveDiff * (10 + level.level)); 

  // 3. Time Bonus:
  // Faster is better. 
  // Max time window varies by level (e.g., 60s for level 1, 600s for level 7)
  const maxTime = 60 + (level.level * 60); 
  const timeDiff = Math.max(0, maxTime - timeSeconds);
  const timeBonus = Math.floor(timeDiff * 5);

  const total = basePoints + moveBonus + timeBonus;

  return {
    total,
    basePoints,
    moveBonus,
    timeBonus,
    isNewHigh: total > currentHighScore
  };
};