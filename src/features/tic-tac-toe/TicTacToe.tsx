import React, { useCallback } from 'react';
import { Client, ProvidedGameProps } from 'boardgame.io/react';
// import { Local } from 'boardgame.io/multiplayer';

import { game, GameState, AvailableMoves } from './conditions';

import { GameTypes } from '../../types';

const createCells = (
  gameCells: GameState['cells'],
  onClick: (id: number) => void,
) => {
  let tbodyMarkup = [];

  for (let i = 0; i < 3; i++) {
    let cells = [];

    for (let j = 0; j < 3; j++) {
      const id = 3 * i + j;

      cells.push(
        <td
          key={id}
          onClick={() => onClick(id)}
          className={`border border-gray-400 px-4 h-12 w-12 py-2 ${
            !!gameCells[id] ? 'cursor-not-allowed' : ''
          }`}
        >
          {gameCells[id]}
        </td>,
      );
    }

    tbodyMarkup.push(<tr key={i}>{cells}</tr>);
  }

  return tbodyMarkup;
};

const TicTacToeBoard = (
  props: ProvidedGameProps<AvailableMoves, GameState>,
) => {
  const { G: boardgame, isActive, moves } = props;

  const canMakeMove = useCallback(
    (cellIndex) => {
      if (!isActive) return false;
      if (boardgame.cells[cellIndex] !== null) return false;

      return true;
    },
    [isActive, boardgame.cells],
  );

  const onClick = useCallback(
    (cellIndex) => {
      if (canMakeMove(cellIndex)) {
        moves.clickCell(cellIndex);
      }
    },
    [moves, canMakeMove],
  );

  return (
    <div>
      <h2 className="text-3xl capitalize">{GameTypes.TicTacToe}</h2>

      <table className="border-collapse border-2 border-gray-500">
        <tbody>{createCells(boardgame.cells, onClick)}</tbody>
      </table>

      {props.ctx.gameover ? (
        <div>
          <h3 className="text-2xl">The result</h3>
          <p className="mb-4">
            {props.ctx.gameover?.winner
              ? `Player ${props.ctx.gameover.winner} is the Winner`
              : 'Draw!'}
          </p>

          <button
            className="px-2 py-1 rounded border-blue border uppercase text-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-100"
            onClick={() => props.reset()}
          >
            Play again
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const TicTacToe = Client({
  game,
  board: TicTacToeBoard,
  debug: true, // TODO with ENV var
  // multiplayer: Local(),
});
