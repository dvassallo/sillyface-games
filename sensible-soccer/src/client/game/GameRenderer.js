import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  GOAL_WIDTH,
  GOAL_DEPTH,
  PENALTY_BOX_WIDTH,
  PENALTY_BOX_HEIGHT,
  GOAL_BOX_WIDTH,
  GOAL_BOX_HEIGHT,
  CENTER_CIRCLE_RADIUS,
  PENALTY_SPOT_DISTANCE,
  CORNER_ARC_RADIUS,
  PLAYER_RADIUS,
  BALL_RADIUS
} from '../../shared/index.js';

export default class GameRenderer {
  constructor(app, scale = 1) {
    this.app = app;
    this.scale = scale;

    // Camera settings
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraSmoothing = 0.15; // Higher = faster tracking
    this.cameraInitialized = false; // First update snaps to player

    // Containers
    this.worldContainer = null;
    this.fieldContainer = null;
    this.playersContainer = null;
    this.ballContainer = null;
    this.uiContainer = null;

    // Sprites/graphics
    this.playerGraphics = new Map();
    this.ballGraphic = null;

    // Track local player for camera
    this.localPlayerId = 'player1';
  }

  async init() {
    // Create world container (moves with camera)
    this.worldContainer = new Container();
    this.app.stage.addChild(this.worldContainer);

    // Create field
    this.fieldContainer = new Container();
    this.worldContainer.addChild(this.fieldContainer);
    this.drawField();

    // Create players container
    this.playersContainer = new Container();
    this.worldContainer.addChild(this.playersContainer);

    // Create ball container
    this.ballContainer = new Container();
    this.worldContainer.addChild(this.ballContainer);
    this.createBall();

    // Create UI container (fixed, doesn't move with camera)
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // Initialize camera to center of field
    this.cameraX = FIELD_WIDTH * this.scale / 2;
    this.cameraY = FIELD_HEIGHT * this.scale / 2;
  }

