import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Boot({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to ensure timer only runs once on mount

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.5, ease: 'easeInOut' } }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ textAlign: 'center' }}
        >
          <svg width="200" height="200" viewBox="0 0 100 100">
            <motion.path
              d="M20,80 L50,20 L80,80"
              fill="none"
              stroke="var(--cat-yellow)"
              strokeWidth="10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--cat-yellow)',
              fontSize: 'var(--text-3xl)',
              marginTop: 'var(--sp-4)',
              letterSpacing: '0.05em'
            }}
          >
            CAT SPOTTER
          </motion.h1>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
