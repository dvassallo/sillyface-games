import { Application } from 'pixi.js';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  TICK_MS,
  KICK_POWER_MIN,
  KICK_POWER_MAX,
  KICK_CHARGE_TIME
} from '@sensible-soccer/shared';
import { createBall, updateBall, kickBall, isInGoal, applyAftertouch } from '@sensible-soccer/shared';
import { createPlayer, updatePlayer, getFormationPositions } from '@sensible-soccer/shared';
import {
  checkBallPossession,
  checkPlayerBallCollision,
  bounceBallOffPlayer,
  getDribblePosition,
  checkTackleHitsBall
} from '@sensible-soccer/shared';
import { startTackle } from '@sensible-soccer/shared';
import GameRenderer from './GameRenderer.js';
import InputManager from './InputManager.js';

const SCALE = 1.0; // Pixels per game unit
const POSSESSION_COOLDOWN = 0.3; // Seconds before player can repossess after kicking

export default class Game {
  constructor(options) {
    this.container = options.container;
    this.onStateUpdate = options.onStateUpdate;

    this.app = null;
    this.renderer = null;
    this.inputManager = null;
    this.initialized = false;
    this.destroyed = false;

    // Game state
    this.state = {
      tick: 0,
      phase: 'playing',
      ball: null,
      players: [],
      score: { home: 0, away: 0 },
      clock: 0
    };

    // Kick state
    this.lastKickTime = 0;
    this.lastKickerId = null;
    this.kickAftertouchActive = false;
    this.kickAftertouchTimer = 0;
    this.kickDirection = 0;

    // Charge kick state
    this.kickCharging = false;
    this.kickChargeStartTime = 0;
    this.kickChargeMoveX = 0;
    this.kickChargeMoveY = 0;

    this.localPlayerId = 'player1';
    this.lastTime = 0;
    this.accumulator = 0;
    this.running = false;
  }

  async init() {
    // Check if already destroyed before starting
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

    // Check if destroyed during init
    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    this.container.appendChild(this.app.canvas);

    // Initialize renderer
    this.renderer = new GameRenderer(this.app, SCALE);
    await this.renderer.init();

    // Check if destroyed during renderer init
    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    // Initialize input manager
    this.inputManager = new InputManager();

    // Initialize game state
    this.initGameState();

    // Initial render
    this.renderer.render(this.state);

    this.initialized = true;
  }

  initGameState() {
    // Create ball at center
    this.state.ball = createBall(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);

    // Create players - practice mode with 1 player per team
    const homePositions = getFormationPositions(1, 'home');
    const awayPositions = getFormationPositions(1, 'away');

    this.state.players = [
      createPlayer('player1', homePositions[0].x, homePositions[0].y, 'home', false),
      createPlayer('player2', awayPositions[0].x, awayPositions[0].y, 'away', false)
    ];

    this.state.score = { home: 0, away: 0 };
    this.state.clock = 0;
    this.state.tick = 0;
    this.state.phase = 'playing';
  }

