import { create } from 'zustand';
import { AppState, WsMessage } from '../net/types';

interface SpotterStore extends AppState {
  handleWsMessage: (msg: WsMessage) => void;
  setConnection: (status: AppState['connection']) => void;
  clearNudge: () => void;
  selectTask: (id: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  demoOpen: boolean;
  trainingSheetOpen: boolean;
  incidentSheetOpen: boolean;
  insightsSheetOpen: boolean;
  endOfShiftOpen: boolean;
  setDemoOpen: (open: boolean) => void;
  setTrainingSheetOpen: (open: boolean) => void;
  setIncidentSheetOpen: (open: boolean) => void;
  setInsightsSheetOpen: (open: boolean) => void;
  setEndOfShiftOpen: (open: boolean) => void;
  ackAlert: (id: string) => void;
  dismissToast: (id: string) => void;
}

const initialState: AppState & { demoOpen: boolean, trainingSheetOpen: boolean, incidentSheetOpen: boolean, insightsSheetOpen: boolean, endOfShiftOpen: boolean } = {
  connection: 'disconnected',
  sim: { playing: false, speed: 1, sim_time: '', window_index: 0, elapsed_s: 0 },
  telemetry: null,
  tasks: [],
  activeTaskId: null,
  eta: null,
  alerts: [],
  alertHistory: [],
  nudge: null,
  fatigue: { score: 0, band: 'Fresh', minutes_to_high: null, hours_since_break: 0 },
  streak: { safe_hours: 0, safe_shifts: 0, points: 0, badges: [] },
  idleCost: { wasted_l: 0, wasted_cost: 0, co2_kg: 0, rate_per_min: 0, is_idling: false },
  weather: null,
  training: [],
  incidents: [],
  voice: { listening: false, speaking: false, transcript: '', lastReply: null },
  leaderboard: [],
  demoOpen: false,
  trainingSheetOpen: false,
  incidentSheetOpen: false,
  insightsSheetOpen: false,
  endOfShiftOpen: false,
};

export const useSpotterStore = create<SpotterStore>((set) => ({
  ...initialState,
  
  handleWsMessage: (msg) => set((state) => {
    switch (msg.type) {
      case 'hello': return { ...state, ...(msg.payload as Partial<AppState>) };
      case 'sim.state': return { sim: msg.payload as unknown as AppState['sim'] };
      case 'telemetry.tick': return { telemetry: msg.payload as unknown as AppState['telemetry'] };
      case 'telemetry.window': return { telemetry: msg.payload as unknown as AppState['telemetry'] };
      case 'alert.raised': return { alerts: [msg.payload as unknown as AppState['alerts'][0], ...state.alerts] };
      case 'alert.cleared': return { alerts: state.alerts.filter(a => a.id !== (msg.payload as any).id) };
      case 'nudge': return { nudge: msg.payload as unknown as AppState['nudge'] };
      case 'score.updated': return { fatigue: msg.payload as unknown as AppState['fatigue'] };
      case 'eta.updated': return { eta: msg.payload as unknown as AppState['eta'] };
      case 'task.updated': {
        const updatedTask = msg.payload as unknown as AppState['tasks'][0];
        const existing = state.tasks.find(t => t.id === updatedTask.id);
        if (existing) {
          return { tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) };
        } else {
          return { tasks: [...state.tasks, updatedTask] };
        }
      }
      case 'schedule.reordered': return { tasks: msg.payload as unknown as AppState['tasks'] };
      case 'weather.updated': return { weather: msg.payload as unknown as AppState['weather'] };
      case 'training.queued': return { training: [...state.training, msg.payload as unknown as AppState['training'][0]] };
      case 'incident.logged': return { incidents: [msg.payload as unknown as AppState['incidents'][0], ...state.incidents] };
      case 'idle.cost': return { idleCost: msg.payload as unknown as AppState['idleCost'] };
      case 'voice.reply': return { voice: { ...state.voice, lastReply: msg.payload as unknown as AppState['voice']['lastReply'] } };
      case 'badge.unlocked': {
        const newBadge = msg.payload as unknown as AppState['streak']['badges'][0];
        return { streak: { ...state.streak, badges: [...state.streak.badges, newBadge] } };
      }
      default: return state;
    }
  }),
  
  setConnection: (status) => set({ connection: status }),
  clearNudge: () => set({ nudge: null }),
  selectTask: (id) => set({ activeTaskId: id }),
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  },
  setDemoOpen: (open) => set({ demoOpen: open }),
  setTrainingSheetOpen: (open) => set({ trainingSheetOpen: open }),
  setIncidentSheetOpen: (open) => set({ incidentSheetOpen: open }),
  setInsightsSheetOpen: (open) => set({ insightsSheetOpen: open }),
  setEndOfShiftOpen: (open) => set({ endOfShiftOpen: open }),
  ackAlert: (id) => set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
  dismissToast: (id) => set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
}));
