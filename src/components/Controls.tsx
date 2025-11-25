import React from 'react';
import { RefreshCw, Timer, Flag } from 'lucide-react';
import { Difficulty, GameStatus, DIFFICULTIES } from '../types';

interface ControlsProps {
  minesLeft: number;
  timer: number;
  gameStatus: GameStatus;
  difficulty: Difficulty;
  onReset: () => void;
  onChangeDifficulty: (diff: Difficulty) => void;
}

const Controls: React.FC<ControlsProps> = ({
  minesLeft,
  timer,
  gameStatus,
  difficulty,
  onReset,
  onChangeDifficulty
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl px-4 py-4 flex flex-col gap-4 mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-lg">
        
        {/* Stats */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-lg">
            <Flag className="w-5 h-5 text-orange-400" />
            <span>{minesLeft}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-lg">
            <Timer className="w-5 h-5 text-blue-400" />
            <span>{formatTime(timer)}</span>
          </div>
        </div>

        {/* Reset / Status Face */}
        <button
          onClick={onReset}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors active:scale-95 shadow-lg border border-slate-600 group"
          aria-label="Reset Game"
        >
          {gameStatus === 'won' ? (
            <span className="text-xl">😎</span>
          ) : gameStatus === 'lost' ? (
            <span className="text-xl">😵</span>
          ) : (
            <RefreshCw className="w-5 h-5 text-slate-200 group-hover:rotate-180 transition-transform duration-500" />
          )}
        </button>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex p-1 bg-slate-800/80 rounded-lg self-center gap-1 overflow-x-auto max-w-full border border-slate-700/50">
        {Object.values(DIFFICULTIES).map((diff) => (
          <button
            key={diff.name}
            onClick={() => onChangeDifficulty(diff)}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap
              ${difficulty.name === diff.name 
                ? 'bg-slate-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}
            `}
          >
            {diff.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Controls;