import { motion, AnimatePresence } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { AlertTriangle } from 'lucide-react';
import { criticalShake } from '../motion/variants';
import { spring } from '../motion/tokens';

export function AlertTakeover() {
  const { alerts, ackAlert } = useSpotterStore();
  const criticalAlert = alerts.find(a => a.severity === 'critical');

  return (
    <AnimatePresence>
      {criticalAlert && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.16 } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-takeover)' as unknown as number,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
        >
          {/* Vignette pulse */}
          <motion.div
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 50%, var(--danger) 150%)', pointerEvents: 'none' }}
          />
          
          <motion.div
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 24 }}
            transition={spring.bouncy}
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--danger)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--sp-8)',
              maxWidth: 600,
              width: '90%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow-danger)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <motion.div variants={criticalShake} animate="animate" style={{ display: 'inline-block', marginBottom: 'var(--sp-4)' }}>
              <AlertTriangle size={80} color="var(--danger)" />
            </motion.div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text)', marginBottom: 'var(--sp-4)', textTransform: 'uppercase' }}>
              {criticalAlert.title}
            </h2>
            <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-8)' }}>
              {criticalAlert.detail}
            </p>
            
            <motion.button
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => ackAlert(criticalAlert.id)}
              style={{
                width: '100%',
                height: 96,
                background: 'var(--danger)',
                color: '#fff',
                fontSize: 'var(--text-2xl)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              Acknowledge
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
