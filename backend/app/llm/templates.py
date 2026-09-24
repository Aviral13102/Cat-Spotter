def get_fallback_template(rule_id: str, data: dict) -> str:
    if rule_id == "R-SB-01":
        return "⚠️ Seatbelt unfastened. Please fasten your seatbelt immediately."
    elif rule_id == "R-IDLE-01":
        return f"You've been idling for {data.get('idle_min', 0)} minutes. Everything okay?"
    elif rule_id == "R-IDLE-02":
        return f"Idle time at {data.get('idle_min', 0)} minutes with {data.get('cycles', 0)} load cycles. Waiting on a truck, machine issue, or taking a break?"
    elif rule_id == "R-IDLE-03":
        return "Excessive idling detected. Please acknowledge."
    elif rule_id == "R-PROX-01":
        return "Proximity alert!"
    elif rule_id == "R-FUEL-01":
        return "High fuel consumption detected."
    elif rule_id == "R-FAT-01":
        return "High fatigue score. Please take a break."
    elif rule_id == "R-PROD-01":
        return "Low productivity detected."
    elif rule_id == "R-TASK-01":
        return "Task is taking longer than expected."
    return "Attention required."
