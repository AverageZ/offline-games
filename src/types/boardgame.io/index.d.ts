// borrowed from https://gist.github.com/qsona/e570cc23179640f00601a7995bc3336e

import {
  ActivePlayersArg,
  ActivePlayers,
  StageMap,
  PhaseConfig,
} from 'boardgame.io';
import { EventsAPI } from 'boardgame.io/dist/types/src/plugins/events/events';
import { PlayerAPI } from 'boardgame.io/dist/types/src/plugins/plugin-player';
import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/plugin-random';

declare module 'boardgame.io/core' {
  import { AIConfiguration } from 'boardgame.io/ai';

  export type Player = string;

  export class FlowObj {
    ctx: (players: number) => any;
    processGameEvent: (state: any, gameEvent: any) => any;
  }

  export class GameObj<GameState> {
    processMove: (G: GameState, action: any, ctx: any) => any;
    flow: FlowObj;
  }

  type GameOutcome =
    | true
    | { winner: GameContext['currentPlayer'] }
    | { draw: boolean };

  interface GameContext {
    numPlayers: number;
    playOrder: Player[];
    playOrderPos: number;
    activePlayers: null | ActivePlayers;
    currentPlayer: Player;
    numMoves?: number;
    gameover?: any;
    turn: number;
    phase: string;
    _activePlayersMoveLimit?: Record<Player, number>;
    _activePlayersNumMoves?: Record<Player, number>;
    _prevActivePlayers?: Array<{
      activePlayers: null | ActivePlayers;
      _activePlayersMoveLimit?: Record<Player, number>;
      _activePlayersNumMoves?: Record<Player, number>;
    }>;
    _nextActivePlayers?: ActivePlayersArg;
    _random?: {
      seed: string | number;
    };
    events?: EventsAPI;
    player?: PlayerAPI;
    random?: RandomAPI;
  }

  /**
   * There are two types of move configurations, short and long.
   */
  type GameMoves<GameState> =
    | {
        [key: string]: (G: GameState, ctx: GameContext, ...args: any[]) => void;
      }
    | {
        move: (G: GameState, ctx: GameContext, ...args: any[]) => void;
        undoable: boolean; // prevents undoing the move.
        redact: boolean; // prevents the move arguments from showing up in the log.
        client: boolean; // prevents the move from running on the client.
      };

  interface GameFlowPhase<GameState> {
    name: string;
    allowedMoves: string[];
    endPhaseIf: (G: GameState, ctx: GameContext) => boolean;
  }

  interface GameFlowTrigger<GameState> {
    conditon: (G: GameState, ctx: GameContext) => boolean;
    action: (G: GameState, ctx: GameContext) => any;
  }

  interface GameFlow<GameState> {
    movesPerTurn?: number;
    endGameIf: (G: GameState, ctx: GameContext) => any;
    endTurnIf?: (G: GameState, ctx: GameContext) => boolean;
    onTurnEnd?: (G: GameState, ctx: GameContext) => void;
    triggers?: GameFlowTrigger<GameState>[];
    phases?: GameFlowPhase<GameState>[];
  }

  interface TurnOrderConfig {
    first: (G: any, ctx: Ctx) => number;
    next: (G: any, ctx: Ctx) => number;
    playOrder?: (G: any, ctx: Ctx) => PlayerID[];
  }

  interface TurnConfiguration {
    /**
     * Calls setActivePlayers with this as argument at the beginning of the turn.
     */
    activePlayers?: object;

    /**
     * Ends the turn automatically after a number of moves.
     */
    moveLimit?: number;

    /**
     * Called at the beginning of a turn.
     */
    onBegin?: (G: GameState, ctx: GameContext) => GameState;

    /**
     * Called at the end of a turn.
     */
    onEnd?: (G: GameState, ctx: GameContext) => GameState;

    /**
     * Ends the turn if this returns true.
     */
    endIf?: (G: GameState, ctx: GameContext) => boolean | void;

    /**
     * Called at the end of each move.
     */
    onMove?: (G: GameState, ctx: GameContext) => any;

    stages?: StageMap;

    /**
     * The turn order for the game
     */
    order?: TurnOrderConfig;
  }

  export interface GameEvents {
    endTurn: () => void;
  }

  interface IAIMoveObj {
    move: string;
    args: unknown[];
  }

  // TODO - broken
  // interface AIConfiguration<T> {
  //   enumerate: (G: T, ctx: GameContext) => IAIMoveObj[];
  // }

  export interface GameConfiguration<GameState> {
    name: string;

    /**
     * The seed used by the pseudo-random number generator.
     */
    seed?: string | number;

    /*
     * Function that returns the initial value of G.
     * setupData is an optional custom object that is
     * passed through the Game Creation API.
     */
    setup: (numPlayers: number) => GameState;

    moves: GameMoves<GameState>;

    phases?: {
      [phaseName: string]: PhaseConfig;
    };

    /**
     * Function that allows you to tailor the game state to a specific player.
     */
    playerView?: (G: GameState, ctx: GameContext, playerID: Player) => any;
    flow?: GameFlow<GameState>;

    /**
     * Ends the game if this returns anything. The return value is available in `ctx.gameover`.
     */
    endIf?: (G: GameState, ctx: GameContext) => GameOutcome | void;

    /**
     * Called at the end of the game. `ctx.gameover` is available at this point.
     */
    onEnd?: (G: GameState, ctx: GameContext) => GameState;

    turn?: TurnConfiguration;

    ai?: {
      // TODO - use AIConfiguration
      enumerate: (G: GameState, ctx: GameContext) => IAIMoveObj[];
    };
  }

  export function Game<GameState>(
    gameArgs: GameConfiguration<GameState>,
  ): GameObj<GameState>;
}

declare module 'boardgame.io/react' {
  import {
    GameConfiguration,
    GameContext,
    GameEvents,
  } from 'boardgame.io/core';

  export class WrapperBoard {
    moves: any;
    events: any;
    store: any;
  }

  export type ProvidedGameProps<Moves, State = GameState> = {
    G: State;
    ctx: GameContext;
    isActive: boolean;
    events: GameEvents<State>;
    moves: Record<Moves, (...args: unknown[]) => void>;
  };

  export function Client(
    clientConfiguration: ClientConfiguration,
  ): React.ComponentType<ProvidedGameProps>;
}

// declare module 'boardgame.io/ai' {
//   import { GameContext } from 'boardgame.io/core';

//   interface IAIMoveObj {
//     move: string;
//     args: unknown[];
//   }

//   export interface AIConfiguration<GameState> {
//     enumerate: (G: GameState, ctx: GameContext) => IAIMoveObj[];
//   }

//   export function AI<GameState>(
//     aiConfiguration: AIConfiguration<GameState>,
//   ): any;
// }

declare module 'boardgame.io/client' {
  import { GameObj, GameMoves } from 'boardgame.io/core';

  export class WrapperBoard {
    moves: any;
    events: any;
    store: any;
  }

  export interface ClientConfiguration {
    game: GameConfiguration<GameState>;
    numPlayer?: number;
    board?: React.ReactNode;
    multiplayer?: {
      server: string;
    };
    debug?: boolean;
    ai?: any;
  }

  export function Client(
    clientConfiguration: ClientConfiguration,
  ): WrapperBoard;
}

declare module 'boardgame.io/server' {
  import { GameObj } from 'boardgame.io/core';
  import * as Koa from 'koa';
  interface ServerConfiguration<GameState> {
    games: GameObj<GameState>[];
  }
  function Server<GameState>(
    serverConfiguration: ServerConfiguration<GameState>,
  ): Koa;
  export = Server;
}
