from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/sim", tags=["Sim"])

class SimControlReq(BaseModel):
    action: str
    speed: float = 60.0

@router.post("/control")
async def control_sim(req: SimControlReq):
    from app.main import clock, scenario, telemetry
    from app.ws import manager
    if req.action == "play":
        clock.play()
        if not scenario.is_running:
            import asyncio
            asyncio.create_task(scenario.run())
        if not telemetry.is_running:
            import asyncio
            asyncio.create_task(telemetry.run())
    elif req.action == "pause":
        clock.pause()
    elif req.action == "reset":
        clock.reset()
    elif req.action == "speed":
        clock.speed = req.speed
        
    state = {"playing": clock.is_playing, "speed": clock.speed, "sim_time": "", "elapsed_s": clock.elapsed_s, "window_index": 0}
    manager.state["sim"] = state
    await manager.broadcast({"type": "sim.state", "payload": state})
    return {"status": req.action}

@router.post("/inject")
async def inject_sim(payload: dict):
    from app.ws import manager
    import asyncio
    
    # Allow injecting any message type, defaulting to telemetry.tick
    msg_type = payload.get("type", "telemetry.tick")
    msg_data = payload.get("payload", payload)
    
    asyncio.create_task(manager.broadcast({"type": msg_type, "payload": msg_data}))
    return {"status": "injected", "type": msg_type}
