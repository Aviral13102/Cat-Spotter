from app.ml.predict import TimePredictor
from app.config import settings

def compute_ghost(task_type: str, weather: str, operator_predicted_min: float, machine_age_yrs: float = 2.0):
    predictor = TimePredictor()
    expert_res = predictor.predict(task_type, weather, 'Expert', machine_age_yrs)
    expert_min = expert_res['predicted_min']
    
    lost = max(0.0, operator_predicted_min - expert_min)
    
    # Fuel benchmark
    fuel_expert = settings.FUEL_PER_CYCLE_L * 1.0
    fuel_inter = settings.FUEL_PER_CYCLE_L * 1.15
    fuel_beginner = settings.FUEL_PER_CYCLE_L * 1.40
    
    return {
        "expert_predicted_min": expert_min,
        "minutes_lost": lost,
        "fuel_benchmark_expert": fuel_expert,
        "fuel_benchmark_inter": fuel_inter,
        "fuel_benchmark_beginner": fuel_beginner,
        "label": "Simulated benchmark"
    }
