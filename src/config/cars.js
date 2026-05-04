// Car definitions per racing class
export const CARS = {
  'kart-default': {
    id: 'kart-default',
    name: 'Go-Kart',
    classId: 'addition',
    color: 0x00aaff,
  },
  'rally-default': {
    id: 'rally-default',
    name: 'Rally Car',
    classId: 'subtraction',
    color: 0x44aaff,
  },
  'monster-default': {
    id: 'monster-default',
    name: 'Monster Truck',
    classId: 'multiplication',
    color: 0xffcc00,
  },
  'formula-default': {
    id: 'formula-default',
    name: 'Formula 1',
    classId: 'division',
    color: 0xff4444,
  },
};

/** AI car names per class */
export const AI_NAMES_BY_CLASS = {
  addition: ['Speedy Sam', 'Turbo Tina', 'Dash Dave'],
  subtraction: ['Rally Rex', 'Gravel Gina', 'Drift Dan'],
  multiplication: ['Crusher Cal', 'Monster Meg', 'Titan Tim'],
  division: ['Formula Frank', 'Apex Amy', 'Champion Chad'],
};

/** Car colors for player + 3 AI slots */
export const CAR_COLORS_BY_CLASS = {
  addition:       [0x00aaff, 0xff4444, 0xffaa00, 0x44ee44],
  subtraction:    [0x44aaff, 0xff6644, 0xaaffaa, 0xffccaa],
  multiplication: [0xffcc00, 0xff8844, 0xcc66ff, 0x66ffcc],
  division:       [0xff4444, 0x88ccff, 0xffee44, 0xee88ff],
};
