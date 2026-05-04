/**
 * ProgressManager — handles LocalStorage persistence.
 * Saves: bucks balance, stats, class/track unlock state, per-track trophies.
 */

import { CLASSES, TRACKS } from '../config/tracks.js';

const STORAGE_KEY = 'mathRacers';
const SCHEMA_VERSION = 2;

function defaultSave() {
  // Build default track state: first track of addition is unlocked, all others locked
  const trackState = {};
  for (const trackId of Object.keys(TRACKS)) {
    const track = TRACKS[trackId];
    trackState[trackId] = {
      unlocked: track.classId === 'addition' && track.trackIndex === 0,
      bestPosition: null, // 1-4, null = never finished
      trophy: null,       // 'gold'|'silver'|'bronze'|null
    };
  }

  // Class unlock state
  const classState = {};
  for (const classId of Object.keys(CLASSES)) {
    classState[classId] = {
      unlocked: classId === 'addition',
    };
  }

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
      recentRaces: [],  // [{ correct, answered, avgTimeMs }]
    },
    classState,
    trackState,
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
      // Migrate from schema v1 or any older version
      if (parsed.version !== SCHEMA_VERSION) {
        const fresh = defaultSave();
        // Preserve bucks from old save if present
        if (parsed.player && typeof parsed.player.bucks === 'number') {
          fresh.player.bucks = parsed.player.bucks;
        }
        return fresh;
      }
      // Ensure all tracks/classes exist (handles new tracks added after save)
      this._ensureKeys(parsed);
      return parsed;
    } catch {
      return defaultSave();
    }
  }

  _ensureKeys(data) {
    if (!data.trackState) data.trackState = {};
    if (!data.classState) data.classState = {};

    for (const trackId of Object.keys(TRACKS)) {
      if (!data.trackState[trackId]) {
        const track = TRACKS[trackId];
        data.trackState[trackId] = {
          unlocked: track.classId === 'addition' && track.trackIndex === 0,
          bestPosition: null,
          trophy: null,
        };
      }
    }
    for (const classId of Object.keys(CLASSES)) {
      if (!data.classState[classId]) {
        data.classState[classId] = { unlocked: classId === 'addition' };
      }
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

  // ─── Class unlock ────────────────────────────────────────────────────────

  isClassUnlocked(classId) {
    return !!(this.data.classState[classId] && this.data.classState[classId].unlocked);
  }

  /**
   * Attempt to purchase a class. Returns true if successful.
   */
  purchaseClass(classId) {
    const cls = CLASSES[classId];
    if (!cls) return false;
    if (this.isClassUnlocked(classId)) return true;
    if (this.data.player.bucks < cls.unlockCost) return false;

    this.data.player.bucks -= cls.unlockCost;
    this.data.classState[classId].unlocked = true;

    // Unlock the first track in that class
    const firstTrackId = cls.tracks[0];
    if (firstTrackId && this.data.trackState[firstTrackId]) {
      this.data.trackState[firstTrackId].unlocked = true;
    }

    this._save();
    return true;
  }

  // ─── Track unlock ────────────────────────────────────────────────────────

  isTrackUnlocked(trackId) {
    return !!(this.data.trackState[trackId] && this.data.trackState[trackId].unlocked);
  }

  getTrackTrophy(trackId) {
    return this.data.trackState[trackId] ? this.data.trackState[trackId].trophy : null;
  }

  getTrackBestPosition(trackId) {
    return this.data.trackState[trackId] ? this.data.trackState[trackId].bestPosition : null;
  }

  /**
   * After a race, update track state and potentially unlock next track.
   * @param {string} trackId
   * @param {number} position  1-4
   * @returns {string|null} nextTrackId if a new track was unlocked
   */
  recordTrackResult(trackId, position) {
    const ts = this.data.trackState[trackId];
    if (!ts) return null;

    // Update best position
    if (ts.bestPosition === null || position < ts.bestPosition) {
      ts.bestPosition = position;
    }

    // Trophy assignment
    if (position === 1) {
      ts.trophy = 'gold';
    } else if (position === 2 && ts.trophy !== 'gold') {
      ts.trophy = 'silver';
    } else if (position === 3 && ts.trophy == null) {
      ts.trophy = 'bronze';
    }

    // Unlock next track if top-2 finish
    let nextTrackId = null;
    if (position <= 2) {
      const track = TRACKS[trackId];
      if (track) {
        const cls = CLASSES[track.classId];
        if (cls) {
          const nextIdx = track.trackIndex + 1;
          if (nextIdx < cls.tracks.length) {
            nextTrackId = cls.tracks[nextIdx];
            if (this.data.trackState[nextTrackId]) {
              this.data.trackState[nextTrackId].unlocked = true;
            }
          }
        }
      }
    }

    this._save();
    return nextTrackId;
  }

  /**
   * Record results of a completed race and persist.
   * @param {{ position, correct, answered, streak, bucksEarned, totalAnswerTimeMs, trackId }} result
   * @returns {string|null} nextTrackId
   */
  recordRace(result) {
    const { correct, answered, streak, bucksEarned, totalAnswerTimeMs, trackId, position } = result;
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

    // Record track result and potentially unlock next track
    let nextTrackId = null;
    if (trackId) {
      nextTrackId = this.recordTrackResult(trackId, position);
    } else {
      this._save();
    }

    return nextTrackId;
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
