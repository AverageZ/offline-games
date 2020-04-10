// borrowed from https://gist.github.com/qsona/e570cc23179640f00601a7995bc3336e

import {
  ActivePlayersArg,
  ActivePlayers,
  StageMap,
  PhaseConfig,
  LogEntry,
} from 'boardgame.io';
import { EventsAPI } from 'boardgame.io/dist/types/src/plugins/events/events';
import { PlayerAPI } from 'boardgame.io/dist/types/src/plugins/plugin-player';
import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/plugin-random';
import { Nullable } from 'tsdef';

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
    /**
     * This event ends the turn. The default behavior is to increment ctx.turn by 1 and advance currentPlayer to the next player according to the configured turn order (the default being a round-robin).
     * This event also accepts an argument, which (if provided) switches the turn to the specified player instead.
     */
    endTurn: (nextPlayer?: { next: Player }) => void;

    /**
     * This event ends the current phase. If the definition for the current phase in the game object specifies a next option, then the game moves to that phase. If not, the game returns to a state where no phase is active.
     */
    endPhase: () => void;

    /**
     * This event ends the game. If you pass an argument to it, then that argument is made available in ctx.gameover. After the game is over, further state changes to the game (via a move or event) are not possible.
     */
    endGame: (arg?: unknown) => void;

    /**
     * Takes the player that called the event into the stage specified.
     */
    setStage: (stageName: string) => void;

    /**
     * Takes the game into the phase specified. Ends the active phase first.
     */
    setPhase: (phaseName: string) => void;

    /**
     * Allows adding additional players to the set of "active players", and also any stages that you want to put them in. See the guide on Stages for more details.
     */
    setActivePlayers: (...args: unknown[]) => void;
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

  export type ProvidedGameProps<Moves, State = GameState> = {
    /**
     *  The game state.
     */
    G: State;

    /**
     * The game metadata.
     */
    ctx: GameContext;

    /**
     * if the client is able to currently make a move or interact with the game.
     */
    isActive: boolean;

    /**
     * if connection to the server is active.
     */
    isConnected: boolean;

    /**
     * if it is a multiplayer game.
     */
    isMultiplayer: boolean;

    /**
     * An object containing functions to dispatch various game events like endTurn and endPhase.
     */
    events: GameEvents<State>;

    /**
     * An object containing functions to dispatch various moves that you have defined.
     * The functions are named after the moves you created using Game().
     * Each function can take any number of arguments, and they are passed to the move
     * function after G and ctx.
     */
    moves: Record<Moves, (...args: unknown[]) => void>;

    /**
     * Function that resets the game.
     */
    reset: () => void;

    /**
     * Function that undoes the last move.
     */
    undo: () => void;

    /**
     * Function that redoes the previously undone move.
     */
    redo: () => void;

    /**
     * Function that will advance the game if AI is configured.
     */
    step?: () => void;

    /**
     * The game log.
     */
    log: LogEntry[];

    /**
     * The game ID associated with the client.
     */
    gameID: string | 'default';

    /**
     * The player ID associated with the client.
     */
    playerID: Nullable<string>;

    /**
     * An object containing the players that have joined the game from a room.
     */
    gameMetadata: { players: Record<Player, { id: Player; name: string }> };
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

  export interface ClientConfiguration {
    game: GameConfiguration<GameState>;

    /**
     * Number of players
     */
    numPlayer?: number;

    /**
     * Your React component representing the game board.
     */
    board?: React.ReactNode;

    /*
     * Optional: React component to display while the client
     * is in the "loading" state prior to the initial sync
     * with the game master. Relevant only in multiplayer mode.
     * If this is not provided, the client displays "connecting...".
     */
    loading?: React.ReactNode;

    /**
     * Set this to one of the following to enable multiplayer:
     *
     * SocketIO
     *   Implementation that talks to a remote server using socket.io.
     *
     *   How to import:
     *     import { SocketIO } from 'boardgame.io/multiplayer'
     *
     *   Arguments:
     *     Object with 2 parameters
     *        1. 'socketOpts' options to pass directly to socket.io client.
     *        2. 'server' specifies the server location in the format: [http[s]:*]hostname[:port];
     *            defaults to current page host.
     *
     * Local
     *   Special local mode that uses an in-memory game master. Useful
     *   for testing multiplayer interactions locally without having to
     *   connect to a server.
     *
     *   How to import:
     *     import { Local } from 'boardgame.io/multiplayer'
     *
     * Additionally, you can write your own transport implementation.
     * See `src/client/client.js` for details.
     */
    multiplayer?: any;

    /**
     * Set to false to disable the Debug UI.
     */
    debug?: boolean;

    /**
     * An optional Redux store enhancer.
     * This is useful for augmenting the Redux store
     * for purposes of debugging or simply intercepting
     * events in order to kick of
     */
    enhancer?: any;
  }

  export function Client(
    clientConfiguration: ClientConfiguration,
  ): React.ComponentType<{
    /**
     * Connect to a particular game (multiplayer).
     */
    gameID?: string;

    /**
     * Associate the client with a player (multiplayer).
     */
    playerID?: string;

    /**
     * Set to false to disable the Debug UI.
     */
    debug?: boolean;
  }>;
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
