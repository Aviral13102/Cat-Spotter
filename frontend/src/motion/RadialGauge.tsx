import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { spring as springTokens } from './tokens';
import { useMotionPrefs } from './useMotionPrefs';

interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  bands?: { threshold: number; color: string }[];
  label?: string;
  showValue?: boolean;
  format?: (n: number) => string;
  className?: string;
}

const defaultBands = [
  { threshold: 0, color: 'var(--ok)' },
  { threshold: 35, color: 'var(--warn)' },
  { threshold: 65, color: 'var(--danger)' },
];

export function RadialGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  bands = defaultBands,
  label,
  showValue = true,
  format = (n) => Math.round(n).toString(),
  className = '',
}: RadialGaugeProps) {
  const { isReduced } = useMotionPrefs();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const progress = clampedValue / max;

  const springProgress = useSpring(progress, isReduced ? { duration: 0.01 } : springTokens.gauge);
  const dashOffset = useTransform(springProgress, (p: number) => circumference * (1 - p));

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  const getColor = () => {
    let color = bands[0]?.color ?? 'var(--ok)';
    for (const band of bands) {
      if (clampedValue >= band.threshold) color = band.color;
    }
    return color;
  };

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {(showValue || label) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showValue && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: size > 80 ? 'var(--text-xl)' : 'var(--text-lg)',
                color: getColor(),
                lineHeight: 1,
              }}
            >
              {format(clampedValue)}
            </span>
          )}
          {label && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                marginTop: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
