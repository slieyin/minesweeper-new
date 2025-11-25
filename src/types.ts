export type CellStatus = 'hidden' | 'revealed' | 'flagged';

export interface CellData {
  row: number;
  col: number;
  isMine: boolean;
  status: CellStatus;
  neighborMines: number;
  isExploded?: boolean; // True if this was the clicked mine
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  EASY: { name: 'Easy', rows: 9, cols: 9, mines: 10 },
  MEDIUM: { name: 'Medium', rows: 16, cols: 16, mines: 40 },
  HARD: { name: 'Hard', rows: 16, cols: 30, mines: 99 },
};