from fastapi import APIRouter
from app.ws import manager
from app.engines.sequencing import optimize_sequence
import asyncio
import json
from app.config import settings

router = APIRouter(tags=["Tasks"])

# Load from schedule_seed
_tasks = []
_schedule_path = settings.DATA_DIR / "content" / "schedule_seed.json"
if _schedule_path.exists():
    with open(_schedule_path, "r") as f:
        data = json.load(f)
        for t in data.get("tasks", []):
            _tasks.append({
                "id": t["id"],
                "task_type": t["task_type"],
                "site": t["site"],
                "planned_start": t.get("planned_start", ""),
                "pinned": t.get("pinned", False),
                "status": "pending",
                "progress": 0,
                "eta": {"original": 60, "current": 60}
            })

@router.get("/tasks/today")
async def get_tasks():
    return _tasks

@router.post("/tasks/{task_id}/start")
async def start_task(task_id: str):
    for t in _tasks:
        if t["id"] == task_id:
            t["status"] = "active"
            t["progress"] = 0
            asyncio.create_task(manager.broadcast({"type": "task.updated", "payload": t}))
            return {"status": "started", "task": t}
    return {"status": "not_found"}

@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    for t in _tasks:
        if t["id"] == task_id:
            t["status"] = "completed"
            t["progress"] = 100
            asyncio.create_task(manager.broadcast({"type": "task.updated", "payload": t}))
            return {"status": "completed", "task": t}
    return {"status": "not_found"}

@router.post("/schedule/optimize")
async def optimize_schedule():
    result = optimize_sequence(_tasks, [{"condition": "Sunny"}])
    asyncio.create_task(manager.broadcast({"type": "schedule.reordered", "payload": _tasks}))
    return result
