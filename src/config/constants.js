// Reference dimensions (used for proportional calculations, not fixed canvas size)
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

// Safe area padding (minimum distance from screen edges for all UI)
export const SAFE_PADDING = 20;

// Race settings
export const PROBLEMS_PER_RACE = Infinity; // Keep generating until race ends
export const ANSWER_COUNT = 4;

// Car physics
export const PLAYER_BASE_SPEED = 150;       // px/s at normal pace
export const CORRECT_BOOST = 60;            // extra px/s for correct answer
export const CORRECT_BOOST_DURATION = 400;  // ms
export const WRONG_PENALTY = 50;            // px/s reduction
export const WRONG_PENALTY_DURATION = 800;  // ms
export const CORRECT_FLASH_DURATION = 1200; // ms show correct answer after wrong

// AI defaults (used as fallbacks, actual AI calibrated from player stats)
export const AI_DEFAULT_ACCURACY = 0.8;
export const AI_DEFAULT_ANSWER_TIME_MS = 3000;

// Streak thresholds & bonuses
export const STREAK_NITRO = 3;
export const STREAK_TURBO = 5;
export const STREAK_SUPERCHARGE = 10;

export const STREAK_BOOST = {
  [STREAK_NITRO]: { speed: 80, duration: 600, label: '🔥 NITRO!', color: 0xff6600 },
  [STREAK_TURBO]: { speed: 120, duration: 800, label: '⚡ TURBO!', color: 0xffff00 },
  [STREAK_SUPERCHARGE]: { speed: 180, duration: 1200, label: '🌟 SUPERCHARGE!', color: 0x00ffff },
};

// Track / finish line
export const FINISH_LINE_X = 3000;   // logical race distance in px
export const TRACK_DISPLAY_SCALE = (GAME_WIDTH * 0.7) / FINISH_LINE_X; // world→screen

// Bucks awards
export const BUCKS_BY_POSITION = [50, 30, 15, 5];
export const BUCKS_ACCURACY_BONUS = 25;
export const BUCKS_STREAK_BONUS = 10;

// Lane positions (screen Y)
export const LANE_Y = [200, 240, 280, 320];

// Colors for placeholder cars
export const CAR_COLORS = [0x00aaff, 0xff4444, 0x44ff44, 0xffaa00];
export const CAR_NAMES = ['YOU', 'Rex', 'Zara', 'Blitz'];

// Parallax layers scroll speeds (relative to car movement)
export const PARALLAX_SPEEDS = [0.05, 0.15, 0.3, 0.8];
