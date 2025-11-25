import React, { useRef, useEffect } from 'react';
import { CellData } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: CellData[][];
  cols: number;
  onCellClick: (r: number, c: number) => void;
  onCellRightClick: (r: number, c: number) => void;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  cols, 
  onCellClick, 
  onCellRightClick,
  disabled 
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardRef.current) {
        boardRef.current.style.margin = 'auto';
    }
  }, [board, cols]);

  return (
    <div className="flex-1 w-full overflow-auto relative p-4 flex items-center justify-center bg-slate-900">
      <div
        ref={boardRef}
        className="grid gap-1 bg-slate-850 p-3 rounded-xl shadow-2xl border border-slate-800/50 touch-manipulation"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(32px, 40px))`,
          gridAutoRows: 'minmax(32px, 40px)',
        }}
      >
        {board.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <Cell
              key={`${rIndex}-${cIndex}`}
              data={cell}
              onClick={onCellClick}
              onRightClick={onCellRightClick}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;