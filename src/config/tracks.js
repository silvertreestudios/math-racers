// Track definitions — MVP has one hardcoded track
export const TRACKS = {
  'starter-speedway': {
    id: 'starter-speedway',
    name: 'Starter Speedway',
    class: 'addition',
    difficulty: 1,
    // single + single digit
    operandRange: { min: 1, max: 9 },
  },
};

export const MVP_TRACK = TRACKS['starter-speedway'];
