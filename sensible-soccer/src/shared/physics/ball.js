import {
  BALL_RADIUS,
  BALL_MAX_SPEED,
  BALL_GROUND_FRICTION,
  BALL_AIR_FRICTION,
  BALL_BOUNCE_FACTOR,
  BALL_GRAVITY,
  CURVE_STRENGTH,
  SPIN_DECAY,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  GOAL_WIDTH,
  GOAL_DEPTH
} from '../constants.js';

export function createBall(x = FIELD_WIDTH / 2, y = FIELD_HEIGHT / 2) {
  return {
    x,
    y,
    z: 0,           // Height above ground
    vx: 0,          // Velocity x
    vy: 0,          // Velocity y
    vz: 0,          // Velocity z (vertical)
    spinX: 0,       // Curve spin x component
    spinY: 0,       // Curve spin y component
    ownerId: null,  // Player currently possessing
    lastTouchId: null // Last player to touch
  };
}

export function updateBall(ball, dt) {
  // Apply curve (aftertouch) effect to velocity
  if (ball.z < 10) { // Only apply curve near ground
    ball.vx += ball.spinX * CURVE_STRENGTH * dt;
    ball.vy += ball.spinY * CURVE_STRENGTH * dt;
  }

  // Decay spin over time
  ball.spinX *= SPIN_DECAY;
  ball.spinY *= SPIN_DECAY;

  // Clear very small spin values
  if (Math.abs(ball.spinX) < 0.01) ball.spinX = 0;
  if (Math.abs(ball.spinY) < 0.01) ball.spinY = 0;

  // Apply gravity for aerial balls
  if (ball.z > 0 || ball.vz > 0) {
    ball.vz -= BALL_GRAVITY * dt;
  }

  // Update position
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  // Ground collision
  if (ball.z <= 0) {
    ball.z = 0;
    if (ball.vz < 0) {
      // Bounce
      ball.vz = -ball.vz * BALL_BOUNCE_FACTOR;
      // Small bounces should stop
      if (Math.abs(ball.vz) < 20) {
        ball.vz = 0;
      }
    }
  }

  // Apply friction
  const friction = ball.z > 0 ? BALL_AIR_FRICTION : BALL_GROUND_FRICTION;
  ball.vx *= friction;
  ball.vy *= friction;

  // Clamp very small velocities
  if (Math.abs(ball.vx) < 0.5) ball.vx = 0;
  if (Math.abs(ball.vy) < 0.5) ball.vy = 0;

  // Clamp max speed
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (speed > BALL_MAX_SPEED) {
    const scale = BALL_MAX_SPEED / speed;
    ball.vx *= scale;
    ball.vy *= scale;
  }

  // Field boundary collisions (sidelines)
  handleBoundaryCollisions(ball);

  return ball;
}

function handleBoundaryCollisions(ball) {
  const goalMinX = (FIELD_WIDTH - GOAL_WIDTH) / 2;
  const goalMaxX = (FIELD_WIDTH + GOAL_WIDTH) / 2;

  // Left boundary
  if (ball.x - BALL_RADIUS < 0) {
    ball.x = BALL_RADIUS;
    ball.vx = -ball.vx * BALL_BOUNCE_FACTOR;
    ball.spinX *= -0.5;
  }

  // Right boundary
  if (ball.x + BALL_RADIUS > FIELD_WIDTH) {
    ball.x = FIELD_WIDTH - BALL_RADIUS;
    ball.vx = -ball.vx * BALL_BOUNCE_FACTOR;
    ball.spinX *= -0.5;
  }

  // Top boundary (with goal opening)
  if (ball.y - BALL_RADIUS < 0) {
    // Check if in goal
    if (ball.x > goalMinX && ball.x < goalMaxX && ball.y > -GOAL_DEPTH) {
      // In goal area - let it go
    } else if (ball.y < -GOAL_DEPTH) {
      // Behind goal net
      ball.y = -GOAL_DEPTH + BALL_RADIUS;
      ball.vy = -ball.vy * BALL_BOUNCE_FACTOR;
    } else if (ball.x <= goalMinX || ball.x >= goalMaxX) {
      // Hit post area
      ball.y = BALL_RADIUS;
      ball.vy = -ball.vy * BALL_BOUNCE_FACTOR;
      ball.spinY *= -0.5;
    }
  }

  // Bottom boundary (with goal opening)
  if (ball.y + BALL_RADIUS > FIELD_HEIGHT) {
    // Check if in goal
    if (ball.x > goalMinX && ball.x < goalMaxX && ball.y < FIELD_HEIGHT + GOAL_DEPTH) {
      // In goal area - let it go
    } else if (ball.y > FIELD_HEIGHT + GOAL_DEPTH) {
      // Behind goal net
      ball.y = FIELD_HEIGHT + GOAL_DEPTH - BALL_RADIUS;
      ball.vy = -ball.vy * BALL_BOUNCE_FACTOR;
    } else if (ball.x <= goalMinX || ball.x >= goalMaxX) {
      // Hit post area
      ball.y = FIELD_HEIGHT - BALL_RADIUS;
      ball.vy = -ball.vy * BALL_BOUNCE_FACTOR;
      ball.spinY *= -0.5;
    }
  }
}

export function kickBall(ball, power, angle, loftAngle = 0, spin = { x: 0, y: 0 }) {
  const speed = Math.min(power, BALL_MAX_SPEED);

  // Calculate velocity components
  ball.vx = Math.cos(angle) * Math.cos(loftAngle) * speed;
  ball.vy = Math.sin(angle) * Math.cos(loftAngle) * speed;
  ball.vz = Math.sin(loftAngle) * speed;

  // Set initial spin for aftertouch
  ball.spinX = spin.x;
  ball.spinY = spin.y;

  // Release possession
  ball.ownerId = null;
}

export function applyAftertouch(ball, direction) {
  // Only allow aftertouch for a short time after kick
  // and only if ball is moving fast enough
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (speed > 50) {
    ball.spinX += direction.x * 0.4;
    ball.spinY += direction.y * 0.4;

    // Clamp spin
    const maxSpin = 2;
    ball.spinX = Math.max(-maxSpin, Math.min(maxSpin, ball.spinX));
    ball.spinY = Math.max(-maxSpin, Math.min(maxSpin, ball.spinY));
  }
}

export function isInGoal(ball) {
  const goalMinX = (FIELD_WIDTH - GOAL_WIDTH) / 2;
  const goalMaxX = (FIELD_WIDTH + GOAL_WIDTH) / 2;

  if (ball.x > goalMinX && ball.x < goalMaxX) {
    if (ball.y < 0) {
      return 'home'; // Ball in top goal (away's goal) = home team scored
    }
    if (ball.y > FIELD_HEIGHT) {
      return 'away'; // Ball in bottom goal (home's goal) = away team scored
    }
  }
  return null;
}

export function getBallSpeed(ball) {
  return Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy + ball.vz * ball.vz);
}

export function isBallAirborne(ball) {
  return ball.z > 5;
}
