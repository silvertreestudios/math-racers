/**
 * RaceScene — Core gameplay: side-scrolling race with math problems.
 * All positions proportional to actual screen size.
 */
import Phaser from 'phaser';
import { MathEngine } from '../systems/MathEngine.js';
import { AIRacer } from '../systems/AIRacer.js';
import {
  SAFE_PADDING,
  PLAYER_BASE_SPEED, CORRECT_BOOST, CORRECT_BOOST_DURATION,
  WRONG_PENALTY, WRONG_PENALTY_DURATION, CORRECT_FLASH_DURATION,
  AI_SPEEDS, STREAK_NITRO, STREAK_TURBO, STREAK_SUPERCHARGE, STREAK_BOOST,
  FINISH_LINE_X, CAR_COLORS, CAR_NAMES,
  PARALLAX_SPEEDS,
} from '../config/constants.js';

export class RaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RaceScene' });
  }

  create() {
    this.w = this.scale.width;
    this.h = this.scale.height;

    this.mathEngine = new MathEngine();

    // Get player historic stats for AI calibration
    const progress = this.registry.get('progress');
    const playerAccuracy = progress ? progress.accuracy : 0.8;
    const playerAvgTime = progress ? (progress.avgAnswerTimeMs || 3000) : 3000;

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

    for (let i = 0; i < 4; i++) {
      const gfx = this.add.graphics().setDepth(i === 0 ? 5 : 3);
      const color = CAR_COLORS[i];
      const y = lanes[i];

      // Car body
      gfx.fillStyle(color);
      gfx.fillRoundedRect(-30, -12, 60, 24, 6);
      // Cockpit
      gfx.fillStyle(0xaaddff, 0.8);
      gfx.fillRoundedRect(-8, -18, 28, 10, 4);
      // Wheels
      gfx.fillStyle(0x222222);
      gfx.fillCircle(-16, 14, 7);
      gfx.fillCircle(16, 14, 7);

      gfx.setPosition(SAFE_PADDING + 40, y);
      this.carSprites.push({ gfx, baseY: y, index: i });

      // Name tag
      const name = this.add.text(SAFE_PADDING + 40, y - 26, CAR_NAMES[i], {
        fontSize: '12px',
        color: i === 0 ? '#00ffff' : '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6);
      this.carSprites[i].nameTag = name;
    }
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

  _updateProgressBar() {
    const { w } = this;
    const fraction = Math.min(1, this.playerWorldX / FINISH_LINE_X);
    this.progressBarFill.width = this._progressBarWidth * fraction;
    this.progressBarFill.setX(w / 2 - this._progressBarWidth / 2);
    const acc = this.problemsAnswered > 0 ? Math.round((this.correctAnswers / this.problemsAnswered) * 100) : 100;
    this.counterText.setText(`${acc}% accuracy · ${this.problemsAnswered} answered`);
  }

  // ─── Problem Flow ────────────────────────────────────────────────────────

  _nextProblem() {
    if (this.raceOver || this.playerFinished) {
      this.problemText.setText('🏁 FINISHED!');
      this._hideButtons();
      this.waitingForInput = false;
      return;
    }

    const problem = this.mathEngine.generateProblem({ min: 1, max: 9 });
    this.currentProblem = problem;
    this.problemText.setText(`${problem.a} + ${problem.b} = ?`);

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
    this.totalAnswerTimeMs += performance.now() - this.problemShownAt;

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
      });
    });
  }
}
