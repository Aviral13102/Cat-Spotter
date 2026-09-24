from fastapi import APIRouter
from app.engines.fatigue import compute_fatigue

router = APIRouter(tags=["Safety"])

@router.get("/safety/score")
async def get_safety_score():
    return compute_fatigue(1.0, [], 10, 0.1)

@router.post("/ack/{alert_id}")
async def ack_alert(alert_id: str):
    return {"status": "acknowledged", "alert_id": alert_id}
