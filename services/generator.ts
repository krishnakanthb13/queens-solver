
import { GridPos, RegionMap } from '../types';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const generateRandomBoard = (
    size: number,
    difficulty: Difficulty
): { regions: RegionMap; solution: GridPos[] } | null => {
    // 1. Generate a valid placement of queens respecting Row, Col, and No-Touch constraints.
    const solution = generateValidQueens(size);
    if (!solution) return null;

    // 2. Grow regions around these queens.
    const regions = generateRegions(size, solution, difficulty);

    return { regions, solution };
};

const generateValidQueens = (size: number): GridPos[] | null => {
    const queens: GridPos[] = [];
    const rows = new Array(size).fill(false);
    const cols = new Array(size).fill(false);

    // Randomize column order for each row to ensure variety
    const getRandomCols = () => {
        const c = Array.from({ length: size }, (_, i) => i);
        for (let i = c.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [c[i], c[j]] = [c[j], c[i]];
        }
        return c;
    };

    const solve = (r: number): boolean => {
        if (r === size) return true;

        const randomCols = getRandomCols();

        for (const c of randomCols) {
            if (cols[c]) continue; // Column occupied

            // Check touch constraint with previous queens
            let conflict = false;
            for (const q of queens) {
                if (Math.abs(q.r - r) <= 1 && Math.abs(q.c - c) <= 1) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) continue;

            // Place queen
            queens.push({ r, c });
            rows[r] = true;
            cols[c] = true;

            if (solve(r + 1)) return true;

            // Backtrack
            queens.pop();
            rows[r] = false;
            cols[c] = false;
        }

        return false;
    };

    if (solve(0)) return queens;
    return null;
};

const generateRegions = (
    size: number,
    queens: GridPos[],
    difficulty: Difficulty
): RegionMap => {
    const regions: RegionMap = Array.from({ length: size }, () => Array(size).fill(-1));

    type FrontierItem = { r: number; c: number; regionId: number };
    let frontier: FrontierItem[] = [];

    // Initialize with queens
    queens.forEach((q, idx) => {
        regions[q.r][q.c] = idx;
        addNeighbors(q.r, q.c, idx, size, regions, frontier);
    });

    // Grow regions
    while (frontier.length > 0) {
        let index = 0;

        // Selection strategy based on difficulty
        if (difficulty === 'Easy') {
            // BFS-like: Probabilistic but favoring "oldest" or "grouped" to keep shapes simple?
            // Actually, pure BFS (shift) makes concentric circles.
            // Randomized selection (pick random index) makes jagged edges.
            // Let's try:
            // Easy: Pick from the beginning (more BFS-like) - tends to be more regular.
            // Hard: Pick completely randomly.

            // However, we want to mix it up a bit even for easy so it's not a perfect diamond.
            // Let's bias:
            // Easy: Pick random index, but maybe prefer neighbors of same region?
            // Let's just use:
            // Easy = 80% chance pick head (BFS), 20% random.
            // Hard = 100% random.

            if (Math.random() > 0.3) {
                index = 0; // Bias towards BFS for cleaner shapes
            } else {
                index = Math.floor(Math.random() * frontier.length);
            }
        } else if (difficulty === 'Medium') {
            // Mix
            if (Math.random() > 0.6) {
                index = 0;
            } else {
                index = Math.floor(Math.random() * frontier.length);
            }
        } else {
            // Hard: Fully random expansion
            index = Math.floor(Math.random() * frontier.length);
        }

        const { r, c, regionId } = frontier[index];
        frontier.splice(index, 1); // Remove

        if (regions[r][c] === -1) {
            regions[r][c] = regionId;
            addNeighbors(r, c, regionId, size, regions, frontier);
        }
    }

    // Fallback: If any cells remain -1 (should not happen with connected components, but safe to check)
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (regions[r][c] === -1) {
                // Assign to random neighbor
                const n = getValidNeighborRegion(r, c, size, regions);
                regions[r][c] = n !== -1 ? n : 0;
            }
        }
    }

    return regions;
};

const addNeighbors = (r: number, c: number, regionId: number, size: number, regions: number[][], frontier: any[]) => {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
            // Avoid duplicates in frontier?
            // Simple way: check if already in frontier? No, expensive.
            // Just add. If popped and already filled, ignore.
            frontier.push({ r: nr, c: nc, regionId });
        }
    }
};

const getValidNeighborRegion = (r: number, c: number, size: number, regions: number[][]): number => {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] !== -1) {
            return regions[nr][nc];
        }
    }
    return -1;
};
