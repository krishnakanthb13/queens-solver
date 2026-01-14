import React from 'react';
import { History, X, Download, Trash2, Clock, Eye, CircleX } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onSaveLogs: () => void;
    onClearHistory: () => void;
    onLoadItem: (item: HistoryItem) => void;
    onDeleteEntry: (id: string, e: React.MouseEvent) => void;
    formatDuration: (ms: number) => string;
    formatTime: (timestamp: number) => string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    history,
    onSaveLogs,
    onClearHistory,
    onLoadItem,
    onDeleteEntry,
    formatDuration,
    formatTime
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 rounded-t-xl z-10">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" /> Solved History Logs
                    </h2>
                    <div className="flex gap-2">
                        {history.length > 0 && (
                            <>
                                <button
                                    onClick={onSaveLogs}
                                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Save Logs"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClearHistory}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Clear History"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
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
                            {history.slice(0, 100).map(item => (
                                <div
                                    key={item.id}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all content-visibility-auto contain-intrinsic-size-[88px]"
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
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onLoadItem(item)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        <button
                                            onClick={(e) => onDeleteEntry(item.id, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete Entry"
                                        >
                                            <CircleX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
