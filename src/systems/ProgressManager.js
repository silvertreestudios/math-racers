/**
 * ProgressManager — handles LocalStorage persistence.
 * Saves: bucks balance + stats.
 */

const STORAGE_KEY = 'mathRacers';
const SCHEMA_VERSION = 1;

function defaultSave() {
  return {
    version: SCHEMA_VERSION,
    player: {
      name: 'Player 1',
      bucks: 0,
      selectedCar: 'kart-default',
    },
    stats: {
      totalRaces: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      bestStreak: 0,
      totalBucksEarned: 0,
      recentAnswers: [],
      avgAnswerTimeMs: null,   // rolling average time per answer in ms
      totalAnswerTimeMs: 0,    // cumulative answer time for computing avg
    },
  };
}

export class ProgressManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      if (parsed.version !== SCHEMA_VERSION) return defaultSave();
      return parsed;
    } catch {
      return defaultSave();
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('ProgressManager: could not save to localStorage', e);
    }
  }

  get bucks() {
    return this.data.player.bucks;
  }

  get stats() {
    return this.data.stats;
  }

  /**
   * Record results of a completed race and persist.
   * @param {{ position, correct, answered, streak, bucksEarned, totalAnswerTimeMs }} result
   */
  recordRace(result) {
    const { correct, answered, streak, bucksEarned, totalAnswerTimeMs } = result;
    const stats = this.data.stats;

    stats.totalRaces += 1;
    stats.totalCorrect += correct;
    stats.totalAnswered += answered;
    stats.totalBucksEarned += bucksEarned;
    if (streak > stats.bestStreak) stats.bestStreak = streak;

    // Track answer speed
    if (totalAnswerTimeMs && answered > 0) {
      stats.totalAnswerTimeMs = (stats.totalAnswerTimeMs || 0) + totalAnswerTimeMs;
      stats.avgAnswerTimeMs = stats.totalAnswerTimeMs / stats.totalAnswered;
    }

    this.data.player.bucks += bucksEarned;
    this._save();
  }

  /** Player's historic accuracy (0-1), defaults to 0.8 */
  get accuracy() {
    const s = this.data.stats;
    if (s.totalAnswered === 0) return 0.8;
    return s.totalCorrect / s.totalAnswered;
  }

  /** Player's avg answer time in ms, defaults to null (use fallback) */
  get avgAnswerTimeMs() {
    return this.data.stats.avgAnswerTimeMs || null;
  }

  reset() {
    this.data = defaultSave();
    this._save();
  }
}
