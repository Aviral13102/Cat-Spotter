import csv
import random
import os
import math
import numpy as np
from pathlib import Path
from app.config import settings

def compute_ratio(skill, weather, task, age, epsilon=0.0):
    m_skill = {'Expert': 0.96, 'Intermediate': 1.00, 'Beginner': 1.32}.get(skill, 1.0)
    m_weather = {'Sunny': 1.00, 'Cloudy': 1.02, 'Rainy': 1.06, 'Windy': 1.04}.get(weather, 1.0)
    
    m_task_weather = 1.0
    if task == 'Trenching' and weather == 'Rainy':
        m_task_weather = 1.05
    elif task == 'Demolition' and weather == 'Windy':
        m_task_weather = 1.06
    elif task == 'Grading' and weather == 'Rainy':
        m_task_weather = 1.04
    elif task == 'Material Loading' and weather == 'Rainy':
        m_task_weather = 1.03
        
    m_age = max(1.0, 1.0 + 0.01 * (age - 2))
    return m_skill * m_weather * m_task_weather * m_age * (1 + epsilon)

def run_augmentation():
    random.seed(settings.SEED)
    np.random.seed(settings.SEED)
    
    settings.SYNTHETIC_DIR.mkdir(parents=True, exist_ok=True)
    
    real_csv = settings.RAW_DIR / "tasks_history.csv"
    real_data = []
    if real_csv.exists():
        with open(real_csv, 'r') as f:
            reader = csv.DictReader(f)
            real_data = list(reader)
            
    print("Calibration checks for real data:")
    for row in real_data:
        actual = float(row['actual_time_min'])
        est = float(row['estimated_time_min'])
        actual_ratio = actual / est
        
        expected_ratio = compute_ratio(
            row['operator_skill'],
            row['weather'],
            row['task_type'],
            float(row['machine_age_yrs'])
        )
        
        diff_pct = abs(actual_ratio - expected_ratio) / expected_ratio * 100
        print(f"Task {row['task_id']}: Actual {actual_ratio:.4f}, Expected {expected_ratio:.4f}, Diff {diff_pct:.2f}%")
        assert diff_pct <= 8.0, f"Task {row['task_id']} failed calibration check!"
        row['source'] = 'real'
    
    from app.ml.features import TASK_TYPES, WEATHERS, SKILLS, BASELINE_ESTIMATES
    
    synthetic_data = []
    for i in range(800):
        task = random.choice(TASK_TYPES)
        weather = random.choice(WEATHERS)
        skill = random.choice(SKILLS)
        age = round(random.uniform(0.5, 15.0), 1)
        
        sigma = 0.03 + 0.008 * age
        epsilon = np.random.normal(0, sigma)
        
        ratio = compute_ratio(skill, weather, task, age, epsilon)
        
        base_est = BASELINE_ESTIMATES[task]
        est = round(base_est * random.uniform(0.9, 1.1))
        actual = round(est * ratio)
        
        synthetic_data.append({
            'task_id': f'S{i:04d}',
            'task_type': task,
            'weather': weather,
            'operator_skill': skill,
            'machine_age_yrs': age,
            'estimated_time_min': est,
            'actual_time_min': actual,
            'source': 'synthetic'
        })
        
    all_data = real_data + synthetic_data
    
    out_file = settings.SYNTHETIC_DIR / "tasks_augmented.csv"
    with open(out_file, 'w', newline='') as f:
        fieldnames = ['task_id', 'task_type', 'weather', 'operator_skill', 'machine_age_yrs', 'estimated_time_min', 'actual_time_min', 'source']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_data)
        
    print(f"Augmentation complete. Saved {len(all_data)} rows to {out_file}")

if __name__ == '__main__':
    run_augmentation()
