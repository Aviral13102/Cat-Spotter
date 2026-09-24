class StreaksEngine:
    def __init__(self):
        self.points = 0
        self.badges = set()
        
    def add_safe_hour(self):
        self.points += 10
        
    def add_quick_click(self):
        self.points += 25
        self.badges.add("Quick Click")
        
    def get_state(self):
        return {
            "points": self.points,
            "badges": list(self.badges),
            "shift_streak": 6
        }

class StreakTracker:
    def __init__(self):
        self.engine = StreaksEngine()
        
    def update(self, is_safe):
        if is_safe:
            self.engine.add_safe_hour()
        return self.engine.get_state()
