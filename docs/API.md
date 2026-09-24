# CAT Spotter — API Reference

## Base URL
All REST endpoints are prefixed with `/api`. WebSocket endpoint is at `/ws`.

## Authentication
No authentication required (demo product). CORS is configured to allow all origins.

---

## REST Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "ok",
  "llm_mode": "claude" | "template",
  "model_loaded": true,
  "sim_running": true,
  "version": "1.0.0"
}
```

### Full State Snapshot
```
GET /api/state
```
Returns the complete application state (used on WS connect and page reload).

### Tasks

#### Get Today's Schedule
```
GET /api/tasks/today
```
Returns an array of `Task` objects.

#### Start a Task
```
POST /api/tasks/{id}/start
```

#### Complete a Task
```
POST /api/tasks/{id}/complete
```

### Schedule Optimization
```
POST /api/schedule/optimize
```
Runs weather-optimised sequencing. Returns:
```json
{
  "new_order": ["D-02", "D-01", "D-03", "D-04", "D-05"],
  "old_total": 285,
  "new_total": 272,
  "saved_min": 13,
  "per_task_reason": [...]
}
```

### Resource Forecast
```
GET /api/forecast/resources
```
Returns fuel and cycle predictions for the shift.

### ETA Prediction
```
POST /api/estimate
```
Body:
```json
{
  "task_type": "Trenching",
  "weather": "Rainy",
  "operator_skill": "Intermediate",
  "machine_age_yrs": 4,
  "progress": 0.3
}
```
Response:
```json
{
  "predicted_min": 52,
  "low_min": 47,
  "high_min": 57,
  "confidence": 0.78,
  "baseline_min": 45,
  "drivers": [
    {"label": "Rainy weather", "delta_min": 3.2},
    {"label": "Machine age (4 yrs)", "delta_min": 1.1}
  ]
}
```

### Safety
```
GET /api/safety/score
```
Returns fatigue score, projection, and streak data.

### Incidents
```
GET /api/incidents
POST /api/incidents
```
Create body:
```json
{
  "type": "near_miss",
  "severity": "warning",
  "description": "Worker walked behind machine",
  "auto_drafted": false
}
```

### Idle Reasons
```
POST /api/idle-reasons
```
Body:
```json
{
  "reason": "waiting_truck",
  "window_index": 1
}
```

### Training Hub
```
GET /api/training/queue
GET /api/training/catalog
POST /api/training/{id}/complete
GET /api/training/slots
POST /api/training/bookings
```

### Leaderboard
```
GET /api/leaderboard
```

### Ghost Operator
```
GET /api/analytics/ghost?task_type=Trenching
```

### Voice Command
```
POST /api/voice/command
```
Body: `{"text": "how long will this take"}`
Response: `{"intent": "eta", "reply": "...", "speak": "...", "ui_actions": [...]}`

### Simulation Control (DEMO_MODE only)
```
POST /api/sim/control
```
Body: `{"action": "play"|"pause"|"reset"|"speed", "value": 2}`

### Simulation Injection (DEMO_MODE only)
```
POST /api/sim/inject
```
Body: `{"type": "seatbelt", "value": "unfastened"}` or `{"type": "proximity", "distance_m": 4, "kind": "person"}`

### Alert Acknowledgement
```
POST /api/ack/{alert_id}
```

---

## WebSocket Protocol

### Endpoint
```
ws(s)://<host>/ws
```

### Message Envelope
```json
{
  "type": "telemetry.tick",
  "seq": 42,
  "ts": "2025-05-01T08:15:00",
  "payload": { ... }
}
```

### Message Types (Server → Client)
| Type | Payload | When |
|---|---|---|
| `hello` | Full state snapshot | On connect |
| `sim.state` | SimState | Sim play/pause/speed change |
| `telemetry.tick` | TelemetryTick | Every sim-second |
| `telemetry.window` | Full window data | Window boundary |
| `alert.raised` | Alert | Rule triggers |
| `alert.cleared` | `{id}` | Alert resolved |
| `nudge` | Nudge | LLM/template nudge |
| `score.updated` | FatigueScore + StreakData | Score changes |
| `eta.updated` | `{old, new, delta_min, reason}` | ETA recalculation |
| `task.updated` | Task | Task status change |
| `schedule.reordered` | Reorder result | Schedule optimized |
| `weather.updated` | WeatherData | Weather change |
| `training.queued` | TrainingItem | Auto-queued lesson |
| `incident.logged` | Incident | New incident |
| `idle.cost` | IdleCost | Idle cost update |
| `voice.reply` | VoiceReply | Voice response |
| `badge.unlocked` | Badge | Badge earned |

### Client Rules
- Auto-reconnect with exponential backoff (500ms → 8s)
- Re-hydrate from `hello` on reconnect
- Ignore duplicate `seq` numbers
- Show connection status pill (animated)
