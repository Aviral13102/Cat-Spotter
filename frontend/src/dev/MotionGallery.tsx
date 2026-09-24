import { useState } from 'react';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { RadialGauge } from '../motion/RadialGauge';
import { Sheet } from '../motion/Sheet';
import { Reveal } from '../motion/Reveal';
import { StaggerList } from '../motion/StaggerList';
import { Typewriter } from '../motion/Typewriter';
import { ActiveTaskHero } from '../components/ActiveTaskHero';
import { SafetyCard } from '../components/SafetyCard';
import { IdleCostMeter } from '../components/IdleCostMeter';
import { TaskRail } from '../components/TaskRail';
import { SpotterOrb } from '../components/SpotterOrb';
import { NudgeBubble } from '../components/NudgeBubble';
import { AlertTakeover } from '../components/AlertTakeover';
import { Boot } from '../components/Boot';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { useSpotterStore } from '../store/spotter';

export default function MotionGallery() {
  const [num, setNum] = useState(100);
  const [gauge, setGauge] = useState(50);
  const [sheet, setSheet] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const { appReducedMotion, setAppReducedMotion } = useMotionPrefs();
  const [boot, setBoot] = useState(false);
  const { alerts, ackAlert } = useSpotterStore();

  const handleReplay = () => setRemountKey(k => k + 1);

  if (boot) return <Boot onComplete={() => setBoot(false)} />;

  return (
    <div style={{ padding: 'var(--sp-6)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)' }}>
        <h1>Motion Gallery</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={appReducedMotion} onChange={e => setAppReducedMotion(e.target.checked)} />
          Reduce Motion
        </label>
      </header>

      <section>
        <h2>Primitives <button onClick={handleReplay}>Replay</button></h2>
        <div key={`prim-${remountKey}`} style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap', marginTop: 'var(--sp-4)' }}>
          <div>
            <h3>AnimatedNumber</h3>
            <AnimatedNumber value={num} size="lg" />
            <button onClick={() => setNum(n => n + Math.floor(Math.random() * 50) - 25)}>Change</button>
          </div>
          <div>
            <h3>RadialGauge</h3>
            <RadialGauge value={gauge} />
            <button onClick={() => setGauge(n => Math.max(0, Math.min(100, n + Math.floor(Math.random() * 40) - 20)))}>Change</button>
          </div>
          <div>
            <h3>Sheet</h3>
            <button onClick={() => setSheet(true)}>Open Sheet</button>
            <Sheet isOpen={sheet} onClose={() => setSheet(false)} title="Demo Sheet">
              Content inside sheet
            </Sheet>
          </div>
          <div>
            <h3>Typewriter</h3>
            <Typewriter text="This is a test of the typewriter component. Click to skip." />
          </div>
        </div>
      </section>

      <section>
        <h2>Cockpit Components <button onClick={handleReplay}>Replay</button></h2>
        <div key={`cockpit-${remountKey}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
          <ActiveTaskHero />
          <SafetyCard />
          <IdleCostMeter />
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', background: 'var(--surface)', padding: 'var(--sp-4)' }}>
            <SpotterOrb />
            <div style={{ position: 'relative', width: 320, height: 200 }}><NudgeBubble /></div>
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <TaskRail />
        </div>
      </section>

      <section>
        <h2>Overlays</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
          <button onClick={() => useSpotterStore.setState(s => ({ alerts: [{ id: 'test-crit', severity: 'critical', title: 'CRITICAL ALERT', detail: 'This is a test.', ts: '', rule_id: '', requires_ack: true, say: '', options: [], data: {} }, ...s.alerts] }))}>
            Fire Critical Alert
          </button>
          <button onClick={() => useSpotterStore.setState(s => ({ alerts: [{ id: `toast-${Date.now()}`, severity: 'notice', title: 'Notice', detail: 'Something happened.', ts: '', rule_id: '', requires_ack: false, say: '', options: [], data: {} }, ...s.alerts] }))}>
            Fire Toast
          </button>
          <button onClick={() => setBoot(true)}>Play Boot Sequence</button>
        </div>
        <AlertTakeover />
      </section>
    </div>
  );
}
