import React, { useState, useEffect, useRef } from 'react';
import { Board } from './components/Board';
import {
  AppMode,
  CellState,
  RegionMap,
  GridState,
  HistoryItem
} from './types';
import {
  REGION_COLORS,
  DEFAULT_GRID_SIZE,
  SAMPLE_PUZZLE_REGIONS_7X7,
  SAMPLE_PUZZLE_REGIONS_9X9
} from './constants';
import {
  createEmptyGrid,
  checkErrors
} from './utils';
import { solvePuzzle } from './services/solver';
import { parsePuzzleFromImage } from './services/gemini';
import { parsePuzzleFromImageVercel } from './services/vercel';
import { parsePuzzleFromImageAIML } from './services/aiml';
import { generateRandomBoard, Difficulty } from './services/generator';
import {
  Wand2,
  RotateCcw,
  Eraser,
  Play,
  PaintBucket,
  Upload,
  Info,
  Loader2,
  CheckCircle,
  HelpCircle,
  Crown,
  X,
  Grid,
  Layers,
  Sun,
  Moon,
  History,
  Trash2,
  Clock,
  ChevronRight,
  Eye,
  Sparkles,
  Download,
  Dices,
  Brush
} from 'lucide-react';

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [numRegions, setNumRegions] = useState<number>(DEFAULT_GRID_SIZE);
  const [regions, setRegions] = useState<RegionMap>(SAMPLE_PUZZLE_REGIONS_7X7);
  const [cells, setCells] = useState<GridState>(createEmptyGrid(DEFAULT_GRID_SIZE, CellState.EMPTY));
  const [mode, setMode] = useState<AppMode>(AppMode.PLAY);
  const [selectedColorId, setSelectedColorId] = useState<number>(0);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isBoardSolvable, setIsBoardSolvable] = useState<boolean>(true);
  const [isSolving, setIsSolving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Paint Brush State
  const [isBrushActive, setIsBrushActive] = useState(false);
  const [brushSource, setBrushSource] = useState<number | CellState | null>(null);

  // New State for Timer and History
  const [lastSolveDuration, setLastSolveDuration] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [visionModel, setVisionModel] = useState<'gemini' | 'vercel' | 'aiml'>('aiml');

  // Generator State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [genSize, setGenSize] = useState<number>(8);
  const [genDifficulty, setGenDifficulty] = useState<Difficulty>('Medium');

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('queens-solver-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Toggle Dark Mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Validate on every move in Play mode
  useEffect(() => {
    if (mode === AppMode.PLAY) {
      const newErrors = checkErrors(gridSize, cells, regions);
      setErrors(newErrors);
    } else {
      setErrors(new Set());
    }
  }, [cells, regions, gridSize, mode]);

  // Check board solvability when entering Play Mode or Regions change
  useEffect(() => {
    if (mode === AppMode.PLAY) {
      // Use efficient solver check
      // We wrap in timeout to avoid blocking main thread immediately on render if expensive
      const timer = setTimeout(() => {
        const solution = solvePuzzle(gridSize, regions);
        setIsBoardSolvable(!!solution);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsBoardSolvable(true); // Reset state when editing
    }
  }, [gridSize, regions, mode]);

  // Reset brush interaction when mode changes
  useEffect(() => {
    setIsBrushActive(false);
    setBrushSource(null);
  }, [mode, gridSize]);

  const saveToHistory = (durationMs: number, solutionQueens: { r: number, c: number }[]) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      durationMs,
      gridSize,
      regions: JSON.parse(JSON.stringify(regions)), // Deep copy
      solution: solutionQueens
    };

    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('queens-solver-history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete all history logs? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem('queens-solver-history');
    }
  };

  const saveLogs = async () => {
    if (history.length === 0) {
      alert("No history logs to save.");
      return;
    }

    const logContent = history.map(item => {
      // Create visual grid for the solution
      const grid = Array(item.gridSize).fill(null).map(() => Array(item.gridSize).fill('.'));
      item.solution.forEach(pos => {
        grid[pos.r][pos.c] = 'Q';
      });
      const solutionMatrix = grid.map(row => row.join(' ')).join('\n');

      // Create visual grid for regions
      const regionMatrix = item.regions.map(row =>
        row.map(r => r.toString().padStart(2, ' ')).join(' ')
      ).join('\n');

      return `Timestamp: ${new Date(item.timestamp).toLocaleString()}\n` +
        `ID: ${item.id}\n` +
        `Grid Size: ${item.gridSize}x${item.gridSize}\n` +
        `Solve Duration: ${formatDuration(item.durationMs)}\n` +
        `\nSolution Queens (row, col):\n${item.solution.map(p => `(${p.r}, ${p.c})`).join(', ')}\n` +
        `\nSolution Board:\n${solutionMatrix}\n` +
        `\nRegion Map:\n${regionMatrix}\n` +
        `\n----------------------------------------`;
    }).join('\n\n');

    try {
      // Attempt to use the File System Access API for "Save As" dialog
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'queens_solver_logs.txt',
          types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(logContent);
        await writable.close();
      } else {
        // Fallback: Standard download (might not prompt on all browsers)
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'queens_solver_logs.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      // Ignore if user cancelled the picker
      if (err.name !== 'AbortError') {
        console.error('Failed to save logs:', err);
        alert('Failed to save logs. Please try again.');
      }
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    if (window.confirm("Load this historical puzzle? Current board progress will be lost.")) {
      setGridSize(item.gridSize);
      setNumRegions(item.gridSize); // Approximation, usually N regions for N grid
      setRegions(item.regions);

      // Reconstruct board
      const newCells = createEmptyGrid(item.gridSize, CellState.CROSS);
      item.solution.forEach(p => {
        newCells[p.r][p.c] = CellState.QUEEN;
      });
      setCells(newCells);
      setMode(AppMode.PLAY);
      setLastSolveDuration(item.durationMs);
      setShowHistoryModal(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 0.001) return "< 1 μs";
    if (ms < 1) return `${Math.round(ms * 1000)} μs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(3)} s`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const handleCellClick = (r: number, c: number) => {
    // Paint Brush Logic (Edit Regions Only)
    if (isBrushActive && mode === AppMode.EDIT_REGIONS) {
      if (brushSource === null) {
        // Pick Source
        setBrushSource(regions[r][c]);
      } else {
        // Paint Target
        const newRegions = regions.map(row => [...row]);
        newRegions[r][c] = brushSource as number;
        setRegions(newRegions);
      }
      return;
    }

    if (mode === AppMode.EDIT_REGIONS) {
      const newRegions = regions.map(row => [...row]);
      newRegions[r][c] = selectedColorId;
      setRegions(newRegions);
    } else {
      // Play Mode: Cycle Empty -> Cross -> Queen -> Empty
      const newCells = cells.map(row => [...row]);
      const current = newCells[r][c];

      if (current === CellState.EMPTY) newCells[r][c] = CellState.CROSS;
      else if (current === CellState.CROSS) newCells[r][c] = CellState.QUEEN;
      else newCells[r][c] = CellState.EMPTY;

      setCells(newCells);
    }
  };

  const handleCellRightClick = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === AppMode.PLAY) {
      // Right click shortcut to place Queen immediately or clear
      const newCells = cells.map(row => [...row]);
      if (newCells[r][c] === CellState.QUEEN) newCells[r][c] = CellState.EMPTY;
      else newCells[r][c] = CellState.QUEEN;
      setCells(newCells);
    }
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to clear the board?")) {
      setCells(createEmptyGrid(gridSize, CellState.EMPTY));
      setErrors(new Set());
      setLastSolveDuration(null);
    }
  };

  const clearRegions = () => {
    if (window.confirm("Are you sure you want to clear all regions? This will reset the board layout.")) {
      setRegions(createEmptyGrid(gridSize, 0));
      setCells(createEmptyGrid(gridSize, CellState.EMPTY));
      setErrors(new Set());
    }
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setGridSize(newSize);
    setNumRegions(newSize); // Default regions to match grid size
    setRegions(createEmptyGrid(newSize, 0));
    setCells(createEmptyGrid(newSize, CellState.EMPTY));
    setErrors(new Set());
    setMode(AppMode.EDIT_REGIONS); // Switch to edit mode so they can draw regions
  };

  const handleNumRegionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count)) count = 1;
    if (count < 1) count = 1;
    if (count > REGION_COLORS.length) count = REGION_COLORS.length;
    setNumRegions(count);
    // Reset selected color if out of bounds
    if (selectedColorId >= count) setSelectedColorId(0);
  };

  const loadSample = (size: number) => {
    const sampleRegions = size === 7 ? SAMPLE_PUZZLE_REGIONS_7X7 : SAMPLE_PUZZLE_REGIONS_9X9;
    setGridSize(size);
    setNumRegions(size);
    setRegions(sampleRegions);
    setCells(createEmptyGrid(size, CellState.EMPTY));
    setErrors(new Set());
    setMode(AppMode.PLAY);
    setLastSolveDuration(null);
  };

  const handleSolve = () => {
    setIsSolving(true);
    setLastSolveDuration(null);

    // Add a tiny delay to let UI render the loading state
    setTimeout(() => {
      const startTime = performance.now();
      const solution = solvePuzzle(gridSize, regions);
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (solution) {
        const newCells = createEmptyGrid(gridSize, CellState.CROSS);
        solution.forEach(({ r, c }) => {
          newCells[r][c] = CellState.QUEEN;
        });
        setCells(newCells);
        setLastSolveDuration(duration);
        saveToHistory(duration, solution);
      } else {
        alert("No solution found for this board configuration. (Standard Queens rules require 1 queen per row, column, and region)");
      }
      setIsSolving(false);
    }, 50);
  };

  const handleHint = () => {
    // Find a valid position from the solver and fill just one
    const solution = solvePuzzle(gridSize, regions);
    if (!solution) {
      alert("This puzzle seems unsolvable.");
      return;
    }

    // Find a cell that should be a queen but isn't
    const missingQueen = solution.find(pos => cells[pos.r][pos.c] !== CellState.QUEEN);
    if (missingQueen) {
      const newCells = cells.map(row => [...row]);
      newCells[missingQueen.r][missingQueen.c] = CellState.QUEEN;
      setCells(newCells);
    } else {
      alert("Board looks correct so far!");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Select API key based on model
    let apiKey: string | undefined;
    let modelLabel: string;

    if (visionModel === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
      modelLabel = 'Gemini';
    } else if (visionModel === 'vercel') {
      apiKey = process.env.VERCEL_API_KEY;
      modelLabel = 'Gemini/Claude (Vercel)';
    } else {
      apiKey = process.env.AIML_API_KEY;
      modelLabel = 'Gemini/Claude (AIML)';
    }

    if (!apiKey) {
      alert(`Please ensure the API key for ${modelLabel} is configured in .env.local`);
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];

        let puzzleData;
        if (visionModel === 'gemini') {
          puzzleData = await parsePuzzleFromImage(
            apiKey,
            base64String,
            file.type
          );
        } else if (visionModel === 'vercel') {
          puzzleData = await parsePuzzleFromImageVercel(
            apiKey,
            base64String,
            file.type
          );
        } else {
          puzzleData = await parsePuzzleFromImageAIML(
            apiKey,
            base64String,
            file.type
          );
        }

        setGridSize(puzzleData.gridSize);

        // Count distinct regions found to update UI
        const uniqueIds = new Set(puzzleData.regions.flat());
        setNumRegions(Math.max(uniqueIds.size, puzzleData.gridSize));

        setRegions(puzzleData.regions);
        setCells(createEmptyGrid(puzzleData.gridSize, CellState.EMPTY));
        setMode(AppMode.PLAY);
        setErrors(new Set());
        setLastSolveDuration(null);
      } catch (err: any) {
        console.error("Vision API Error:", err);
        let errorMsg = `Failed to analyze image using ${visionModel}.`;

        if (err.message) {
          errorMsg += `\n\nError: ${err.message}`;
          if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
            errorMsg = "Quota limit reached. Please try again later or use a different model.";
          } else if (err.message.includes('401')) {
            errorMsg = `Invalid API key for ${visionModel}. Please check your .env.local file.`;
          } else if (err.message.includes('404')) {
            errorMsg = `Model not found or API base URL is incorrect.`;
          }
        }

        alert(errorMsg);
      } finally {
        setIsParsing(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
    reader.readAsDataURL(file);
  };

  const handleGenerateBoard = () => {
    const result = generateRandomBoard(genSize, genDifficulty);
    if (result) {
      setGridSize(genSize);
      setNumRegions(genSize);
      setRegions(result.regions);
      setCells(createEmptyGrid(genSize, CellState.EMPTY));
      setMode(AppMode.PLAY);
      setErrors(new Set());
      setLastSolveDuration(null);
      setShowGeneratorModal(false);
    } else {
      alert("Failed to generate a valid board. Please try again.");
    }
  };

  const handleBrushClick = () => {
    if (isBrushActive) {
      // Toggle off or reset selection
      if (brushSource !== null) {
        setBrushSource(null);
      } else {
        setIsBrushActive(false);
      }
    } else {
      setIsBrushActive(true);
      setBrushSource(null);
    }
  };

  // Helper to get button style for brush
  const getBrushButtonStyle = () => {
    const baseStyle = "flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border ";

    if (!isBrushActive) {
      return baseStyle + "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700";
    }

    if (brushSource === null) {
      return baseStyle + "bg-black text-white border-black hover:bg-slate-900 animate-pulse ring-2 ring-offset-2 ring-black dark:ring-slate-500";
    }

    // Active with source (Region color)
    return baseStyle + `border-slate-300 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 brightness-110`;
    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-8 px-4 font-sans transition-colors duration-200 relative">

      {/* Top Right Controls */}
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="View History"
        >
          <History className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Header */}
      <header className="mb-8 text-center max-w-2xl w-full relative">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="text-amber-500 fill-current w-10 h-10" />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              Queens Solver
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Solve the daily LinkedIn Queens puzzle. Upload a screenshot to auto-detect the layout.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl justify-center items-start">

        {/* Left Column: Board */}
        <div className="flex-1 w-full flex justify-center max-w-[600px] mx-auto lg:mx-0">
          <Board
            gridSize={gridSize}
            regions={regions}
            cells={cells}
            mode={mode}
            selectedColorId={selectedColorId}
            errors={errors}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
          />
        </div>

        {/* Right Column: Controls */}
        <div className="w-full lg:w-96 flex flex-col gap-6">

          {/* Game Controls Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Play className="w-5 h-5" /> Game Controls
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSolve}
                disabled={isSolving || mode === AppMode.EDIT_REGIONS}
                className="col-span-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                {isSolving ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                {isSolving ? 'Solving...' : 'Auto Solve'}
              </button>

              <button
                onClick={handleHint}
                disabled={mode === AppMode.EDIT_REGIONS}
                className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 py-3 px-4 rounded-lg font-medium transition-colors border border-amber-200 dark:border-amber-800/50"
              >
                <HelpCircle className="w-5 h-5" /> Hint
              </button>

              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-lg font-medium transition-colors border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-5 h-5" /> Reset
              </button>

              {mode === AppMode.EDIT_REGIONS && (
                <button
                  onClick={handleBrushClick}
                  style={isBrushActive && brushSource !== null ? { backgroundColor: REGION_COLORS[brushSource as number] } : {}}
                  className={`col-span-2 ${getBrushButtonStyle()}`}
                  title="Paint Brush: Click to pick a cell color, then click other cells to paint."
                >
                  <Brush className={`w-5 h-5 ${isBrushActive && brushSource === null ? 'animate-bounce' : ''}`} />
                  {isBrushActive
                    ? (brushSource === null ? "Pick a Local Color..." : "Painting...")
                    : "Paint Brush"}
                </button>
              )}
            </div>

            {/* Simple Timer Display */}
            {lastSolveDuration !== null && (
              <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-medium">
                  Solved in: <span className="font-bold">{formatDuration(lastSolveDuration)}</span>
                </p>
              </div>
            )}

            {/* Status Display */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              {errors.size > 0 ? (
                <span className="text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2 animate-pulse">
                  <Info className="w-4 h-4" /> {errors.size} conflicts detected!
                </span>
              ) : !isBoardSolvable ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" /> Board Layout is Unsolvable
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Board is valid
                </span>
              )}
            </div>
          </div>

          {/* Setup / Gemini Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PaintBucket className="w-5 h-5" /> Setup Board
            </h2>

            <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setMode(AppMode.PLAY)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === AppMode.PLAY
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Play Mode
              </button>
              <button
                onClick={() => setMode(AppMode.EDIT_REGIONS)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === AppMode.EDIT_REGIONS
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Edit Regions
              </button>
            </div>

            {/* Grid Size & Blocks Controls */}
            {mode === AppMode.EDIT_REGIONS && (
              <div className="mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <Grid className="w-3 h-3" /> Size
                    </label>
                    <select
                      value={gridSize}
                      onChange={handleGridSizeChange}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 py-2 pl-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border"
                    >
                      {[5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                        <option key={size} value={size}>{size}x{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Blocks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={REGION_COLORS.length}
                      value={numRegions}
                      onChange={handleNumRegionsChange}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 py-2 pl-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border"
                    />
                  </div>
                </div>

                <div className="flex gap-1">
                  <button onClick={() => loadSample(7)} className="flex-1 px-2 py-2 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-medium transition-colors">Sample 7x7</button>
                  <button onClick={() => loadSample(9)} className="flex-1 px-2 py-2 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-medium transition-colors">Sample 9x9</button>
                </div>
              </div>
            )}

            {mode === AppMode.EDIT_REGIONS && (
              <div className="mb-4 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-8 gap-2">
                  {REGION_COLORS.slice(0, numRegions).map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColorId(idx);
                        if (isBrushActive) {
                          setBrushSource(idx); // Also update brush if active
                        }
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColorId === idx ? 'border-slate-800 dark:border-white scale-110 shadow-md' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                      title={`Region Block ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Select a block color and tap the grid to paint.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearRegions}
                    className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    <Eraser className="w-3 h-3" /> Clear All Regions
                  </button>
                </div>
              </div>
            )}

            {/* Random Generator Button */}
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Dices className="w-5 h-5" /> Random Level
            </button>

            <div className="relative group pt-4 border-t border-slate-100 dark:border-slate-800">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`
                  flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 cursor-pointer
                  hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all
                  ${isParsing ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Thinking...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                    <div className="text-center">
                      <span className="block text-slate-700 dark:text-slate-200 font-medium">Upload Screenshot</span>
                      <span className="block text-slate-400 dark:text-slate-500 text-xs mt-1 flex items-center justify-center gap-1">
                        <Sparkles className={`w-3 h-3 ${visionModel === 'gemini' ? 'text-indigo-500' :
                          visionModel === 'vercel' ? 'text-orange-500' : 'text-emerald-500'
                          }`} />
                        {visionModel === 'gemini' ? 'Gemini 3 Pro' :
                          visionModel === 'vercel' ? 'Gemini/Claude (Vercel)' : 'Gemini/Claude (AIML)'} (Thinking)
                      </span>
                    </div>
                  </>
                )}
              </label>

              {/* Model Selection Toggle */}
              <div className="mt-3 flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setVisionModel('aiml')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${visionModel === 'aiml'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  AIML
                </button>
                <button
                  onClick={() => setVisionModel('gemini')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${visionModel === 'gemini'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => setVisionModel('vercel')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${visionModel === 'vercel'
                    ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  Vercel
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">How to Play</h3>
            <ul className="list-disc pl-4 space-y-1 marker:text-slate-400">
              <li>Place exactly one <span className="inline-block align-middle"><Crown className="w-3 h-3 text-amber-600 dark:text-amber-500 fill-current" /></span> in each <strong>row</strong>, <strong>column</strong>, and <strong>colored block</strong>.</li>
              <li>Queens cannot touch each other, not even diagonally.</li>
              <li>Click once for <X className="inline w-3 h-3" /> (empty), click again for <Crown className="inline w-3 h-3" /> (Queen).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 rounded-t-xl z-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" /> Solve History
              </h2>
              <div className="flex gap-2">
                {history.length > 0 && (
                  <>
                    <button
                      onClick={saveLogs}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Save Logs"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={clearHistory}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Clear History"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                  <History className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No puzzles solved yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {item.gridSize}x{item.gridSize}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(item.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Solved in:</span>
                          <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {formatDuration(item.durationMs)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => loadHistoryItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Dices className="w-5 h-5 text-fuchsia-500" /> Generate Level
              </h2>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Board Size
                </label>
                <select
                  value={genSize}
                  onChange={(e) => setGenSize(parseInt(e.target.value))}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-shadow"
                >
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                    <option key={size} value={size}>{size}x{size}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setGenDifficulty(diff)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-all border
                        ${genDifficulty === diff
                          ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500 dark:border-fuchsia-500 ring-1 ring-fuchsia-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {genDifficulty === 'Easy' && "Simple, blocky regions."}
                  {genDifficulty === 'Medium' && "Balanced layout."}
                  {genDifficulty === 'Hard' && "Complex, winding regions."}
                </p>
              </div>

              <button
                onClick={handleGenerateBoard}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all hover:shadow-fuchsia-500/30 active:scale-[0.98]"
              >
                Generate Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;