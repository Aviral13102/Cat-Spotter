import pytest
from app.engines.sequencing import optimize_sequence
from app.engines.forecast import check_fuel_forecast
from app.engines.rules import RuleEngine
from app.engines.fatigue import compute_fatigue
from app.engines.ghost import compute_ghost
from app.engines.training_router import TrainingRouter
from app.engines.streaks import StreaksEngine
from app.ml.predict import TimePredictor

def test_b0_b1_schedule_and_forecast():
    tasks = [
        {"id": "T001", "type": "Trenching", "site": "Site-A"},
        {"id": "T002", "type": "Earth Excavation", "site": "Site-B"},
        {"id": "T003", "type": "Demolition", "site": "Site-A"}
    ]
    forecast = [{"hour": i, "condition": "Sunny"} for i in range(8)]
    forecast[1]["condition"] = "Rainy"
    
    seq = optimize_sequence(tasks, forecast)
    assert seq["saved_min"] >= 0
    
    # B1: Forecast
    # Inject predicted_min to simulate ML output
    tasks[0]["predicted_min"] = 45
    tasks[1]["predicted_min"] = 60
    tasks[2]["predicted_min"] = 90
    fuel_res = check_fuel_forecast(tasks, 10.0)  # Lower fuel to trigger warning
    assert fuel_res["refuel_needed"] is True
    assert fuel_res["shortfall_l"] > 0
    assert fuel_res["warning"] is True

def test_b2_b3_telemetry_rules():
    engine = RuleEngine()
    
    # B2 (nominal)
    t1 = {'seatbelt_status': 'Fastened', 'idling_time_min': 30, 'load_cycles': 12, 'fuel_used_l': 5.2, 'sim_time': '08:00'}
    alerts1 = engine.evaluate(t1)
    assert len(alerts1) == 0 # > 30 is the rule
    
    # B3 (problematic)
    t2 = {'seatbelt_status': 'Unfastened', 'idling_time_min': 55, 'load_cycles': 2, 'fuel_used_l': 3.8, 'sim_time': '08:12'}
    alerts2 = engine.evaluate(t2)
    ids = {a['rule_id'] for a in alerts2}
    assert ids == {"R-SB-01", "R-IDLE-02", "R-PROD-01", "R-FUEL-01"}

def test_b5_ghost_and_training():
    ghost = compute_ghost("Trenching", "Sunny", 60.0)
    assert ghost["label"] == "Simulated benchmark"
    assert ghost["minutes_lost"] > 0
    
    router = TrainingRouter()
    router.add_training("T001", "Trenching", "Task overrun > 15%")
    assert len(router.get_queue()) == 1
    assert router.get_queue()[0]["module"] == "Trenching Advanced Module"

def test_b7_fatigue():
    # 6 critical/warning alerts -> A = 1.0
    alerts = [{"severity": "critical"}] * 4
    res = compute_fatigue(4.0, alerts, 15, 0.8)
    # H = 4/6 = 0.66. A = 1.0. T=0. I=0.8
    # 0.4*0.66 + 0.3*1.0 + 0.15*0 + 0.15*0.8 = 0.264 + 0.3 + 0 + 0.12 = 0.684 -> 68
    assert res["score"] >= 65
    assert res["band"] == "High"
