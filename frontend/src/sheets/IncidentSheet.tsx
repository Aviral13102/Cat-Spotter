import { useSpotterStore } from '../store/spotter';
import { Sheet } from '../motion/Sheet';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../net/api';

const INCIDENT_TYPES = [
  'Equipment Malfunction', 'Hydraulic Leak', 'Electrical Issue',
  'Structural Damage', 'Near Miss', 'Safety Violation',
  'Environmental Spill', 'Ground Instability', 'Communication Failure', 'Other'
];

const SEVERITY_LEVELS = [
  { value: 'notice', label: 'Low', color: 'var(--info)' },
  { value: 'warning', label: 'Medium', color: 'var(--warn)' },
  { value: 'critical', label: 'High', color: 'var(--danger)' },
];

const EQUIPMENT_PARTS = [
  'Boom', 'Arm/Stick', 'Bucket', 'Hydraulic Cylinder', 'Tracks/Undercarriage',
  'Engine', 'Cab/Controls', 'Electrical System', 'Other'
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 'var(--sp-3)', background: 'var(--surface-3)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  color: 'var(--text)', fontSize: 'var(--text-sm)', outline: 'none',
  fontFamily: 'var(--font-body)'
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase',
  marginBottom: 'var(--sp-1)', display: 'block', fontWeight: 600
};

export function IncidentSheet() {
  const { incidentSheetOpen, setIncidentSheetOpen, incidents } = useSpotterStore();
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [formData, setFormData] = useState({
    type: '', severity: 'warning', description: '', location: '', equipment_part: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!formData.type || !formData.description) return;
    setSubmitting(true);
    try {
      await api.createIncident({
        type: formData.type, severity: formData.severity,
        description: formData.description, location: formData.location,
        equipment_part: formData.equipment_part, weather: '', fatigue_score: 0
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode('list');
        setFormData({ type: '', severity: 'warning', description: '', location: '', equipment_part: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to log incident', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet isOpen={incidentSheetOpen} onClose={() => { setIncidentSheetOpen(false); setMode('list'); }} title="Incident Log">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {mode === 'list' ? (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('form')}
              style={{
                padding: 'var(--sp-3)', background: 'var(--cat-yellow)', color: '#000',
                borderRadius: 'var(--radius-md)', fontWeight: 700, border: 'none',
                cursor: 'pointer', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}
            >
              + New Incident Report
            </motion.button>
            {incidents.length === 0 && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 'var(--sp-6)' }}>No incidents recorded this shift.</p>
            )}
            {incidents.map((inc, idx) => (
              <motion.div
                key={inc.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'var(--surface-2)', padding: 'var(--sp-4)',
                  borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${
                    inc.severity === 'critical' ? 'var(--danger)' :
                    inc.severity === 'warning' ? 'var(--warn)' : 'var(--info)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: 'var(--text)' }}>{inc.type}</h4>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: inc.severity === 'critical' ? 'var(--danger-dim)' :
                                inc.severity === 'warning' ? 'var(--warn-dim)' : 'var(--info-dim)',
                    color: inc.severity === 'critical' ? 'var(--danger)' :
                           inc.severity === 'warning' ? 'var(--warn)' : 'var(--info)',
                    textTransform: 'uppercase', fontWeight: 700
                  }}>{inc.severity}</span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 'var(--sp-2) 0 0' }}>
                  {inc.description}
                </p>
                {inc.created_at && (
                  <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 'var(--sp-1)' }}>
                    {new Date(inc.created_at as string).toLocaleTimeString()}
                  </p>
                )}
              </motion.div>
            ))}
          </>
        ) : (
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: 'var(--sp-8)' }}
              >
                <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>✅</div>
                <h3 style={{ color: 'var(--ok)' }}>Incident Logged Successfully</h3>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
              >
                <div>
                  <label style={labelStyle}>Incident Type *</label>
                  <select value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))} style={inputStyle}>
                    <option value="">Select type...</option>
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Severity</label>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    {SEVERITY_LEVELS.map(s => (
                      <button key={s.value} onClick={() => setFormData(p => ({...p, severity: s.value}))}
                        style={{
                          flex: 1, padding: 'var(--sp-2)', borderRadius: 'var(--radius-sm)',
                          border: formData.severity === s.value ? `2px solid ${s.color}` : '1px solid var(--border)',
                          background: formData.severity === s.value ? `${s.color}20` : 'var(--surface-3)',
                          color: formData.severity === s.value ? s.color : 'var(--muted)',
                          cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)'
                        }}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Equipment/Component</label>
                  <select value={formData.equipment_part} onChange={e => setFormData(p => ({...p, equipment_part: e.target.value}))} style={inputStyle}>
                    <option value="">Select component...</option>
                    {EQUIPMENT_PARTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input type="text" placeholder="e.g. Site B, Zone 3" value={formData.location}
                    onChange={e => setFormData(p => ({...p, location: e.target.value}))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea rows={4} placeholder="Describe the incident in detail..." value={formData.description}
                    onChange={e => setFormData(p => ({...p, description: e.target.value}))}
                    style={{...inputStyle, resize: 'vertical'}} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                  <button onClick={() => setMode('list')} style={{
                    flex: 1, padding: 'var(--sp-3)', background: 'var(--surface-3)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text)', cursor: 'pointer'
                  }}>Cancel</button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={submitting || !formData.type || !formData.description}
                    style={{
                      flex: 2, padding: 'var(--sp-3)', background: submitting ? 'var(--muted)' : 'var(--cat-yellow)',
                      color: '#000', borderRadius: 'var(--radius-md)', fontWeight: 700,
                      border: 'none', cursor: submitting ? 'wait' : 'pointer',
                      opacity: (!formData.type || !formData.description) ? 0.5 : 1
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Incident Report'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Sheet>
  );
}
