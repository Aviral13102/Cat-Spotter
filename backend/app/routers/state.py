from fastapi import APIRouter
from app.schemas import SimState
from app.ws import manager

router = APIRouter(prefix="/state", tags=["State"])

@router.get("", response_model=SimState)
async def get_state():
    # Return dummy state for now, main.py will populate it properly
    return manager.state.get("sim", {"playing": False, "speed": 1.0, "sim_time": "", "elapsed_s": 0.0})
