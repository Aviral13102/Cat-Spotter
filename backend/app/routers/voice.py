from fastapi import APIRouter
from app.voice.intents import parser
from app.ws import manager
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio

router = APIRouter(prefix="/voice", tags=["Voice"])

class VoiceReq(BaseModel):
    text: str
    context: Dict[str, Any] = {}

INTENT_RESPONSES = {
    'status': {'reply': 'Current task is on track. Fuel at {fuel}L, {idle} min idle time.', 'ui_actions': []},
    'eta': {'reply': 'Estimated completion in about {eta} minutes.', 'ui_actions': []},
    'log_incident': {'reply': 'Opening incident form for you.', 'ui_actions': [{'type': 'open_incidents', 'payload': {}}]},
    'report_hazard': {'reply': 'Opening incident form to log the hazard.', 'ui_actions': [{'type': 'open_incidents', 'payload': {}}]},
    'training': {'reply': 'Opening your training queue.', 'ui_actions': [{'type': 'open_training', 'payload': {}}]},
    'break': {'reply': 'Noted. I\'ll log a break. Remember to stretch and hydrate!', 'ui_actions': []},
    'refuel': {'reply': 'Fuel level noted. Alerting site manager for refuel at next break.', 'ui_actions': []},
    'weather': {'reply': 'Current conditions: checking weather data.', 'ui_actions': []},
    'schedule': {'reply': 'Here\'s your task schedule for today.', 'ui_actions': [{'type': 'open_insights', 'payload': {}}]},
    'help': {'reply': 'You can say: status, ETA, log incident, request training, take break, check weather, or show schedule.', 'ui_actions': []},
    'acknowledge': {'reply': 'Alert acknowledged. Stay safe.', 'ui_actions': []},
    'start_task': {'reply': 'Starting the task now.', 'ui_actions': []},
    'complete_task': {'reply': 'Task marked as complete. Good work!', 'ui_actions': []},
}

@router.post("/command")
async def voice_command(req: VoiceReq):
    res = parser.parse(req.text)
    intent = res['intent']
    template = INTENT_RESPONSES.get(intent, {'reply': f'Understood: {intent}', 'ui_actions': []})
    
    reply_text = template['reply']
    
    # Broadcast the voice reply via WS so the NudgeBubble shows it
    asyncio.create_task(manager.broadcast({"type": "nudge", "payload": {
        "say": reply_text,
        "options": []
    }}))
    
    return {
        "reply": reply_text,
        "action": intent,
        "slots": res['slots'],
        "ui_actions": template['ui_actions']
    }
