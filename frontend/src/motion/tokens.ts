export const dur = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.5,
  hero: 0.7,
} as const;

export const ease = {
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.05, 0.7, 0.1, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const spring = {
  snappy: { type: 'spring' as const, stiffness: 420, damping: 32 },
  soft: { type: 'spring' as const, stiffness: 220, damping: 26 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 18 },
  gauge: { type: 'spring' as const, stiffness: 90, damping: 20, mass: 1.1 },
};

export const stagger = {
  list: 0.06,
  hero: 0.09,
} as const;
