import { Sheet } from '../motion/Sheet';

interface DemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoPanel({ isOpen, onClose }: DemoPanelProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Demo Controls">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <section>
          <h3 style={{ color: 'var(--muted)' }}>Seatbelt</h3>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <button style={{ padding: 'var(--sp-2)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>Fastened</button>
            <button style={{ padding: 'var(--sp-2)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>Unfastened</button>
          </div>
        </section>

        <section>
          <h3 style={{ color: 'var(--muted)' }}>Weather</h3>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {['Sunny', 'Cloudy', 'Rainy', 'Windy'].map(w => (
              <button key={w} style={{ padding: 'var(--sp-2)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>{w}</button>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ color: 'var(--muted)' }}>Simulation</h3>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <button style={{ padding: 'var(--sp-2)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', flex: 1 }}>Play/Pause</button>
            <button style={{ padding: 'var(--sp-2)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', flex: 1 }}>Reset</button>
          </div>
        </section>
      </div>
    </Sheet>
  );
}
