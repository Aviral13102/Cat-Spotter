import { motion, AnimatePresence } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { Reveal } from '../motion/Reveal';

export function EndOfShiftSummary() {
  const { endOfShiftOpen, setEndOfShiftOpen } = useSpotterStore();

  return (
    <AnimatePresence>
      {endOfShiftOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-takeover)' as unknown as number,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Reveal>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--cat-yellow)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--sp-8)',
              maxWidth: 600,
              width: '90%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow-yellow)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--cat-yellow)', marginBottom: 'var(--sp-4)' }}>
                SHIFT COMPLETE
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Safe Shifts</div>
                  <AnimatedNumber value={1} size="lg" highlightColor="var(--ok)" />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Fuel Saved</div>
                  <AnimatedNumber value={12.4} size="lg" format={n => `${n.toFixed(1)}L`} />
                </div>
              </div>
              <button onClick={() => setEndOfShiftOpen(false)} style={{ padding: 'var(--sp-3) var(--sp-6)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                Close Summary
              </button>
            </div>
          </Reveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
