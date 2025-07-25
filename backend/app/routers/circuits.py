from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.utils.security import get_current_user
from typing import List, Any
from datetime import datetime
import numpy as np
from app.tasks.simulation import run_short_circuit_simulation
from celery.result import AsyncResult
from app.celery_worker import celery_app
from pydantic import BaseModel

router = APIRouter()

class CircuitSimulationRequest(BaseModel):
    circuit_data: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{project_id}/save_version", response_model=dict)
def save_circuit_version(project_id: int, data_json: Any, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check project membership
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a project member")
    version = models.CircuitVersion(project_id=project_id, data_json=data_json)
    db.add(version)
    db.commit()
    db.refresh(version)
    return {"id": version.id, "created_at": version.created_at}

@router.get("/{project_id}/versions", response_model=List[dict])
def list_circuit_versions(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a project member")
    versions = db.query(models.CircuitVersion).filter_by(project_id=project_id).order_by(models.CircuitVersion.created_at.desc()).all()
    return [{"id": v.id, "created_at": v.created_at} for v in versions]

@router.post("/{project_id}/simulate", response_model=dict)
def simulate_circuit(project_id: int, request: CircuitSimulationRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a project member")
    try:
        # Parse the circuit data (assuming it's JSON string)
        import json
        circuit_data = json.loads(request.circuit_data)
        voltage = float(circuit_data.get("voltage", 0))
        resistances = circuit_data.get("resistances", [])
        task = run_short_circuit_simulation.apply_async(args=[voltage, resistances])
        # Store simulation with pending result
        sim = models.Simulation(project_id=project_id, result_json={"task_id": task.id, "status": "pending"})
        db.add(sim)
        db.commit()
        db.refresh(sim)
        return {"id": sim.id, "simulated_at": sim.simulated_at, "task_id": task.id, "status": "pending"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.get("/simulation_result/{task_id}", response_model=dict)
def get_simulation_result(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    if result.state == "PENDING":
        return {"status": "pending"}
    elif result.state == "SUCCESS":
        return {"status": "success", "result": result.result}
    else:
        return {"status": "error", "error": str(result.result)}

@router.get("/{project_id}/simulations", response_model=List[dict])
def list_simulations(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a project member")
    sims = db.query(models.Simulation).filter_by(project_id=project_id).order_by(models.Simulation.simulated_at.desc()).all()
    return [{"id": s.id, "simulated_at": s.simulated_at, "result": s.result_json} for s in sims]
