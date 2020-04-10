import React from 'react';
import { Link } from 'react-router-dom';

import { GameTypes } from '../../types';

type Game = {
  name: string;
  available: boolean;
  route: GameTypes;
  color: string;
};

const allGames: Game[] = [
  {
    name: 'Tic-tac-toe',
    available: true,
    route: GameTypes.TicTacToe,
    color: 'blue',
  },
];

const transitionStyles =
  'transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-100';

export const GameSelection = () => (
  <nav className="grid grid-cols-3 gap-4">
    {allGames.map((game) => (
      <Link
        key={game.name}
        className={`${transitionStyles} flex rounded items-center justify-center shadow h-16 uppercase text-white bg-${game.color}`}
        to={`/${game.route}`}
      >
        {game.name}
      </Link>
    ))}
  </nav>
);
