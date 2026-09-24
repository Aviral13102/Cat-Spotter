import { useSpotterStore } from '../store/spotter';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { RadialGauge } from '../motion/RadialGauge';
import { EtaRange } from './EtaRange';
import { Reveal } from '../motion/Reveal';

export function ActiveTaskHero() {
  const { tasks, activeTaskId, eta, telemetry } = useSpotterStore();
  const activeTask = tasks.find(t => t.id === activeTaskId) || tasks[0];

  if (!activeTask) {
    return (
      <div style={{ padding: 'var(--sp-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <span style={{ color: 'var(--muted)' }}>No active task</span>
      </div>
    );
  }

  return (
    <Reveal>
      <div style={{
        padding: 'var(--sp-6)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text)', margin: 0, lineHeight: 1.1 }}>
              {activeTask.task_type}
            </h2>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                background: activeTask.status === 'active' ? 'var(--cat-yellow-dim)' : 'var(--surface-3)',
                color: activeTask.status === 'active' ? 'var(--cat-yellow)' : 'var(--muted)',
                fontWeight: 600
              }}>
                {activeTask.status}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', alignSelf: 'center' }}>
                Site {activeTask.site}
              </span>
            </div>
          </div>
          <RadialGauge
            value={activeTask.progress}
            max={100}
            size={64}
            strokeWidth={6}
            bands={[{ threshold: 0, color: 'var(--cat-yellow)' }]}
            format={(n) => `${n}%`}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>Cycles Completed</div>
            <AnimatedNumber value={telemetry?.load_cycles ?? 0} size="lg" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>Fuel / Cycle</div>
            <AnimatedNumber value={telemetry?.fuel_per_cycle ?? 0} size="lg" format={n => `${n.toFixed(1)} L`} />
          </div>
        </div>

        <EtaRange eta={eta} />
      </div>
    </Reveal>
  );
}
