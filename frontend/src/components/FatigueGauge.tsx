import { RadialGauge } from '../motion/RadialGauge';
import { useSpotterStore } from '../store/spotter';
import { motion, AnimatePresence } from 'framer-motion';

export function FatigueGauge() {
  const { fatigue } = useSpotterStore();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <RadialGauge
        value={fatigue.score}
        max={100}
        size={100}
        strokeWidth={8}
        bands={[
          { threshold: 0, color: 'var(--ok)' },
          { threshold: 35, color: 'var(--warn)' },
          { threshold: 65, color: 'var(--danger)' }
        ]}
        label={fatigue.band}
      />
      <AnimatePresence mode="wait">
        {fatigue.minutes_to_high && (
          <motion.span
            key={fatigue.band}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--sp-1)' }}
          >
            Break in ~{fatigue.minutes_to_high}m
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
