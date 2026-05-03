/**
 * MathEngine — generates addition problems with smart distractors.
 *
 * Smart distractor strategies:
 *  - off-by-one: correct ± 1
 *  - wrong-operation: a - b  (or |a - b|)
 *  - nearby-value: correct ± small random (2-4)
 *  - digit-swap: swap tens/units of correct answer
 *  - carry-error: simulate forgetting a carry (subtract 10)
 */

export class MathEngine {
  /**
   * Generate a single addition problem.
   * @param {{ min: number, max: number }} range  operand range
   * @returns {{ a, b, correct, answers, answerIndex }}
   */
  generateProblem(range = { min: 1, max: 9 }) {
    const a = this._rand(range.min, range.max);
    const b = this._rand(range.min, range.max);
    const correct = a + b;

    const distractors = this._generateDistractors(a, b, correct);
    const answers = this._buildAnswerList(correct, distractors);

    return {
      a,
      b,
      correct,
      answers,          // array of 4 numbers, shuffled
      answerIndex: answers.indexOf(correct),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _generateDistractors(a, b, correct) {
    const candidates = new Set();

    // Off-by-one
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);

    // Wrong operation: subtraction |a - b|
    const sub = Math.abs(a - b);
    if (sub !== correct && sub > 0) candidates.add(sub);

    // Wrong operation: multiply (can be large but useful for variety)
    const mul = a * b;
    if (mul !== correct && mul > 0 && mul < correct + 20) candidates.add(mul);

    // Nearby values ±2..4
    for (let delta = 2; delta <= 4; delta++) {
      if (correct - delta > 0) candidates.add(correct - delta);
      candidates.add(correct + delta);
    }

    // Digit swap (e.g., 17 → 71) — only if result is positive and different
    if (correct >= 10) {
      const tens = Math.floor(correct / 10);
      const units = correct % 10;
      if (units !== 0) {
        const swapped = units * 10 + tens;
        if (swapped !== correct && swapped > 0) candidates.add(swapped);
      }
    }

    // Carry error: subtract 10
    if (correct - 10 > 0) candidates.add(correct - 10);

    // Remove the correct answer itself and anything ≤ 0
    candidates.delete(correct);
    for (const c of candidates) {
      if (c <= 0) candidates.delete(c);
    }

    // Shuffle and pick 3
    const arr = Array.from(candidates);
    this._shuffle(arr);
    return arr.slice(0, 3);
  }

  _buildAnswerList(correct, distractors) {
    // Pad if somehow we got fewer than 3 distractors
    while (distractors.length < 3) {
      let fallback = correct + this._rand(2, 8);
      while (distractors.includes(fallback) || fallback === correct) {
        fallback++;
      }
      distractors.push(fallback);
    }

    const answers = [correct, ...distractors.slice(0, 3)];
    this._shuffle(answers);
    return answers;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
