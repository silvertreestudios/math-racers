import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { RaceScene } from './scenes/RaceScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { ProgressManager } from './systems/ProgressManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';

// Instantiate global progress manager and share via Phaser registry
const progress = new ProgressManager();

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, RaceScene, ResultsScene],
  callbacks: {
    preBoot: (game) => {
      game.registry.set('progress', progress);
    },
  },
};

new Phaser.Game(config);
