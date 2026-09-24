import json
import asyncio
from pathlib import Path
from app.config import settings
from app.engines.rules import RuleEngine
from app.engines.fatigue import compute_fatigue
from app.engines.idle_cost import compute_idle_cost
from app.engines.streaks import StreakTracker

class ScenarioPlayer:
    def __init__(self, clock):
        self.clock = clock
        self.scenario = []
        self.load_scenario()
        self.is_running = False
        self.rules = RuleEngine()
        self.streaks = StreakTracker()
        self.manager = None  # set externally
        self.tasks_state = []  # set externally
        self.current_task_idx = 0
        self.total_idle_min = 0
        self.hours_since_break = 0.0
        
    def load_scenario(self):
        path = settings.DATA_DIR / "content" / "scenario_demo.json"
        if path.exists():
            with open(path, "r") as f:
                raw = json.load(f)
                self.scenario = raw.get("beats", raw if isinstance(raw, list) else [])
                
    async def run(self):
        self.is_running = True
        beat_idx = 0
        while self.is_running and beat_idx < len(self.scenario):
            if not self.clock.is_playing:
                await asyncio.sleep(0.5)
                continue
                
            beat = self.scenario[beat_idx]
            if self.clock.elapsed_s >= beat['at_s']:
                await self.execute_beat(beat)
                beat_idx += 1
            else:
                await asyncio.sleep(0.3)
        
        # After all beats, show end-of-shift summary
        if self.is_running and self.manager:
            await asyncio.sleep(3)
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": "Shift complete! Great work today. Here's your summary.",
                "options": ["View Summary", "Dismiss"]
            }})
                
    async def execute_beat(self, beat):
        if not self.manager:
            print(f"No manager set, skipping beat: {beat['id']}")
            return
            
        action = beat['action']
        payload = beat.get('payload', {})
        bid = beat['id']
        print(f"[Scenario] Executing {bid}: {action}")
        
        if action == 'boot':
            greeting = payload.get('greeting', 'Shift starting. Stay safe.')
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": greeting,
                "options": ["Got it", "Show schedule"]
            }})
            # Send weather
            await self.manager.broadcast({"type": "weather.updated", "payload": {
                "condition": "Sunny", "temperature_c": 28, "wind_speed_kmh": 8, "source": "Open-Meteo"
            }})
            
        elif action == 'forecast_check':
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": "⛽ Fuel check: You have 28.0 L. At current burn rate, you'll need a refuel by 11:00. Plan accordingly.",
                "options": ["Refuel now", "Continue"]
            }})
            
        elif action == 'start_task_and_telemetry':
            task_id = payload.get('task_id', 'D-01')
            # Mark task active
            for t in self.tasks_state:
                if t['id'] == task_id:
                    t['status'] = 'active'
                    t['progress'] = 10
                    await self.manager.broadcast({"type": "task.updated", "payload": t})
                    break
            # Send healthy telemetry (Row 1 style)
            telem = {
                'machine_id': 'EXC-320F-001', 'operator_id': 'OP-1001',
                'engine_hours': 1200.5, 'fuel_used_l': 3.2, 'fuel_level_l': 24.8,
                'load_cycles': 11, 'idling_time_min': 30, 'seatbelt_status': 'Fastened',
                'safety_alert_triggered': 'No', 'sim_time': self.clock.sim_time.isoformat(),
                'is_simulated': False, 'fuel_per_cycle': 0.29
            }
            await self.manager.broadcast({"type": "telemetry.tick", "payload": telem})
            # Send ETA
            await self.manager.broadcast({"type": "eta.updated", "payload": {
                "predicted_min": 52.0, "range_low": 48.0, "range_high": 58.0,
                "confidence": 0.87, "drivers": [
                    {"name": "Weather", "value": "Sunny", "impact": "+0"},
                    {"name": "Operator Skill", "value": "Intermediate", "impact": "+3 min"},
                    {"name": "Machine Age", "value": "3 yrs", "impact": "+2 min"}
                ]
            }})
            self.hours_since_break = 1.0
            
        elif action == 'telemetry_window':
            window = payload.get('telemetry_window', 1)
            if window == 1:
                # Row 2: Bad - unfastened, high idle, low cycles
                telem = {
                    'machine_id': 'EXC-320F-001', 'operator_id': 'OP-1001',
                    'engine_hours': 1201.0, 'fuel_used_l': 3.8, 'fuel_level_l': 21.0,
                    'load_cycles': 2, 'idling_time_min': 55, 'seatbelt_status': 'Unfastened',
                    'safety_alert_triggered': 'Yes', 'sim_time': self.clock.sim_time.isoformat(),
                    'is_simulated': False, 'fuel_per_cycle': 1.90
                }
                self.total_idle_min = 55
                self.hours_since_break = 2.0
            else:
                # Row 3: Healthy recovery
                telem = {
                    'machine_id': 'EXC-320F-001', 'operator_id': 'OP-1001',
                    'engine_hours': 1202.0, 'fuel_used_l': 4.5, 'fuel_level_l': 16.5,
                    'load_cycles': 8, 'idling_time_min': 10, 'seatbelt_status': 'Fastened',
                    'safety_alert_triggered': 'No', 'sim_time': self.clock.sim_time.isoformat(),
                    'is_simulated': False, 'fuel_per_cycle': 0.56
                }
                self.hours_since_break = 3.0
            
            await self.manager.broadcast({"type": "telemetry.tick", "payload": telem})
            
            # Run rule engine
            alerts = self.rules.evaluate(telem)
            for alert in alerts:
                await self.manager.broadcast({"type": "alert.raised", "payload": alert})
            
            # Compute and send fatigue
            fatigue = compute_fatigue(self.hours_since_break, alerts, 10, self.total_idle_min / 60.0)
            await self.manager.broadcast({"type": "score.updated", "payload": fatigue})
            
            # Compute and send idle cost
            idle_cost = compute_idle_cost(telem['idling_time_min'])
            await self.manager.broadcast({"type": "idle.cost", "payload": idle_cost})
            
            # Update streaks
            streak_data = self.streaks.update(len(alerts) == 0)
            
            # Progress the active task
            for t in self.tasks_state:
                if t.get('status') == 'active':
                    t['progress'] = min(100, t.get('progress', 0) + 25)
                    await self.manager.broadcast({"type": "task.updated", "payload": t})
                    break
            
            # If bad telemetry, also send nudge
            if telem['idling_time_min'] >= 45:
                await self.manager.broadcast({"type": "nudge", "payload": {
                    "say": f"You've been idling for {telem['idling_time_min']} minutes. What's the reason?",
                    "options": ["Waiting for truck", "Break", "Equipment issue", "Other"]
                }})
                
        elif action == 'weather_change':
            new_weather = payload.get('new_weather', 'Rainy')
            await self.manager.broadcast({"type": "weather.updated", "payload": {
                "condition": new_weather, "temperature_c": 26, "wind_speed_kmh": 15, "source": "Open-Meteo"
            }})
            # Recalculate ETA with weather penalty
            await self.manager.broadcast({"type": "eta.updated", "payload": {
                "predicted_min": 64.0, "range_low": 58.0, "range_high": 72.0,
                "confidence": 0.72, "drivers": [
                    {"name": "Weather", "value": new_weather, "impact": "+12 min"},
                    {"name": "Operator Skill", "value": "Intermediate", "impact": "+3 min"},
                    {"name": "Machine Age", "value": "3 yrs", "impact": "+2 min"}
                ]
            }})
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": f"Weather changed to {new_weather}. I've adjusted your ETA. Consider reordering tasks.",
                "options": ["Reorder tasks", "Keep current order"]
            }})
            
        elif action == 'task_overrun':
            overrun = payload.get('overrun_pct', 18)
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": f"Task D-01 is running {overrun}% over estimate. I've queued a refresher training module for Trenching techniques.",
                "options": ["View training", "Dismiss"]
            }})
            await self.manager.broadcast({"type": "training.queued", "payload": {
                "id": "TRN-AUTO-01", "title": "Trenching Best Practices",
                "reason": f"Auto-queued: {overrun}% overrun on Trenching",
                "duration_min": 8, "status": "queued"
            }})
            
        elif action == 'telemetry_and_proximity':
            # Row 3 healthy + proximity danger
            telem = {
                'machine_id': 'EXC-320F-001', 'operator_id': 'OP-1001',
                'engine_hours': 1202.5, 'fuel_used_l': 4.0, 'fuel_level_l': 12.5,
                'load_cycles': 9, 'idling_time_min': 8, 'seatbelt_status': 'Fastened',
                'safety_alert_triggered': 'No', 'sim_time': self.clock.sim_time.isoformat(),
                'is_simulated': False, 'fuel_per_cycle': 0.44
            }
            await self.manager.broadcast({"type": "telemetry.tick", "payload": telem})
            
            self.hours_since_break = 3.5
            fatigue = compute_fatigue(self.hours_since_break, [], 10, 8.0 / 60.0)
            await self.manager.broadcast({"type": "score.updated", "payload": fatigue})
            
            idle_cost = compute_idle_cost(8)
            await self.manager.broadcast({"type": "idle.cost", "payload": idle_cost})
            
            # Safe streak increment
            streak_data = self.streaks.update(True)
            
            await asyncio.sleep(2)
            # Proximity danger!
            prox_alerts = self.rules.evaluate(telem, proximity_m=4.0)
            for alert in prox_alerts:
                await self.manager.broadcast({"type": "alert.raised", "payload": alert})
                
        elif action == 'telemetry_window_final':
            # Row 4: Worst - unfastened, idle 60, 1 cycle
            telem = {
                'machine_id': 'EXC-320F-001', 'operator_id': 'OP-1001',
                'engine_hours': 1203.5, 'fuel_used_l': 2.0, 'fuel_level_l': 10.5,
                'load_cycles': 1, 'idling_time_min': 60, 'seatbelt_status': 'Unfastened',
                'safety_alert_triggered': 'Yes', 'sim_time': self.clock.sim_time.isoformat(),
                'is_simulated': False, 'fuel_per_cycle': 2.00
            }
            self.total_idle_min = 60
            self.hours_since_break = 5.0
            
            await self.manager.broadcast({"type": "telemetry.tick", "payload": telem})
            
            alerts = self.rules.evaluate(telem, fatigue_score=72)
            for alert in alerts:
                await self.manager.broadcast({"type": "alert.raised", "payload": alert})
            
            fatigue = compute_fatigue(self.hours_since_break, alerts, 10, self.total_idle_min / 60.0)
            await self.manager.broadcast({"type": "score.updated", "payload": fatigue})
            
            idle_cost = compute_idle_cost(60)
            await self.manager.broadcast({"type": "idle.cost", "payload": idle_cost})
            
            # Complete the active task
            for t in self.tasks_state:
                if t.get('status') == 'active':
                    t['status'] = 'completed'
                    t['progress'] = 100
                    await self.manager.broadcast({"type": "task.updated", "payload": t})
                    break
            
            await self.manager.broadcast({"type": "nudge", "payload": {
                "say": "⚠️ Fatigue level is HIGH. You've been working 5 hours without a break. I strongly recommend a 15-minute rest.",
                "options": ["Take break now", "Continue working"]
            }})
        
    def stop(self):
        self.is_running = False
