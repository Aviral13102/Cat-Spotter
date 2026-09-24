import pandas as pd
import numpy as np
import joblib
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score
from app.config import settings
from app.ml.features import build_preprocessor

def train_model():
    data_path = settings.SYNTHETIC_DIR / "tasks_augmented.csv"
    df = pd.read_csv(data_path)
    
    real_mask = df['source'] == 'real'
    df_real = df[real_mask]
    df_synth = df[~real_mask]
    
    X_synth = df_synth[['task_type', 'weather', 'operator_skill', 'machine_age_yrs']]
    y_synth = df_synth['actual_time_min'] / df_synth['estimated_time_min']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_synth, y_synth, test_size=0.2, random_state=settings.SEED
    )
    
    X_real = df_real[['task_type', 'weather', 'operator_skill', 'machine_age_yrs']]
    y_real = df_real['actual_time_min'] / df_real['estimated_time_min']
    
    preprocessor = build_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    X_real_processed = preprocessor.transform(X_real)
    
    model = RandomForestRegressor(
        n_estimators=300, min_samples_leaf=2, random_state=settings.SEED, n_jobs=-1
    )
    model.fit(X_train_processed, y_train)
    
    preds_test = model.predict(X_test_processed)
    preds_real = model.predict(X_real_processed)
    
    metrics = {
        'synthetic_holdout': {
            'mae': float(mean_absolute_error(y_test, preds_test)),
            'mape': float(mean_absolute_percentage_error(y_test, preds_test)),
            'r2': float(r2_score(y_test, preds_test))
        },
        'real_data': {
            'mae': float(mean_absolute_error(y_real, preds_real)),
            'mape': float(mean_absolute_percentage_error(y_real, preds_real)),
            'r2': float(r2_score(y_real, preds_real))
        }
    }
    
    print("Metrics:", json.dumps(metrics, indent=2))
    assert metrics['synthetic_holdout']['mape'] < 0.12, "MAPE on synthetic holdout exceeds 12%"
    
    # Sanity checks
    def predict_single(task, weather, skill, age):
        X = pd.DataFrame([{
            'task_type': task, 'weather': weather, 'operator_skill': skill, 'machine_age_yrs': age
        }])
        X_p = preprocessor.transform(X)
        return model.predict(X_p)[0]
    
    # Check 1: Skill monotonicity
    assert predict_single('Trenching', 'Sunny', 'Beginner', 5) > predict_single('Trenching', 'Sunny', 'Expert', 5)

    
    # Check 2: Weather interaction
    assert predict_single('Trenching', 'Rainy', 'Intermediate', 5) >= predict_single('Trenching', 'Sunny', 'Intermediate', 5)
    assert predict_single('Demolition', 'Windy', 'Intermediate', 5) >= predict_single('Demolition', 'Sunny', 'Intermediate', 5)
    
    settings.ML_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(preprocessor, settings.ML_ARTIFACTS_DIR / "preprocessor.joblib")
    joblib.dump(model, settings.ML_ARTIFACTS_DIR / "model.joblib")
    
    with open(settings.ML_ARTIFACTS_DIR / "evaluation.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    with open(settings.ML_ARTIFACTS_DIR / "meta.json", "w") as f:
        json.dump({"features": preprocessor.get_feature_names_out().tolist()}, f, indent=2)
        
    print("Training complete and artifacts saved.")

if __name__ == '__main__':
    train_model()
