import {
  PLAYER_RADIUS,
  PLAYER_MAX_SPEED,
  PLAYER_SPRINT_MULTIPLIER,
  PLAYER_ACCELERATION,
  PLAYER_DECELERATION,
  PLAYER_TURN_SPEED,
  GOALKEEPER_DIVE_SPEED,
  GOALKEEPER_DIVE_DURATION,
  TACKLE_DURATION,
  TACKLE_SPEED,
  TACKLE_RECOVERY_TIME,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  PENALTY_BOX_WIDTH,
  PENALTY_BOX_HEIGHT
} from '../constants.js';

export function createPlayer(id, x, y, team, isGoalkeeper = false) {
  return {
    id,
    x,
    y,
    vx: 0,
    vy: 0,
    facing: team === 'home' ? -Math.PI / 2 : Math.PI / 2, // Face opponent's goal
    team,
    isGoalkeeper,

    // State
    state: 'idle', // idle, running, tackling, diving, recovering
    stateTimer: 0,

    // Input state
    moveX: 0,
    moveY: 0,
    sprinting: false,

    // Action states
    kickCharging: false,
    kickChargeTime: 0,
    tackleDirection: 0,
    diveDirection: { x: 0, y: 0 },

    // Stats (for future use)
    stamina: 100,
    hasBall: false
  };
}

export function updatePlayer(player, dt) {
  // Handle state timers
  if (player.stateTimer > 0) {
    player.stateTimer -= dt;
    if (player.stateTimer <= 0) {
      player.stateTimer = 0;
      handleStateEnd(player);
    }
  }

  // Update based on current state
  switch (player.state) {
    case 'idle':
    case 'running':
      updateMovement(player, dt);
      break;
    case 'tackling':
      updateTackle(player, dt);
      break;
    case 'diving':
      updateDive(player, dt);
      break;
    case 'recovering':
      // Can't move while recovering
      applyFriction(player, dt);
      break;
  }

  // Clamp to field boundaries (goalkeepers have special rules)
  clampToField(player);

  return player;
}

