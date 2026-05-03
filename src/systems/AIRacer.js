import {
  CORRECT_BOOST, CORRECT_BOOST_DURATION,
  WRONG_PENALTY, WRONG_PENALTY_DURATION,
  PLAYER_BASE_SPEED, FINISH_LINE_X,
} from '../config/constants.js';

/**
 * AIRacer — simulates an AI opponent that "answers questions" like the player.
 *
 * Each AI has:
 *  - accuracy: probability of getting a question right (sampled ±20% of player historic accuracy)
 *  - answerInterval: how long between answers, sampled from a normal distribution
 *    centered on the player's avg answer time
 *
 * On each simulated answer:
 *  - Correct: speed boost (like the player gets)
 *  - Wrong: speed penalty (like the player gets)
 */
export class AIRacer {
  /**
   * @param {number} index  0-based AI index
   * @param {number} playerAccuracy  player's historic accuracy (0-1), default 0.8
   * @param {number} playerAvgTimeMs  player's avg answer time in ms, default ~3000
   */
  constructor(index, playerAccuracy = 0.8, playerAvgTimeMs = 3000) {
    this.index = index;
    this.worldX = 0;
    this.finished = false;
    this.finishTime = null;

    // Assign accuracy: player accuracy ± 20%, clamped to [0.3, 0.95]
    const accOffset = (Math.random() * 0.4 - 0.2); // -0.2 to +0.2
    this.accuracy = Math.min(0.95, Math.max(0.3, playerAccuracy + accOffset));

    // Base answer interval from player avg time
    this.baseAnswerTimeMs = playerAvgTimeMs;

    // Speed state
    this.speed = PLAYER_BASE_SPEED;
    this.speedModifier = 0;
    this.speedModTimer = 0;

    // Question timer — schedule first answer
    this.nextAnswerTimer = this._sampleAnswerTime();
    this.streak = 0;
  }

  /**
   * Sample an answer time from a normal distribution centered on baseAnswerTimeMs.
   * Stddev = 30% of base time for variety.
   */
  _sampleAnswerTime() {
    const mean = this.baseAnswerTimeMs;
    const stddev = mean * 0.3;
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
    const sampled = mean + z * stddev;
    // Clamp to reasonable range: at least 500ms, at most 3x the mean
    return Math.max(500, Math.min(mean * 3, sampled));
  }

  /**
   * @param {number} delta  ms since last frame
   * @param {number} finishLineX  world X of finish line
   */
  update(delta, finishLineX) {
    if (this.finished) return;

    // Speed modifier decay
    if (this.speedModTimer > 0) {
      this.speedModTimer -= delta;
      if (this.speedModTimer <= 0) {
        this.speedModifier = 0;
        this.speedModTimer = 0;
      }
    }

    // Move car
    const effectiveSpeed = Math.max(20, this.speed + this.speedModifier);
    this.worldX += effectiveSpeed * (delta / 1000);

    // Check finish
    if (this.worldX >= finishLineX) {
      this.worldX = finishLineX;
      this.finished = true;
      this.finishTime = performance.now();
      return;
    }

    // Question timer — simulate answering
    this.nextAnswerTimer -= delta;
    if (this.nextAnswerTimer <= 0) {
      this._simulateAnswer();
      this.nextAnswerTimer = this._sampleAnswerTime();
    }
  }

  _simulateAnswer() {
    const gotItRight = Math.random() < this.accuracy;

    if (gotItRight) {
      this.streak++;
      this.speedModifier = CORRECT_BOOST;
      this.speedModTimer = CORRECT_BOOST_DURATION;

      // Streak bonuses (same thresholds as player)
      if (this.streak === 3) {
        this.speedModifier = 80;
        this.speedModTimer = 600;
      } else if (this.streak === 5) {
        this.speedModifier = 120;
        this.speedModTimer = 800;
      } else if (this.streak === 10) {
        this.speedModifier = 180;
        this.speedModTimer = 1200;
      }
    } else {
      this.streak = 0;
      this.speedModifier = -WRONG_PENALTY;
      this.speedModTimer = WRONG_PENALTY_DURATION;
    }
  }

  reset() {
    this.worldX = 0;
    this.finished = false;
    this.finishTime = null;
    this.speedModifier = 0;
    this.speedModTimer = 0;
    this.streak = 0;
    this.nextAnswerTimer = this._sampleAnswerTime();
  }
}
