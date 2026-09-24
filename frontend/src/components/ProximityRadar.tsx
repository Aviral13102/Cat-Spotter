import { motion } from 'framer-motion';
import { useMotionPrefs } from '../motion/useMotionPrefs';

export function ProximityRadar() {
  const { isReduced } = useMotionPrefs();
  const rotation = isReduced ? 0 : 360;

  return (
    <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', background: 'var(--surface-3)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Grid rings */}
      <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid var(--border-light)' }} />
      <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid var(--border-light)' }} />
      <div style={{ position: 'absolute', inset: 50, borderRadius: '50%', border: '1px solid var(--border-light)' }} />
      
      {/* Sweep */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, var(--warn-dim) 360deg)',
          borderRadius: '50%',
        }}
      />
      {/* Ping ripple */}
      <motion.div
        animate={{ scale: [0.2, 1], opacity: [0.8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid var(--warn)',
          borderRadius: '50%',
        }}
      />
      {/* Blip */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
      >
        <div style={{ position: 'absolute', top: 15, left: '50%', width: 6, height: 6, background: 'var(--warn)', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: 'var(--shadow-glow-yellow)' }} />
      </motion.div>
      <div style={{ position: 'absolute', bottom: -4, right: 4, fontSize: '9px', color: 'var(--muted)' }}>Simulated sensor</div>
    </div>
  );
}
