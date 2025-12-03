import {
  TICK_RATE,
  TICK_MS,
  BROADCAST_INTERVAL,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  KICK_POWER_MIN,
  KICK_POWER_MAX,
  KICK_CHARGE_TIME,
  createBall,
  updateBall,
  kickBall,
  isInGoal,
  createPlayer,
  updatePlayer,
  getFormationPositions,
  startTackle,
  checkBallPossession,
  checkPlayerBallCollision,
  bounceBallOffPlayer,
  getDribblePosition,
  checkPlayerCollision,
  resolvePlayerCollision,
  checkTackleHitsBall
} from '../../shared/index.js';

const POSSESSION_COOLDOWN = 0.3; // Seconds before player can repossess after kicking

export class GameRoom {
  constructor(id, settings = {}) {
    this.id = id;
    this.settings = {
      matchDuration: settings.matchDuration || 180,
      teamSize: settings.teamSize || 1,
      ...settings
    };

    this.state = {
      tick: 0,
      phase: 'waiting', // waiting, kickoff, playing, goal_scored, halftime, ended
      ball: null,
      players: [],
      score: { home: 0, away: 0 },
      clock: 0,
      half: 1
    };

    this.playerConnections = new Map(); // playerId -> websocket
    this.playerInputs = new Map(); // playerId -> latest input
    this.running = false;
    this.loopInterval = null;
    this.tickCount = 0;

    // Kick tracking (per-player)
    this.lastKickTime = new Map(); // playerId -> time
    this.lastKickerId = null;

    // Per-player kick charging state
    this.kickCharging = new Map(); // playerId -> { charging, startTime }
  }

  addPlayer(playerId, ws, team, name) {
    this.playerConnections.set(playerId, ws);

    // Determine position based on current team size
    const teamPlayers = this.state.players.filter(p => p.team === team);
    const positions = getFormationPositions(this.settings.teamSize, team);
    const posIndex = teamPlayers.length;

    if (posIndex >= positions.length) {
      return { success: false, error: 'Team is full' };
    }

    const pos = positions[posIndex];
    const isGoalkeeper = posIndex === 0 && this.settings.teamSize >= 5;

    const player = createPlayer(playerId, pos.x, pos.y, team, isGoalkeeper);
    player.name = name;
    this.state.players.push(player);

    return { success: true, player };
  }

  removePlayer(playerId) {
    this.playerConnections.delete(playerId);
    this.playerInputs.delete(playerId);
    this.state.players = this.state.players.filter(p => p.id !== playerId);
  }

  processInput(playerId, input) {
    this.playerInputs.set(playerId, {
      ...input,
      receivedAt: Date.now()
    });
  }

  start() {
    if (this.running) return;

    // Initialize ball
    this.state.ball = createBall(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);
    this.state.phase = 'playing'; // Start playing immediately like single-player
    this.state.clock = 0;
    this.state.tick = 0;

    this.running = true;
    this.lastTime = Date.now();

    // Start fixed timestep loop
    this.loopInterval = setInterval(() => this.tick(), TICK_MS);
  }

