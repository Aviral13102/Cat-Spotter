from app.config import settings

INTENSITIES = {
    'Earth Excavation': 1.0,
    'Trenching': 0.9,
    'Material Loading': 1.1,
    'Grading': 0.7,
    'Demolition': 0.8
}

def check_fuel_forecast(tasks, fuel_on_hand=settings.START_FUEL_L):
    total_fuel = 0.0
    has_site_b = False
    
    for t in tasks:
        predicted_min = t.get('predicted_min', 60)
        cycles = (predicted_min / 60.0) * settings.PRODUCTIVE_CYCLES_PER_HR * INTENSITIES.get(t['type'], 1.0)
        fuel = cycles * settings.FUEL_PER_CYCLE_L
        total_fuel += fuel
        if t.get('site') == 'Site-B':
            has_site_b = True
            
    required = total_fuel * (1.0 + settings.FUEL_RESERVE_PCT / 100.0)
    shortfall = required - fuel_on_hand
    
    return {
        "refuel_needed": shortfall > 0,
        "shortfall_l": max(0.0, shortfall),
        "warning": (shortfall > 0 and has_site_b)
    }
