// Client -> Server message types
export const ClientMessageType = {
  // Lobby
  JOIN_LOBBY: 0x01,
  CREATE_LOBBY: 0x02,
  LEAVE_LOBBY: 0x03,
  SELECT_TEAM: 0x04,
  READY: 0x05,
  START_MATCH: 0x06,

  // Queue
  JOIN_QUEUE: 0x10,
  LEAVE_QUEUE: 0x11,

  // Game
  INPUT: 0x20,

  // Connection
  PING: 0xff
};

// Server -> Client message types
export const ServerMessageType = {
  // Lobby
  LOBBY_STATE: 0x01,
  LOBBY_ERROR: 0x02,
  LOBBY_JOINED: 0x03,
  PLAYER_JOINED: 0x04,
  PLAYER_LEFT: 0x05,

  // Queue
  QUEUE_POSITION: 0x10,
  MATCH_FOUND: 0x11,

  // Game
  MATCH_START: 0x20,
  GAME_STATE: 0x21,
  GAME_DELTA: 0x22,
  INPUT_ACK: 0x23,
  GOAL: 0x24,
  FOUL: 0x25,
  CARD: 0x26,
  MATCH_EVENT: 0x27,
  HALF_TIME: 0x28,
  MATCH_END: 0x29,

  // Connection
  PONG: 0xff,
  ERROR: 0xfe
};

// Match events
export const MatchEventType = {
  KICKOFF: 'kickoff',
  GOAL_KICK: 'goal_kick',
  CORNER: 'corner',
  THROW_IN: 'throw_in',
  FREE_KICK: 'free_kick',
  PENALTY: 'penalty',
  OFFSIDE: 'offside',
  GOAL: 'goal',
  HALFTIME: 'halftime',
  FULLTIME: 'fulltime'
};

// Player states (for syncing)
export const PlayerState = {
  IDLE: 0,
  RUNNING: 1,
  TACKLING: 2,
  DIVING: 3,
  RECOVERING: 4,
  CELEBRATING: 5
};

// Game phases
export const GamePhase = {
  WAITING: 'waiting',
  KICKOFF: 'kickoff',
  PLAYING: 'playing',
  GOAL_SCORED: 'goal_scored',
  SET_PIECE: 'set_piece',
  HALFTIME: 'halftime',
  ENDED: 'ended'
};

// Create an input command
export function createInputCommand(sequence, tick, input) {
  return {
    sequence,
    tick,
    moveX: input.moveX || 0,
    moveY: input.moveY || 0,
    kick: input.kick || false,
    tackle: input.tackle || false,
    sprint: input.sprint || false,
    aftertouchX: input.aftertouchX || 0,
    aftertouchY: input.aftertouchY || 0
  };
}

// Serialize game state for network (minimal version)
export function serializeGameState(state) {
  return {
    tick: state.tick,
    phase: state.phase,
    ball: {
      x: Math.round(state.ball.x * 10) / 10,
      y: Math.round(state.ball.y * 10) / 10,
      z: Math.round(state.ball.z * 10) / 10,
      vx: Math.round(state.ball.vx),
      vy: Math.round(state.ball.vy),
      vz: Math.round(state.ball.vz)
    },
    players: state.players.map(p => ({
      id: p.id,
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      vx: Math.round(p.vx),
      vy: Math.round(p.vy),
      facing: Math.round(p.facing * 100) / 100,
      state: PlayerState[p.state.toUpperCase()] || 0,
      team: p.team
    })),
    score: state.score,
    clock: state.clock
  };
}

// Deserialize game state from network
export function deserializeGameState(data) {
  const stateNames = ['idle', 'running', 'tackling', 'diving', 'recovering', 'celebrating'];

  return {
    tick: data.tick,
    phase: data.phase,
    ball: {
      x: data.ball.x,
      y: data.ball.y,
      z: data.ball.z,
      vx: data.ball.vx,
      vy: data.ball.vy,
      vz: data.ball.vz,
      spinX: 0,
      spinY: 0,
      ownerId: null,
      lastTouchId: null
    },
    players: data.players.map(p => ({
      id: p.id,
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      facing: p.facing,
      state: stateNames[p.state] || 'idle',
      team: p.team
    })),
    score: data.score,
    clock: data.clock
  };
}
