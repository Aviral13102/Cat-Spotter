import { motion, AnimatePresence } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { api } from '../net/api';

interface ShortcutsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'D', label: 'Demo Controls', icon: '🎬', action: 'demo' },
  { key: 'T', label: 'Training Center', icon: '📚', action: 'training' },
  { key: 'I', label: 'Report Incident', icon: '⚠️', action: 'incident' },
  { key: 'G', label: 'Insights & Analytics', icon: '📊', action: 'insights' },
  { key: 'E', label: 'End of Shift Summary', icon: '📋', action: 'endshift' },
  { key: 'Space', label: 'Voice Command', icon: '🎤', action: 'voice' },
  { key: '?', label: 'Toggle This Panel', icon: '⌨️', action: 'sidebar' },
  { key: 'Esc', label: 'Close Any Panel', icon: '✕', action: 'close' },
];

const quickActions = [
  { label: '▶ Play Demo', action: async () => { await api.simControl({ action: 'play' }); } },
  { label: '⏸ Pause Demo', action: async () => { await api.simControl({ action: 'pause' }); } },
  { label: '🔄 Reset Demo', action: async () => { await api.simControl({ action: 'reset' }); } },
  { label: '⚡ Inject Alert', action: async () => { 
    await api.simInject({
      type: 'alert.raised',
      payload: {
        id: `alert-${Date.now()}`, rule_id: 'R-IDLE-02', severity: 'warning',
        title: 'High Idling', detail: 'Idling for 55 minutes.',
        ts: new Date().toISOString(), requires_ack: false, say: true, options: [], data: {}
      }
    });
  }},
  { label: '📡 Inject Telemetry', action: async () => {
    await api.simInject({
      type: 'telemetry.tick',
      payload: {
        machine_id: 'EXC-320F-001', operator_id: 'OP-1001', engine_hours: 1205.0,
        fuel_used_l: 4.5, fuel_level_l: 18.0, load_cycles: 7, idling_time_min: 42,
        seatbelt_status: 'Fastened', safety_alert_triggered: 'No',
        sim_time: new Date().toISOString(), is_simulated: false, fuel_per_cycle: 0.64
      }
    });
  }},
];

export function ShortcutsSidebar({ isOpen, onClose }: ShortcutsSidebarProps) {
  const store = useSpotterStore.getState;

  const handleAction = (action: string) => {
    const s = useSpotterStore.getState();
    switch (action) {
      case 'demo': s.setDemoOpen(!s.demoOpen); break;
      case 'training': s.setTrainingSheetOpen(true); break;
      case 'incident': s.setIncidentSheetOpen(true); break;
      case 'insights': s.setInsightsSheetOpen(true); break;
      case 'endshift': s.setEndOfShiftOpen(true); break;
      case 'close': 
        s.setTrainingSheetOpen(false);
        s.setIncidentSheetOpen(false);
        s.setInsightsSheetOpen(false);
        s.setEndOfShiftOpen(false);
        s.setDemoOpen(false);
        onClose();
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 'var(--z-sheet)' as any, backdropFilter: 'blur(4px)'
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 340,
              background: 'var(--surface)', borderLeft: '1px solid var(--border)',
              zIndex: 101, display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
            }}
          >
            <div style={{
              padding: 'var(--sp-4) var(--sp-4)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--cat-yellow)', margin: 0, fontSize: 'var(--text-lg)' }}>
                ⌨️ SHORTCUTS & ACTIONS
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)' }}>
              <h3 style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
                Keyboard Shortcuts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {shortcuts.map(s => (
                  <motion.button
                    key={s.key}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(s.action)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                      padding: 'var(--sp-3) var(--sp-3)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      color: 'var(--text)', textAlign: 'left', width: '100%'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{s.label}</span>
                    <kbd style={{
                      padding: '2px 8px', background: 'var(--surface-3)',
                      borderRadius: 4, fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)', color: 'var(--cat-yellow)',
                      border: '1px solid var(--border-light)'
                    }}>{s.key}</kbd>
                  </motion.button>
                ))}
              </div>
              
              <h3 style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', margin: 'var(--sp-6) 0 var(--sp-3)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {quickActions.map((qa, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={qa.action}
                    style={{
                      padding: 'var(--sp-3)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      color: 'var(--text)', fontSize: 'var(--text-sm)',
                      textAlign: 'left', width: '100%'
                    }}
                  >
                    {qa.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
