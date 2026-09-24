import pytest
from app.engines.rules import RuleEngine
import csv
from pathlib import Path
from app.config import settings

@pytest.fixture
def rows():
    path = settings.RAW_DIR / "telemetry.csv"
    with open(path, "r") as f:
        return list(csv.DictReader(f))

def map_row(row):
    return {
        'seatbelt_status': row['seatbelt_status'],
        'idling_time_min': int(row['idling_time_min']),
        'load_cycles': int(row['load_cycles']),
        'fuel_used_l': float(row['fuel_used_l']),
        'sim_time': '10:00'
    }

def test_rule_row1(rows):
    engine = RuleEngine()
    alerts = engine.evaluate(map_row(rows[0]))
    assert len(alerts) == 0

def test_rule_row2(rows):
    engine = RuleEngine()
    alerts = engine.evaluate(map_row(rows[1]))
    rule_ids = {a['rule_id'] for a in alerts}
    assert rule_ids == {"R-SB-01", "R-IDLE-02", "R-PROD-01", "R-FUEL-01"}

def test_rule_row3(rows):
    engine = RuleEngine()
    alerts = engine.evaluate(map_row(rows[2]))
    assert len(alerts) == 0

def test_rule_row4(rows):
    engine = RuleEngine()
    alerts = engine.evaluate(map_row(rows[3]))
    rule_ids = {a['rule_id'] for a in alerts}
    assert rule_ids == {"R-SB-01", "R-IDLE-03", "R-PROD-01", "R-FUEL-01"}
