import { motion, useSpring, useTransform } from 'framer-motion';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { dur } from '../motion/tokens';
import { Eta } from '../net/types';

interface EtaRangeProps {
  eta: Eta | null;
}

export function EtaRange({ eta }: EtaRangeProps) {
  const { isReduced } = useMotionPrefs();
  const maxVal = Math.max(eta?.high_min ?? 0, 100);
  const minVal = Math.max(eta?.low_min ?? 0, 0);
  const predicted = eta?.predicted_min ?? 0;
  
  const springConfig = isReduced ? { duration: 0.01 } : { type: 'spring', stiffness: 100, damping: 20 };
  const predictedSpring = useSpring(predicted, springConfig);
  const leftPos = useTransform(predictedSpring, val => `${(val / maxVal) * 100}%`);
  const widthPos = `${((maxVal - minVal) / maxVal) * 100}%`;
  const leftStart = `${(minVal / maxVal) * 100}%`;

  if (!eta) return <div style={{ height: 24 }} />;

  return (
    <div style={{ padding: 'var(--sp-2) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Prediction Range</span>
        {eta.drivers.length > 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: eta.drivers[0].delta_min > 0 ? 'var(--danger)' : 'var(--ok)' }}>
            {eta.drivers[0].delta_min > 0 ? '+' : ''}{eta.drivers[0].delta_min} min ({eta.drivers[0].label})
          </span>
        )}
      </div>
      <div style={{ position: 'relative', height: 8, background: 'var(--surface-3)', borderRadius: 'var(--radius-full)' }}>
        <motion.div
          style={{
            position: 'absolute',
            left: leftStart,
            width: widthPos,
            height: '100%',
            background: 'var(--cat-yellow-dim)',
            borderRadius: 'var(--radius-full)',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            left: leftPos,
            width: 4,
            height: 16,
            top: -4,
            background: 'var(--cat-yellow)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-glow-yellow)'
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-1)', fontSize: 'var(--text-xs)' }}>
        <span style={{ color: 'var(--muted)' }}>{eta.low_min}m</span>
        <span style={{ color: 'var(--muted)' }}>{eta.high_min}m</span>
      </div>
    </div>
  );
}
