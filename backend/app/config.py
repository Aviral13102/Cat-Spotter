from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    # Global
    SEED: int = 42
    
    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_NUDGE_MODEL: str = "claude-haiku-4-5-20251001"
    CLAUDE_VOICE_MODEL: str = "claude-haiku-4-5-20251001"
    LLM_TIMEOUT_S: int = 4
    
    # Fuel & cost (all labelled 'Assumed rate' in UI)
    DIESEL_PRICE_PER_L: float = 92.0
    IDLE_BURN_L_PER_HR: float = 3.0
    CO2_KG_PER_L: float = 2.68
    TANK_CAPACITY_L: float = 60.0
    START_FUEL_L: float = 28.0
    FUEL_RESERVE_PCT: float = 15.0
    CURRENCY_SYMBOL: str = "₹"
    
    # Productivity
    PRODUCTIVE_CYCLES_PER_HR: int = 11
    FUEL_PER_CYCLE_L: float = 0.52
    
    # Shift
    SHIFT_START: str = "08:00"
    SHIFT_DURATION_HRS: int = 8
    
    # Weather
    SITE_LAT: float = 28.6139
    SITE_LON: float = 77.2090
    
    # Demo
    DEMO_MODE: bool = True
    
    # Database
    DB_PATH: str = "data/cat_spotter.db"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Derived paths
    @property
    def PROJECT_ROOT(self) -> Path:
        return Path(__file__).parent.parent.parent
    
    @property
    def DATA_DIR(self) -> Path:
        return self.PROJECT_ROOT / "data"
    
    @property
    def RAW_DIR(self) -> Path:
        return self.DATA_DIR / "raw"
    
    @property
    def SYNTHETIC_DIR(self) -> Path:
        return self.DATA_DIR / "synthetic"
    
    @property
    def CONTENT_DIR(self) -> Path:
        return self.DATA_DIR / "content"
    
    @property
    def ML_ARTIFACTS_DIR(self) -> Path:
        return Path(__file__).parent / "ml" / "artifacts"
    
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


def get_settings() -> Settings:
    # Look for .env in project root
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        return Settings(_env_file=str(env_path))
    return Settings()

settings = get_settings()
