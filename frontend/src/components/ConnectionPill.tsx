import { motion } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';

export function ConnectionPill() {
  const { connection } = useSpotterStore();
  
  let color = 'var(--danger)';
  let text = 'DISCONNECTED';
  
  if (connection === 'connected') { color = 'var(--ok)'; text = 'CONNECTED'; }
  if (connection === 'connecting') { color = 'var(--warn)'; text = 'CONNECTING'; }
  if (connection === 'reconnecting') { color = 'var(--warn)'; text = 'RECONNECTING'; }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
      <motion.span 
        animate={{ scale: connection === 'reconnecting' ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}80`
        }} 
      />
      <span style={{ color: 'var(--muted)' }}>{text}</span>
    </div>
  );
}
