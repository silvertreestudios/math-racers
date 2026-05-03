/**
 * ResultsScene — Post-race results: position, accuracy, bucks earned.
 */
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  BUCKS_BY_POSITION, BUCKS_ACCURACY_BONUS, BUCKS_STREAK_BONUS,
} from '../config/constants.js';

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data) {
    this.raceData = data;
  }

  create() {
    const { position, correct, answered, streak } = this.raceData;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    // ── Calculate bucks ───────────────────────────────────────────────────
    let bucksEarned = BUCKS_BY_POSITION[position - 1] || 5;
    if (accuracy === 100) bucksEarned += BUCKS_ACCURACY_BONUS;
    if (streak >= 5) bucksEarned += BUCKS_STREAK_BONUS;

    // Save progress
    const progress = this.registry.get('progress');
    if (progress) {
      progress.recordRace({ position, correct, answered, streak, bucksEarned });
    }

    // ── Background ────────────────────────────────────────────────────────
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2a2a5e, 0x2a2a5e, 1);
    gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cx = GAME_WIDTH / 2;
    let y = 40;

    // ── Position header ───────────────────────────────────────────────────
    const posLabels = ['🥇 1st Place!', '🥈 2nd Place!', '🥉 3rd Place!', '🏅 4th Place'];
    const posColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#88aacc'];

    this.add.text(cx, y, posLabels[position - 1], {
      fontSize: '48px',
      fontStyle: 'bold',
      color: posColors[position - 1],
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    y += 80;

    // ── Stats ─────────────────────────────────────────────────────────────
    const statsStyle = {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    };

    this.add.text(cx, y, `Accuracy: ${accuracy}% (${correct}/${answered})`, statsStyle).setOrigin(0.5);
    y += 40;

    this.add.text(cx, y, `Best Streak: ${streak} 🔥`, statsStyle).setOrigin(0.5);
    y += 60;

    // ── Bucks breakdown ───────────────────────────────────────────────────
    const bucksStyle = { fontSize: '20px', color: '#aaccff', fontFamily: 'Arial' };
    const breakdownLines = [`Race finish: 💵 ${BUCKS_BY_POSITION[position - 1] || 5}`];
    if (accuracy === 100) breakdownLines.push(`Perfect accuracy: 💵 ${BUCKS_ACCURACY_BONUS}`);
    if (streak >= 5) breakdownLines.push(`Streak bonus: 💵 ${BUCKS_STREAK_BONUS}`);

    for (const line of breakdownLines) {
      this.add.text(cx, y, line, bucksStyle).setOrigin(0.5);
      y += 30;
    }

    y += 20;

    // Total bucks earned
    this.add.text(cx, y, `Total: 💵 ${bucksEarned}`, {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffdd00',
      fontFamily: 'Arial Black, Arial',
      stroke: '#886600',
      strokeThickness: 3,
    }).setOrigin(0.5);

    y += 30;

    // Wallet balance
    const totalBucks = progress ? progress.bucks : bucksEarned;
    this.add.text(cx, y, `Wallet: 💵 ${totalBucks}`, {
      fontSize: '18px',
      color: '#88aa88',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // ── RACE AGAIN button ─────────────────────────────────────────────────
    const btnY = GAME_HEIGHT - 70;
    const btnBg = this.add.rectangle(cx, btnY, 260, 64, 0xff4400)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(4, 0xffffff);

    const btnText = this.add.text(cx, btnY, '🏁  RACE AGAIN', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0xff6622);
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0xff4400);
      this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 100 });
    });
    btnBg.on('pointerdown', () => {
      btnBg.setFillStyle(0xcc3300);
    });
    btnBg.on('pointerup', () => {
      this.scene.start('RaceScene');
    });

    // ── Celebrate if 1st place ────────────────────────────────────────────
    if (position === 1) {
      this.cameras.main.flash(400, 255, 215, 0);
      // Confetti-like particles
      for (let i = 0; i < 30; i++) {
        const px = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const py = Phaser.Math.Between(-20, -200);
        const colors = [0xffd700, 0xff4444, 0x44ff44, 0x4488ff, 0xff88ff];
        const c = colors[i % colors.length];
        const particle = this.add.rectangle(px, py, 8, 8, c).setDepth(50);
        this.tweens.add({
          targets: particle,
          y: GAME_HEIGHT + 20,
          x: px + Phaser.Math.Between(-60, 60),
          angle: Phaser.Math.Between(0, 360),
          duration: Phaser.Math.Between(1500, 3000),
          ease: 'Quad.easeIn',
        });
      }
    }
  }
}
