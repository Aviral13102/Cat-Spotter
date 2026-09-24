import json
import pytest
import time
from app.config import settings
from app.ml.predict import TimePredictor

def test_prediction_output():
    predictor = TimePredictor()
    res = predictor.predict('Trenching', 'Rainy', 'Beginner', 5.0)
    
    assert 'predicted_min' in res
    assert 'low_min' in res
    assert 'high_min' in res
    assert 'confidence' in res
    assert 'baseline_min' in res
    assert 'drivers' in res
    
    assert res['low_min'] < res['predicted_min']
    assert res['predicted_min'] < res['high_min']
    assert 0.35 <= res['confidence'] <= 0.97
    
    for driver in res['drivers']:
        assert 'label' in driver
        assert 'delta_min' in driver

def test_evaluation_metrics():
    eval_file = settings.ML_ARTIFACTS_DIR / "evaluation.json"
    assert eval_file.exists()
    
    with open(eval_file, "r") as f:
        metrics = json.load(f)
        
    assert metrics['synthetic_holdout']['mape'] < 0.12

def test_prediction_latency():
    predictor = TimePredictor()
    # Warmup
    predictor.predict('Earth Excavation', 'Sunny', 'Expert', 2.0)
    
    start_time = time.time()
    predictor.predict('Earth Excavation', 'Sunny', 'Expert', 2.0)
    duration = time.time() - start_time
    assert duration < 0.05, f"Prediction took {duration*1000:.2f}ms, which is >= 50ms"
