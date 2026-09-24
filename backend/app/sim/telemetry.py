import asyncio
import csv
import json
import random
from pathlib import Path
from app.config import settings
from app.sim.clock import SimClock

class TelemetryReplay:
    def __init__(self, clock: SimClock):
        self.clock = clock
        self.window_real_s = 12.0
        self.data_rows = []
        self.load_data()
        self.fuel_level = settings.START_FUEL_L
        self.current_engine_hours = 0.0
        self.callbacks = []
        self.is_running = False

    def load_data(self):
        path = settings.RAW_DIR / "telemetry.csv"
        with open(path, "r") as f:
            reader = csv.DictReader(f)
            self.data_rows = list(reader)
        if self.data_rows:
            self.current_engine_hours = float(self.data_rows[0]['engine_hours'])

    def register_callback(self, cb):
        self.callbacks.append(cb)

    async def run(self):
        self.is_running = True
        idx = 0
        while self.is_running:
            if not self.clock.is_playing:
                await asyncio.sleep(0.5)
                continue
                
            row = self.data_rows[idx % len(self.data_rows)].copy()
            if idx >= len(self.data_rows):
                row['machine_id'] = 'EXC001'
                row['operator_id'] = 'OP1001'
                self.current_engine_hours += 0.5
                row['engine_hours'] = f"{self.current_engine_hours:.1f}"
                row['fuel_used_l'] = f"{random.uniform(2.0, 6.0):.1f}"
                row['load_cycles'] = str(random.randint(2, 12))
                row['idling_time_min'] = str(random.randint(10, 60))
                row['seatbelt_status'] = random.choice(['Fastened', 'Unfastened'])
                row['safety_alert_triggered'] = 'Yes' if row['seatbelt_status'] == 'Unfastened' else 'No'
                
            fuel_used = float(row['fuel_used_l'])
            self.fuel_level = max(0.0, self.fuel_level - fuel_used)
            
            payload = {
                'machine_id': row['machine_id'],
                'operator_id': row['operator_id'],
                'engine_hours': float(row['engine_hours']),
                'fuel_used_l': fuel_used,
                'fuel_level_l': self.fuel_level,
                'load_cycles': int(row['load_cycles']),
                'idling_time_min': int(row['idling_time_min']),
                'seatbelt_status': row['seatbelt_status'],
                'safety_alert_triggered': row['safety_alert_triggered'],
                'sim_time': self.clock.sim_time.isoformat(),
                'is_simulated': idx >= len(self.data_rows)
            }
            
            for cb in self.callbacks:
                cb('telemetry.window', payload)
                
            # Simulate 1Hz ticks for window_real_s seconds
            steps = int(self.window_real_s)
            for step in range(steps):
                if not self.is_running:
                    break
                if not self.clock.is_playing:
                    await asyncio.sleep(0.5)
                    continue
                
                tick_payload = payload.copy()
                tick_payload['tick_step'] = step
                for cb in self.callbacks:
                    cb('telemetry.tick', tick_payload)
                await asyncio.sleep(1.0 / (self.clock.speed / 60.0 if self.clock.speed > 0 else 1.0))
                
            idx += 1

    def stop(self):
        self.is_running = False
