from fastapi import APIRouter
from app.engines.ghost import compute_ghost
from app.engines.forecast import check_fuel_forecast

router = APIRouter(tags=["Analytics"])

@router.get("/analytics/ghost")
async def ghost():
    return compute_ghost("Trenching", "Sunny", 50.0)

@router.get("/leaderboard")
async def leaderboard():
    return []

@router.get("/forecast/resources")
async def forecast():
    return check_fuel_forecast([{"type": "Earth Excavation", "site": "Site-A"}])
