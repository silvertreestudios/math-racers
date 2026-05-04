import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { ClassSelectScene } from './scenes/ClassSelectScene.js';
import { TrackSelectScene } from './scenes/TrackSelectScene.js';
import { RaceScene } from './scenes/RaceScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { ProgressManager } from './systems/ProgressManager.js';

// Instantiate global progress manager and share via Phaser registry
const progress = new ProgressManager();

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  scene: [BootScene, TitleScene, ClassSelectScene, TrackSelectScene, RaceScene, ResultsScene],
  callbacks: {
    preBoot: (game) => {
      game.registry.set('progress', progress);
    },
  },
};

const game = new Phaser.Game(config);

// Expose the game instance globally so ProgressManager can emit events
// to active scenes (e.g. after async IDB recovery on first load).
globalThis.__phaserGame = game;
