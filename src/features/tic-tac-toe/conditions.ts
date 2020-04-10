import { Player, GameConfiguration } from 'boardgame.io/core';
import { Nullable } from 'tsdef';
import { GameTypes } from '../../types';

type Cells = Nullable<Player>[];

export type GameState = {
  cells: Cells;
};

const possibleWinCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const isVictory = (cells: Cells, player: Player) =>
  possibleWinCombinations.some((winLine) =>
    winLine.every((i) => cells[i] === player),
  );

export const isDraw = (cells: Cells) => cells.every((cell) => cell !== null);

export enum AvailableMoves {
  ClickCell = 'clickCell',
}

export const game: GameConfiguration<GameState> = {
  name: GameTypes.TicTacToe,

  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    [AvailableMoves.ClickCell]: (G, ctx, cellIndex) => {
      if (G.cells[cellIndex] === null) {
        G.cells[cellIndex] = ctx.currentPlayer;
      }
    },
  },

  turn: {
    moveLimit: 1,
  },

  endIf: (G, ctx) => {
    if (isVictory(G.cells, ctx.currentPlayer))
      return { winner: ctx.currentPlayer };

    if (isDraw(G.cells)) return { draw: true };
  },

  ai: {
    enumerate: (G) => {
      let moves = [];

      for (let i = 0; i < 9; i++) {
        if (G.cells[i] === null) {
          moves.push({ move: AvailableMoves.ClickCell, args: [i] });
        }
      }

      return moves;
    },
  },
};
