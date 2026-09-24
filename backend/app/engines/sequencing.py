import itertools
from app.ml.predict import TimePredictor

def optimize_sequence(tasks, forecast):
    predictor = TimePredictor()
    best_order = None
    min_total = float('inf')
    
    # Pre-evaluate for old total
    old_total = 0
    for t in tasks:
        # Assuming intermediate and current weather
        res = predictor.predict(t['type'], forecast[0]['condition'], 'Intermediate', t.get('age', 2.0))
        old_total += res['predicted_min']
        
    for order in itertools.permutations(tasks):
        total = 0
        current_min = 0
        for t in order:
            hr = min(int(current_min / 60), len(forecast) - 1)
            weather = forecast[hr]['condition']
            res = predictor.predict(t['type'], weather, 'Intermediate', t.get('age', 2.0))
            total += res['predicted_min']
            current_min += res['predicted_min'] + 10 # 10 min transition
            
        if total < min_total:
            min_total = total
            best_order = order
            
    return {
        "new_order": [t['id'] for t in best_order] if best_order else [],
        "old_total": old_total,
        "new_total": min_total,
        "saved_min": old_total - min_total,
        "per_task_reason": {}
    }
