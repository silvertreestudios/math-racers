import { AI_SPEEDS } from '../config/constants.js';

/**
 * AIRacer — manages a single AI car's position.
 * MVP: constant speed, no mistakes.
 */
export class AIRacer {
  /**
   * @param {number} index  0-based AI index (0 = fastest)
   */
  constructor(index) {
    this.index = index;
    this.speed = AI_SPEEDS[index] ?? 90; // px/s in world space
    this.worldX = 0;
    this.finished = false;
    this.finishTime = null;
  }

  /**
   * @param {number} delta  ms since last frame
   * @param {number} finishLineX  world X of finish line
   */
  update(delta, finishLineX) {
    if (this.finished) return;
    this.worldX += this.speed * (delta / 1000);
    if (this.worldX >= finishLineX) {
      this.worldX = finishLineX;
      this.finished = true;
      this.finishTime = performance.now();
    }
  }

  reset() {
    this.worldX = 0;
    this.finished = false;
    this.finishTime = null;
  }
}
