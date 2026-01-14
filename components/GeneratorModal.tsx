import React from 'react';
import { Dices, X } from 'lucide-react';
import { Difficulty } from '../services/generator';

interface GeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    genSize: number;
    setGenSize: (size: number) => void;
    genDifficulty: Difficulty;
    setGenDifficulty: (diff: Difficulty) => void;
    onGenerate: () => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
    isOpen,
    onClose,
    genSize,
    setGenSize,
    genDifficulty,
    setGenDifficulty,
    onGenerate
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Dices className="w-5 h-5 text-fuchsia-500" /> Generate Level
                    </h2>
                    <button
                        onClick={onClose}
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
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium text-center min-h-[1.5em]">
                            {genDifficulty === 'Easy' && "Simple, blocky regions."}
                            {genDifficulty === 'Medium' && "Balanced layout."}
                            {genDifficulty === 'Hard' && "Complex, winding regions."}
                        </p>
                    </div>

                    <button
                        onClick={onGenerate}
                        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all hover:shadow-fuchsia-500/30 active:scale-[0.98]"
                    >
                        Generate Board
                    </button>
                </div>
            </div>
        </div>
    );
};
