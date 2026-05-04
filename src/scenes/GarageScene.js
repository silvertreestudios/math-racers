/**
 * GarageScene — car customization: recolor and attach cosmetics.
 * Layout (landscape ~800×480):
 *   Left 40%: large car preview + class navigation arrows
 *   Right 60%: color palette + attachment grid
 */
import Phaser from 'phaser';
import { SAFE_PADDING } from '../config/constants.js';
import { CLASSES } from '../config/tracks.js';
import { CAR_DRAW_FN } from '../systems/CarRenderer.js';
import { ATTACHMENTS, ATTACHMENTS_BY_CLASS } from '../config/attachments.js';
import { CAR_COLORS_BY_CLASS } from '../config/cars.js';

const CLASS_ORDER = ['addition', 'subtraction', 'multiplication', 'division', 'advanced'];

// 8 preset recolor options per class (using the class palette + extras)
const PALETTE = [0x00cccc, 0xff4444, 0x44ff44, 0xffaa00, 0xcc44ff, 0xff88cc, 0x4488ff, 0xffffff];

const RECOLOR_COST = 10000;

export class GarageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    this.w = this.scale.width;
    this.h = this.scale.height;

    this._progress = this.registry.get('progress');

    // Determine which classes are unlocked
    this._unlockedClasses = CLASS_ORDER.filter(id => this._progress && this._progress.isClassUnlocked(id));
    if (this._unlockedClasses.length === 0) this._unlockedClasses = ['addition'];

    this._classIndex = 0;
    this._pendingColor = null;  // color pending purchase confirmation

    this._drawBackground();
    this._buildStaticUI();
    this._renderScene();
  }

  // ─── Background ───────────────────────────────────────────────────────────

  _drawBackground() {
    const { w, h } = this;
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a1a4a, 0x1a1a4a, 1);
    gfx.fillRect(0, 0, w, h);
    // floor stripe
    gfx.fillStyle(0x111133, 0.8);
    gfx.fillRect(0, h * 0.72, w, h * 0.28);
    gfx.setDepth(-10);
  }

  // ─── Static chrome (title, back button, bucks) ────────────────────────────

  _buildStaticUI() {
    const { w, h } = this;
    const cx = w / 2;

    // Title
    this.add.text(cx, SAFE_PADDING + 10, '🔧 GARAGE', {
      fontSize: `${Math.min(30, w * 0.04)}px`,
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      stroke: '#003399',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(5);

    // Bucks display (top-right) — kept as instance var for updates
    this._bucksText = this.add.text(w - SAFE_PADDING, SAFE_PADDING, `💵 ${this._getBucks()}`, {
      fontSize: '18px',
      color: '#ffdd00',
      fontFamily: 'Arial',
    }).setOrigin(1, 0).setDepth(5);

    // Back button (bottom-left)
    const backW = 110, backH = 44;
    const backX = SAFE_PADDING + backW / 2;
    const backY = h - SAFE_PADDING - backH / 2;
    const backBg = this.add.rectangle(backX, backY, backW, backH, 0x334455)
      .setStrokeStyle(2, 0x6688aa)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);
    this.add.text(backX, backY, '← Back', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(6);
    backBg.on('pointerup', () => this.scene.start('TitleScene'));
  }

  // ─── Full scene render (call when switching class) ────────────────────────

  _renderScene() {
    // Destroy previous dynamic objects
    if (this._dynamicGroup) this._dynamicGroup.destroy(true);
    this._dynamicGroup = this.add.group();

    const classId = this._unlockedClasses[this._classIndex];
    const classCfg = CLASSES[classId];
    const customization = this._progress ? this._progress.getCarCustomization(classId) : { color: null, equipped: [] };
    this._currentColor = customization.color || CAR_COLORS_BY_CLASS[classId][0];
    this._equippedList = [...(customization.equipped || [])];
    this._pendingColor = null;
    this._currentClassId = classId;

    this._renderCarPanel(classId, classCfg);
    this._renderRightPanel(classId, customization);
    this._updateBucks();
  }

  // ─── Left panel: large car preview ────────────────────────────────────────

  _renderCarPanel(classId, classCfg) {
    const { w, h } = this;
    const panelW = w * 0.38;
    const panelCx = SAFE_PADDING + panelW / 2;
    const carY = h * 0.42;

    // Car class label
    const lbl = this.add.text(panelCx, SAFE_PADDING + 48, `${classCfg.emoji} ${classCfg.carType}`, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#aaddff',
      fontFamily: 'Arial',
    }).setOrigin(0.5, 0).setDepth(5);
    this._dynamicGroup.add(lbl);

    // Car container (drawn at normal scale, then scaled up)
    this._carContainer = this.add.container(panelCx, carY).setDepth(4);
    this._dynamicGroup.add(this._carContainer);
    this._carContainer.setScale(2.8);

    this._redrawCarPreview();

    // Left / Right arrows (only if multiple unlocked classes)
    if (this._unlockedClasses.length > 1) {
      const arrowY = carY;
      const arrowStyle = { fontSize: '32px', color: '#ffffff', fontFamily: 'Arial' };

      const leftArrow = this.add.text(SAFE_PADDING + 4, arrowY, '◀', arrowStyle)
        .setOrigin(0, 0.5).setDepth(6)
        .setInteractive({ useHandCursor: true });
      leftArrow.on('pointerup', () => this._changeClass(-1));
      leftArrow.on('pointerover', () => leftArrow.setAlpha(0.7));
      leftArrow.on('pointerout', () => leftArrow.setAlpha(1));
      this._dynamicGroup.add(leftArrow);

      const rightArrow = this.add.text(panelW + SAFE_PADDING - 4, arrowY, '▶', arrowStyle)
        .setOrigin(1, 0.5).setDepth(6)
        .setInteractive({ useHandCursor: true });
      rightArrow.on('pointerup', () => this._changeClass(1));
      rightArrow.on('pointerover', () => rightArrow.setAlpha(0.7));
      rightArrow.on('pointerout', () => rightArrow.setAlpha(1));
      this._dynamicGroup.add(rightArrow);
    }

    // Class name below car
    const classNameY = carY + 70;
    const nameTxt = this.add.text(panelCx, classNameY, classCfg.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);
    this._dynamicGroup.add(nameTxt);
  }

  _redrawCarPreview() {
    // Clear and redraw car inside the container
    this._carContainer.removeAll(true);

    const classId = this._currentClassId;
    const drawFn = CAR_DRAW_FN[classId] || CAR_DRAW_FN['addition'];

    const gfx = this.add.graphics();
    drawFn(gfx, this._currentColor, true);

    // Draw equipped attachments
    for (const attachId of this._equippedList) {
      const def = ATTACHMENTS.find(a => a.id === attachId);
      if (def) def.draw(gfx, this._currentColor);
    }

    this._carContainer.add(gfx);
  }

  // ─── Right panel: color picker + attachments ──────────────────────────────

  _renderRightPanel(classId, customization) {
    const { w, h } = this;
    const panelX = w * 0.40 + SAFE_PADDING;
    const panelW = w - panelX - SAFE_PADDING;
    let curY = SAFE_PADDING + 52;

    // ── Color section ──────────────────────────────────────────────────
    const colorLbl = this.add.text(panelX, curY, '🎨 COLOR', {
      fontSize: '16px', fontStyle: 'bold', color: '#aaddff', fontFamily: 'Arial',
    }).setOrigin(0, 0).setDepth(5);
    this._dynamicGroup.add(colorLbl);
    curY += 24;

    const swatchSize = 34;
    const swatchGap = 6;
    for (let i = 0; i < PALETTE.length; i++) {
      const sx = panelX + i * (swatchSize + swatchGap);
      const sy = curY;
      const col = PALETTE[i];

      const swatch = this.add.rectangle(sx + swatchSize / 2, sy + swatchSize / 2, swatchSize, swatchSize, col)
        .setStrokeStyle(2, this._currentColor === col ? 0xffffff : 0x444444)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);
      this._dynamicGroup.add(swatch);

      swatch.on('pointerup', () => this._onSwatchTap(col, swatch));
    }

    curY += swatchSize + 8;

    // Confirm color button (shown when pending purchase)
    this._confirmColorBtn = this.add.rectangle(panelX + panelW / 2, curY + 16, 180, 34, 0x225522)
      .setStrokeStyle(2, 0x44ff44)
      .setInteractive({ useHandCursor: true })
      .setDepth(5)
      .setVisible(false);
    this._confirmColorTxt = this.add.text(panelX + panelW / 2, curY + 16, `Confirm 💵${RECOLOR_COST.toLocaleString()}`, {
      fontSize: '14px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(6).setVisible(false);
    this._dynamicGroup.add(this._confirmColorBtn);
    this._dynamicGroup.add(this._confirmColorTxt);

    this._confirmColorBtn.on('pointerup', () => this._confirmColorPurchase());

    curY += 44;

    // Separator
    const sep = this.add.rectangle(panelX + panelW / 2, curY, panelW, 1, 0x334466).setDepth(5);
    this._dynamicGroup.add(sep);
    curY += 8;

    // ── Attachments section ────────────────────────────────────────────
    const attachLbl = this.add.text(panelX, curY, '⚙ ATTACHMENTS', {
      fontSize: '16px', fontStyle: 'bold', color: '#aaddff', fontFamily: 'Arial',
    }).setOrigin(0, 0).setDepth(5);
    this._dynamicGroup.add(attachLbl);
    curY += 24;

    const attachments = ATTACHMENTS_BY_CLASS[classId] || [];
    const garageData = this._progress ? (this._progress.data.garage[classId] || {}) : {};
    const ownedList = garageData.ownedAttachments || [];

    const colCount = 3;
    const cardW = Math.floor((panelW - (colCount - 1) * 6) / colCount);
    const cardH = 52;
    const cardGap = 6;

    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const cx = panelX + col * (cardW + cardGap);
      const cy = curY + row * (cardH + cardGap);

      // Don't draw if it would go below screen
      if (cy + cardH > h - SAFE_PADDING - 50) continue;

      const isOwned = ownedList.includes(att.id);
      const isEquipped = this._equippedList.includes(att.id);

      const cardColor = isEquipped ? 0x224422 : (isOwned ? 0x2a2a3a : 0x1a1a2e);
      const strokeColor = isEquipped ? 0x44ff44 : (isOwned ? 0x666688 : 0x334466);

      const card = this.add.rectangle(cx + cardW / 2, cy + cardH / 2, cardW, cardH, cardColor)
        .setStrokeStyle(2, strokeColor)
        .setInteractive({ useHandCursor: true })
        .setDepth(5);
      this._dynamicGroup.add(card);

      const nameTxt = this.add.text(cx + 6, cy + 8, att.name, {
        fontSize: '12px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Arial',
        wordWrap: { width: cardW - 10 },
      }).setOrigin(0, 0).setDepth(6);
      this._dynamicGroup.add(nameTxt);

      let statusStr, statusColor;
      if (isEquipped) {
        statusStr = '✓ Equipped';
        statusColor = '#44ff44';
      } else if (isOwned) {
        statusStr = 'Owned';
        statusColor = '#aaaaaa';
      } else {
        statusStr = `💵 ${att.cost.toLocaleString()}`;
        statusColor = '#ffdd00';
      }

      const statusTxt = this.add.text(cx + 6, cy + 32, statusStr, {
        fontSize: '11px', color: statusColor, fontFamily: 'Arial',
      }).setOrigin(0, 0).setDepth(6);
      this._dynamicGroup.add(statusTxt);

      // Tap handler
      card.on('pointerup', () => this._onAttachmentTap(att, isOwned, isEquipped));
    }
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  _changeClass(dir) {
    this._classIndex = (this._classIndex + dir + this._unlockedClasses.length) % this._unlockedClasses.length;
    this._renderScene();
  }

  _onSwatchTap(color, swatchRect) {
    const garageData = this._progress ? (this._progress.data.garage[this._currentClassId] || {}) : {};
    const ownedColor = garageData.color;

    if (color === ownedColor || color === (CAR_COLORS_BY_CLASS[this._currentClassId] || [])[0]) {
      // Free apply — it's the default color or already purchased
      this._currentColor = color;
      this._pendingColor = null;
      this._hideConfirmColor();
      this._redrawCarPreview();
    } else if (color === this._pendingColor) {
      // Tapping the same pending color again — cancel
      this._pendingColor = null;
      this._currentColor = (this._progress ? this._progress.getCarCustomization(this._currentClassId) : {}).color
        || CAR_COLORS_BY_CLASS[this._currentClassId][0];
      this._hideConfirmColor();
      this._redrawCarPreview();
    } else {
      // New color — preview it and show confirm button
      this._pendingColor = color;
      this._currentColor = color;
      this._redrawCarPreview();
      this._showConfirmColor();
    }
  }

  _showConfirmColor() {
    this._confirmColorBtn.setVisible(true);
    this._confirmColorTxt.setVisible(true);
  }

  _hideConfirmColor() {
    this._confirmColorBtn.setVisible(false);
    this._confirmColorTxt.setVisible(false);
  }

  _confirmColorPurchase() {
    if (!this._pendingColor || !this._progress) return;
    const success = this._progress.purchaseColor(this._currentClassId, this._pendingColor);
    if (success) {
      this._pendingColor = null;
      this._hideConfirmColor();
      this._updateBucks();
      // Re-render to refresh swatches
      this._renderScene();
    } else {
      // Not enough bucks — flash the confirm button red
      this._confirmColorBtn.setFillStyle(0x552222);
      this._confirmColorTxt.setText('Not enough bucks!');
      this.time.delayedCall(1200, () => {
        if (this._confirmColorBtn.active) {
          this._confirmColorBtn.setFillStyle(0x225522);
          this._confirmColorTxt.setText(`Confirm 💵${RECOLOR_COST.toLocaleString()}`);
        }
      });
    }
  }

  _onAttachmentTap(att, isOwned, isEquipped) {
    if (!this._progress) return;
    if (!isOwned) {
      // Attempt purchase
      const success = this._progress.purchaseAttachment(this._currentClassId, att.id);
      if (success) {
        // Auto-equip after purchase
        this._progress.toggleAttachment(this._currentClassId, att.id);
        this._updateBucks();
        this._renderScene();
      } else {
        // Flash insufficient funds — briefly show a message
        this._showToast('Not enough bucks! 💵');
      }
    } else if (isEquipped) {
      // Unequip
      this._progress.toggleAttachment(this._currentClassId, att.id);
      this._renderScene();
    } else {
      // Equip (owned but not equipped)
      this._progress.toggleAttachment(this._currentClassId, att.id);
      this._renderScene();
    }
  }

  _showToast(msg) {
    const { w, h } = this;
    const toast = this.add.text(w / 2, h / 2, msg, {
      fontSize: '22px', fontStyle: 'bold', color: '#ff4444',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: toast, alpha: 0, y: h / 2 - 40, duration: 1200, ease: 'Power2',
      onComplete: () => toast.destroy() });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _getBucks() {
    return this._progress ? this._progress.bucks : 0;
  }

  _updateBucks() {
    if (this._bucksText && this._bucksText.active) {
      this._bucksText.setText(`💵 ${this._getBucks().toLocaleString()}`);
    }
  }
}
