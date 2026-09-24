import { motion, AnimatePresence } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { X, Info, AlertCircle, AlertTriangle } from 'lucide-react';

export function Toasts() {
  const { alerts, dismissToast } = useSpotterStore();
  const nonCritical = alerts.filter(a => a.severity !== 'critical');

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--sp-20)',
      right: 'var(--sp-4)',
      zIndex: 'var(--z-toast)' as unknown as number,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)',
      width: 320,
      pointerEvents: 'none'
    }}>
      <AnimatePresence mode="popLayout">
        {nonCritical.map(alert => {
          let color = 'var(--info)';
          let Icon = Info;
          if (alert.severity === 'notice') { color = 'var(--ok)'; }
          if (alert.severity === 'warning') { color = 'var(--warn)'; Icon = AlertCircle; }
          
          return (
            <motion.div
              layout
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${color}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'auto',
                display: 'flex',
                gap: 'var(--sp-3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Icon color={color} size={20} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{alert.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{alert.detail}</div>
              </div>
              <button onClick={() => dismissToast(alert.id)} style={{ color: 'var(--muted)', background: 'transparent', border: 'none', padding: 4, height: 'fit-content' }}>
                <X size={16} />
              </button>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => dismissToast(alert.id)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 3,
                  background: color,
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
