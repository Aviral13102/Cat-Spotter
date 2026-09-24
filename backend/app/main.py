from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routers import state, tasks, estimate, safety, incidents, training, voice, sim, analytics
from app.ws import manager
from app.db import db
from app.sim.clock import SimClock
from app.sim.telemetry import TelemetryReplay
from app.sim.scenario import ScenarioPlayer
import asyncio

app = FastAPI(title="CAT Spotter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(state.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(estimate.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(training.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(sim.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

clock = None
telemetry = None
scenario = None

@app.on_event("startup")
async def startup_event():
    await db.init_db()
    
    global clock, telemetry, scenario
    clock = SimClock()
    telemetry = TelemetryReplay(clock)
    
    def on_telemetry(msg_type, payload):
        import asyncio
        asyncio.create_task(manager.broadcast({"type": msg_type, "payload": payload}))
        
    telemetry.register_callback(on_telemetry)
    
    scenario = ScenarioPlayer(clock)
    
    import json
    from app.config import settings
    schedule_path = settings.DATA_DIR / "content" / "schedule_seed.json"
    tasks = []
    if schedule_path.exists():
        with open(schedule_path, "r") as f:
            data = json.load(f)
            tasks = data.get("tasks", [])
            for t in tasks:
                t['status'] = 'pending'
                t['progress'] = 0
                t['eta'] = {"original": 60, "current": 60}
    
    manager.state = {
        "sim": {"playing": False, "speed": 1.0, "sim_time": "", "elapsed_s": 0.0, "window_index": 0},
        "tasks": tasks
    }
    
    # Start automatically in background
    scenario.manager = manager
    scenario.tasks_state = tasks
    
    # clock.play()
    # asyncio.create_task(scenario.run())
    # asyncio.create_task(telemetry.run())

@app.on_event("shutdown")
async def shutdown_event():
    if telemetry: telemetry.stop()
    if scenario: scenario.stop()

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
