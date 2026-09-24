import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { dur } from './tokens';
import { useMotionPrefs } from './useMotionPrefs';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  showDirection?: boolean;
  highlightColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

const sizeMap = {
  sm: 'var(--text-sm)',
  md: 'var(--text-lg)',
  lg: 'var(--text-2xl)',
  hero: 'var(--text-hero)',
};

export function AnimatedNumber({
  value,
  format = (n) => n.toFixed(0),
  duration = dur.slow,
  className = '',
  showDirection = false,
  highlightColor = 'var(--cat-yellow)',
  size = 'md',
}: AnimatedNumberProps) {
  const { isReduced } = useMotionPrefs();
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(format(value));
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prevRef.current) {
      setDirection(value > prevRef.current ? 'up' : 'down');
      setFlash(true);
      const timeout = setTimeout(() => {
        setFlash(false);
        setDirection(null);
      }, 600);

      const controls = animate(motionValue, value, {
        duration: isReduced ? 0.01 : duration,
        ease: [0.2, 0, 0, 1],
        onUpdate: (v) => setDisplay(format(v)),
      });

      prevRef.current = value;
      return () => {
        controls.stop();
        clearTimeout(timeout);
      };
    } else {
      setDisplay(format(value));
    }
  }, [value, format, duration, isReduced, motionValue]);

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-bold)' as unknown as number,
        fontSize: sizeMap[size],
        lineHeight: 1.1,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '4px',
        color: flash ? highlightColor : 'var(--text)',
        transition: 'color 0.3s',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {display}
      {showDirection && direction && (
        <motion.span
          initial={{ opacity: 0, y: direction === 'up' ? 4 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: '0.6em',
            color: direction === 'up' ? 'var(--warn)' : 'var(--ok)',
          }}
        >
          {direction === 'up' ? '↑' : '↓'}
        </motion.span>
      )}
    </span>
  );
}
