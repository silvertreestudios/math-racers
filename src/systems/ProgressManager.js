/**
 * ProgressManager — handles persistence across cookies, LocalStorage, and IndexedDB.
 *
 * All three backends are written on every save. Whichever survives a session
 * reset will be used to recover data on next load.
 *
 * Load priority (synchronous):
 *   1. Cookies  — survive Silk/Amazon Kids session resets
 *   2. localStorage — standard browser persistence
 *   (async) IndexedDB — fallback if both above are empty on load
 *
 * Save (every _save() call):
 *   - localStorage  (sync)
 *   - cookies       (sync, chunked at 3500 bytes each)
 *   - IndexedDB     (async)
 *
 * Cookie chunking: the save JSON is split into 3500-byte chunks stored as
 * mathRacersSave_0, mathRacersSave_1, … with a count cookie mathRacersSave_n.
 */

import { CLASSES, TRACKS } from '../config/tracks.js';

const STORAGE_KEY  = 'mathRacers';
const COOKIE_BASE  = 'mathRacersSave';
const COOKIE_COUNT = 'mathRacersSave_n';
const COOKIE_CHUNK = 3500;
const COOKIE_TTL   = 60 * 60 * 24 * 365; // 1 year in seconds
const SCHEMA_VERSION = 3;
const IDB_NAME     = 'mathRacersDB';
const IDB_STORE    = 'saves';
const IDB_KEY      = 'main';

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
    firstRun: true,
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
      winStreak: 0,             // consecutive 1st-place finishes on the same track
      winStreakTrackId: null,   // which track the current streak is on
    },
    classState,
    trackState,
  };
}

export class ProgressManager {
  constructor() {
    this._loadedFromSync = false; // set true if cookies/localStorage had data
    this.data = this._load();

    // Async IDB init: if sync load found nothing, try IDB as fallback
    this._initIDB();
  }

  // ─── IndexedDB helpers ───────────────────────────────────────────────────

  /** Open (or create) the IDB database. Returns a Promise<IDBDatabase>. */
  _openIDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in globalThis)) { reject(new Error('IDB not available')); return; }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror   = (e) => reject(e.target.error);
    });
  }

  /** Write data object to IDB. Returns a Promise. */
  _idbWrite(dataObj) {
    return this._openIDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(dataObj, IDB_KEY);
      tx.oncomplete = resolve;
      tx.onerror    = (e) => reject(e.target.error);
    }));
  }

  /** Read data object from IDB. Returns a Promise<object|null>. */
  _idbRead() {
    return this._openIDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = (e) => resolve(e.target.result || null);
      req.onerror   = (e) => reject(e.target.error);
    }));
  }

  /**
   * Async IDB bootstrap: opens IDB and, if the sync load found no data,
   * recovers from IDB if it has a valid save. The recovered data is then
   * re-saved to all backends so subsequent loads are synchronous.
   *
   * After recovery, emits 'progressRestored' on the global game event bus
   * so active scenes can refresh their UI.
   */
  _initIDB() {
    this._idbRead()
      .then(idbData => {
        if (!idbData || this._loadedFromSync) return;

        // cookies and localStorage were both empty — recover from IDB
        if (idbData.version !== SCHEMA_VERSION) {
          const fresh = defaultSave();
          if (idbData.player && typeof idbData.player.bucks === 'number') {
            fresh.player.bucks = idbData.player.bucks;
          }
          this.data = fresh;
        } else {
          this._ensureKeys(idbData);
          this.data = idbData;
        }

        // Re-save to all backends so next load is synchronous
        this._save();

        // Notify any active Phaser scene that data has been restored
        const game = globalThis.__phaserGame;
        if (game && game.events) {
          game.events.emit('progressRestored', this.data);
        }
      })
      .catch(() => { /* IDB unavailable — silent */ });
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
    let raw = null;
    let source = 'default';

    // 1. Try cookies first
    try {
      raw = this._cookieRead();
      if (raw) source = 'cookies';
    } catch { /* cookies unavailable */ }

    // 2. Fall back to localStorage
    if (!raw) {
      try {
        raw = localStorage.getItem(STORAGE_KEY);
        if (raw) source = 'localStorage';
      } catch { /* unavailable */ }
    }

    if (!raw) return defaultSave();

    this._loadedFromSync = true;

    try {
      const parsed = JSON.parse(raw);
      // Migrate from older schema versions
      if (parsed.version !== SCHEMA_VERSION) {
        if (parsed.version === 2) {
          // v2 → v3: add firstRun flag. Existing players skip name entry.
          parsed.version = SCHEMA_VERSION;
          parsed.firstRun = false;
          this._ensureKeys(parsed);
          return parsed;
        }
        // Older than v2: preserve bucks only
        const fresh = defaultSave();
        if (parsed.player && typeof parsed.player.bucks === 'number') {
          fresh.player.bucks = parsed.player.bucks;
        }
        // Existing player — skip name entry
        fresh.firstRun = false;
        return fresh;
      }
      // Ensure all tracks/classes exist (handles new tracks added after save)
      this._ensureKeys(parsed);
      return parsed;
    } catch {
      return defaultSave();
    }
  }

  _save() {
    const json = JSON.stringify(this.data);

    // 1. localStorage (sync)
    try { localStorage.setItem(STORAGE_KEY, json); } catch { /* quota/unavailable */ }

    // 2. Cookies (sync) — always, not just on Silk
    try { this._cookieWrite(json); } catch { /* unavailable */ }

    // 3. IndexedDB (async)
    this._idbWrite(this.data).catch(() => { /* unavailable */ });
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
    // Ensure win streak fields exist (migration from saves without them)
    if (typeof data.stats.winStreak !== 'number') {
      data.stats.winStreak = 0;
    }
    if (!('winStreakTrackId' in data.stats)) {
      data.stats.winStreakTrackId = null;
      data.stats.winStreak = 0; // reset — old streak had no track context
    }
  }

  get bucks() {
    return this.data.player.bucks;
  }

  get stats() {
    return this.data.stats;
  }

  get winStreak() {
    // Only return streak if there's a valid track context; guards against legacy saves
    if (!this.data.stats.winStreakTrackId) return 0;
    return this.data.stats.winStreak || 0;
  }

  get isFirstRun() {
    return this.data.firstRun !== false;
  }

  /**
   * Save the player's chosen name and mark first-run complete.
   * @param {string} name  Raw input; trimmed, capped at 16 chars, defaults to 'Racer'
   */
  setPlayerName(name) {
    const trimmed = (name || '').trim().slice(0, 16) || 'Racer';
    this.data.player.name = trimmed;
    this.data.firstRun = false;
    this._save();
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

    // Win streak (consecutive 1st-place finishes on the SAME track)
    if (position === 1 && trackId && trackId === stats.winStreakTrackId) {
      stats.winStreak = (stats.winStreak || 0) + 1;
    } else {
      stats.winStreak = position === 1 ? 1 : 0;
      stats.winStreakTrackId = position === 1 ? (trackId || null) : null;
    }

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
