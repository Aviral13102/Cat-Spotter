from fastapi import APIRouter
from pydantic import BaseModel
from app.ml.predict import TimePredictor

router = APIRouter(prefix="/estimate", tags=["Estimate"])

class EstimateReq(BaseModel):
    task_type: str
    weather: str
    operator_skill: str
    machine_age_yrs: float

@router.post("")
async def estimate(req: EstimateReq):
    predictor = TimePredictor()
    return predictor.predict(req.task_type, req.weather, req.operator_skill, req.machine_age_yrs)
