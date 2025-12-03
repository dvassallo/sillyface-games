import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // UI State
  screen: 'menu', // 'menu', 'lobby', 'game'
  playerName: '',

  // Game State (synced from game engine)
  gameState: null,
  localPlayerId: null,

  // Match info
  score: { home: 0, away: 0 },
  clock: 0,
  phase: 'waiting',

  // Connection
  connected: false,
  latency: 0,

  // Actions
  setScreen: (screen) => set({ screen }),
  setPlayerName: (name) => set({ playerName: name }),

  startLocalGame: () => {
    set({
      screen: 'game',
      score: { home: 0, away: 0 },
      clock: 0,
      phase: 'playing'
    });
  },

  updateGameState: (state) => set({
    gameState: state,
    score: state.score,
    clock: state.clock,
    phase: state.phase
  }),

  setLocalPlayerId: (id) => set({ localPlayerId: id }),

  setConnected: (connected) => set({ connected }),
  setLatency: (latency) => set({ latency }),

  goalScored: (team) => set(state => ({
    score: {
      ...state.score,
      [team]: state.score[team] + 1
    }
  })),

  resetGame: () => set({
    gameState: null,
    score: { home: 0, away: 0 },
    clock: 0,
    phase: 'waiting'
  }),

  returnToMenu: () => set({
    screen: 'menu',
    gameState: null,
    score: { home: 0, away: 0 },
    clock: 0,
    phase: 'waiting'
  })
}));