  stop() {
    this.running = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  tick() {
    if (!this.running) return;

    const dt = TICK_MS / 1000;
    this.state.tick++;
    this.tickCount++;

    // Update clock (always when playing)
    if (this.state.phase === 'playing') {
      this.state.clock += dt;
    }

    // Apply inputs to players
    for (const [playerId, input] of this.playerInputs) {
      const player = this.state.players.find(p => p.id === playerId);
      if (player) {
        player.moveX = input.moveX || 0;
        player.moveY = input.moveY || 0;
        player.sprinting = input.sprint || false;

        // Handle kick - need to track charge state for proper power
        if (input.kick && player.hasBall) {
          this.handleKick(player, input);
        }

        // Handle tackle
        if (input.tackle && !player.hasBall) {
          this.handleTackle(player);
        }
      }
    }

    // Update all players
    for (const player of this.state.players) {
      updatePlayer(player, dt);
    }

    // Resolve player-player collisions
    for (let i = 0; i < this.state.players.length; i++) {
      for (let j = i + 1; j < this.state.players.length; j++) {
        const collision = checkPlayerCollision(
          this.state.players[i],
          this.state.players[j]
        );
        if (collision.colliding) {
          resolvePlayerCollision(
            this.state.players[i],
            this.state.players[j],
            collision
          );
        }
      }
    }

    // Update ball
    this.updateBall(dt);

    // Check for goals
    const goalTeam = isInGoal(this.state.ball);
    if (goalTeam && this.state.phase === 'playing') {
      this.handleGoal(goalTeam);
    }

    // Broadcast state every tick for responsiveness
    this.broadcastState();
  }

  updateBall(dt) {
    const ball = this.state.ball;
    const timeSinceKick = this.lastKickTime.get(this.lastKickerId)
      ? this.state.clock - this.lastKickTime.get(this.lastKickerId)
      : Infinity;

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
      } else {
        // Owner disconnected
        ball.ownerId = null;
      }
    } else {
      // Free ball - update physics
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
  }

  handleKick(player, input) {
    const ball = this.state.ball;
    if (ball.ownerId !== player.id) return;

    // Kick in player's facing direction
    const kickAngle = player.facing;

    // Use medium power for now (no charge state tracking in multiplayer yet)
    // This gives a consistent, reasonable kick
    const basePower = (KICK_POWER_MIN + KICK_POWER_MAX) / 2;

    // Add player's velocity to kick power (momentum transfer)
    const playerSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    const power = basePower + playerSpeed * 0.5;

    // Base loft angle - slight lift for ground pass
    const loftAngle = 0.1;

    // Release ball
    player.hasBall = false;
    ball.ownerId = null;

    // Record kick for cooldown
    this.lastKickTime.set(player.id, this.state.clock);
    this.lastKickerId = player.id;

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

    // Reset ball to center immediately (like single-player)
    this.state.ball = createBall(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);

    // Reset player possession
    for (const player of this.state.players) {
      player.hasBall = false;
    }

    // Reset kick state
    this.lastKickerId = null;
    this.lastKickTime.clear();

    console.log(`Goal! Score: Home ${this.state.score.home} - Away ${this.state.score.away}`);

    // Broadcast goal event
    this.broadcast({
      type: 'goal',
      team: scoringTeam,
      score: this.state.score
    });
  }

  resetForKickoff() {
    // Reset ball
    this.state.ball = createBall(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);

    // Reset player positions
    const homePositions = getFormationPositions(
      this.state.players.filter(p => p.team === 'home').length,
      'home'
    );
    const awayPositions = getFormationPositions(
      this.state.players.filter(p => p.team === 'away').length,
      'away'
    );

    let homeIdx = 0;
    let awayIdx = 0;

    for (const player of this.state.players) {
      if (player.team === 'home') {
        player.x = homePositions[homeIdx].x;
        player.y = homePositions[homeIdx].y;
        homeIdx++;
      } else {
        player.x = awayPositions[awayIdx].x;
        player.y = awayPositions[awayIdx].y;
        awayIdx++;
      }
      player.vx = 0;
      player.vy = 0;
      player.hasBall = false;
    }

    this.state.phase = 'kickoff';

    // Start playing after brief delay
    setTimeout(() => {
      this.state.phase = 'playing';
    }, 2000);
  }

  broadcastState() {
    const stateData = {
      type: 'game_state',
      tick: this.state.tick,
      phase: this.state.phase,
      ball: {
        x: this.state.ball.x,
        y: this.state.ball.y,
        z: this.state.ball.z,
        vx: this.state.ball.vx,
        vy: this.state.ball.vy,
        vz: this.state.ball.vz,
        ownerId: this.state.ball.ownerId
      },
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        facing: p.facing,
        state: p.state,
        team: p.team,
        hasBall: p.hasBall
      })),
      score: this.state.score,
      clock: this.state.clock
    };

    this.broadcast(stateData);
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    for (const ws of this.playerConnections.values()) {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    }
  }

  getState() {
    return this.state;
  }
}
