import { useSpotterStore } from '../store/spotter';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { Reveal } from '../motion/Reveal';

export function IdleCostMeter() {
  const { idleCost } = useSpotterStore();

  return (
    <Reveal delay={0.2}>
      <div style={{
        padding: 'var(--sp-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', margin: 0, color: 'var(--cat-yellow)' }}>IDLING COST</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: 'var(--text-3xl)', color: 'var(--cat-yellow)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>₹</span>
          <AnimatedNumber value={idleCost.wasted_cost} size="hero" highlightColor="var(--danger)" format={n => n.toFixed(2)} />
        </div>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          ₹{idleCost.rate_per_min.toFixed(2)} / min
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Wasted Fuel</div>
            <AnimatedNumber value={idleCost.wasted_l} size="sm" format={n => `${n.toFixed(1)} L`} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Emissions</div>
            <AnimatedNumber value={idleCost.co2_kg} size="sm" format={n => `${n.toFixed(1)} kg CO₂`} />
          </div>
        </div>

        {/* Heat bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'var(--surface-3)' }}>
          <div style={{
            height: '100%',
            width: `${Math.min((idleCost.wasted_cost / 100) * 100, 100)}%`,
            background: idleCost.wasted_cost > 50 ? 'var(--danger)' : (idleCost.wasted_cost > 20 ? 'var(--warn)' : 'var(--ok)'),
            transition: 'width 1s ease-out, background 1s ease'
          }} />
        </div>
      </div>
    </Reveal>
  );
}