  start() {
    if (this.destroyed || !this.initialized) return;
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop() {
    this.running = false;
  }

  gameLoop() {
    if (!this.running || this.destroyed) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.accumulator += delta;

    // Fixed timestep updates
    while (this.accumulator >= TICK_MS) {
      this.update(TICK_MS / 1000);
      this.accumulator -= TICK_MS;
    }

    // Render
    if (this.renderer) {
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

  update(dt) {
    this.state.tick++;
    this.state.clock += dt;

    // Get local player
    const localPlayer = this.state.players.find(p => p.id === this.localPlayerId);
    if (!localPlayer) return;

    // Apply input to local player
    const input = this.inputManager.getInput();

    // Handle kick charging (press to start, release to kick)
    if (input.kickStart && localPlayer.hasBall) {
      this.kickCharging = true;
      this.kickChargeStartTime = this.state.clock;
      // Store movement direction at start of charge
      this.kickChargeMoveX = input.moveX;
      this.kickChargeMoveY = input.moveY;
    }

    // While charging, use stored movement direction
    if (this.kickCharging) {
      localPlayer.moveX = this.kickChargeMoveX;
      localPlayer.moveY = this.kickChargeMoveY;
      localPlayer.facingLocked = true;
    } else {
      localPlayer.moveX = input.moveX;
      localPlayer.moveY = input.moveY;
      localPlayer.facingLocked = false;
    }
    localPlayer.sprinting = input.sprint;

    if (input.kickRelease && this.kickCharging && localPlayer.hasBall) {
      this.handleKick(localPlayer, input);
      this.kickCharging = false;
    }

    // Cancel charge if player loses ball
    if (this.kickCharging && !localPlayer.hasBall) {
      this.kickCharging = false;
    }

    // Handle tackle
    if (input.tackle && !localPlayer.hasBall) {
      this.handleTackle(localPlayer);
    }

    // Update all players
    for (const player of this.state.players) {
      updatePlayer(player, dt);
    }

    // Update ball
    this.updateBall(dt, input);
  }

  updateBall(dt, input) {
    const ball = this.state.ball;
    const timeSinceKick = this.state.clock - this.lastKickTime;

    // Check possession (with cooldown after kicking)
    if (!ball.ownerId) {
      for (const player of this.state.players) {
        // Don't let the kicker immediately repossess
        const canPossess = (player.id !== this.lastKickerId) ||
                          (timeSinceKick > POSSESSION_COOLDOWN);

        if (canPossess && checkBallPossession(player, ball)) {
          ball.ownerId = player.id;
          ball.lastTouchId = player.id;
          player.hasBall = true;
          // Clear aftertouch when someone gains possession
          this.kickAftertouchActive = false;
          break;
        }
      }
    }

    // If a player has the ball, move ball with them
    if (ball.ownerId) {
      const owner = this.state.players.find(p => p.id === ball.ownerId);
      if (owner) {
        // Check if a tackling player steals the ball
        for (const player of this.state.players) {
          if (player.id !== owner.id && player.state === 'tackling') {
            if (checkTackleHitsBall(player, ball)) {
              // Steal the ball!
              owner.hasBall = false;
              ball.ownerId = player.id;
              ball.lastTouchId = player.id;
              player.hasBall = true;
              break;
            }
          }
        }

        // Update ball position with current owner
        const currentOwner = this.state.players.find(p => p.id === ball.ownerId);
        if (currentOwner) {
          const dribblePos = getDribblePosition(currentOwner);
          ball.x = dribblePos.x;
          ball.y = dribblePos.y;
          ball.vx = 0;
          ball.vy = 0;
          ball.z = 0;
          ball.spinX = 0;
          ball.spinY = 0;
        }
      }
    } else {
      // Apply aftertouch if active and player is holding direction keys
      if (this.kickAftertouchActive && this.kickAftertouchTimer > 0) {
        this.kickAftertouchTimer -= dt;

        // Use movement keys for aftertouch (not just when kick is held)
        if (input.moveX !== 0 || input.moveY !== 0) {
          // Use stored kick direction for more responsive feel
          const kickDir = this.kickDirection || Math.atan2(ball.vy, ball.vx);
          const inputDir = Math.atan2(input.moveY, input.moveX);

          // Calculate angle difference from kick direction
          let angleDiff = inputDir - kickDir;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // If pulling back (angle > 90 degrees from kick direction), add lift
          if (Math.abs(angleDiff) > Math.PI / 2) {
            const pullStrength = (Math.abs(angleDiff) - Math.PI / 2) / (Math.PI / 2); // 0 to 1
            const liftAmount = pullStrength * 25; // Add vertical velocity
            ball.vz += liftAmount;
            // Cap the vertical velocity
            ball.vz = Math.min(ball.vz, 250);
          } else {
            // Only apply curve for side-to-side movement (not pulling back)
            // Calculate perpendicular component for curve
            const perpAmount = Math.sin(angleDiff);
            applyAftertouch(ball, {
              x: Math.cos(kickDir + Math.PI / 2) * perpAmount,
              y: Math.sin(kickDir + Math.PI / 2) * perpAmount
            });
          }
        }
      } else {
        this.kickAftertouchActive = false;
      }

      // Update ball physics
      updateBall(ball, dt);

      // Check ball collisions with players (but not immediate repossession)
      for (const player of this.state.players) {
        // Skip collision with recent kicker during cooldown
        if (player.id === this.lastKickerId && timeSinceKick < POSSESSION_COOLDOWN * 0.5) {
          continue;
        }

        const collision = checkPlayerBallCollision(player, ball);
        if (collision.colliding) {
          bounceBallOffPlayer(ball, player, collision);
        }
      }
    }

    // Check for goals
    const goalTeam = isInGoal(ball);
    if (goalTeam) {
      this.handleGoal(goalTeam);
    }
  }

  handleKick(player, input) {
    const ball = this.state.ball;
    if (ball.ownerId !== player.id) return;

    // Kick goes in the direction the player is facing
    const kickAngle = player.facing;

    // Calculate kick power based on charge time
    const chargeTime = this.state.clock - this.kickChargeStartTime;
    const chargeRatio = Math.min(chargeTime / KICK_CHARGE_TIME, 1);
    const basePower = KICK_POWER_MIN + (KICK_POWER_MAX - KICK_POWER_MIN) * chargeRatio;

    // Add player's velocity to kick power (momentum transfer)
    const playerSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    const power = basePower + playerSpeed * 0.5;

    // Base loft angle - slight lift for ground pass
    let loftAngle = 0.1;

    // Release ball
    player.hasBall = false;
    ball.ownerId = null;

    // Record kick for cooldown and aftertouch
    this.lastKickTime = this.state.clock;
    this.lastKickerId = player.id;
    this.kickDirection = kickAngle; // Store kick direction for aftertouch

    // Enable aftertouch for a short time
    this.kickAftertouchActive = true;
    this.kickAftertouchTimer = 0.6; // 0.6 seconds of aftertouch control

    // Apply kick with player's velocity added
    kickBall(ball, power, kickAngle, loftAngle, { x: 0, y: 0 });

    // Add some of player's velocity to ball
    ball.vx += player.vx * 0.3;
    ball.vy += player.vy * 0.3;
  }

  handleTackle(player) {
    startTackle(player);
  }

  handleGoal(scoringTeam) {
    // scoringTeam is the team that scored (put ball in opponent's goal)
    if (scoringTeam === 'home') {
      this.state.score.home += 1;
    } else {
      this.state.score.away += 1;
    }

    // Reset ball to center
    this.state.ball = createBall(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);

    // Reset player possession
    for (const player of this.state.players) {
      player.hasBall = false;
    }

    // Reset kick state
    this.lastKickerId = null;
    this.kickAftertouchActive = false;

    console.log(`Goal! Score: Home ${this.state.score.home} - Away ${this.state.score.away}`);
  }

  destroy() {
    this.destroyed = true;
    this.stop();

    if (this.inputManager) {
      this.inputManager.destroy();
      this.inputManager = null;
    }

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.app) {
      // Remove canvas from DOM
      if (this.app.canvas && this.app.canvas.parentNode) {
        this.app.canvas.parentNode.removeChild(this.app.canvas);
      }
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
