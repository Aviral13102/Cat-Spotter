import joblib
import numpy as np
import pandas as pd
from app.config import settings
from app.ml.features import BASELINE_ESTIMATES

class TimePredictor:
    def __init__(self):
        self.preprocessor = joblib.load(settings.ML_ARTIFACTS_DIR / "preprocessor.joblib")
        self.model = joblib.load(settings.ML_ARTIFACTS_DIR / "model.joblib")
        self.model.n_jobs = 1  # Disable multiprocessing for single-row inference
        
    def predict(self, task_type: str, weather: str, operator_skill: str, machine_age_yrs: float) -> dict:
        baseline_min = BASELINE_ESTIMATES[task_type]
        
        task_idx = ['Earth Excavation', 'Trenching', 'Material Loading', 'Grading', 'Demolition'].index(task_type)
        weather_idx = ['Sunny', 'Cloudy', 'Rainy', 'Windy'].index(weather)
        skill_idx = ['Beginner', 'Intermediate', 'Expert'].index(operator_skill)
        
        x_task = [0.0]*5
        x_task[task_idx] = 1.0
        x_weather = [0.0]*4
        x_weather[weather_idx] = 1.0
        
        X_p = np.array([x_task + x_weather + [float(skill_idx), machine_age_yrs]])
        
        skill_idx_neutral = 1
        X_skill_p = np.array([x_task + x_weather + [float(skill_idx_neutral), machine_age_yrs]])
        
        weather_idx_neutral = 0
        x_weather_neutral = [1.0, 0.0, 0.0, 0.0]
        X_weather_p = np.array([x_task + x_weather_neutral + [float(skill_idx), machine_age_yrs]])
        
        X_age_p = np.array([x_task + x_weather + [float(skill_idx), 2.0]])
        
        X_all = np.vstack([X_p, X_skill_p, X_weather_p, X_age_p])
        all_preds = self.model.predict(X_all)
        
        pred_ratio = all_preds[0]
        pred_skill_neutral = all_preds[1]
        pred_weather_neutral = all_preds[2]
        pred_age_neutral = all_preds[3]
        
        leaves = self.model.apply(X_p)[0]
        preds = np.array([self.model.estimators_[i].tree_.value[leaf][0][0] for i, leaf in enumerate(leaves)])
        tree_std = np.std(preds)
        
        sigma_age = 0.03 + 0.008 * machine_age_yrs
        half_width = 1.28 * np.sqrt(tree_std**2 + sigma_age**2)
        
        predicted_min = pred_ratio * baseline_min
        low_min = (pred_ratio - half_width) * baseline_min
        high_min = (pred_ratio + half_width) * baseline_min
        
        confidence = max(0.35, min(0.97, 1 - 6 * (half_width / pred_ratio)))
        
        # Drivers analysis
        drivers = []
        
        # Skill driver
        delta_skill = (pred_ratio - pred_skill_neutral) * baseline_min
        if abs(delta_skill) > 0.5:
            drivers.append({"label": f"Skill: {operator_skill}", "delta_min": float(delta_skill)})
            
        # Weather driver
        delta_weather = (pred_ratio - pred_weather_neutral) * baseline_min
        if abs(delta_weather) > 0.5:
            drivers.append({"label": f"Weather: {weather}", "delta_min": float(delta_weather)})
            
        # Age driver
        delta_age = (pred_ratio - pred_age_neutral) * baseline_min
        if abs(delta_age) > 0.5:
            drivers.append({"label": f"Age: {machine_age_yrs}y", "delta_min": float(delta_age)})
            
        return {
            'predicted_min': float(predicted_min),
            'low_min': float(low_min),
            'high_min': float(high_min),
            'confidence': float(confidence),
            'baseline_min': float(baseline_min),
            'drivers': drivers
        }

if __name__ == '__main__':
    predictor = TimePredictor()
    res = predictor.predict('Trenching', 'Rainy', 'Beginner', 5.0)
    import json
    print(json.dumps(res, indent=2))