  drawField() {
    const g = new Graphics();
    const s = this.scale;

    // Grass background (just the field area)
    g.rect(0, 0, FIELD_WIDTH * s, FIELD_HEIGHT * s);
    g.fill(0x2d8a2d);

    // Grass stripes (lighter/darker alternating)
    const stripeHeight = 50 * s;
    for (let y = 0; y < FIELD_HEIGHT * s; y += stripeHeight * 2) {
      g.rect(0, y, FIELD_WIDTH * s, stripeHeight);
      g.fill(0x339933);
    }

    // Field outline
    g.rect(0, 0, FIELD_WIDTH * s, FIELD_HEIGHT * s);
    g.stroke({ width: 3, color: 0xffffff });

    // Center line
    g.moveTo(0, FIELD_HEIGHT * s / 2);
    g.lineTo(FIELD_WIDTH * s, FIELD_HEIGHT * s / 2);
    g.stroke({ width: 2, color: 0xffffff });

    // Center circle
    g.circle(FIELD_WIDTH * s / 2, FIELD_HEIGHT * s / 2, CENTER_CIRCLE_RADIUS * s);
    g.stroke({ width: 2, color: 0xffffff });

    // Center spot
    g.circle(FIELD_WIDTH * s / 2, FIELD_HEIGHT * s / 2, 4);
    g.fill(0xffffff);

    // Penalty boxes (top)
    const pbLeft = (FIELD_WIDTH - PENALTY_BOX_WIDTH) / 2 * s;
    const pbWidth = PENALTY_BOX_WIDTH * s;
    const pbHeight = PENALTY_BOX_HEIGHT * s;

    g.rect(pbLeft, 0, pbWidth, pbHeight);
    g.stroke({ width: 2, color: 0xffffff });

    // Penalty boxes (bottom)
    g.rect(pbLeft, FIELD_HEIGHT * s - pbHeight, pbWidth, pbHeight);
    g.stroke({ width: 2, color: 0xffffff });

    // Goal boxes (top)
    const gbLeft = (FIELD_WIDTH - GOAL_BOX_WIDTH) / 2 * s;
    const gbWidth = GOAL_BOX_WIDTH * s;
    const gbHeight = GOAL_BOX_HEIGHT * s;

    g.rect(gbLeft, 0, gbWidth, gbHeight);
    g.stroke({ width: 2, color: 0xffffff });

    // Goal boxes (bottom)
    g.rect(gbLeft, FIELD_HEIGHT * s - gbHeight, gbWidth, gbHeight);
    g.stroke({ width: 2, color: 0xffffff });

    // Penalty spots (top)
    g.circle(FIELD_WIDTH * s / 2, PENALTY_SPOT_DISTANCE * s, 3);
    g.fill(0xffffff);

    // Penalty spots (bottom)
    g.circle(FIELD_WIDTH * s / 2, FIELD_HEIGHT * s - PENALTY_SPOT_DISTANCE * s, 3);
    g.fill(0xffffff);

    // Penalty arcs (the "D" shape outside penalty box)
    const penaltyArcRadius = 91 * s;
    const distToBoxEdge = (PENALTY_BOX_HEIGHT - PENALTY_SPOT_DISTANCE) * s;
    const horizDist = Math.sqrt(penaltyArcRadius * penaltyArcRadius - distToBoxEdge * distToBoxEdge);
    const intersectAngle = Math.atan2(distToBoxEdge, horizDist);

    // Top penalty arc - use moveTo to start at the right position
    const topArcStartX = FIELD_WIDTH * s / 2 + Math.cos(intersectAngle) * penaltyArcRadius;
    const topArcStartY = PENALTY_SPOT_DISTANCE * s + Math.sin(intersectAngle) * penaltyArcRadius;
    g.moveTo(topArcStartX, topArcStartY);
    g.arc(FIELD_WIDTH * s / 2, PENALTY_SPOT_DISTANCE * s, penaltyArcRadius,
          intersectAngle, Math.PI - intersectAngle);
    g.stroke({ width: 2, color: 0xffffff });

    // Bottom penalty arc
    const bottomArcStartX = FIELD_WIDTH * s / 2 + Math.cos(Math.PI + intersectAngle) * penaltyArcRadius;
    const bottomArcStartY = (FIELD_HEIGHT * s - PENALTY_SPOT_DISTANCE * s) + Math.sin(Math.PI + intersectAngle) * penaltyArcRadius;
    g.moveTo(bottomArcStartX, bottomArcStartY);
    g.arc(FIELD_WIDTH * s / 2, FIELD_HEIGHT * s - PENALTY_SPOT_DISTANCE * s, penaltyArcRadius,
          Math.PI + intersectAngle, -intersectAngle);
    g.stroke({ width: 2, color: 0xffffff });

    // Goals (top - away team)
    const goalLeft = (FIELD_WIDTH - GOAL_WIDTH) / 2 * s;
    const goalWidth = GOAL_WIDTH * s;
    const goalDepth = GOAL_DEPTH * s;

    g.rect(goalLeft, -goalDepth, goalWidth, goalDepth);
    g.fill(0x1a1a1a);
    g.rect(goalLeft, -goalDepth, goalWidth, goalDepth);
    g.stroke({ width: 3, color: 0xffffff });

    // Goals (bottom - home team)
    g.rect(goalLeft, FIELD_HEIGHT * s, goalWidth, goalDepth);
    g.fill(0x1a1a1a);
    g.rect(goalLeft, FIELD_HEIGHT * s, goalWidth, goalDepth);
    g.stroke({ width: 3, color: 0xffffff });

    // Corner arcs
    const cornerRadius = CORNER_ARC_RADIUS * s;

    // Top-left corner
    g.arc(0, 0, cornerRadius, 0, Math.PI / 2);
    g.stroke({ width: 2, color: 0xffffff });

    // Top-right corner
    g.arc(FIELD_WIDTH * s, 0, cornerRadius, Math.PI / 2, Math.PI);
    g.stroke({ width: 2, color: 0xffffff });

    // Bottom-left corner
    g.arc(0, FIELD_HEIGHT * s, cornerRadius, -Math.PI / 2, 0);
    g.stroke({ width: 2, color: 0xffffff });

    // Bottom-right corner
    g.arc(FIELD_WIDTH * s, FIELD_HEIGHT * s, cornerRadius, Math.PI, -Math.PI / 2);
    g.stroke({ width: 2, color: 0xffffff });

    this.fieldContainer.addChild(g);
  }

  createBall() {
    const s = this.scale;

    // Create shadow (separate graphic that stays on ground)
    this.ballShadow = new Graphics();
    this.ballShadow.ellipse(0, 0, BALL_RADIUS * s * 1.5, BALL_RADIUS * s * 0.7);
    this.ballShadow.fill({ color: 0x000000, alpha: 0.4 });
    this.ballContainer.addChild(this.ballShadow);

    // Create ball
    const g = new Graphics();

    // Ball
    g.circle(0, 0, BALL_RADIUS * s);
    g.fill(0xffffff);
    g.circle(0, 0, BALL_RADIUS * s);
    g.stroke({ width: 1, color: 0x333333 });

    // Ball pattern (pentagon shapes)
    const r = BALL_RADIUS * s * 0.4;
    g.circle(-r * 0.3, -r * 0.2, r * 0.4);
    g.fill(0x333333);
    g.circle(r * 0.4, 0, r * 0.3);
    g.fill(0x333333);

    this.ballGraphic = g;
    this.ballContainer.addChild(g);
  }

