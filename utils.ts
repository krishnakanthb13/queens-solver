import { CellState, GridPos, RegionMap } from './types';

export const createEmptyGrid = <T,>(size: number, initialValue: T): T[][] => {
  return Array.from({ length: size }, () => Array(size).fill(initialValue));
};

export const isValidMove = (
  r: number,
  c: number,
  currentQueens: GridPos[],
  regions: RegionMap
): boolean => {
  const targetRegion = regions[r][c];

  for (const q of currentQueens) {
    // 1. Same Row
    if (q.r === r) return false;
    // 2. Same Col
    if (q.c === c) return false;
    // 3. Same Region
    if (regions[q.r][q.c] === targetRegion) return false;
    // 4. Touching (Orthogonal or Diagonal)
    if (Math.abs(q.r - r) <= 1 && Math.abs(q.c - c) <= 1) return false;
  }
  return true;
};

export const checkErrors = (
  size: number,
  cells: CellState[][],
  regions: RegionMap
): Set<string> => {
  const errors = new Set<string>();
  const queens: GridPos[] = [];

  // Collect all queens
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c] === CellState.QUEEN) {
        queens.push({ r, c });
      }
    }
  }

  // Check each queen against every other queen
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const q1 = queens[i];
      const q2 = queens[j];
      
      let conflict = false;

      // Row conflict
      if (q1.r === q2.r) conflict = true;
      // Col conflict
      else if (q1.c === q2.c) conflict = true;
      // Region conflict
      else if (regions[q1.r][q1.c] === regions[q2.r][q2.c]) conflict = true;
      // Touch conflict
      else if (Math.abs(q1.r - q2.r) <= 1 && Math.abs(q1.c - q2.c) <= 1) conflict = true;

      if (conflict) {
        errors.add(`${q1.r},${q1.c}`);
        errors.add(`${q2.r},${q2.c}`);
      }
    }
  }

  return errors;
};
