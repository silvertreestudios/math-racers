/**
 * BootScene — preload assets (MVP: generate them programmatically).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // MVP uses only programmatically-generated graphics — nothing to load.
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 0, 20, 0x00aaff);
    this.load.on('progress', (v) => {
      bar.width = width * 0.6 * v;
    });
  }

  create() {
    const progress = this.registry.get('progress');
    if (progress && progress.isFirstRun) {
      this.scene.start('NameEntryScene');
    } else {
      this.scene.start('TitleScene');
    }
  }
}
