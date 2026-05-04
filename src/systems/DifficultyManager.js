/**
 * DifficultyManager — adaptive difficulty within a single race.
 *
 * Eases players into each race with simpler problems, then ramps to full
 * difficulty. Backs off to easy whenever a "struggle condition" is detected
 * (≥2 wrong or ≥2 slow answers in the last 5 problems).
 *
 * Tiers: 'easy' | 'medium' | 'full'
 */
export class DifficultyManager {
  constructor() {
    this.reset();
  }

  reset() {
    this._problemCount = 0;       // how many problems have been presented
    this._recentResults = [];     // last 5 {correct, slow} records
    this._struggling = false;     // struggle flag — cleared after one easy problem
  }

  /**
   * Record the result of the most recently answered problem.
   * @param {boolean} correct   Was the answer correct?
   * @param {number}  timeMs    How long the player took (ms)
   * @param {number}  avgTimeMs Running average answer time so far (ms). 0 = no baseline yet.
   */
  recordAnswer(correct, timeMs, avgTimeMs) {
    const slow = avgTimeMs > 0 && timeMs > avgTimeMs * 2;
    this._recentResults.push({ correct, slow });
    if (this._recentResults.length > 5) this._recentResults.shift();
  }

  /**
   * Get the difficulty tier for the next problem.
   * Call this BEFORE generating the problem, then increment internally.
   * @returns {'easy'|'medium'|'full'}
   */
  getNextTier() {
    const count = this._problemCount;
    this._problemCount++;

    // First 2 problems: always easy
    if (count < 2) return 'easy';

    // Problem 3 (index 2): medium ramp
    if (count === 2) return 'medium';

    // Problems 4+ — check struggle condition
    if (this._isStruggling()) {
      this._recentResults = []; // reset window after backing off
      return 'easy';
    }

    return 'full';
  }

  _isStruggling() {
    if (this._recentResults.length < 3) return false; // not enough data yet
    const wrongCount = this._recentResults.filter(r => !r.correct).length;
    const slowCount  = this._recentResults.filter(r => r.slow).length;
    return wrongCount >= 2 || slowCount >= 2;
  }
}
