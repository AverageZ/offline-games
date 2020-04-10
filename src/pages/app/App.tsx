import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { GameSelection, TicTacToe } from '../../features';
import { GameTypes } from '../../types';

export function App() {
  return (
    <Router>
      <div className="container mx-auto shadow p-4 m-4">
        <header>
          <h1 className="text-5xl">Bored Games</h1>
        </header>

        <main className="container">
          <Switch>
            <Route exact path="/">
              <GameSelection />
            </Route>
            <Route path={`/${GameTypes.TicTacToe}`}>
              <Link to="/">Back</Link>
              <TicTacToe playerID="0" />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}
