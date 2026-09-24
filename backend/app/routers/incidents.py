from fastapi import APIRouter
from app.db import db
from app.ws import manager
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import asyncio
import uuid

router = APIRouter(tags=["Incidents"])

class IncidentCreate(BaseModel):
    type: str
    severity: str = "warning"
    description: str
    location: str = ""
    equipment_part: str = ""
    weather: str = ""
    fatigue_score: int = 0

_incidents = []

@router.get("/incidents")
async def get_incidents():
    db_incidents = await db.get_incidents()
    # Merge DB incidents with in-memory ones
    all_incidents = []
    for i in db_incidents:
        all_incidents.append({
            "id": str(i["id"]),
            "type": i["type"],
            "severity": "warning",
            "description": i["description"],
            "location": "",
            "equipment_part": "",
            "conditions_snapshot": {"weather": "", "fatigue_score": 0},
            "auto_drafted": False,
            "confirmed": True,
            "created_at": datetime.now().isoformat()
        })
    return _incidents + all_incidents

@router.post("/incidents")
async def log_incident(inc: IncidentCreate):
    incident = {
        "id": str(uuid.uuid4()),
        "type": inc.type,
        "severity": inc.severity,
        "description": inc.description,
        "location": inc.location,
        "equipment_part": inc.equipment_part,
        "conditions_snapshot": {"weather": inc.weather, "fatigue_score": inc.fatigue_score},
        "auto_drafted": False,
        "confirmed": True,
        "created_at": datetime.now().isoformat()
    }
    _incidents.append(incident)
    await db.add_incident(inc.type, inc.description)
    asyncio.create_task(manager.broadcast({"type": "incident.logged", "payload": incident}))
    return {"status": "logged", "incident": incident}

@router.post("/idle-reasons")
async def log_idle_reason(reason: dict):
    return {"status": "logged", "reason": reason.get("reason", "unknown")}
