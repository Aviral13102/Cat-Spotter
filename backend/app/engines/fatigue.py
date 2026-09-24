def compute_fatigue(hours_since_last_break, alerts, current_hour, idle_ratio):
    H = max(0.0, min(1.0, hours_since_last_break / 6.0))
    
    alert_sum = 0.0
    for a in alerts:
        if a['severity'] == 'critical': alert_sum += 1.0
        elif a['severity'] == 'warning': alert_sum += 0.5
        elif a['severity'] == 'notice': alert_sum += 0.2
    A = max(0.0, min(1.0, alert_sum / 4.0))
    
    # Circadian T: simple approximation
    T = 0.5 if (current_hour < 6 or current_hour > 22) else 0.0 # circadian dip
    
    I = max(0.0, min(1.0, idle_ratio))
    
    score = round(100.0 * (0.40 * H + 0.30 * A + 0.15 * T + 0.15 * I))
    
    band = "Fresh"
    if score >= 65: band = "High"
    elif score >= 35: band = "Watch"
    
    return {
        "score": score,
        "band": band,
        "minutes_to_high": (65 - score) * 2 if score < 65 else 0, # Dummy predictive
        "hours_since_break": hours_since_last_break
    }
