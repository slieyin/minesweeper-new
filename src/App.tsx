import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CellData, GameStatus, Difficulty, DIFFICULTIES } from './types';
import { createBoard, initializeMines, revealCells, checkWin, countFlags } from './utils/gameLogic';
import Controls from './components/Controls';
import Board from './components/Board';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES.EASY);
  const [board, setBoard] = useState<CellData[][]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  const initGame = useCallback(() => {
    setBoard(createBoard(difficulty.rows, difficulty.cols));
    setStatus('idle');
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [difficulty]);

  useEffect(() => {
    initGame();
    return () => clearInterval(timerRef.current);
  }, [initGame]);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
  }, [status]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (status === 'won' || status === 'lost') return;

    // Safe Start
    if (status === 'idle') {
      setStatus('playing');
      const boardWithMines = initializeMines(board, difficulty, row, col);
      const { board: newBoard } = revealCells(boardWithMines, row, col);
      setBoard(newBoard);
      return;
    }

    const { board: newBoard, exploded } = revealCells(board, row, col);
    setBoard(newBoard);

    if (exploded) {
      setStatus('lost');
    } else if (checkWin(newBoard)) {
      setStatus('won');
      triggerWinEffect();
    }
  }, [board, status, difficulty]);

  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (status !== 'playing' && status !== 'idle') return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const cell = newBoard[row][col];

    if (cell.status === 'revealed') return;

    if (cell.status === 'hidden') {
      cell.status = 'flagged';
    } else if (cell.status === 'flagged') {
      cell.status = 'hidden';
    }

    setBoard(newBoard);
  }, [board, status]);

  const triggerWinEffect = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#34d399', '#f472b6']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#34d399', '#f472b6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const minesLeft = difficulty.mines - countFlags(board);

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden font-sans text-slate-200">
      {/* Header */}
      <div className="flex-none flex justify-center z-10 shadow-xl bg-slate-900/90 border-b border-slate-800">
        <Controls
          minesLeft={Math.max(0, minesLeft)}
          timer={timer}
          gameStatus={status}
          difficulty={difficulty}
          onReset={initGame}
          onChangeDifficulty={setDifficulty}
        />
      </div>

      {/* Board */}
      <Board
        board={board}
        cols={difficulty.cols}
        onCellClick={handleCellClick}
        onCellRightClick={handleCellRightClick}
        disabled={status === 'won' || status === 'lost'}
      />

      {/* Win Overlay */}
      {status === 'won' && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-600 text-center animate-pop">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2">Victory!</h2>
              <p className="text-slate-400 mb-6">Time: {timer} seconds</p>
              <button 
                onClick={initGame}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all font-semibold"
              >
                Play Again
              </button>
            </div>
         </div>
      )}
    </div>
  );
}

export default App;