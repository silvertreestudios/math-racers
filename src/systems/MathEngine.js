/**
 * MathEngine — generates arithmetic problems for all 4 operations.
 *
 * Smart distractor strategies per operation:
 *  Addition:       off-by-one, wrong-op (sub/mul), nearby, digit-swap, carry-error
 *  Subtraction:    off-by-one, wrong-op (add/wrong sign), nearby, borrow-error, digit-swap
 *  Multiplication: off-by-one, wrong-op (add instead), nearby, digit-swap, off-by-factor
 *  Division:       off-by-one, wrong-op (multiply back), nearby, remainder-confusion
 */

export class MathEngine {
  constructor() {
    /** Tracks the last N problem keys seen this race to avoid repeats. */
    this._recentKeys = [];
    this._historySize = 5;
  }

  /** Call at the start of each race to clear repeat-prevention history. */
  reset() {
    this._recentKeys = [];
  }

  /**
   * Generate a single problem for the given track config.
   * Avoids repeating any of the last 5 problems (same operands + operator).
   * Bails out after 10 attempts; if still colliding, only guarantees no
   * back-to-back repeat (prevents the worst case on tiny number ranges).
   * @param {object} trackConfig  Full track object from tracks.js
   * @param {'easy'|'medium'|'full'} [tier='full']  Difficulty tier from DifficultyManager
   * @returns {{ a, b, correct, answers, answerIndex, operator }}
   */
  generateProblem(trackConfig, tier = 'full') {
    const op = trackConfig.classId || 'addition';
    const MAX_TRIES = 10;

    let problem;
    let lastKey = this._recentKeys[this._recentKeys.length - 1] ?? null;

    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      problem = this._generate(op, trackConfig, tier);
      const key = `${problem.operator}${problem.a}_${problem.b}_${problem.c ?? ''}`;

      // Accept if not in recent history (full dedup window)
      if (!this._recentKeys.includes(key)) {
        this._pushKey(key);
        return problem;
      }

      // After exhausting attempts, at least avoid exact back-to-back
      if (attempt === MAX_TRIES - 1 && key !== lastKey) {
        this._pushKey(key);
        return problem;
      }
    }

