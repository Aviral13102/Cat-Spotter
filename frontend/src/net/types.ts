export type Severity = 'info' | 'notice' | 'warning' | 'critical';

export interface Alert {
  id: string;
  rule_id: string;
  severity: Severity;
  title: string;
  detail: string;
  ts: string;
  requires_ack: boolean;
  say: string;
  options: string[];
  data: Record<string, unknown>;
}

export interface Eta {
  task_id: string;
  predicted_min: number;
  low_min: number;
  high_min: number;
  confidence: number;
  baseline_min: number;
  drivers: { label: string; delta_min: number }[];
}

export type TaskStatus = 'queued' | 'active' | 'done';

export interface Task {
  id: string;
  task_type: string;
  site: 'A' | 'B';
  planned_start: string;
  status: TaskStatus;
  predicted_min: number;
  progress: number;
  pinned: boolean;
}

export interface TelemetryTick {
  engine_hours: number;
  fuel_used_l: number;
  load_cycles: number;
  idling_time_min: number;
  seatbelt_status: 'Fastened' | 'Unfastened';
  fuel_level_l: number;
  fuel_per_cycle: number;
}

export interface WeatherData {
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Windy';
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  forecast: ForecastHour[];
}

export interface ForecastHour {
  hour: string;
  condition: string;
  temperature_c: number;
}

export interface FatigueScore {
  score: number;
  band: 'Fresh' | 'Watch' | 'High';
  minutes_to_high: number | null;
  hours_since_break: number;
}

export interface IdleCost {
  wasted_l: number;
  wasted_cost: number;
  co2_kg: number;
  rate_per_min: number;
  is_idling: boolean;
}

export interface StreakData {
  safe_hours: number;
  safe_shifts: number;
  points: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earned_at?: string;
}

export interface Nudge {
  id: string;
  say: string;
  options: string[];
  rule_id?: string;
  priority: number;
}

export interface TrainingItem {
  id: string;
  module_id: string;
  title: string;
  description: string;
  reason: string;
  status: 'queued' | 'in_progress' | 'completed';
  queued_at: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: Severity;
  description: string;
  conditions_snapshot: Record<string, unknown>;
  auto_drafted: boolean;
  confirmed: boolean;
  created_at: string;
}

export interface SimState {
  playing: boolean;
  speed: number;
  sim_time: string;
  window_index: number;
  elapsed_s: number;
}

export interface VoiceReply {
  intent: string;
  reply: string;
  speak: string;
  ui_actions: { type: string; payload?: Record<string, unknown> }[];
}

export interface LeaderboardEntry {
  operator_id: string;
  name: string;
  points: number;
  badges: number;
  rank: number;
  is_self: boolean;
}

export interface GhostComparison {
  task_type: string;
  expert_predicted_min: number;
  operator_predicted_min: number;
  gap_min: number;
  expert_fuel_per_cycle: number;
  operator_fuel_per_cycle: number;
  label: string; // always "Simulated benchmark"
}

export interface ResourceForecast {
  total_fuel_needed_l: number;
  fuel_on_hand_l: number;
  shortfall_l: number;
  refuel_needed: boolean;
  total_cycles: number;
  per_task: {
    task_id: string;
    task_type: string;
    predicted_cycles: number;
    predicted_fuel_l: number;
  }[];
}

// WebSocket message envelope
export interface WsMessage {
  type: string;
  seq: number;
  ts: string;
  payload: Record<string, unknown>;
}

export interface AppState {
  connection: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  sim: SimState;
  telemetry: TelemetryTick | null;
  tasks: Task[];
  activeTaskId: string | null;
  eta: Eta | null;
  alerts: Alert[];
  alertHistory: Alert[];
  nudge: Nudge | null;
  fatigue: FatigueScore;
  streak: StreakData;
  idleCost: IdleCost;
  weather: WeatherData | null;
  training: TrainingItem[];
  incidents: Incident[];
  voice: {
    listening: boolean;
    speaking: boolean;
    transcript: string;
    lastReply: VoiceReply | null;
  };
  leaderboard: LeaderboardEntry[];
}
