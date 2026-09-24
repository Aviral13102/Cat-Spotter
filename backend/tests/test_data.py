import csv
from pathlib import Path
import pytest

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "raw"

def test_telemetry_csv_shape():
    """Verify telemetry.csv has exactly 4 data rows with correct columns."""
    path = DATA_DIR / "telemetry.csv"
    assert path.exists(), f"telemetry.csv not found at {path}"
    with open(path, newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == 4, f"Expected 4 rows, got {len(rows)}"
    expected_cols = {
        'timestamp', 'machine_id', 'operator_id', 'engine_hours',
        'fuel_used_l', 'load_cycles', 'idling_time_min',
        'seatbelt_status', 'safety_alert_triggered'
    }
    assert set(reader.fieldnames) == expected_cols

def test_telemetry_csv_values():
    """Verify exact values from Section 3.1."""
    path = DATA_DIR / "telemetry.csv"
    with open(path, newline='') as f:
        rows = list(csv.DictReader(f))
    # Row 1: healthy
    assert rows[0]['machine_id'] == 'EXC001'
    assert rows[0]['operator_id'] == 'OP1001'
    assert float(rows[0]['engine_hours']) == 1523.5
    assert float(rows[0]['fuel_used_l']) == 5.2
    assert int(rows[0]['load_cycles']) == 12
    assert int(rows[0]['idling_time_min']) == 30
    assert rows[0]['seatbelt_status'] == 'Fastened'
    assert rows[0]['safety_alert_triggered'] == 'No'
    # Row 2: problematic
    assert rows[1]['seatbelt_status'] == 'Unfastened'
    assert rows[1]['safety_alert_triggered'] == 'Yes'
    assert int(rows[1]['idling_time_min']) == 55
    assert int(rows[1]['load_cycles']) == 2
    # Row 4: problematic
    assert rows[3]['seatbelt_status'] == 'Unfastened'
    assert rows[3]['safety_alert_triggered'] == 'Yes'
    assert int(rows[3]['idling_time_min']) == 60

def test_tasks_history_csv_shape():
    """Verify tasks_history.csv has exactly 5 rows with correct columns."""
    path = DATA_DIR / "tasks_history.csv"
    assert path.exists(), f"tasks_history.csv not found at {path}"
    with open(path, newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert len(rows) == 5, f"Expected 5 rows, got {len(rows)}"
    expected_cols = {
        'task_id', 'task_type', 'weather', 'operator_skill',
        'machine_age_yrs', 'estimated_time_min', 'actual_time_min'
    }
    assert set(reader.fieldnames) == expected_cols

def test_tasks_history_csv_values():
    """Verify exact values and overrun ratios from Section 3.3."""
    path = DATA_DIR / "tasks_history.csv"
    with open(path, newline='') as f:
        rows = list(csv.DictReader(f))
    expected_ratios = {
        'T001': 58/60,   # 0.9667
        'T002': 52/45,   # 1.1556
        'T003': 42/30,   # 1.40
        'T004': 33/35,   # 0.9429
        'T005': 105/90,  # 1.1667
    }
    for row in rows:
        tid = row['task_id']
        actual = float(row['actual_time_min'])
        estimate = float(row['estimated_time_min'])
        ratio = actual / estimate
        assert abs(ratio - expected_ratios[tid]) < 0.01, f"{tid}: expected ratio {expected_ratios[tid]:.4f}, got {ratio:.4f}"
    # T003 is Beginner + Cloudy = worst overrun
    assert rows[2]['operator_skill'] == 'Beginner'
    assert rows[2]['weather'] == 'Cloudy'

def test_fuel_per_cycle():
    """Verify fuel-per-cycle computation from Section 3.3."""
    path = DATA_DIR / "telemetry.csv"
    with open(path, newline='') as f:
        rows = list(csv.DictReader(f))
    # Row 1: 5.2/12 = 0.4333
    fpc_1 = float(rows[0]['fuel_used_l']) / int(rows[0]['load_cycles'])
    assert abs(fpc_1 - 0.43) < 0.01
    # Row 2: 3.8/2 = 1.90 (bad)
    fpc_2 = float(rows[1]['fuel_used_l']) / max(int(rows[1]['load_cycles']), 1)
    assert abs(fpc_2 - 1.90) < 0.01
    # Row 3: 6.1/10 = 0.61
    fpc_3 = float(rows[2]['fuel_used_l']) / int(rows[2]['load_cycles'])
    assert abs(fpc_3 - 0.61) < 0.01
    # Row 4: 2.0/1 = 2.00 (bad)
    fpc_4 = float(rows[3]['fuel_used_l']) / max(int(rows[3]['load_cycles']), 1)
    assert abs(fpc_4 - 2.00) < 0.01
