import httpx
import json
from app.config import settings

class WeatherProvider:
    def __init__(self):
        self.lat = settings.SITE_LAT
        self.lon = settings.SITE_LON
        self.override = None
        self.forecast_override = []
        self.load_seed()
        
    def load_seed(self):
        path = settings.DATA_DIR / "content" / "schedule_seed.json"
        if path.exists():
            with open(path, "r") as f:
                data = json.load(f)
                self.forecast_override = data.get("forecast_override", [])
                
    def inject(self, condition):
        self.override = condition
        
    async def get_current(self):
        if self.override:
            return {"condition": self.override, "temp": 25.0}
        
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(
                    f"https://api.open-meteo.com/v1/forecast?latitude={self.lat}&longitude={self.lon}&current=temperature_2m,weather_code"
                )
                if res.status_code == 200:
                    data = res.json()
                    code = data["current"]["weather_code"]
                    condition = self._map_code(code)
                    return {"condition": condition, "temp": data["current"]["temperature_2m"]}
        except:
            pass
            
        return {"condition": "Sunny", "temp": 22.0}
        
    async def get_forecast(self):
        if self.forecast_override:
            return self.forecast_override
        return [{"hour": i, "condition": "Sunny"} for i in range(8)]
        
    def _map_code(self, code):
        if code <= 3: return "Sunny"
        if code <= 48: return "Cloudy"
        if code <= 67: return "Rainy"
        return "Windy"
