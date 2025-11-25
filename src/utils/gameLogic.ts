import { CellData, Difficulty } from '../types';

/**
 * Creates an empty board grid
 */
export const createBoard = (rows: number, cols: number): CellData[][] => {
  const board: CellData[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        status: 'hidden',
        neighborMines: 0,
      });
    }
    board.push(row);
  }
  return board;
};

/**
 * Calculates neighbor mines for a specific cell
 */
const countNeighbors = (board: CellData[][], r: number, c: number): number => {
  const rows = board.length;
  const cols = board[0].length;
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const nr = r + i;
      const nc = c + j;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (board[nr][nc].isMine) count++;
      }
    }
  }
  return count;
};

/**
 * Places mines randomly, ensuring the first clicked cell (and neighbors) is safe.
 */
export const initializeMines = (
  initialBoard: CellData[][],
  difficulty: Difficulty,
  firstClickRow: number,
  firstClickCol: number
): CellData[][] => {
  const board = initialBoard.map(row => row.map(cell => ({ ...cell })));
  const { rows, cols, mines } = difficulty;
  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Don't place mine on existing mine
    if (board[r][c].isMine) continue;

    // SAFE START: Don't place mine on the first clicked cell
    if (r === firstClickRow && c === firstClickCol) continue;
    
    // Keep immediate neighbors safe for easier start
    const isNeighbor = Math.abs(r - firstClickRow) <= 1 && Math.abs(c - firstClickCol) <= 1;
    if (isNeighbor) continue;

    board[r][c].isMine = true;
    minesPlaced++;
  }

  // Calculate numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        board[r][c].neighborMines = countNeighbors(board, r, c);
      }
    }
  }

  return board;
};

/**
 * Flood fill algorithm (BFS) to reveal empty areas
 */
export const revealCells = (
  currentBoard: CellData[][],
  row: number,
  col: number
): { board: CellData[][], exploded: boolean } => {
  const board = currentBoard.map(r => r.map(c => ({ ...c })));
  const queue: [number, number][] = [[row, col]];
  const rows = board.length;
  const cols = board[0].length;

  // Handle first click if it is a mine (defensive check)
  if (board[row][col].isMine) {
    board[row][col].isExploded = true;
    board[row][col].status = 'revealed';
    // Reveal all mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine) {
          board[r][c].status = 'revealed';
        }
      }
    }
    return { board, exploded: true };
  }

  const visited = new Set<string>();

  while (queue.length > 0) {
    const [currR, currC] = queue.shift()!;
    const key = `${currR},${currC}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const cell = board[currR][currC];

    if (cell.status !== 'hidden') continue; 

    cell.status = 'revealed';

    // If empty cell (0 neighbors), add neighbors to queue
    if (cell.neighborMines === 0 && !cell.isMine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const nr = currR + i;
          const nc = currC + j;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
             if (board[nr][nc].status === 'hidden' && !board[nr][nc].isMine) {
                queue.push([nr, nc]);
             }
          }
        }
      }
    }
  }

  return { board, exploded: false };
};

export const checkWin = (board: CellData[][]): boolean => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && cell.status === 'hidden') {
        return false;
      }
    }
  }
  return true;
};

export const countFlags = (board: CellData[][]): number => {
  let count = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell.status === 'flagged') count++;
  }));
  return count;
};