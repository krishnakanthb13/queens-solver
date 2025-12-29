export enum CellState {
  EMPTY = 0,
  CROSS = 1,
  QUEEN = 2,
}

export interface GridPos {
  r: number;
  c: number;
}

export type RegionMap = number[][];
export type GridState = CellState[][];

export enum AppMode {
  PLAY = 'PLAY',
  EDIT_REGIONS = 'EDIT_REGIONS',
}

export interface PuzzleData {
  gridSize: number;
  regions: RegionMap;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  durationMs: number;
  gridSize: number;
  regions: RegionMap;
  solution: GridPos[];
}