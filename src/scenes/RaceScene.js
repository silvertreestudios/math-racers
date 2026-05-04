/**
 * RaceScene — Core gameplay: side-scrolling race with math problems.
 * All positions proportional to actual screen size.
 */
import Phaser from 'phaser';
import { MathEngine } from '../systems/MathEngine.js';
import { AIRacer } from '../systems/AIRacer.js';
import { DifficultyManager } from '../systems/DifficultyManager.js';
import { CLASSES, TRACKS } from '../config/tracks.js';
import { AI_NAMES_BY_CLASS, CAR_COLORS_BY_CLASS } from '../config/cars.js';
import {
  SAFE_PADDING,
  PLAYER_BASE_SPEED, CORRECT_BOOST, CORRECT_BOOST_DURATION,
  WRONG_PENALTY, WRONG_PENALTY_DURATION, CORRECT_FLASH_DURATION,
  STREAK_NITRO, STREAK_TURBO, STREAK_SUPERCHARGE, STREAK_BOOST,
  FINISH_LINE_X, CAR_COLORS, CAR_NAMES,
  PARALLAX_SPEEDS,
} from '../config/constants.js';

export class RaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RaceScene' });
  }

  init(data) {
    this.classId = (data && data.classId) || 'addition';
    this.trackId = (data && data.trackId) || 'starter-speedway';
  }

  create() {
    this.w = this.scale.width;
    this.h = this.scale.height;

    // Resolve track + class config
    this.trackConfig = TRACKS[this.trackId] || TRACKS['starter-speedway'];
    this.classConfig = CLASSES[this.classId] || CLASSES['addition'];

    this.mathEngine = new MathEngine();
    this.mathEngine.reset(); // clear repeat-prevention history for this race
    this.difficultyManager = new DifficultyManager();
    this.difficultyManager.reset();

    // Get per-class stats for AI calibration — falls back to track-specific
    // defaults on first race in a new class so the player isn't overwhelmed.
    // Tracks with harder problems use longer fallback times so the AI doesn't
    // answer impossibly fast before the player has established a history.
    const progress = this.registry.get('progress');
    const trackFallbackTime = this.trackConfig.fallbackAnswerTimeMs || 5000;
    const playerAccuracy = progress ? progress.accuracyForClass(this.classId) : 0.5;
    const playerAvgTime  = progress
      ? (progress.avgAnswerTimeMsForClass(this.classId) || trackFallbackTime)
      : trackFallbackTime;

    // Store player name now so _createUI() can use it without re-reading registry
    this.playerName = progress?.data?.player?.name || 'You';

    this.aiRacers = [
      new AIRacer(0, playerAccuracy, playerAvgTime),
      new AIRacer(1, playerAccuracy, playerAvgTime),
      new AIRacer(2, playerAccuracy, playerAvgTime),
    ];

    // Player state
    this.playerWorldX = 0;
    this.playerSpeed = PLAYER_BASE_SPEED;
    this.playerFinished = false;
    this.playerFinishTime = null;
    this.speedModifier = 0;
    this.speedModTimer = 0;
    this._endScheduled = false;

    // Race state
    this.problemsAnswered = 0;
    this.correctAnswers = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.raceOver = false;
    this.waitingForInput = true;
    this.finishOrder = [];
    this.problemShownAt = 0;       // timestamp when current problem appeared
    this.totalAnswerTimeMs = 0;    // cumulative time spent answering

    // Draw everything
    this._createBackground();
    this._createCars();
    this._createUI();
    this._createStreakLabel();

    // Start first problem
    this._nextProblem();
  }

  update(time, delta) {
    if (this.raceOver) return;

    // Speed modifier timer
    if (this.speedModTimer > 0) {
      this.speedModTimer -= delta;
      if (this.speedModTimer <= 0) {
        this.speedModifier = 0;
        this.speedModTimer = 0;
      }
    }

    // Move player
    if (!this.playerFinished) {
      const effectiveSpeed = Math.max(20, this.playerSpeed + this.speedModifier);
      this.playerWorldX += effectiveSpeed * (delta / 1000);
      if (this.playerWorldX >= FINISH_LINE_X) {
        this.playerWorldX = FINISH_LINE_X;
        this.playerFinished = true;
        this.playerFinishTime = time;
        this.finishOrder.push(0);
      }
    }

    // Move AI
    for (let i = 0; i < this.aiRacers.length; i++) {
      const ai = this.aiRacers[i];
      if (!ai.finished) {
        ai.update(delta, FINISH_LINE_X);
        if (ai.finished) {
          this.finishOrder.push(i + 1);
        }
      }
    }

    // Update car positions on screen
    this._updateCarPositions();

    // Update parallax
    this._updateParallax();

    // Update progress bar
    this._updateProgressBar();

    // Check race end — end shortly after player finishes
    if (this.playerFinished && !this._endScheduled) {
      this._endScheduled = true;
      this.time.delayedCall(1500, () => this._endRace());
    }
  }

  // ─── Background ──────────────────────────────────────────────────────────

  _createBackground() {
    const { w, h } = this;
    this.parallaxLayers = [];

    // Sky (static)
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4488cc, 0x4488cc, 1);
    gfx.fillRect(0, 0, w, h * 0.45);
    gfx.setDepth(-10);

    // Mountains layer
    this.mountainsGfx = this.add.graphics().setDepth(-9);
    this._drawMountains(0);
    this.parallaxLayers.push({ gfx: this.mountainsGfx, speed: PARALLAX_SPEEDS[1], offset: 0, draw: (o) => this._drawMountains(o) });

    // Trees/grass layer
    this.treesGfx = this.add.graphics().setDepth(-8);
    this._drawTrees(0);
    this.parallaxLayers.push({ gfx: this.treesGfx, speed: PARALLAX_SPEEDS[2], offset: 0, draw: (o) => this._drawTrees(o) });

    // Road
    const road = this.add.graphics().setDepth(-5);
    road.fillStyle(0x555566);
    road.fillRect(0, h * 0.40, w, h * 0.30);

    // Lane lines
    road.lineStyle(2, 0xffffff, 0.3);
    for (let i = 1; i < 4; i++) {
      const y = h * 0.40 + (h * 0.30 / 4) * i;
      for (let x = 0; x < w; x += 40) {
        road.lineBetween(x, y, x + 20, y);
      }
    }

    // Road dash lines (animated)
    this.roadDashes = [];
    for (let i = 0; i < 14; i++) {
      const dash = this.add.rectangle(i * (w / 12), h * 0.55, 30, 4, 0xffffff, 0.5).setDepth(-4);
      this.roadDashes.push(dash);
    }
  }

  _drawMountains(offset) {
    const { w, h } = this;
    const gfx = this.mountainsGfx;
    gfx.clear();
    gfx.fillStyle(0x556688, 0.7);
    const baseY = h * 0.45;
    for (let i = 0; i < 5; i++) {
      const cx = ((i * (w / 4) - offset * 0.3) % (w + 300)) - 100;
      const peakH = 80 + (i % 3) * 30;
      gfx.fillTriangle(cx - 100, baseY, cx, baseY - peakH, cx + 100, baseY);
    }
  }

  _drawTrees(offset) {
    const { w, h } = this;
    const gfx = this.treesGfx;
    gfx.clear();
    const baseY = h * 0.42;
    for (let i = 0; i < 12; i++) {
      const x = ((i * (w / 10) - offset) % (w + 200)) - 50;
      gfx.fillStyle(0x664422);
      gfx.fillRect(x - 3, baseY - 15, 6, 18);
      gfx.fillStyle(0x228833);
      gfx.fillCircle(x, baseY - 22, 12);
    }
  }

  _updateParallax() {
    const { w } = this;
    const worldProgress = this.playerWorldX / FINISH_LINE_X;

    for (const dash of this.roadDashes) {
      dash.x -= 3;
      if (dash.x < -40) dash.x += w + 80;
    }

    for (const layer of this.parallaxLayers) {
      layer.offset = worldProgress * w * 3 * layer.speed;
      layer.draw(layer.offset);
    }
  }

  // ─── Cars ────────────────────────────────────────────────────────────────

  _createCars() {
    const { w, h } = this;
    this.carSprites = [];

    const lanes = [
      h * 0.44,
      h * 0.50,
      h * 0.56,
      h * 0.62,
    ];

    // Use class-specific colors and names
    const carColors = CAR_COLORS_BY_CLASS[this.classId] || CAR_COLORS;
    const aiNames = AI_NAMES_BY_CLASS[this.classId] || ['Speedy Sam', 'Turbo Tina', 'Dash Dave'];
    const carNames = ['YOU', ...aiNames];

    // Pick car-draw function based on class
    const drawFn = {
      addition:       (g, c, isPlayer) => this._drawGoKart(g, c, isPlayer),
      subtraction:    (g, c, isPlayer) => this._drawRallyCar(g, c, isPlayer),
      multiplication: (g, c, isPlayer) => this._drawMonsterTruck(g, c, isPlayer),
      division:       (g, c, isPlayer) => this._drawFormulaOne(g, c, isPlayer),
      advanced:       (g, c, isPlayer) => this._drawSupercar(g, c, isPlayer),
    }[this.classId] || ((g, c, isPlayer) => this._drawGoKart(g, c, isPlayer));

    for (let i = 0; i < 4; i++) {
      const isPlayer = i === 0;
      const gfx = this.add.graphics().setDepth(isPlayer ? 5 : 3);
      const color = carColors[i];
      const y = lanes[i];

      // Player gets a subtle cyan glow ring underneath
      if (isPlayer) {
        gfx.lineStyle(3, 0x00ffff, 0.45);
        gfx.strokeCircle(0, 0, 36);
      }

      drawFn(gfx, color, isPlayer);

      gfx.setPosition(SAFE_PADDING + 40, y);
      this.carSprites.push({ gfx, baseY: y, index: i });

      // Name tag (extra padding for monster trucks which are taller)
      const tagOffset = this.classId === 'multiplication' ? 34 : 28;
      const name = this.add.text(SAFE_PADDING + 40, y - tagOffset, carNames[i], {
        fontSize: '12px',
        color: isPlayer ? '#00ffff' : '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6);
      this.carSprites[i].nameTag = name;
    }
  }

  // ── Go-Kart (Addition — Rookie League) ───────────────────────────────────
  // Low, compact, open-top with a visible driver helmet, small wheels
  _drawGoKart(g, color, isPlayer) {
    const dark = this._darken(color);

    // Main body — low flat pod
    g.fillStyle(color);
    g.fillRoundedRect(-26, -7, 52, 16, 4);

    // Side pods
    g.fillStyle(dark);
    g.fillRoundedRect(-28, -3, 10, 10, 2);
    g.fillRoundedRect(18, -3, 10, 10, 2);

    // Nose (front taper)
    g.fillStyle(color);
    g.fillTriangle(26, -4, 36, 0, 26, 4);

    // Open cockpit surround
    g.fillStyle(dark);
    g.fillRoundedRect(-10, -12, 22, 8, 3);

    // Driver helmet
    g.fillStyle(0xff3300);
    g.fillCircle(-2, -13, 7);
    g.fillStyle(0x88ccff, 0.85);
    g.fillRoundedRect(-5, -17, 10, 6, 2);   // visor

    // Wheels — small, 4 corners
    g.fillStyle(0x111111);
    g.fillCircle(-18, 9, 6);   // rear left
    g.fillCircle(18, 9, 6);    // front left
    // Wheel highlights
    g.fillStyle(0x444444);
    g.fillCircle(-18, 9, 3);
    g.fillCircle(18, 9, 3);

    // Exhaust pipe (rear right)
    g.fillStyle(0x888888);
    g.fillRect(-30, 2, 5, 4);

    // Headlights
    g.fillStyle(0xffffaa);
    g.fillCircle(30, -2, 3);
    g.fillCircle(30, 4, 3);
  }

  // ── Rally Car (Subtraction — Amateur Circuit) ─────────────────────────────
  // Wider hatchback, roll cage, mud flaps, rear spoiler
  _drawRallyCar(g, color, isPlayer) {
    const dark = this._darken(color);

    // Body — wider, taller than kart
    g.fillStyle(color);
    g.fillRoundedRect(-28, -10, 56, 22, 5);

    // Hatchback roofline
    g.fillStyle(dark);
    g.fillRoundedRect(-16, -20, 34, 12, 4);

    // Windshield
    g.fillStyle(0x88ccff, 0.75);
    g.fillRoundedRect(-12, -19, 26, 10, 3);

    // Roll cage bars (top of roof)
    g.lineStyle(2, 0x888888);
    g.lineBetween(-10, -21, -10, -19);
    g.lineBetween(10, -21, 10, -19);
    g.lineBetween(-10, -21, 10, -21);

    // Rear spoiler
    g.fillStyle(0x888888);
    g.fillRect(-26, -24, 10, 4);  // mount
    g.fillRect(-30, -26, 18, 3);  // blade

    // Front hood scoop
    g.fillStyle(0x333333);
    g.fillRoundedRect(10, -12, 12, 6, 2);

    // Fender flares
    g.fillStyle(dark);
    g.fillRoundedRect(-32, 4, 10, 6, 2);
    g.fillRoundedRect(22, 4, 10, 6, 2);

    // Wheels — bigger than kart
    g.fillStyle(0x111111);
    g.fillCircle(-20, 12, 8);
    g.fillCircle(20, 12, 8);
    g.fillStyle(0x555555);
    g.fillCircle(-20, 12, 4);
    g.fillCircle(20, 12, 4);

    // Mud flaps
    g.fillStyle(0x222222);
    g.fillRect(-26, 8, 4, 8);

    // Headlights
    g.fillStyle(0xffffaa);
    g.fillRect(25, -7, 6, 4);
    // Tail lights
    g.fillStyle(0xff2200);
    g.fillRect(-30, -7, 4, 4);
  }

  // ── Monster Truck (Multiplication — Pro Series) ───────────────────────────
  // Tall body, massive chunky wheels, lifted suspension gap
  _drawMonsterTruck(g, color, isPlayer) {
    const dark = this._darken(color);

    // MASSIVE WHEELS — the star of the show
    // Rear wheel
    g.fillStyle(0x111111);
    g.fillCircle(-18, 12, 14);
    // Tread lines (concentric)
    g.lineStyle(2, 0x333333);
    g.strokeCircle(-18, 12, 10);
    g.strokeCircle(-18, 12, 6);
    // Lug bolts
    g.fillStyle(0x555555);
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      g.fillCircle(-18 + Math.cos(ang) * 8, 12 + Math.sin(ang) * 8, 2);
    }

    // Front wheel
    g.fillStyle(0x111111);
    g.fillCircle(18, 12, 14);
    g.lineStyle(2, 0x333333);
    g.strokeCircle(18, 12, 10);
    g.strokeCircle(18, 12, 6);
    g.fillStyle(0x555555);
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      g.fillCircle(18 + Math.cos(ang) * 8, 12 + Math.sin(ang) * 8, 2);
    }

    // Suspension / axle
    g.fillStyle(0x666666);
    g.fillRect(-22, -1, 40, 5);

    // Body — blocky, tall, sits above the wheels
    g.fillStyle(color);
    g.fillRoundedRect(-22, -24, 44, 24, 4);

    // Roof
    g.fillStyle(dark);
    g.fillRoundedRect(-18, -28, 36, 8, 3);

    // Windshield
    g.fillStyle(0x88ccff, 0.75);
    g.fillRoundedRect(-14, -26, 28, 10, 3);

    // Exhaust stacks (dual vertical pipes on hood)
    g.fillStyle(0x888888);
    g.fillRect(6, -30, 4, 10);
    g.fillRect(12, -30, 4, 10);

    // Grill
    g.fillStyle(0x333333);
    g.fillRoundedRect(16, -20, 8, 14, 2);
    g.lineStyle(1, 0x555555);
    for (let yy = -18; yy < -8; yy += 3) {
      g.lineBetween(17, yy, 23, yy);
    }

    // Number plate
    g.fillStyle(0xffffff);
    g.fillRect(-8, -20, 14, 8);
    g.fillStyle(0x000000);
  }

  // ── Formula 1 (Division — Championship) ──────────────────────────────────
  // Sleek, low, elongated, pointed nose, large rear wing, front wings
  _drawFormulaOne(g, color, isPlayer) {
    const dark = this._darken(color);

    // Rear wing (drawn first so body overlaps mount)
    // Vertical endplates
    g.fillStyle(dark);
    g.fillRect(-34, -18, 4, 14);
    g.fillRect(-22, -18, 4, 14);
    // Horizontal wing blade
    g.fillStyle(color);
    g.fillRect(-36, -20, 20, 4);

    // Rear diffuser
    g.fillStyle(dark);
    g.fillTriangle(-28, 8, -20, 8, -24, 14);

    // Main body — very long, low, bullet-shaped
    g.fillStyle(color);
    g.fillRoundedRect(-28, -8, 58, 14, 4);

    // Sidepods
    g.fillStyle(dark);
    g.fillRoundedRect(-22, -4, 16, 10, 3);
    g.fillRoundedRect(4, -4, 16, 10, 3);

    // Pointed nose cone
    g.fillStyle(color);
    g.fillTriangle(30, -5, 48, 0, 30, 5);
    // Nose tip highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillTriangle(40, -2, 47, 0, 40, 2);

    // Open cockpit (monocoque)
    g.fillStyle(dark);
    g.fillRoundedRect(-8, -12, 18, 8, 3);

    // Driver helmet
    g.fillStyle(0xffffff);
    g.fillCircle(0, -13, 6);
    g.fillStyle(0x88ccff, 0.9);
    g.fillRoundedRect(-4, -16, 9, 5, 2);   // visor

    // Front wings — wide extensions past the body
    g.fillStyle(color);
    g.fillRect(22, 4, 26, 3);   // front wing plane
    g.fillStyle(dark);
    g.fillRect(24, 1, 3, 6);    // front wing endplate L
    g.fillRect(44, 1, 3, 6);    // front wing endplate R

    // Wheels — low-profile slicks
    g.fillStyle(0x111111);
    g.fillCircle(-18, 8, 7);   // rear
    g.fillCircle(20, 8, 7);    // front
    g.fillStyle(0x333333);
    g.fillCircle(-18, 8, 3);
    g.fillCircle(20, 8, 3);

    // Halo safety device (thin arc over cockpit)
    g.lineStyle(3, 0x888888);
    g.beginPath();
    g.arc(-4, -9, 10, Math.PI, 0, false);
    g.strokePath();

    // Headlights
    g.fillStyle(0xffffaa);
    g.fillCircle(45, -2, 2);
    // Rear lights
    g.fillStyle(0xff0000);
    g.fillCircle(-28, 0, 3);
  }

  // ── Supercar (Advanced — Superclass) ─────────────────────────────────────
  // Lamborghini-style: very low, angular, enclosed cockpit, swept windshield,
  // large rear diffuser, wide flat stance
  _drawSupercar(g, color, isPlayer) {
    const dark = this._darken(color);

    // Rear diffuser — angular wide piece
    g.fillStyle(0x222222);
    g.fillTriangle(-34, 8, -20, 8, -27, 16);
    g.fillTriangle(-20, 8, -10, 8, -15, 14);

    // Wide low body — very flat and wide
    g.fillStyle(color);
    g.fillRoundedRect(-30, -6, 60, 14, 3);

    // Low angular nose — sharp taper
    g.fillStyle(color);
    g.fillTriangle(30, -5, 48, 0, 30, 5);
    // Nose tip
    g.fillStyle(0xffffff, 0.2);
    g.fillTriangle(42, -2, 47, 0, 42, 2);

    // Side air intakes / vents
    g.fillStyle(dark);
    g.fillRoundedRect(-28, -2, 12, 6, 2);
    g.fillRoundedRect(8, -2, 12, 6, 2);

    // Roof — very low swept-back profile
    g.fillStyle(dark);
    g.fillRoundedRect(-14, -16, 28, 12, 4);

    // Swept-back windshield
    g.fillStyle(0x88ccff, 0.8);
    // Front windshield: angled, wide
    g.fillTriangle(-10, -14, 14, -14, 14, -4);
    // Rear window
    g.fillTriangle(-14, -14, -4, -14, -14, -6);

    // Rear wing — low, wide blade
    g.fillStyle(0x444444);
    g.fillRect(-34, -10, 4, 10);  // endplate
    g.fillStyle(color);
    g.fillRect(-36, -12, 22, 4);  // wing blade

    // Front splitter
    g.fillStyle(dark);
    g.fillRect(28, 3, 20, 3);

    // Wheels — wide, low-profile racing slicks
    g.fillStyle(0x111111);
    g.fillEllipse(-20, 10, 18, 12);   // rear
    g.fillEllipse(20, 10, 18, 12);    // front
    // Rim highlights
    g.fillStyle(0x888888);
    g.fillEllipse(-20, 10, 8, 6);
    g.fillEllipse(20, 10, 8, 6);
    // Lug bolts
    g.fillStyle(0x555555);
    g.fillCircle(-20, 10, 2);
    g.fillCircle(20, 10, 2);

    // Headlights — sharp angular slits
    g.fillStyle(0xffffee);
    g.fillRect(40, -4, 6, 2);
    g.fillRect(40, 1, 6, 2);

    // Tail lights
    g.fillStyle(0xff2200);
    g.fillRect(-30, -4, 4, 3);
    g.fillRect(-30, 1, 4, 3);

    // Exhaust tips (dual center)
    g.fillStyle(0x888888);
    g.fillCircle(-22, 14, 3);
    g.fillCircle(-18, 14, 3);
    g.fillStyle(0x333333);
    g.fillCircle(-22, 14, 1);
    g.fillCircle(-18, 14, 1);

    // Lightning bolt emblem on door
    g.fillStyle(0xffee00, 0.9);
    g.fillTriangle(-4, -5, 2, -5, -2, 0);
    g.fillTriangle(-2, 0, 4, 0, 0, 6);
  }

  /** Darken a color by ~30% for shading/dark panels */
  _darken(color) {
    const r = Math.floor(((color >> 16) & 0xff) * 0.6);
    const gr = Math.floor(((color >> 8) & 0xff) * 0.6);
    const b = Math.floor((color & 0xff) * 0.6);
    return (r << 16) | (gr << 8) | b;
  }

  _updateCarPositions() {
    const { w } = this;
    const trackStartX = SAFE_PADDING + 40;
    const trackEndX = w - SAFE_PADDING - 20;
    const trackWidth = trackEndX - trackStartX;

    // Player car
    const playerProgress = this.playerWorldX / FINISH_LINE_X;
    const playerScreenX = trackStartX + playerProgress * trackWidth;
    this.carSprites[0].gfx.setX(playerScreenX);
    this.carSprites[0].nameTag.setX(playerScreenX);

    // AI cars
    for (let i = 0; i < this.aiRacers.length; i++) {
      const ai = this.aiRacers[i];
      const progress = ai.worldX / FINISH_LINE_X;
      const screenX = trackStartX + progress * trackWidth;
      this.carSprites[i + 1].gfx.setX(screenX);
      this.carSprites[i + 1].nameTag.setX(screenX);
    }
  }

  // ─── UI ──────────────────────────────────────────────────────────────────

  _createUI() {
    const { w, h } = this;

    // Problem text
    this.problemText = this.add.text(w / 2, h * 0.73, '', {
      fontSize: `${Math.min(34, w * 0.045)}px`,
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    // Answer buttons (1×4 horizontal row)
    this.answerButtons = [];
    const btnCount = 4;
    const btnGap = 10;
    const availableWidth = w - (SAFE_PADDING * 2);
    const btnW = Math.floor((availableWidth - btnGap * (btnCount - 1)) / btnCount);
    const btnH = Math.max(48, h * 0.11);
    const btnY = h - SAFE_PADDING - btnH / 2;

    for (let i = 0; i < btnCount; i++) {
      const x = SAFE_PADDING + i * (btnW + btnGap) + btnW / 2;

      const bg = this.add.rectangle(x, btnY, btnW, btnH, 0x334466)
        .setStrokeStyle(3, 0x6688aa)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const text = this.add.text(x, btnY, '', {
        fontSize: `${Math.min(26, btnW * 0.2)}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(21);

      bg.on('pointerdown', () => this._onAnswer(i));

      this.answerButtons.push({ bg, text, idx: i });
    }

    // Feedback text (shows correct answer on wrong)
    this.feedbackText = this.add.text(w / 2, h * 0.67, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#44ff44',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(22).setAlpha(0);

    // Progress bar (race distance)
    const barWidth = w * 0.5;
    this.progressBarBg = this.add.rectangle(w / 2, SAFE_PADDING + 6, barWidth, 12, 0x333333).setDepth(20);
    this.progressBarFill = this.add.rectangle(
      w / 2 - barWidth / 2, SAFE_PADDING + 6, 0, 12, 0x00ff88
    ).setOrigin(0, 0.5).setDepth(21);
    this._progressBarWidth = barWidth;

    // Player name label — left of progress bar
    this.add.text(w / 2 - barWidth / 2 - 8, SAFE_PADDING + 6, this.playerName, {
      fontSize: `${Math.min(13, w * 0.016)}px`,
      color: '#00ff88',
      fontFamily: 'Arial',
    }).setOrigin(1, 0.5).setDepth(20);

    // Problem counter
    this.counterText = this.add.text(w / 2, SAFE_PADDING + 22, '', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(20);

    // Streak display
    this.streakText = this.add.text(w - SAFE_PADDING, SAFE_PADDING + 6, '', {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(20);

    // Speed indicator — below streak
    this.speedText = this.add.text(w - SAFE_PADDING, SAFE_PADDING + 26, '', {
      fontSize: '13px',
      color: '#aaddff',
      fontFamily: 'Arial',
    }).setOrigin(1, 0).setDepth(20);

    // Finish line graphic (checkerboard, hidden until near finish)
    this._buildFinishLine();
  }

  _createStreakLabel() {
    const { w, h } = this;
    this.streakLabel = this.add.text(w / 2, h * 0.35, '', {
      fontSize: `${Math.min(42, w * 0.06)}px`,
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);
  }

  _buildFinishLine() {
    const { w, h } = this;
    const roadTop = h * 0.40;
    const roadH = h * 0.30;
    const squareSize = 12;
    const cols = 2;
    const rows = Math.ceil(roadH / squareSize);
    const gfx = this.add.graphics().setDepth(1).setAlpha(0);
    this._finishLineGfx = gfx;
    this._finishLineX = w - SAFE_PADDING - 20; // matches trackEndX in _updateCarPositions
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLight = (r + c) % 2 === 0;
        gfx.fillStyle(isLight ? 0xffffff : 0x000000, 0.9);
        gfx.fillRect(c * squareSize, roadTop + r * squareSize, squareSize, squareSize);
      }
    }
    gfx.setX(this._finishLineX);
  }

  _updateProgressBar() {
    const { w } = this;
    const fraction = Math.min(1, this.playerWorldX / FINISH_LINE_X);
    this.progressBarFill.width = this._progressBarWidth * fraction;
    this.progressBarFill.setX(w / 2 - this._progressBarWidth / 2);
    const acc = this.problemsAnswered > 0 ? Math.round((this.correctAnswers / this.problemsAnswered) * 100) : 100;
    this.counterText.setText(`${acc}% accuracy · ${this.problemsAnswered} answered`);

    // Speed indicator
    const effectiveSpeed = Math.max(20, this.playerSpeed + this.speedModifier);
    const mph = Math.round(effectiveSpeed * 0.5);
    this.speedText.setText(`${mph} mph`);

    // Show finish line checkerboard when within 10% of finish
    if (this._finishLineGfx) {
      const show = fraction >= 0.90;
      this._finishLineGfx.setAlpha(show ? 1 : 0);
    }
  }

  // ─── Problem Flow ────────────────────────────────────────────────────────

  _nextProblem() {
    if (this.raceOver || this.playerFinished) {
      this.problemText.setText('🏁 FINISHED!');
      this._hideButtons();
      this.waitingForInput = false;
      return;
    }

    const tier = this.difficultyManager.getNextTier();
    const problem = this.mathEngine.generateProblem(this.trackConfig, tier);
    this.currentProblem = problem;
    this.problemText.setText(problem.displayText || `${problem.a} ${problem.operator} ${problem.b} = ?`);

    // Set answer button texts
    for (let i = 0; i < 4; i++) {
      this.answerButtons[i].text.setText(String(problem.answers[i]));
      this.answerButtons[i].bg.setFillStyle(0x334466);
      this.answerButtons[i].bg.setStrokeStyle(3, 0x6688aa);
      this.answerButtons[i].bg.setInteractive();
    }

    this.waitingForInput = true;
    this.feedbackText.setAlpha(0);
    this.problemShownAt = performance.now();
  }

  _onAnswer(idx) {
    if (!this.waitingForInput || this.raceOver) return;
    this.waitingForInput = false;

    const problem = this.currentProblem;
    const chosen = problem.answers[idx];
    const correct = chosen === problem.correct;

    this.problemsAnswered++;
    const answerTimeMs = performance.now() - this.problemShownAt;
    this.totalAnswerTimeMs += answerTimeMs;
    const avgTimeMs = this.problemsAnswered > 1
      ? this.totalAnswerTimeMs / this.problemsAnswered
      : 0;
    this.difficultyManager.recordAnswer(correct, answerTimeMs, avgTimeMs);

    if (correct) {
      this._onCorrect(idx);
    } else {
      this._onWrong(idx);
    }
  }

  _onCorrect(idx) {
    this.correctAnswers++;
    this.currentStreak++;
    if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

    // Flash button green
    this.answerButtons[idx].bg.setFillStyle(0x22aa44);
    this.answerButtons[idx].bg.setStrokeStyle(3, 0x44ff66);

    // Speed boost
    this.speedModifier = CORRECT_BOOST;
    this.speedModTimer = CORRECT_BOOST_DURATION;

    // Streak bonus check
    if (this.currentStreak === STREAK_NITRO || this.currentStreak === STREAK_TURBO || this.currentStreak === STREAK_SUPERCHARGE) {
      this._triggerStreakBonus(this.currentStreak);
    }

    // Update streak display
    this.streakText.setText(this.currentStreak > 1 ? `🔥 ${this.currentStreak}` : '');

    // Disable buttons, then next problem
    this._disableButtons();
    this.time.delayedCall(400, () => this._nextProblem());
  }

  _onWrong(idx) {
    this.currentStreak = 0;
    this.streakText.setText('');

    // Flash chosen button red
    this.answerButtons[idx].bg.setFillStyle(0xaa2222);
    this.answerButtons[idx].bg.setStrokeStyle(3, 0xff4444);

    // Highlight correct answer green
    const correctIdx = this.currentProblem.answerIndex;
    this.answerButtons[correctIdx].bg.setFillStyle(0x22aa44);
    this.answerButtons[correctIdx].bg.setStrokeStyle(3, 0x44ff66);

    // Show feedback
    this.feedbackText.setText(`✓ ${this.currentProblem.correct}`);
    this.feedbackText.setAlpha(1);

    // Slow down
    this.speedModifier = -WRONG_PENALTY;
    this.speedModTimer = WRONG_PENALTY_DURATION;

    // Disable buttons, then next problem after delay
    this._disableButtons();
    this.time.delayedCall(CORRECT_FLASH_DURATION, () => this._nextProblem());
  }

  _triggerStreakBonus(streak) {
    const bonus = STREAK_BOOST[streak];
    if (!bonus) return;

    // Extra speed
    this.speedModifier = bonus.speed;
    this.speedModTimer = bonus.duration;

    // Big label animation
    this.streakLabel.setText(bonus.label);
    this.streakLabel.setColor(`#${bonus.color.toString(16).padStart(6, '0')}`);
    this.streakLabel.setAlpha(1).setScale(0.5);

    this.tweens.add({
      targets: this.streakLabel,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
    });

    // Screen flash
    this.cameras.main.flash(200,
      (bonus.color >> 16) & 0xff,
      (bonus.color >> 8) & 0xff,
      bonus.color & 0xff
    );
  }

  _disableButtons() {
    for (const btn of this.answerButtons) {
      btn.bg.disableInteractive();
    }
  }

  _hideButtons() {
    for (const btn of this.answerButtons) {
      btn.bg.setAlpha(0.3);
      btn.text.setAlpha(0.3);
      btn.bg.disableInteractive();
    }
  }

  // ─── Race End ────────────────────────────────────────────────────────────

  _endRace() {
    if (this.raceOver) return;
    this.raceOver = true;

    // Fill in any who haven't finished yet
    const allIndices = [0, 1, 2, 3];
    for (const idx of allIndices) {
      if (!this.finishOrder.includes(idx)) {
        this.finishOrder.push(idx);
      }
    }

    // Determine player position (1-indexed)
    const playerPosition = this.finishOrder.indexOf(0) + 1;

    // Transition to results
    this.time.delayedCall(800, () => {
      this.scene.start('ResultsScene', {
        position: playerPosition,
        correct: this.correctAnswers,
        answered: this.problemsAnswered,
        streak: this.bestStreak,
        totalAnswerTimeMs: this.totalAnswerTimeMs,
        classId: this.classId,
        trackId: this.trackId,
      });
    });
  }
}
