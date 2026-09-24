import { useSpotterStore } from '../store/spotter';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, CheckCircle2 } from 'lucide-react';

const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition) {
    case 'Sunny': return <Sun size={16} />;
    case 'Rainy': return <CloudRain size={16} />;
    case 'Windy': return <Wind size={16} />;
    default: return <Cloud size={16} />;
  }
};

export function TaskRail() {
  const { tasks, activeTaskId, selectTask } = useSpotterStore();

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--sp-3)',
      overflowX: 'auto',
      padding: 'var(--sp-4)',
      background: 'var(--surface-2)',
      borderTop: '1px solid var(--border)',
    }}>
      <AnimatePresence>
        {tasks.map(task => {
          const isActive = task.id === activeTaskId;
          const isDone = task.status === 'done';
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => selectTask(task.id)}
              style={{
                minWidth: 160,
                padding: 'var(--sp-3)',
                background: isActive ? 'var(--surface-3)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--cat-yellow)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                opacity: isDone ? 0.6 : 1,
                boxShadow: isActive ? 'var(--shadow-glow-yellow)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{task.task_type}</span>
                {isDone ? <CheckCircle2 size={16} color="var(--ok)" /> : <WeatherIcon condition="Sunny" />}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                Site {task.site} • {task.predicted_min}m
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
