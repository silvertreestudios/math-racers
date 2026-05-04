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
    // Debug: check response headers for Clear-Site-Data or other storage-clearing headers
    fetch(location.href, { method: 'HEAD' })
      .then(r => {
        console.log(`[Header] status=${r.status} url=${r.url}`);
        r.headers.forEach((v, k) => console.log(`[Header] ${k}: ${v}`));
      })
      .catch(e => console.warn('[Header check failed]', e));

    this.scene.start('TitleScene');
  }
}
