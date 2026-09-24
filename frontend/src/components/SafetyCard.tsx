import { motion } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { Reveal } from '../motion/Reveal';
import { ProximityRadar } from './ProximityRadar';
import { FatigueGauge } from './FatigueGauge';

export function SafetyCard() {
  const { telemetry, streak } = useSpotterStore();
  const seatbelt = telemetry?.seatbelt_status === 'Fastened';

  return (
    <Reveal delay={0.1}>
      <div style={{
        padding: 'var(--sp-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', margin: 0, color: 'var(--text-secondary)' }}>SAFETY MONITOR</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ProximityRadar />
          <FatigueGauge />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <div style={{ position: 'relative', width: 16, height: 16 }}>
              <motion.div
                key={seatbelt ? 'on' : 'off'}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: [0.8, 1.5], opacity: [0.8, 0] }}
                transition={{ duration: 0.6 }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: seatbelt ? 'var(--ok)' : 'var(--danger)' }}
              />
              <motion.div
                animate={{ backgroundColor: seatbelt ? 'var(--ok)' : 'var(--danger)' }}
                style={{ width: '100%', height: '100%', borderRadius: '50%', boxShadow: seatbelt ? 'var(--shadow-glow-ok)' : 'var(--shadow-glow-danger)', position: 'relative' }}
              />
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Belt {seatbelt ? 'Fastened' : 'Unfastened'}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <motion.span animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>🔥</motion.span>
                Shifts
              </div>
              <AnimatedNumber value={streak.safe_shifts} size="sm" />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Points</div>
              <AnimatedNumber value={streak.points} size="sm" highlightColor="var(--ok)" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
