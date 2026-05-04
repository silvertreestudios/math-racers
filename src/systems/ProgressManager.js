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
      avgAnswerTimeMs: null,
      totalAnswerTimeMs: 0,
      // Windowed stats: last 5 races
      recentRaces: [],  // [{ correct, answered, avgTimeMs }]
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

    // Windowed recent races (last 5)
    if (!stats.recentRaces) stats.recentRaces = [];
    stats.recentRaces.push({
      correct,
      answered,
      avgTimeMs: (totalAnswerTimeMs && answered > 0) ? totalAnswerTimeMs / answered : null,
    });
    if (stats.recentRaces.length > 5) {
      stats.recentRaces = stats.recentRaces.slice(-5);
    }

    this.data.player.bucks += bucksEarned;
    this._save();
  }

  /** Player's windowed accuracy (last 5 races), defaults to 0.8 */
  get accuracy() {
    const races = this.data.stats.recentRaces || [];
    if (races.length === 0) return 0.8;
    let correct = 0, answered = 0;
    for (const r of races) {
      correct += r.correct;
      answered += r.answered;
    }
    return answered > 0 ? correct / answered : 0.8;
  }

  /** Player's windowed avg answer time (last 5 races), defaults to null */
  get avgAnswerTimeMs() {
    const races = this.data.stats.recentRaces || [];
    const withTime = races.filter(r => r.avgTimeMs != null);
    if (withTime.length === 0) return null;
    const sum = withTime.reduce((s, r) => s + r.avgTimeMs, 0);
    return sum / withTime.length;
  }

  reset() {
    this.data = defaultSave();
    this._save();
  }
}
