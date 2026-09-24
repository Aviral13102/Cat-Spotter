import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_health():
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200

def test_state():
    with TestClient(app) as client:
        res = client.get("/api/state")
        assert res.status_code == 200

def test_estimate():
    with TestClient(app) as client:
        res = client.post("/api/estimate", json={
            "task_type": "Trenching",
            "weather": "Sunny",
            "operator_skill": "Expert",
            "machine_age_yrs": 2.0
        })
        assert res.status_code == 200
        assert "predicted_min" in res.json()

def test_incidents():
    with TestClient(app) as client:
        res = client.post("/api/incidents", json={"type": "Test", "description": "Desc"})
        assert res.status_code == 200
        res2 = client.get("/api/incidents")
        assert len(res2.json()) > 0
