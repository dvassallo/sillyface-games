import {
  PLAYER_RADIUS,
  BALL_RADIUS,
  POSSESSION_RADIUS,
  BALL_CONTROL_OFFSET,
  TACKLE_REACH,
  GOALKEEPER_REACH_MULTIPLIER
} from '../constants.js';

// Check collision between two players
export function checkPlayerCollision(player1, player2) {
  const dx = player2.x - player1.x;
  const dy = player2.y - player1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = PLAYER_RADIUS * 2;

  if (dist < minDist && dist > 0) {
    return {
      colliding: true,
      overlap: minDist - dist,
      normal: { x: dx / dist, y: dy / dist }
    };
  }

  return { colliding: false };
}

// Resolve player-player collision by pushing apart
export function resolvePlayerCollision(player1, player2, collision) {
  if (!collision.colliding) return;

  const halfOverlap = collision.overlap / 2;

  // Push players apart equally
  player1.x -= collision.normal.x * halfOverlap;
  player1.y -= collision.normal.y * halfOverlap;
  player2.x += collision.normal.x * halfOverlap;
  player2.y += collision.normal.y * halfOverlap;

  // Exchange some velocity (elastic collision)
  const relVelX = player1.vx - player2.vx;
  const relVelY = player1.vy - player2.vy;
  const relVelDotNormal = relVelX * collision.normal.x + relVelY * collision.normal.y;

  if (relVelDotNormal > 0) {
    // Only resolve if moving towards each other
    const restitution = 0.5;
    const impulse = relVelDotNormal * restitution;

    player1.vx -= impulse * collision.normal.x;
    player1.vy -= impulse * collision.normal.y;
    player2.vx += impulse * collision.normal.x;
    player2.vy += impulse * collision.normal.y;
  }
}

// Check if player can possess the ball
export function checkBallPossession(player, ball) {
  // Can't possess if ball is too high
  if (ball.z > 30) return false;

  // Can't possess if in certain states
  if (player.state === 'recovering') return false;

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const reach = player.isGoalkeeper
    ? POSSESSION_RADIUS * GOALKEEPER_REACH_MULTIPLIER
    : POSSESSION_RADIUS;

  return dist < reach;
}

// Check if player's tackle hits the ball
export function checkTackleHitsBall(player, ball) {
  if (player.state !== 'tackling') return false;

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Extended reach during tackle
  const reach = TACKLE_REACH + PLAYER_RADIUS + BALL_RADIUS;

  return dist < reach;
}

// Check if tackling player fouls another player
export function checkTackleFoul(tackler, target) {
  if (tackler.state !== 'tackling') return { foul: false };
  if (tackler.team === target.team) return { foul: false };

  const dx = target.x - tackler.x;
  const dy = target.y - tackler.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > TACKLE_REACH + PLAYER_RADIUS * 2) {
    return { foul: false };
  }

  // Calculate angle of tackle relative to target's facing
  const tackleAngle = Math.atan2(dy, dx);
  let angleDiff = tackleAngle - target.facing;

  // Normalize to -PI to PI
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  // Foul from behind (more than ~100 degrees from front)
  const fromBehind = Math.abs(angleDiff) > Math.PI * 0.55;

  // Calculate if ball was hit (would need ball position)
  // For now, assume foul if from behind
  return {
    foul: fromBehind,
    fromBehind,
    dangerous: false
  };
}

// Position ball relative to player when dribbling
export function getDribblePosition(player) {
  return {
    x: player.x + Math.cos(player.facing) * BALL_CONTROL_OFFSET,
    y: player.y + Math.sin(player.facing) * BALL_CONTROL_OFFSET
  };
}

// Check if player is in position to header the ball
export function canHeader(player, ball) {
  if (ball.z < 20 || ball.z > 50) return false; // Ball must be at head height

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < PLAYER_RADIUS + BALL_RADIUS + 10;
}

// Check if player is in position to volley
export function canVolley(player, ball) {
  if (ball.z < 5 || ball.z > 30) return false; // Ball must be at kick height but airborne

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < PLAYER_RADIUS + BALL_RADIUS + 15;
}

// Check player-ball collision (for bouncing off players)
export function checkPlayerBallCollision(player, ball) {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = PLAYER_RADIUS + BALL_RADIUS;

  if (dist < minDist && dist > 0) {
    return {
      colliding: true,
      overlap: minDist - dist,
      normal: { x: dx / dist, y: dy / dist }
    };
  }

  return { colliding: false };
}

// Bounce ball off player
export function bounceBallOffPlayer(ball, player, collision) {
  if (!collision.colliding) return;

  // Push ball out of player
  ball.x += collision.normal.x * collision.overlap;
  ball.y += collision.normal.y * collision.overlap;

  // Reflect velocity
  const dotProduct = ball.vx * collision.normal.x + ball.vy * collision.normal.y;

  if (dotProduct < 0) {
    // Only bounce if moving towards player
    ball.vx -= 2 * dotProduct * collision.normal.x;
    ball.vy -= 2 * dotProduct * collision.normal.y;

    // Add some of player's velocity
    ball.vx += player.vx * 0.3;
    ball.vy += player.vy * 0.3;

    // Dampen
    ball.vx *= 0.7;
    ball.vy *= 0.7;

    // Record last touch
    ball.lastTouchId = player.id;
  }
}

// Simple distance check
export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check if point is in rectangle
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
