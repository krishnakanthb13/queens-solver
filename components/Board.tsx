import React from 'react';
import { CellState, RegionMap, AppMode } from '../types';
import { REGION_COLORS } from '../constants';
import { X, Crown } from 'lucide-react';

interface BoardProps {
  gridSize: number;
  regions: RegionMap;
  cells: CellState[][];
  mode: AppMode;
  selectedColorId: number;
  errors: Set<string>;
  onCellClick: (r: number, c: number) => void;
  onCellRightClick: (r: number, c: number, e: React.MouseEvent) => void;
}

export const Board: React.FC<BoardProps> = ({
  gridSize,
  regions,
  cells,
  mode,
  selectedColorId,
  errors,
  onCellClick,
  onCellRightClick
}) => {

  // Calculate borders dynamically based on region neighbors
  const getBorderClasses = (r: number, c: number, regionId: number) => {
    const borders = [];
    // Top
    if (r === 0 || regions[r - 1]?.[c] !== regionId) borders.push('border-t-2 border-t-slate-800');
    else borders.push('border-t border-t-slate-800/20');

    // Bottom
    if (r === gridSize - 1 || regions[r + 1]?.[c] !== regionId) borders.push('border-b-2 border-b-slate-800');
    else borders.push('border-b border-b-slate-800/20');

    // Left
    if (c === 0 || regions[r]?.[c - 1] !== regionId) borders.push('border-l-2 border-l-slate-800');
    else borders.push('border-l border-l-slate-800/20');

    // Right
    if (c === gridSize - 1 || regions[r]?.[c + 1] !== regionId) borders.push('border-r-2 border-r-slate-800');
    else borders.push('border-r border-r-slate-800/20');

    return borders.join(' ');
  };

  return (
    <div
      className="grid select-none shadow-xl rounded-lg overflow-hidden bg-slate-800 border-2 border-slate-800 dark:border-slate-700"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1/1'
      }}
    >
      {Array.from({ length: gridSize }).map((_, r) =>
        Array.from({ length: gridSize }).map((_, c) => {
          const regionId = regions[r]?.[c] ?? 0;
          const cellState = cells[r]?.[c] ?? CellState.EMPTY;
          const isError = errors.has(`${r},${c}`);
          const color = REGION_COLORS[regionId % REGION_COLORS.length];

          return (
            <div
              key={`${r}-${c}`}
              className={`
                relative flex items-center justify-center cursor-pointer transition-colors duration-100
                ${getBorderClasses(r, c, regionId)}
                ${isError ? 'animate-pulse bg-red-400/50' : ''}
              `}
              style={{ backgroundColor: isError ? undefined : color }}
              onClick={() => onCellClick(r, c)}
              onContextMenu={(e) => onCellRightClick(r, c, e)}
            >
              {/* Content */}
              {cellState === CellState.QUEEN && (
                <Crown
                  className={`w-3/5 h-3/5 drop-shadow-md ${isError ? 'text-red-700' : 'text-amber-600'}`}
                  fill="currentColor"
                  strokeWidth={2}
                />
              )}
              {cellState === CellState.CROSS && (
                <X className="w-2/5 h-2/5 text-slate-900/40" />
              )}

              {/* Hover effect for edit mode */}
              {mode === AppMode.EDIT_REGIONS && (
                <div
                  className="absolute inset-0 hover:bg-white/30"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};