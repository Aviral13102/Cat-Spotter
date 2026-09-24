import { Variants } from 'framer-motion';
import { dur, ease, spring } from './tokens';

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.base, ease: ease.standard } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: dur.fast, ease: ease.exit } },
};

export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: spring.soft },
  exit: { opacity: 0, scale: 0.92, transition: { duration: dur.fast, ease: ease.exit } },
};

export const slideInRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: spring.soft },
  exit: { x: '100%', opacity: 0, transition: { duration: dur.base, ease: ease.exit } },
};

export const slideUp: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: spring.soft },
  exit: { y: '100%', opacity: 0, transition: { duration: dur.base, ease: ease.exit } },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: spring.snappy },
  exit: { opacity: 0, x: 12, transition: { duration: dur.fast } },
};

export const alertPop: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: spring.bouncy },
  exit: { opacity: 0, scale: 0.8, y: -20, transition: { duration: dur.fast, ease: ease.exit } },
};

export const criticalShake: Variants = {
  animate: {
    x: [0, -4, 4, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

export const pulseRing: Variants = {
  initial: { scale: 0.8, opacity: 0.8 },
  animate: {
    scale: [0.8, 1.4],
    opacity: [0.8, 0],
    transition: { duration: 0.8, ease: ease.standard },
  },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const heroStaggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};
