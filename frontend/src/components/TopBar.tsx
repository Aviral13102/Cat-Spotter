import { HardHat, Sun, Moon } from 'lucide-react';
import { useSpotterStore } from '../store/spotter';
import { useState } from 'react';
import { ConnectionPill } from './ConnectionPill';

export function TopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--sp-2) var(--sp-4)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <HardHat color="var(--cat-yellow)" size={28} />
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1, margin: 0, color: 'var(--text)' }}>
            <span style={{ color: '#fff' }}>CAT</span> <span style={{ color: 'var(--cat-yellow)' }}>SPOTTER</span>
          </h1>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Safety & Efficiency Console
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        <ConnectionPill />
        <button onClick={toggleTheme} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
            ⌨️
          </button>
        )}
        <div style={{ padding: 'var(--sp-1) var(--sp-2)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          OP-22
        </div>
      </div>
    </header>
  );
}
