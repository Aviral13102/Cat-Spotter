import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from '../motion/Typewriter';
import { useSpotterStore } from '../store/spotter';
import { useState } from 'react';
import { spring } from '../motion/tokens';

export function NudgeBubble() {
  const { nudge, clearNudge } = useSpotterStore();
  const [typed, setTyped] = useState(false);

  return (
    <AnimatePresence>
      {nudge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={spring.bouncy}
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: 120,
            right: 40,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            padding: 'var(--sp-4)',
            borderRadius: 'var(--radius-lg)',
            borderBottomRightRadius: 4,
            maxWidth: 320,
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
            <Typewriter text={nudge.say} onComplete={() => setTyped(true)} />
          </div>
          
          <AnimatePresence>
            {typed && nudge.options && nudge.options.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)', flexWrap: 'wrap' }}
              >
                {nudge.options.map((opt, i) => (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={clearNudge}
                    style={{
                      padding: 'var(--sp-2) var(--sp-3)',
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text)',
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
