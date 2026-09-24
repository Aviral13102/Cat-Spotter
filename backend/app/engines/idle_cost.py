from app.config import settings

def compute_idle_cost(idle_min: float):
    wasted_l = (idle_min / 60.0) * settings.IDLE_BURN_L_PER_HR
    wasted_cost = wasted_l * settings.DIESEL_PRICE_PER_L
    co2_kg = wasted_l * settings.CO2_KG_PER_L
    
    return {
        "wasted_l": wasted_l,
        "wasted_cost": wasted_cost,
        "co2_kg": co2_kg,
        "rate_per_min": (settings.IDLE_BURN_L_PER_HR / 60.0) * settings.DIESEL_PRICE_PER_L,
        "is_idling": idle_min > 0
    }
