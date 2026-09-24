import json
from typing import List, Dict, Any
from fastapi import WebSocket
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.seq = 0
        self.state: Dict[str, Any] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_personal_message({"type": "hello", "payload": self.state}, websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        msg = self._envelope(message)
        await websocket.send_text(json.dumps(msg))

    async def broadcast(self, message: dict):
        msg = self._envelope(message)
        js = json.dumps(msg)
        for connection in self.active_connections:
            await connection.send_text(js)

    def _envelope(self, message: dict):
        self.seq += 1
        message['seq'] = self.seq
        message['ts'] = datetime.utcnow().isoformat()
        return message

manager = ConnectionManager()
