import { RegionMap, GridPos } from '../types';
import { isValidMove } from '../utils';

export const solvePuzzle = (
  gridSize: number,
  regions: RegionMap
): GridPos[] | null => {
  const queens: GridPos[] = [];

  const solve = (row: number): boolean => {
    // Base case: All rows filled
    if (row === gridSize) {
      return true;
    }

    // Optimization: Check which columns are already taken to prune search space?
    // Actually, for N=9, simple backtracking is fast enough.
    
    for (let col = 0; col < gridSize; col++) {
      if (isValidMove(row, col, queens, regions)) {
        queens.push({ r: row, c: col });
        if (solve(row + 1)) {
          return true;
        }
        queens.pop();
      }
    }

    return false;
  };

  if (solve(0)) {
    return queens;
  }
  return null;
};
