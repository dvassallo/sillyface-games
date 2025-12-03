// Game timing
export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const BROADCAST_RATE = 20;
export const BROADCAST_INTERVAL = Math.floor(TICK_RATE / BROADCAST_RATE);

// Field dimensions (in game units, roughly representing meters * 10)
export const FIELD_WIDTH = 680;  // ~68 meters
export const FIELD_HEIGHT = 1050; // ~105 meters
export const GOAL_WIDTH = 73;    // ~7.3 meters
export const GOAL_DEPTH = 24;    // ~2.4 meters
export const PENALTY_BOX_WIDTH = 403;  // ~40.3 meters
export const PENALTY_BOX_HEIGHT = 165; // ~16.5 meters
export const GOAL_BOX_WIDTH = 183;     // ~18.3 meters
export const GOAL_BOX_HEIGHT = 55;     // ~5.5 meters
export const CENTER_CIRCLE_RADIUS = 91; // ~9.1 meters
export const PENALTY_SPOT_DISTANCE = 110; // ~11 meters from goal line
export const CORNER_ARC_RADIUS = 10;

// Player physics
export const PLAYER_RADIUS = 8;
export const PLAYER_MAX_SPEED = 180;      // units per second
export const PLAYER_SPRINT_MULTIPLIER = 1.4;
export const PLAYER_ACCELERATION = 800;
export const PLAYER_DECELERATION = 600;
export const PLAYER_TURN_SPEED = 8;       // radians per second

// Goalkeeper specific
export const GOALKEEPER_DIVE_SPEED = 300;
export const GOALKEEPER_DIVE_DURATION = 0.5; // seconds
export const GOALKEEPER_REACH_MULTIPLIER = 1.5;

// Ball physics
export const BALL_RADIUS = 4;
export const BALL_MAX_SPEED = 2000;
export const BALL_GROUND_FRICTION = 0.98;
export const BALL_AIR_FRICTION = 0.995;
export const BALL_BOUNCE_FACTOR = 0.6;
export const BALL_GRAVITY = 800;          // units per second squared

// Kick physics
export const KICK_POWER_MIN = 300;
export const KICK_POWER_MAX = 900;
export const KICK_CHARGE_TIME = 0.5;      // seconds to reach max power
export const PASS_POWER = 150;
export const HEADER_POWER_MULTIPLIER = 0.6;
export const VOLLEY_POWER_MULTIPLIER = 1.2;

// Aftertouch (curve)
export const CURVE_STRENGTH = 300;
export const SPIN_DECAY = 0.96;           // per tick

// Tackling
export const TACKLE_DURATION = 0.4;       // seconds
export const TACKLE_SPEED = 250;
export const TACKLE_REACH = 20;
export const TACKLE_RECOVERY_TIME = 0.3;  // seconds

// Ball control
export const POSSESSION_RADIUS = 15;      // distance to "have" ball
export const DRIBBLE_SPEED_PENALTY = 0.85;
export const BALL_CONTROL_OFFSET = 12;    // ball distance when dribbling

// Match settings
export const MATCH_DURATION = 180;        // seconds per half (3 minutes)
export const HALFTIME_DURATION = 5;       // seconds
export const KICKOFF_DELAY = 2;           // seconds before kickoff
export const GOAL_CELEBRATION_TIME = 3;   // seconds

// Team colors (default)
export const TEAM_COLORS = {
  home: { primary: '#ff0000', secondary: '#ffffff' },
  away: { primary: '#0000ff', secondary: '#ffffff' }
};

// Offside
export const OFFSIDE_LINE_TOLERANCE = 1;  // units of tolerance

// Fouls
export const FOUL_FROM_BEHIND_ANGLE = Math.PI / 3; // 60 degrees
export const DANGEROUS_TACKLE_SPEED = 200;
