import uuid
from typing import List, Dict, Any

class RuleEngine:
    def __init__(self):
        self.sb_unfastened_start = None

    def evaluate(self, tick_data: Dict[str, Any], is_live_tick: bool = False, proximity_m: float = None, fatigue_score: int = None, task_overrun_pct: float = None) -> List[Dict[str, Any]]:
        alerts = []
        now = tick_data.get('sim_time', '')
        
        # R-SB-01
        is_unfastened = (tick_data.get('seatbelt_status') == 'Unfastened')
        if is_unfastened:
            if is_live_tick:
                # Assuming sim_time is parsed or tick_step is used. For live ticks, grace 5s.
                step = tick_data.get('tick_step', 0)
                if step >= 5:
                    alerts.append(self._make_alert("R-SB-01", "critical", "Seatbelt Unfastened", "Seatbelt is unfastened while engine is running.", now, True, True))
            else:
                alerts.append(self._make_alert("R-SB-01", "critical", "Seatbelt Unfastened", "Seatbelt is unfastened while engine is running.", now, True, True))
                
        # R-IDLE-01, R-IDLE-02, R-IDLE-03
        idle = tick_data.get('idling_time_min', 0)
        if idle >= 60:
            alerts.append(self._make_alert("R-IDLE-03", "critical", "Excessive Idling", f"Idling for {idle} minutes.", now, True, True))
        elif idle >= 45:
            alerts.append(self._make_alert("R-IDLE-02", "warning", "High Idling", f"Idling for {idle} minutes.", now, False, True))
        elif idle > 30:
            alerts.append(self._make_alert("R-IDLE-01", "notice", "Idling Notice", f"Idling for {idle} minutes.", now, False, True))
            
        # R-PROD-01
        cycles = tick_data.get('load_cycles', 0)
        if cycles <= 2 and idle >= 45:
            alerts.append(self._make_alert("R-PROD-01", "warning", "Low Productivity", f"Only {cycles} cycles in high idle time.", now, False, False))
            
        # R-FUEL-01
        fuel = tick_data.get('fuel_used_l', 0.0)
        fpc = fuel / max(cycles, 1) if cycles > 0 else fuel
        if fpc > 1.5:
            alerts.append(self._make_alert("R-FUEL-01", "warning", "High Fuel Consumption", f"{fpc:.2f}L per cycle.", now, False, False))
            
        # R-PROX-01
        if proximity_m is not None:
            if proximity_m < 5:
                alerts.append(self._make_alert("R-PROX-01", "critical", "Proximity Critical", f"Object at {proximity_m}m.", now, True, True))
            elif proximity_m < 10:
                alerts.append(self._make_alert("R-PROX-01", "warning", "Proximity Warning", f"Object at {proximity_m}m.", now, False, True))
            elif proximity_m < 20:
                alerts.append(self._make_alert("R-PROX-01", "notice", "Proximity Notice", f"Object at {proximity_m}m.", now, False, False))
                
        # R-FAT-01
        if fatigue_score is not None and fatigue_score >= 65:
            alerts.append(self._make_alert("R-FAT-01", "warning", "High Fatigue", f"Fatigue score is {fatigue_score}.", now, False, True))
            
        # R-TASK-01
        if task_overrun_pct is not None and task_overrun_pct >= 15.0:
            alerts.append(self._make_alert("R-TASK-01", "notice", "Task Overrun", f"Task overrun by {task_overrun_pct}%.", now, False, False))
            
        return alerts

    def _make_alert(self, rule_id, severity, title, detail, ts, req_ack, say):
        return {
            "id": str(uuid.uuid4()),
            "rule_id": rule_id,
            "severity": severity,
            "title": title,
            "detail": detail,
            "ts": ts,
            "requires_ack": req_ack,
            "say": say,
            "options": [],
            "data": {}
        }
