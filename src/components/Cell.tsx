import React, { memo } from 'react';
import { CellData } from '../types';
import { Flag, Bomb } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useLongPress } from '../hooks/useLongPress';

interface CellProps {
  data: CellData;
  onClick: (r: number, c: number) => void;
  onRightClick: (r: number, c: number) => void;
  disabled: boolean;
}

const Cell: React.FC<CellProps> = ({ data, onClick, onRightClick, disabled }) => {
  const { row, col, status, isMine, neighborMines, isExploded } = data;

  // Handle standard interactions
  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (disabled || status !== 'hidden') return;
    onClick(row, col);
  };

  const handleFlag = (e: React.SyntheticEvent) => {
    // If it's a touch event or manual call, prevent default to stop ghost clicks
    if (e.type === 'contextmenu') {
        e.preventDefault();
    }
    
    if (disabled || status === 'revealed') return;
    onRightClick(row, col);
  };

  // Mobile Long Press Hook
  // We pass handleFlag as both the Long Press handler AND the Context Menu handler (desktop right click)
  // The hook internal logic prevents double-firing.
  const longPressProps = useLongPress(handleFlag, handleClick, {
    delay: 400, 
    shouldPreventDefault: true,
    onContext: handleFlag 
  });

  // Determine appearance
  const baseClasses = "relative w-full h-full rounded-md flex items-center justify-center text-lg font-bold select-none transition-all duration-200 shadow-sm border-b-[3px]";
  
  let stateClasses = "";
  let content = null;

  if (status === 'hidden') {
    stateClasses = "bg-slate-700 border-slate-800 hover:bg-slate-600 active:translate-y-[2px] active:border-b-0 cursor-pointer";
  } else if (status === 'flagged') {
    stateClasses = "bg-slate-700 border-slate-800 cursor-pointer";
    content = <Flag className="w-1/2 h-1/2 text-orange-400 fill-orange-400/20 animate-pop" />;
  } else if (status === 'revealed') {
    if (isMine) {
      stateClasses = isExploded 
        ? "bg-red-500/90 border-red-700 z-10 scale-105 shadow-xl" 
        : "bg-slate-800 border-slate-850 opacity-60";
      content = <Bomb className={`w-3/5 h-3/5 text-white ${isExploded ? 'animate-shake' : ''}`} fill="currentColor" />;
    } else {
      stateClasses = "bg-slate-800 border-slate-850"; // Flat, revealed state
      if (neighborMines > 0) {
        const colors = [
          '',
          'text-blue-400',
          'text-emerald-400',
          'text-red-400',
          'text-purple-400',
          'text-amber-400',
          'text-pink-400',
          'text-teal-400',
          'text-gray-400',
        ];
        content = <span className={`${colors[neighborMines]} animate-pop`}>{neighborMines}</span>;
      }
    }
  }

  return (
    <div
      {...longPressProps}
      // Note: We removed the manual onContextMenu={handleContextMenu} here 
      // because longPressProps now contains the smart onContextMenu handler.
      className={twMerge(baseClasses, stateClasses)}
    >
      {content}
      {status === 'hidden' && !content && (
         <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default memo(Cell, (prev, next) => {
  return (
    prev.data.status === next.data.status &&
    prev.data.isMine === next.data.isMine &&
    prev.data.neighborMines === next.data.neighborMines &&
    prev.data.isExploded === next.data.isExploded &&
    prev.disabled === next.disabled
  );
});