    // Absolute fallback — return whatever we last generated
    const key = `${problem.operator}${problem.a}_${problem.b}_${problem.c ?? ''}`;
    this._pushKey(key);
    return problem;
  }

  _pushKey(key) {
    this._recentKeys.push(key);
    if (this._recentKeys.length > this._historySize) {
      this._recentKeys.shift();
    }
  }

  _generate(op, trackConfig, tier = 'full') {
    switch (op) {
      case 'subtraction':    return this._subtraction(trackConfig, tier);
      case 'multiplication': return this._multiplication(trackConfig, tier);
      case 'division':       return this._division(trackConfig, tier);
      case 'advanced':       return this._advanced(trackConfig, tier);
      default:               return this._addition(trackConfig, tier);
    }
  }

  // ─── Operations ──────────────────────────────────────────────────────────

  _addition(track, tier = 'full') {
    let a, b;
    if (tier === 'easy') {
      // No carrying: keep both operands ≤ 49. Fall through to full if track min > 49.
      const aMax = Math.min(track.operandA.max, 49);
      const bMax = Math.min(track.operandB.max, 49);
      if (aMax >= track.operandA.min && bMax >= track.operandB.min) {
        let tries = 0;
        do {
          a = this._rand(track.operandA.min, aMax);
          b = this._rand(track.operandB.min, bMax);
          tries++;
        } while (!this._additionNoCarry(a, b) && tries < 20);
      } else {
        // Track range exceeds easy constraints — fall through to full difficulty
        a = this._rand(track.operandA.min, track.operandA.max);
        b = this._rand(track.operandB.min, track.operandB.max);
      }
    } else if (tier === 'medium') {
      // At most one carry — allow values ≤ 99. Fall through to full if track min > 99.
      const aMax = Math.min(track.operandA.max, 99);
      const bMax = Math.min(track.operandB.max, 99);
      if (aMax >= track.operandA.min && bMax >= track.operandB.min) {
        let tries = 0;
        do {
          a = this._rand(track.operandA.min, aMax);
          b = this._rand(track.operandB.min, bMax);
          tries++;
        } while (this._additionCarryCount(a, b) > 1 && tries < 20);
      } else {
        a = this._rand(track.operandA.min, track.operandA.max);
        b = this._rand(track.operandB.min, track.operandB.max);
      }
    } else {
      a = this._rand(track.operandA.min, track.operandA.max);
      b = this._rand(track.operandB.min, track.operandB.max);
    }
    const correct = a + b;
    const distractors = this._additionDistractors(a, b, correct);
    const answers = this._buildAnswerList(correct, distractors);
    return { a, b, correct, answers, answerIndex: answers.indexOf(correct), operator: '+' };
  }

  /** True when adding a + b requires no carrying at any digit position */
  _additionNoCarry(a, b) {
    let carry = 0;
    let x = a, y = b;
    while (x > 0 || y > 0) {
      const col = (x % 10) + (y % 10) + carry;
      if (col > 9) return false;
      carry = Math.floor(col / 10);
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return true;
  }

  /** Count carry operations when adding a + b */
  _additionCarryCount(a, b) {
    let carry = 0, count = 0;
    let x = a, y = b;
    while (x > 0 || y > 0) {
      const col = (x % 10) + (y % 10) + carry;
      carry = Math.floor(col / 10);
      if (carry) count++;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return count;
  }

  _subtraction(track, tier = 'full') {
    let a, b;
    if (tier === 'easy') {
      // No borrowing. Fall through to full if track min > 99.
      const aMax = Math.min(track.operandA.max, 99);
      const bMax = Math.min(track.operandB.max, 99);
      if (aMax >= track.operandA.min && bMax >= track.operandB.min) {
        let tries = 0;
        do {
          a = this._rand(track.operandA.min, aMax);
          b = this._rand(track.operandB.min, Math.min(bMax, a));
          tries++;
        } while (!this._subtractionNoBorrow(a, b) && tries < 20);
      } else {
        a = this._rand(track.operandA.min, track.operandA.max);
        b = this._rand(track.operandB.min, track.operandB.max);
      }
    } else if (tier === 'medium') {
      // At most one borrow. Fall through to full if track min > 99.
      const aMax = Math.min(track.operandA.max, 99);
      const bMax = Math.min(track.operandB.max, 99);
      if (aMax >= track.operandA.min && bMax >= track.operandB.min) {
        let tries = 0;
        do {
          a = this._rand(track.operandA.min, aMax);
          b = this._rand(track.operandB.min, Math.min(bMax, a));
          tries++;
        } while (this._subtractionBorrowCount(a, b) > 1 && tries < 20);
      } else {
        a = this._rand(track.operandA.min, track.operandA.max);
        b = this._rand(track.operandB.min, track.operandB.max);
      }
    } else {
      a = this._rand(track.operandA.min, track.operandA.max);
      b = this._rand(track.operandB.min, track.operandB.max);
    }
    // Ensure a >= b so answer is positive
    b = Math.min(b, a - 1 > 0 ? a - 1 : a);
    if (b <= 0) b = 1;
    if (a <= b) a = b + this._rand(1, 5);
    const correct = a - b;
    const distractors = this._subtractionDistractors(a, b, correct);
    const answers = this._buildAnswerList(correct, distractors);
    return { a, b, correct, answers, answerIndex: answers.indexOf(correct), operator: '−' };
  }

  /** True when a - b requires no borrowing */
  _subtractionNoBorrow(a, b) {
    let x = a, y = b;
    while (x > 0 || y > 0) {
      if ((x % 10) < (y % 10)) return false;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return true;
  }

  /** Count borrow operations needed for a - b */
  _subtractionBorrowCount(a, b) {
    let borrow = 0, count = 0;
    let x = a, y = b;
    while (x > 0 || y > 0) {
      let col = (x % 10) - (y % 10) - borrow;
      if (col < 0) { borrow = 1; count++; } else { borrow = 0; }
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return count;
  }

  _multiplication(track, tier = 'full') {
    let a, b;
    if (tier === 'easy') {
      // One operand is a single digit. Fall through to full if track min > 9.
      const aEasyMax = Math.min(track.operandA.max, 9);
      const bEasyMax = Math.min(track.operandB.max, 9);
      if (aEasyMax >= track.operandA.min) {
        a = this._rand(Math.max(track.operandA.min, 2), aEasyMax);
        b = this._rand(track.operandB.min, track.operandB.max);
      } else if (bEasyMax >= track.operandB.min) {
        a = this._rand(track.operandA.min, track.operandA.max);
        b = this._rand(Math.max(track.operandB.min, 2), bEasyMax);
      } else {
        // Both ranges exceed single-digit — use lower half of each range
        const aMid = Math.floor((track.operandA.min + track.operandA.max) / 2);
        const bMid = Math.floor((track.operandB.min + track.operandB.max) / 2);
        a = this._rand(track.operandA.min, aMid);
        b = this._rand(track.operandB.min, bMid);
      }
    } else if (tier === 'medium') {
      // Lower half of each range
      const aMid = Math.floor((track.operandA.min + track.operandA.max) / 2);
      const bMid = Math.floor((track.operandB.min + track.operandB.max) / 2);
      a = this._rand(track.operandA.min, aMid);
      b = this._rand(track.operandB.min, bMid);
    } else {
      a = this._rand(track.operandA.min, track.operandA.max);
      b = this._rand(track.operandB.min, track.operandB.max);
    }
    const correct = a * b;
    const distractors = this._multiplicationDistractors(a, b, correct);
    const answers = this._buildAnswerList(correct, distractors);
    return { a, b, correct, answers, answerIndex: answers.indexOf(correct), operator: '×' };
  }

  _division(track, tier = 'full') {
    // Build clean division: dividend = divisor × quotient (no remainder)
    let divisor, quotient;
    if (tier === 'easy') {
      // Small divisor (2-5), single-digit quotient. Fall through if track min exceeds caps.
      const divMax = Math.min(track.divisorRange.max, 5);
      const qMax   = Math.min(track.quotientRange.max, 9);
      if (divMax >= track.divisorRange.min && qMax >= track.quotientRange.min) {
        divisor  = this._rand(track.divisorRange.min, divMax);
        quotient = this._rand(track.quotientRange.min, qMax);
      } else {
        divisor  = this._rand(track.divisorRange.min, track.divisorRange.max);
        quotient = this._rand(track.quotientRange.min, track.quotientRange.max);
      }
    } else if (tier === 'medium') {
      // Lower half of each range
      const divMid = Math.floor((track.divisorRange.min + track.divisorRange.max) / 2);
      const qMid   = Math.floor((track.quotientRange.min + track.quotientRange.max) / 2);
      divisor  = this._rand(track.divisorRange.min, divMid);
      quotient = this._rand(track.quotientRange.min, qMid);
    } else {
      divisor  = this._rand(track.divisorRange.min, track.divisorRange.max);
      quotient = this._rand(track.quotientRange.min, track.quotientRange.max);
    }
    const dividend = divisor * quotient;
    const correct = quotient;
    const distractors = this._divisionDistractors(dividend, divisor, correct);
    const answers = this._buildAnswerList(correct, distractors);
    return { a: dividend, b: divisor, correct, answers, answerIndex: answers.indexOf(correct), operator: '÷' };
  }

  // ─── Advanced (Superclass) ────────────────────────────────────────────────

  _advanced(track, tier) {
    switch (track.subType) {
      case 'squareRoots':    return this._squareRoots(track, tier);
      case 'orderOfOps':     return this._orderOfOps(track, tier);
      case 'orderOfOpsHard': return this._orderOfOpsHard(track, tier);
      case 'solveForX':      return this._solveForX(track, tier);
      default:               return this._exponents(track, tier);
    }
  }

  _exponents(track, tier) {
    const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
    let expMax;
    if (tier === 'easy')        expMax = 2;
    else if (tier === 'medium') expMax = 3;
    else                        expMax = track.exponentRange.max;

    const exp  = this._rand(2, expMax);
    const base = this._rand(track.baseRange.min, track.baseRange.max);
    const correct = Math.pow(base, exp);

    const candidates = new Set();
    // base^(exp+1), base^(exp-1)
    if (exp < 5) candidates.add(Math.pow(base, exp + 1));
    if (exp > 1) { const v = Math.pow(base, exp - 1); if (v > 0) candidates.add(v); }
    // (base±1)^exp
    if (base > 2) { const v = Math.pow(base - 1, exp); if (v > 0) candidates.add(v); }
    candidates.add(Math.pow(base + 1, exp));
    // nearby ±10% rounded
    const step = Math.max(1, Math.round(correct * 0.1));
    candidates.add(correct + step);
    if (correct - step > 0) candidates.add(correct - step);

    const distractors = this._pickDistractors(candidates, correct, 3);
    const answers = this._buildAnswerList(correct, distractors);
    return {
      a: base, b: exp, correct, answers,
      answerIndex: answers.indexOf(correct),
      operator: '^',
      displayText: `${base}${SUP[exp] || `^${exp}`} = ?`,
    };
  }

  _squareRoots(track, tier) {
    let rootMax;
    if (tier === 'easy')        rootMax = Math.min(track.rootRange.max, 5);
    else if (tier === 'medium') rootMax = Math.min(track.rootRange.max, 7);
    else                        rootMax = track.rootRange.max;

    const root = this._rand(track.rootRange.min, rootMax);
    const radicand = root * root;
    const correct = root;

    const candidates = new Set();
    if (root > 1) candidates.add(root - 1);
    candidates.add(root + 1);
    if (root > 2) candidates.add(root - 2);
    candidates.add(root + 2);
    candidates.add(radicand);
    const half = Math.floor(radicand / 2);
    if (half !== correct && half > 0) candidates.add(half);

    const distractors = this._pickDistractors(candidates, correct, 3);
    const answers = this._buildAnswerList(correct, distractors);
    return {
      a: radicand, b: null, correct, answers,
      answerIndex: answers.indexOf(correct),
      operator: '√',
      displayText: `√${radicand} = ?`,
    };
  }

  _orderOfOps(track, tier) {
    let opMax;
    if (tier === 'easy')        opMax = 5;
    else if (tier === 'medium') opMax = 7;
    else                        opMax = track.operandRange.max;
    const opMin = track.operandRange.min;

    const patterns = ['a + b * c', 'a * b + c', 'a * b - c'];
    const pattern = patterns[this._rand(0, patterns.length - 1)];

    let a, b, c, correct, displayText;
    if (pattern === 'a + b * c') {
      a = this._rand(opMin, opMax);
      b = this._rand(opMin, opMax);
      c = this._rand(opMin, opMax);
      correct = a + b * c;
      displayText = `${a} + ${b} × ${c} = ?`;
    } else if (pattern === 'a * b + c') {
      a = this._rand(opMin, opMax);
      b = this._rand(opMin, opMax);
      c = this._rand(opMin, opMax);
      correct = a * b + c;
      displayText = `${a} × ${b} + ${c} = ?`;
    } else {
      // a * b - c, ensure positive result
      a = this._rand(opMin, opMax);
      b = this._rand(opMin, opMax);
      const prod = a * b;
      c = this._rand(opMin, Math.min(opMax, prod - 1 > 0 ? prod - 1 : opMin));
      correct = prod - c;
      displayText = `${a} × ${b} − ${c} = ?`;
    }

    // Wrong: left-to-right evaluation
    let wrongLR;
    if (pattern === 'a + b * c') wrongLR = (a + b) * c;
    else if (pattern === 'a * b + c') wrongLR = a * (b + c);
    else wrongLR = (a * b - c); // same as correct for this form, handle below

    const candidates = new Set();
    if (wrongLR !== correct && wrongLR > 0) candidates.add(wrongLR);
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);
    if (correct - 2 > 0) candidates.add(correct - 2);
    candidates.add(correct + 2);

    const distractors = this._pickDistractors(candidates, correct, 3);
    const answers = this._buildAnswerList(correct, distractors);
    return {
      a, b, c, correct, answers,
      answerIndex: answers.indexOf(correct),
      operator: 'oop',
      displayText,
    };
  }

  _orderOfOpsHard(track, tier) {
    let opMax;
    if (tier === 'easy')        opMax = 7;
    else if (tier === 'medium') opMax = 10;
    else                        opMax = track.operandRange.max;
    const opMin = track.operandRange.min;

    const patterns = ['(a + b) * c', '(a - b) * c', 'a * (b + c)'];
    const pattern = patterns[this._rand(0, patterns.length - 1)];

    let a, b, c, correct, displayText, wrongNoParen;
    if (pattern === '(a + b) * c') {
      a = this._rand(opMin, opMax);
      b = this._rand(opMin, opMax);
      c = this._rand(opMin, opMax);
      correct = (a + b) * c;
      displayText = `(${a} + ${b}) × ${c} = ?`;
      wrongNoParen = a + b * c;
    } else if (pattern === '(a - b) * c') {
      b = this._rand(opMin, opMax - 1);
      a = this._rand(b + 1, opMax + b); // ensure a > b
      c = this._rand(opMin, opMax);
      correct = (a - b) * c;
      displayText = `(${a} − ${b}) × ${c} = ?`;
      wrongNoParen = a - b * c;
    } else {
      a = this._rand(opMin, opMax);
      b = this._rand(opMin, opMax);
      c = this._rand(opMin, opMax);
      correct = a * (b + c);
      displayText = `${a} × (${b} + ${c}) = ?`;
      wrongNoParen = a * b + c;
    }

    const candidates = new Set();
    if (wrongNoParen !== correct && wrongNoParen > 0) candidates.add(wrongNoParen);
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);
    if (correct - 2 > 0) candidates.add(correct - 2);
    candidates.add(correct + 2);

    const distractors = this._pickDistractors(candidates, correct, 3);
    const answers = this._buildAnswerList(correct, distractors);
    return {
      a, b, c, correct, answers,
      answerIndex: answers.indexOf(correct),
      operator: 'oop',
      displayText,
    };
  }

  _solveForX(track, tier) {
    // Choose form based on tier
    let formPool;
    if (tier === 'easy')        formPool = ['add'];
    else if (tier === 'medium') formPool = ['add', 'sub'];
    else                        formPool = ['add', 'sub', 'mul', 'div'];

    const form = formPool[this._rand(0, formPool.length - 1)];
    let a, b, correct, displayText;

    if (form === 'add') {
      // X + a = b → X = b - a
      a = this._rand(1, 20);
      correct = this._rand(1, 30);
      b = correct + a;
      displayText = `X + ${a} = ${b}`;
    } else if (form === 'sub') {
      // X − a = b → X = b + a
      a = this._rand(1, 20);
      b = this._rand(1, 30);
      correct = b + a;
      displayText = `X − ${a} = ${b}`;
    } else if (form === 'mul') {
      // a × X = b → X = b / a
      a = this._rand(2, 12);
      correct = this._rand(2, 9);
      b = a * correct;
      displayText = `${a} × X = ${b}`;
    } else {
      // b ÷ X = a → X = b / a; pick X first
      correct = this._rand(2, 9);
      a = this._rand(2, 12);
      b = correct * a;
      displayText = `${b} ÷ X = ${a}`;
    }

    const candidates = new Set();
    // Wrong-op solve
    if (form === 'add') {
      candidates.add(b + a); // added instead of subtracted
    } else if (form === 'sub') {
      candidates.add(b - a); // subtracted instead of added
    } else if (form === 'mul') {
      candidates.add(b * a); // multiplied instead of divided
    } else {
      candidates.add(b / a > 0 ? Math.round(b / a) : b + a);
    }
    // Off-by-one and nearby
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);
    if (correct - 2 > 0) candidates.add(correct - 2);
    candidates.add(correct + 2);
    candidates.add(correct + 3);

    const distractors = this._pickDistractors(candidates, correct, 3);
    const answers = this._buildAnswerList(correct, distractors);
    return {
      a, b, correct, answers,
      answerIndex: answers.indexOf(correct),
      operator: '=',
      displayText: `${displayText} → X = ?`,
    };
  }

  // ─── Distractor generators ────────────────────────────────────────────────

  _additionDistractors(a, b, correct) {
    const candidates = new Set();

    // Off-by-one
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);

    // Wrong operation: subtraction
    const sub = Math.abs(a - b);
    if (sub !== correct && sub > 0) candidates.add(sub);

    // Wrong operation: multiply (capped so not too wild)
    const mul = a * b;
    if (mul !== correct && mul > 0 && mul < correct + 50) candidates.add(mul);

    // Nearby ±2..4
    for (let d = 2; d <= 4; d++) {
      if (correct - d > 0) candidates.add(correct - d);
      candidates.add(correct + d);
    }

    // Digit swap
    this._digitSwap(correct, candidates);

    // Carry error: subtract 10
    if (correct - 10 > 0) candidates.add(correct - 10);

    return this._pickDistractors(candidates, correct, 3);
  }

  _subtractionDistractors(a, b, correct) {
    const candidates = new Set();

    // Off-by-one
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);

    // Wrong direction: a + b
    const add = a + b;
    if (add !== correct) candidates.add(add);

    // Borrow error: +10 (forgot to borrow)
    candidates.add(correct + 10);
    if (correct - 10 > 0) candidates.add(correct - 10);

    // Digit swap
    this._digitSwap(correct, candidates);

    // Nearby
    for (let d = 2; d <= 4; d++) {
      if (correct - d > 0) candidates.add(correct - d);
      candidates.add(correct + d);
    }

    // Swapped operands: b - a style error (if b > correct)
    if (b > correct && b - correct > 0 && b - correct !== correct) {
      candidates.add(b - correct > 0 ? b : b + 1);
    }

    return this._pickDistractors(candidates, correct, 3);
  }

  _multiplicationDistractors(a, b, correct) {
    const candidates = new Set();

    // Off-by-one
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);

    // Wrong operation: addition
    const add = a + b;
    if (add !== correct && add > 0) candidates.add(add);

    // Off by one factor: (a-1)*b or a*(b-1)
    const offA = (a - 1) * b;
    if (offA > 0 && offA !== correct) candidates.add(offA);
    const offB = a * (b - 1);
    if (offB > 0 && offB !== correct) candidates.add(offB);
    const offAp = (a + 1) * b;
    if (offAp !== correct) candidates.add(offAp);

    // Digit swap
    this._digitSwap(correct, candidates);

    // Nearby ±10 for larger numbers, ±2..5 for small
    const nearbyStep = correct > 50 ? 10 : 3;
    for (let d = 1; d <= 2; d++) {
      if (correct - nearbyStep * d > 0) candidates.add(correct - nearbyStep * d);
      candidates.add(correct + nearbyStep * d);
    }

    // Partial product error: a * units(b) only
    const partialB = b % 10;
    if (partialB > 0) {
      const partial = a * partialB;
      if (partial !== correct && partial > 0) candidates.add(partial);
    }

    return this._pickDistractors(candidates, correct, 3);
  }

  _divisionDistractors(dividend, divisor, correct) {
    const candidates = new Set();

    // Off-by-one
    if (correct - 1 > 0) candidates.add(correct - 1);
    candidates.add(correct + 1);

    // Wrong op: dividend / (divisor - 1) or +1
    if (divisor > 1) {
      const wrongDiv1 = Math.round(dividend / (divisor - 1));
      if (wrongDiv1 !== correct && wrongDiv1 > 0) candidates.add(wrongDiv1);
    }
    const wrongDiv2 = Math.round(dividend / (divisor + 1));
    if (wrongDiv2 !== correct && wrongDiv2 > 0) candidates.add(wrongDiv2);

    // Multiply back confusion: divisor itself
    if (divisor !== correct) candidates.add(divisor);

    // Nearby ±2..4
    for (let d = 2; d <= 4; d++) {
      if (correct - d > 0) candidates.add(correct - d);
      candidates.add(correct + d);
    }

    // Digit swap
    this._digitSwap(correct, candidates);

    // Off by 10% (remainder confusion)
    const off10 = Math.round(correct * 1.1);
    if (off10 !== correct) candidates.add(off10);

    return this._pickDistractors(candidates, correct, 3);
  }

  // ─── Shared helpers ──────────────────────────────────────────────────────

  _digitSwap(correct, candidates) {
    if (correct >= 10) {
      const tens = Math.floor(correct / 10);
      const units = correct % 10;
      if (units !== 0) {
        const swapped = units * 10 + tens;
        if (swapped !== correct && swapped > 0) candidates.add(swapped);
      }
    }
  }

  _pickDistractors(candidates, correct, count) {
    candidates.delete(correct);
    for (const c of candidates) {
      if (c <= 0 || !Number.isFinite(c)) candidates.delete(c);
    }
    const arr = Array.from(candidates);
    this._shuffle(arr);
    return arr.slice(0, count);
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

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