  createPlayerGraphic(player) {
    const container = new Container();
    const g = new Graphics();
    const s = this.scale;

    // Player shadow
    g.ellipse(0, PLAYER_RADIUS * s * 0.8, PLAYER_RADIUS * s * 1.3, PLAYER_RADIUS * s * 0.5);
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Player body (circle)
    const color = player.team === 'home' ? 0xff4444 : 0x4444ff;
    g.circle(0, 0, PLAYER_RADIUS * s);
    g.fill(color);
    g.circle(0, 0, PLAYER_RADIUS * s);
    g.stroke({ width: 2, color: 0xffffff });

    // Direction indicator
    const dirGraphic = new Graphics();
    dirGraphic.moveTo(0, 0);
    dirGraphic.lineTo(PLAYER_RADIUS * s * 1.5, 0);
    dirGraphic.stroke({ width: 2, color: 0xffffff });
    dirGraphic.label = 'direction';

    container.addChild(g);
    container.addChild(dirGraphic);

    // Player name label
    const style = new TextStyle({
      fontSize: 10,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    const displayName = player.name || player.id.replace('player', '');
    const label = new Text({ text: displayName, style });
    label.anchor.set(0.5, 0.5);
    label.y = -PLAYER_RADIUS * s - 10;
    label.label = 'playerName';
    container.addChild(label);

    return container;
  }

  updateCamera(targetX, targetY) {
    const s = this.scale;
    const fieldHeight = FIELD_HEIGHT * s;
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // Keep X centered on field (no horizontal movement)
    this.cameraX = FIELD_WIDTH * s / 2;

    // Smoothly move Y to follow player (snap on first frame)
    if (!this.cameraInitialized) {
      this.cameraY = targetY;
      this.cameraInitialized = true;
    } else {
      this.cameraY += (targetY - this.cameraY) * this.cameraSmoothing;
    }

    // Clamp camera so we don't show too far beyond the pitch
    // Allow a margin for the goals to be visible
    const goalMargin = GOAL_DEPTH * s;
    const minCameraY = screenHeight / 2 - goalMargin;
    const maxCameraY = fieldHeight - screenHeight / 2 + goalMargin;

    // Only clamp if field is taller than screen
    if (maxCameraY > minCameraY) {
      this.cameraY = Math.max(minCameraY, Math.min(maxCameraY, this.cameraY));
    }

    // Apply camera transform - offset so camera target appears at screen center
    this.worldContainer.x = screenWidth / 2 - this.cameraX;
    this.worldContainer.y = screenHeight / 2 - this.cameraY;
  }

  render(state) {
    const s = this.scale;

    // Track the ball with the camera
    if (state.ball) {
      this.updateCamera(state.ball.x * s, state.ball.y * s);
    }

    // Update ball position
    if (this.ballGraphic && state.ball) {
      const ballX = state.ball.x * s;
      const ballY = state.ball.y * s;
      const ballZ = state.ball.z;

      // Shadow stays on the ground
      if (this.ballShadow) {
        this.ballShadow.x = ballX;
        this.ballShadow.y = ballY;
        // Shadow gets smaller and more transparent as ball goes higher
        const shadowScale = Math.max(0.3, 1 - ballZ / 150);
        this.ballShadow.scale.set(shadowScale);
        this.ballShadow.alpha = Math.max(0.1, 0.4 - ballZ / 200);
      }

      // Ball position
      this.ballGraphic.x = ballX;
      this.ballGraphic.y = ballY - ballZ * 1.5; // Rise up on screen

      // Scale based on height (z) for 3D effect - ball gets bigger as it rises
      const heightScale = 1 + (ballZ / 40);
      this.ballGraphic.scale.set(heightScale);
    }

    // Update players
    for (const player of state.players) {
      let graphic = this.playerGraphics.get(player.id);

      // Create graphic if doesn't exist
      if (!graphic) {
        graphic = this.createPlayerGraphic(player);
        this.playerGraphics.set(player.id, graphic);
        this.playersContainer.addChild(graphic);
      }

      // Update position
      graphic.x = player.x * s;
      graphic.y = player.y * s;

      // Update direction indicator
      const dirGraphic = graphic.children.find(c => c.label === 'direction');
      if (dirGraphic) {
        dirGraphic.rotation = player.facing;
      }

      // Update player name label if available
      const nameLabel = graphic.children.find(c => c.label === 'playerName');
      if (nameLabel && player.name) {
        nameLabel.text = player.name;
      }

      // Visual feedback for states
      graphic.alpha = player.state === 'recovering' ? 0.6 : 1;

      // Highlight player with ball
      if (state.ball && state.ball.ownerId === player.id) {
        graphic.scale.set(1.1);
      } else {
        graphic.scale.set(1);
      }
    }

    // Remove graphics for players that no longer exist
    for (const [id, graphic] of this.playerGraphics) {
      if (!state.players.find(p => p.id === id)) {
        this.playersContainer.removeChild(graphic);
        this.playerGraphics.delete(id);
      }
    }
  }

  destroy() {
    this.playerGraphics.clear();
  }
}
