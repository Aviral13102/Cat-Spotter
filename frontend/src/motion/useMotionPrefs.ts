import { useEffect, useState } from 'react';

export function useMotionPrefs() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [appReducedMotion, setAppReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isReduced = reducedMotion || appReducedMotion;

  return {
    isReduced,
    reducedMotion,
    appReducedMotion,
    setAppReducedMotion,
    getTransition: (normal: object) =>
      isReduced ? { duration: 0.12, ease: 'easeOut' } : normal,
    getVariant: (normal: object, reduced?: object) =>
      isReduced ? (reduced ?? { opacity: 1, transition: { duration: 0.12 } }) : normal,
  };
}
