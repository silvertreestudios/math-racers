/**
 * ProgressManager — handles LocalStorage persistence with cookie fallback.
 *
 * Storage strategy:
 *  - Non-Silk browsers: LocalStorage only.
 *  - Silk browser (Amazon Kids): dual-write to BOTH LocalStorage AND cookies.
 *    Cookies persist across Silk sessions in Amazon Kids profiles even when
 *    localStorage is cleared between sessions. Reads prefer cookies.
 *
 * Cookie chunking: cookies are limited to ~4096 bytes per cookie. The save
 * JSON is split into 3500-byte chunks and stored as mathRacersSave_0,
 * mathRacersSave_1, … A mathRacersSave_n cookie records the chunk count.
 */

import { CLASSES, TRACKS } from '../config/tracks.js';

const STORAGE_KEY  = 'mathRacers';
const COOKIE_BASE  = 'mathRacersSave';
const COOKIE_COUNT = 'mathRacersSave_n';
const COOKIE_CHUNK = 3500;
const COOKIE_TTL   = 60 * 60 * 24 * 365; // 1 year in seconds
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
      recentRaces: [],          // global window kept for backward compat
      recentRacesByClass: {},   // { [classId]: [{ correct, answered, avgTimeMs }] }
    },
    classState,
    trackState,
  };
}

export class ProgressManager {
  constructor() {
    // Detect Silk browser (Amazon Kindle Fire)
    this._useCookies = /Silk|SilkBrowser/i.test(
      (typeof navigator !== 'undefined' ? navigator.userAgent : '')
    );
    this.data = this._load();
  }

  // ─── Cookie helpers ──────────────────────────────────────────────────────

