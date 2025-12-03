import { Application } from 'pixi.js';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  TICK_MS
} from '@sensible-soccer/shared';
import GameRenderer from './GameRenderer.js';
import InputManager from './InputManager.js';
import networkManager from '../network/NetworkManager.js';

const SCALE = 1.0;

export default class MultiplayerGame {
  constructor(options) {
    this.container = options.container;
    this.onStateUpdate = options.onStateUpdate;
    this.localPlayerId = options.localPlayerId;

    this.app = null;
    this.renderer = null;
    this.inputManager = null;
    this.initialized = false;
    this.destroyed = false;

    // Game state (received from server)
    this.state = {
      tick: 0,
      phase: 'waiting',
      ball: null,
      players: [],
      score: { home: 0, away: 0 },
      clock: 0
    };

    this.running = false;
    this.lastInputSendTime = 0;
    this.inputSendInterval = TICK_MS; // Send input every tick

    // Track kick/tackle states that shouldn't be lost between frames
    this.pendingKick = false;
    this.pendingTackle = false;
  }

  async init() {
    if (this.destroyed) return;

    // Create PixiJS application
    this.app = new Application();

    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    this.container.appendChild(this.app.canvas);

    // Initialize renderer
    this.renderer = new GameRenderer(this.app, SCALE);
    await this.renderer.init();

    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    // Initialize input manager
    this.inputManager = new InputManager();

    // Set up network message handlers
    this.setupNetworkHandlers();

    this.initialized = true;
  }

  setupNetworkHandlers() {
    this.handleGameState = (message) => {
      // Update local state from server
      this.state = {
        tick: message.tick,
        phase: message.phase,
        ball: message.ball,
        players: message.players,
        score: message.score,
        clock: message.clock
      };

      // Update ball ownerId for rendering
      if (this.state.ball && message.ball.ownerId) {
        this.state.ball.ownerId = message.ball.ownerId;
      }

      // Mark which player has the ball
      for (const player of this.state.players) {
        player.hasBall = player.id === message.ball?.ownerId;
      }
    };

    this.handleGoal = (message) => {
      console.log(`Goal scored by ${message.team}!`);
      this.state.score = message.score;
    };

    networkManager.on('game_state', this.handleGameState);
    networkManager.on('goal', this.handleGoal);
  }

  start() {
    if (this.destroyed || !this.initialized) return;
    this.running = true;
    this.gameLoop();
  }

  stop() {
    this.running = false;
  }

  gameLoop() {
    if (!this.running || this.destroyed) return;

    const now = performance.now();

    // Capture input every frame (so we don't miss kick/tackle presses)
    const input = this.inputManager.getInput();
    if (input.kickStart) this.pendingKick = true;
    if (input.tackle) this.pendingTackle = true;

    // Store latest movement input
    this.latestInput = input;

    // Send input to server periodically
    if (now - this.lastInputSendTime >= this.inputSendInterval) {
      this.sendInput();
      this.lastInputSendTime = now;
    }

    // Render current state
    if (this.renderer && this.state.ball) {
      this.renderer.render(this.state);
    }

    // Notify React store
    if (this.onStateUpdate) {
      this.onStateUpdate({
        score: this.state.score,
        clock: this.state.clock,
        phase: this.state.phase
      });
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  sendInput() {
    const input = this.latestInput || { moveX: 0, moveY: 0, sprint: false };

    // Send pending actions (kick/tackle that might have been pressed between sends)
    networkManager.sendInput({
      moveX: input.moveX,
      moveY: input.moveY,
      kick: this.pendingKick,
      tackle: this.pendingTackle,
      sprint: input.sprint
    });

    // Clear pending actions after sending
    this.pendingKick = false;
    this.pendingTackle = false;
  }

  destroy() {
    this.destroyed = true;
    this.stop();

    // Remove network handlers
    if (this.handleGameState) {
      networkManager.off('game_state', this.handleGameState);
    }
    if (this.handleGoal) {
      networkManager.off('goal', this.handleGoal);
    }

    if (this.inputManager) {
      this.inputManager.destroy();
      this.inputManager = null;
    }

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.app) {
      if (this.app.canvas && this.app.canvas.parentNode) {
        this.app.canvas.parentNode.removeChild(this.app.canvas);
      }
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
