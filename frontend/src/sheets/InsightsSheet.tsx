import { useSpotterStore } from '../store/spotter';
import { Sheet } from '../motion/Sheet';

export function InsightsSheet() {
  const { insightsSheetOpen, setInsightsSheetOpen, telemetry, fatigue, idleCost } = useSpotterStore();
  
  return (
    <Sheet isOpen={insightsSheetOpen} onClose={() => setInsightsSheetOpen(false)} title="Insights & Analytics">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <div style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ color: 'var(--cat-yellow)', marginBottom: 'var(--sp-2)' }}>ML Prediction Model</h4>
          <p style={{ fontSize: 'var(--text-sm)' }}>RandomForest (300 trees) — MAPE: 7.27% on holdout data</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--sp-1)' }}>Trained on 805 operational records across 5 task types</p>
        </div>

        <div style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: 'var(--sp-2)' }}>Live Telemetry Snapshot</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Engine Hours</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{telemetry?.engine_hours?.toFixed(1) ?? '—'}</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Fuel Level</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{telemetry?.fuel_level_l?.toFixed(1) ?? '—'} L</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cycles</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{telemetry?.load_cycles ?? '—'}</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Idle Time</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{telemetry?.idling_time_min ?? '—'} min</div></div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: 'var(--sp-2)' }}>Operator Wellness</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Fatigue Score</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', color: fatigue.band === 'High' ? 'var(--danger)' : fatigue.band === 'Watch' ? 'var(--warn)' : 'var(--ok)' }}>{fatigue.score} — {fatigue.band}</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Hours Since Break</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{fatigue.hours_since_break.toFixed(1)}h</div></div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: 'var(--sp-2)' }}>Cost Analysis</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-3)' }}>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Wasted Fuel</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', color: 'var(--warn)' }}>{idleCost.wasted_l.toFixed(1)} L</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Idle Cost</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>₹{idleCost.wasted_cost.toFixed(0)}</div></div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>CO₂</span><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)' }}>{idleCost.co2_kg.toFixed(1)} kg</div></div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