  _cookieSet(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_TTL}; SameSite=Lax`;
  }

  _cookieGet(name) {
    const match = document.cookie.split('; ').find(c => c.startsWith(name + '='));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
  }

  _cookieDel(name) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }

  /** Write JSON string to cookie(s), chunking at COOKIE_CHUNK bytes each. */
  _cookieWrite(json) {
    // Clean up old chunks first
    const oldCount = parseInt(this._cookieGet(COOKIE_COUNT) || '0', 10);
    for (let i = 0; i < oldCount; i++) this._cookieDel(`${COOKIE_BASE}_${i}`);

    const chunks = [];
    for (let i = 0; i < json.length; i += COOKIE_CHUNK) {
      chunks.push(json.slice(i, i + COOKIE_CHUNK));
    }
    this._cookieSet(COOKIE_COUNT, String(chunks.length));
    chunks.forEach((chunk, i) => this._cookieSet(`${COOKIE_BASE}_${i}`, chunk));
  }

  /** Read and reassemble JSON string from cookie(s). Returns null if absent. */
  _cookieRead() {
    const countStr = this._cookieGet(COOKIE_COUNT);
    if (!countStr) return null;
    const count = parseInt(countStr, 10);
    if (!count || count < 1) return null;
    const parts = [];
    for (let i = 0; i < count; i++) {
      const part = this._cookieGet(`${COOKIE_BASE}_${i}`);
      if (part === null) return null; // missing chunk — treat as corrupt
      parts.push(part);
    }
    return parts.join('');
  }

  // ─── Load / Save ─────────────────────────────────────────────────────────

  _load() {
    // Try cookies first — they survive Amazon Kids session resets on Silk
    let raw = null;
    let source = 'default';
    try {
      raw = this._cookieRead();
      if (raw) source = 'cookies';
    } catch { /* cookies unavailable */ }

    // Fall back to localStorage
    if (!raw) {
      try {
        raw = localStorage.getItem(STORAGE_KEY);
        if (raw) source = 'localStorage';
      } catch { /* unavailable */ }
    }

    if (!raw) {
      console.log('[PM] _load: no saved data found, using default (bucks=0)');
      return defaultSave();
    }

    try {
      const parsed = JSON.parse(raw);
      // Migrate from schema v1 or any older version
      if (parsed.version !== SCHEMA_VERSION) {
        const fresh = defaultSave();
        // Preserve bucks from old save if present
        if (parsed.player && typeof parsed.player.bucks === 'number') {
          fresh.player.bucks = parsed.player.bucks;
        }
        console.log(`[PM] _load: migrated old schema from ${source}, bucks=${fresh.player.bucks}`);
        return fresh;
      }
      // Ensure all tracks/classes exist (handles new tracks added after save)
      this._ensureKeys(parsed);
      console.log(`[PM] _load: loaded from ${source}, bucks=${parsed.player.bucks}`);
      return parsed;
    } catch {
      console.log(`[PM] _load: JSON parse failed from ${source}, using default`);
      return defaultSave();
    }
  }

  _save() {
    const json = JSON.stringify(this.data);
    const bucks = this.data.player.bucks;

    // Always write to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, json);
      console.log(`[PM] _save: localStorage write OK, bucks=${bucks}`);
    } catch (e) {
      console.warn(`[PM] _save: localStorage write FAILED, bucks=${bucks}`, e);
    }

    // Dual-write to cookies on Silk for persistence across Amazon Kids sessions
    if (this._useCookies) {
      try {
        this._cookieWrite(json);
        console.log(`[PM] _save: cookie write OK, bucks=${bucks}`);
      } catch (e) {
        console.warn(`[PM] _save: cookie write FAILED, bucks=${bucks}`, e);
      }
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
    // Ensure per-class race history exists (migration from saves without it)
    if (!data.stats.recentRacesByClass) {
      data.stats.recentRacesByClass = {};
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
   * @param {{ position, correct, answered, streak, bucksEarned, totalAnswerTimeMs, trackId, classId }} result
   * @returns {string|null} nextTrackId
   */
  recordRace(result) {
    const { correct, answered, streak, bucksEarned, totalAnswerTimeMs, trackId, position, classId } = result;
    const stats = this.data.stats;

    stats.totalRaces += 1;
    stats.totalCorrect += correct;
    stats.totalAnswered += answered;
    stats.totalBucksEarned += bucksEarned;
    if (streak > stats.bestStreak) stats.bestStreak = streak;

    // Track answer speed (global)
    if (totalAnswerTimeMs && answered > 0) {
      stats.totalAnswerTimeMs = (stats.totalAnswerTimeMs || 0) + totalAnswerTimeMs;
      stats.avgAnswerTimeMs = stats.totalAnswerTimeMs / stats.totalAnswered;
    }

    const raceEntry = {
      correct,
      answered,
      avgTimeMs: (totalAnswerTimeMs && answered > 0) ? totalAnswerTimeMs / answered : null,
    };

    // Global windowed window (backward compat)
    if (!stats.recentRaces) stats.recentRaces = [];
    stats.recentRaces.push(raceEntry);
    if (stats.recentRaces.length > 5) stats.recentRaces = stats.recentRaces.slice(-5);

    // Per-class windowed window
    if (!stats.recentRacesByClass) stats.recentRacesByClass = {};
    if (classId) {
      if (!stats.recentRacesByClass[classId]) stats.recentRacesByClass[classId] = [];
      stats.recentRacesByClass[classId].push(raceEntry);
      if (stats.recentRacesByClass[classId].length > 5) {
        stats.recentRacesByClass[classId] = stats.recentRacesByClass[classId].slice(-5);
      }
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

  /**
   * Per-class windowed accuracy (last 5 races for this class).
   * Falls back to 0.5 when no history for the class — deliberately easier
   * so the first race in a new class feels approachable.
   * @param {string} classId
   */
  accuracyForClass(classId) {
    const races = (this.data.stats.recentRacesByClass || {})[classId] || [];
    if (races.length === 0) return 0.5;
    let correct = 0, answered = 0;
    for (const r of races) {
      correct += r.correct;
      answered += r.answered;
    }
    return answered > 0 ? correct / answered : 0.5;
  }

  /**
   * Per-class windowed avg answer time (last 5 races for this class).
   * Falls back to 5000ms when no history — deliberately slower default
   * so AI isn't tuned too tight on the first race of a new class.
   * @param {string} classId
   */
  avgAnswerTimeMsForClass(classId) {
    const races = (this.data.stats.recentRacesByClass || {})[classId] || [];
    const withTime = races.filter(r => r.avgTimeMs != null);
    if (withTime.length === 0) return 5000;
    const sum = withTime.reduce((s, r) => s + r.avgTimeMs, 0);
    return sum / withTime.length;
  }

  reset() {
    this.data = defaultSave();
    this._save();
  }
}
