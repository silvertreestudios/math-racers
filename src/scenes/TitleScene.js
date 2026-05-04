/**
 * TitleScene — logo text + "RACE!" button.
 * All positions are proportional to actual screen size.
 */
import { SAFE_PADDING } from '../config/constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const cy = h / 2;

    // ── Background gradient (sky + road) ──────────────────────────────────
    this._drawBackground(w, h);

    // ── Animated road lines ───────────────────────────────────────────────
    this._roadLines = [];
    for (let i = 0; i < 8; i++) {
      const line = this.add.rectangle(
        i * (w / 7) - 10, h * 0.75 + 14,
        70, 8, 0xffffff, 0.8
      );
      this._roadLines.push(line);
    }

    // ── Logo ──────────────────────────────────────────────────────────────
    // Shadow
    this.add.text(cx + 4, cy - h * 0.2 + 4, 'MATH', {
      fontSize: `${Math.min(80, w * 0.1)}px`,
      fontStyle: 'bold',
      color: '#00000055',
      fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5);
    this.add.text(cx + 4, cy - h * 0.04 + 4, 'RACERS', {
      fontSize: `${Math.min(80, w * 0.1)}px`,
      fontStyle: 'bold',
      color: '#00000055',
      fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5);

    // Main text
    const mathText = this.add.text(cx, cy - h * 0.2, 'MATH', {
      fontSize: `${Math.min(80, w * 0.1)}px`,
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#003399',
      strokeThickness: 8,
    }).setOrigin(0.5);

    const racersText = this.add.text(cx, cy - h * 0.04, 'RACERS', {
      fontSize: `${Math.min(80, w * 0.1)}px`,
      fontStyle: 'bold',
      color: '#ffdd00',
      fontFamily: 'Arial Black, Arial',
      stroke: '#aa6600',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Pulse animation on logo
    this.tweens.add({
      targets: [mathText, racersText],
      scaleX: 1.04,
      scaleY: 1.04,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    });

    // ── Decorative cars ───────────────────────────────────────────────────
    this._drawDecoCar(cx - w * 0.2, cy + h * 0.12, 0x00aaff);
    this._drawDecoCar(cx + w * 0.1, cy + h * 0.12, 0xff4444);

    // ── RACE! button ──────────────────────────────────────────────────────
    const btnY = cy + h * 0.3;
    const btnBg = this.add.rectangle(cx, btnY, 260, 72, 0xff4400)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(4, 0xffffff);

    const btnText = this.add.text(cx, btnY, '🏁  RACE!', {
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5);

    // Button hover / press effects
    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0xff6622);
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.07, scaleY: 1.07, duration: 100 });
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0xff4400);
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 100 });
    });
    btnBg.on('pointerdown', () => {
      btnBg.setFillStyle(0xcc3300);
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 0.96, scaleY: 0.96, duration: 80 });
    });
    btnBg.on('pointerup', () => {
      this.cameras.main.flash(300, 255, 255, 255);
      this.time.delayedCall(320, () => this.scene.start('ClassSelectScene'));
    });

    // ── Bucks display ─────────────────────────────────────────────────────
    const progress = this.registry.get('progress');
    if (progress) {
      this.add.text(cx, h - SAFE_PADDING - 10, `💵 ${progress.bucks} Bucks`, {
        fontSize: '22px',
        color: '#ffdd00',
        fontFamily: 'Arial',
      }).setOrigin(0.5);
    }

    // ── Animated road scroll ──────────────────────────────────────────────
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        for (const line of this._roadLines) {
          line.x -= 4;
          if (line.x < -60) line.x += w + 100;
        }
      },
    });
  }

  _drawBackground(w, h) {
    const gfx = this.add.graphics();

    // Sky gradient
    gfx.fillGradientStyle(0x1a1a6e, 0x1a1a6e, 0x4488cc, 0x4488cc, 1);
    gfx.fillRect(0, 0, w, h * 0.65);

    // Mountains
    gfx.fillStyle(0x336699, 0.7);
    gfx.fillTriangle(w * 0.12, h * 0.65, w * 0.35, h * 0.35, w * 0.57, h * 0.65);
    gfx.fillTriangle(w * 0.37, h * 0.65, w * 0.65, h * 0.28, w * 0.9, h * 0.65);
    gfx.fillTriangle(w * 0.68, h * 0.65, w * 0.93, h * 0.38, w * 1.1, h * 0.65);

    // Ground / road
    gfx.fillGradientStyle(0x228833, 0x228833, 0x115522, 0x115522, 1);
    gfx.fillRect(0, h * 0.63, w, h * 0.1);

    gfx.fillStyle(0x555566);
    gfx.fillRect(0, h * 0.70, w, h * 0.30);
  }

  _drawDecoCar(x, y, color) {
    const gfx = this.add.graphics();
    gfx.fillStyle(color);
    gfx.fillRoundedRect(x, y, 90, 30, 8);
    gfx.fillStyle(0xaaddff, 0.8);
    gfx.fillRoundedRect(x + 20, y - 12, 40, 16, 6);
    gfx.fillStyle(0x222222);
    gfx.fillCircle(x + 18, y + 30, 10);
    gfx.fillCircle(x + 72, y + 30, 10);
    gfx.fillStyle(0xff8800);
    gfx.fillTriangle(x, y + 15, x - 20, y + 10, x - 20, y + 20);
  }
}