function updateMovement(player, dt) {
  const targetSpeed = player.sprinting
    ? PLAYER_MAX_SPEED * PLAYER_SPRINT_MULTIPLIER
    : PLAYER_MAX_SPEED;

  // Calculate target velocity from input
  const inputMag = Math.sqrt(player.moveX * player.moveX + player.moveY * player.moveY);

  if (inputMag > 0.1) {
    // Normalize input
    const normX = player.moveX / inputMag;
    const normY = player.moveY / inputMag;

    // Target velocity
    const targetVx = normX * targetSpeed * Math.min(inputMag, 1);
    const targetVy = normY * targetSpeed * Math.min(inputMag, 1);

    // Accelerate towards target
    const dvx = targetVx - player.vx;
    const dvy = targetVy - player.vy;
    const accel = PLAYER_ACCELERATION * dt;

    if (Math.abs(dvx) < accel) {
      player.vx = targetVx;
    } else {
      player.vx += Math.sign(dvx) * accel;
    }

    if (Math.abs(dvy) < accel) {
      player.vy = targetVy;
    } else {
      player.vy += Math.sign(dvy) * accel;
    }

    // Update facing direction (unless locked for aiming)
    if (!player.facingLocked) {
      const targetFacing = Math.atan2(normY, normX);
      player.facing = lerpAngle(player.facing, targetFacing, PLAYER_TURN_SPEED * dt);
    }

    player.state = 'running';
  } else {
    // Decelerate
    applyFriction(player, dt);
    if (Math.abs(player.vx) < 1 && Math.abs(player.vy) < 1) {
      player.vx = 0;
      player.vy = 0;
      player.state = 'idle';
    }
  }

  // Update position
  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

function updateTackle(player, dt) {
  // Move in tackle direction
  player.vx = Math.cos(player.tackleDirection) * TACKLE_SPEED;
  player.vy = Math.sin(player.tackleDirection) * TACKLE_SPEED;

  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

function updateDive(player, dt) {
  // Goalkeeper dive
  player.vx = player.diveDirection.x * GOALKEEPER_DIVE_SPEED;
  player.vy = player.diveDirection.y * GOALKEEPER_DIVE_SPEED;

  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

function handleStateEnd(player) {
  switch (player.state) {
    case 'tackling':
      player.state = 'recovering';
      player.stateTimer = TACKLE_RECOVERY_TIME;
      player.vx = 0;
      player.vy = 0;
      break;
    case 'diving':
      player.state = 'recovering';
      player.stateTimer = TACKLE_RECOVERY_TIME;
      player.vx = 0;
      player.vy = 0;
      break;
    case 'recovering':
      player.state = 'idle';
      break;
  }
}

function applyFriction(player, dt) {
  const decel = PLAYER_DECELERATION * dt;

  if (Math.abs(player.vx) < decel) {
    player.vx = 0;
  } else {
    player.vx -= Math.sign(player.vx) * decel;
  }

  if (Math.abs(player.vy) < decel) {
    player.vy = 0;
  } else {
    player.vy -= Math.sign(player.vy) * decel;
  }
}

function clampToField(player) {
  // Basic field boundaries
  const minX = PLAYER_RADIUS;
  const maxX = FIELD_WIDTH - PLAYER_RADIUS;
  const minY = PLAYER_RADIUS;
  const maxY = FIELD_HEIGHT - PLAYER_RADIUS;

  // Goalkeeper box restrictions
  if (player.isGoalkeeper) {
    const boxLeft = (FIELD_WIDTH - PENALTY_BOX_WIDTH) / 2;
    const boxRight = (FIELD_WIDTH + PENALTY_BOX_WIDTH) / 2;

    if (player.team === 'home') {
      // Home goalkeeper - bottom of field
      const boxTop = FIELD_HEIGHT - PENALTY_BOX_HEIGHT;
      player.x = Math.max(boxLeft + PLAYER_RADIUS, Math.min(boxRight - PLAYER_RADIUS, player.x));
      player.y = Math.max(boxTop + PLAYER_RADIUS, Math.min(maxY, player.y));
    } else {
      // Away goalkeeper - top of field
      const boxBottom = PENALTY_BOX_HEIGHT;
      player.x = Math.max(boxLeft + PLAYER_RADIUS, Math.min(boxRight - PLAYER_RADIUS, player.x));
      player.y = Math.max(minY, Math.min(boxBottom - PLAYER_RADIUS, player.y));
    }
  } else {
    // Regular field player
    player.x = Math.max(minX, Math.min(maxX, player.x));
    player.y = Math.max(minY, Math.min(maxY, player.y));
  }
}

export function startTackle(player) {
  if (player.state === 'idle' || player.state === 'running') {
    player.state = 'tackling';
    player.stateTimer = TACKLE_DURATION;
    player.tackleDirection = player.facing;
    return true;
  }
  return false;
}

export function startDive(player, direction) {
  if (!player.isGoalkeeper) return false;
  if (player.state === 'idle' || player.state === 'running') {
    player.state = 'diving';
    player.stateTimer = GOALKEEPER_DIVE_DURATION;
    // Normalize direction
    const mag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (mag > 0) {
      player.diveDirection = { x: direction.x / mag, y: direction.y / mag };
    } else {
      player.diveDirection = { x: Math.cos(player.facing), y: Math.sin(player.facing) };
    }
    return true;
  }
  return false;
}

export function canAct(player) {
  return player.state === 'idle' || player.state === 'running';
}

export function getPlayerSpeed(player) {
  return Math.sqrt(player.vx * player.vx + player.vy * player.vy);
}

// Helper to interpolate angles
function lerpAngle(from, to, t) {
  let diff = to - from;

  // Normalize to -PI to PI
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  return from + diff * Math.min(t, 1);
}

// Get formation positions for different team sizes
export function getFormationPositions(teamSize, team) {
  const formations = {
    1: [[0.5, 0.25]],
    2: [[0.5, 0.2], [0.5, 0.6]],
    3: [[0.5, 0.15], [0.3, 0.5], [0.7, 0.5]],
    4: [[0.5, 0.1], [0.3, 0.4], [0.7, 0.4], [0.5, 0.7]],
    5: [[0.5, 0.08], [0.25, 0.3], [0.75, 0.3], [0.35, 0.6], [0.65, 0.6]],
    6: [[0.5, 0.08], [0.2, 0.28], [0.8, 0.28], [0.2, 0.55], [0.8, 0.55], [0.5, 0.75]],
    7: [[0.5, 0.06], [0.2, 0.22], [0.8, 0.22], [0.5, 0.38], [0.2, 0.55], [0.8, 0.55], [0.5, 0.75]],
    8: [[0.5, 0.06], [0.2, 0.18], [0.8, 0.18], [0.35, 0.35], [0.65, 0.35], [0.2, 0.58], [0.8, 0.58], [0.5, 0.78]],
    9: [[0.5, 0.06], [0.2, 0.16], [0.8, 0.16], [0.5, 0.3], [0.25, 0.45], [0.75, 0.45], [0.2, 0.65], [0.8, 0.65], [0.5, 0.82]],
    10: [[0.5, 0.06], [0.2, 0.15], [0.8, 0.15], [0.35, 0.28], [0.65, 0.28], [0.2, 0.45], [0.8, 0.45], [0.35, 0.62], [0.65, 0.62], [0.5, 0.8]],
    11: [[0.5, 0.05], [0.2, 0.14], [0.8, 0.14], [0.35, 0.26], [0.65, 0.26], [0.5, 0.38], [0.15, 0.52], [0.85, 0.52], [0.3, 0.68], [0.7, 0.68], [0.5, 0.85]]
  };

  const formation = formations[teamSize] || formations[11].slice(0, teamSize);

  // Convert normalized positions to field positions
  return formation.map(([x, y]) => {
    const fieldX = x * FIELD_WIDTH;
    // Home team at bottom, away at top - flip y for away
    const fieldY = team === 'home'
      ? (1 - y) * FIELD_HEIGHT * 0.5 + FIELD_HEIGHT * 0.5
      : y * FIELD_HEIGHT * 0.5;
    return { x: fieldX, y: fieldY };
  });
}
