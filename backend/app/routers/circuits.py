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

class CircuitVersionRequest(BaseModel):
    data_json: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_project_access(project_id: int, current_user: models.User, db: Session) -> models.Project:
    """Check if user has access to a project (owner, member, or shared)"""
    # First check if user is project owner or in same company
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.company_id == current_user.company_id
    ).first()
    
    if project:
        return project
    
    # Check if user is a project member (for cross-company sharing)
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    
    if member:
        # Get the project for the member
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        return project
    
    # Check if project is shared with this user (pending shares)
    share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "pending"
    ).first()
    
    if share:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        return project
    
    # Check if project is shared with this user (accepted shares)
    accepted_share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "accepted"
    ).first()
    
    if accepted_share:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        return project
    
    return None

def check_project_permissions(project_id: int, current_user: models.User, db: Session, required_role: str = "viewer") -> dict:
    """Check project access and return user's role"""
    # Check if user is project owner or in same company
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.company_id == current_user.company_id
    ).first()
    
    if project:
        # User is owner or in same company - has full access
        return {"can_edit": True, "can_view": True, "role": "owner"}
    
    # Check if user is a project member
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    
    if member:
        return {
            "can_edit": member.role == models.ProjectRole.editor,
            "can_view": True,
            "role": member.role
        }
    
    # Check if project is shared with this user (pending shares)
    share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "pending"
    ).first()
    
    if share:
        return {
            "can_edit": share.role == "editor",
            "can_view": True,
            "role": share.role
        }
    
    # Check if project is shared with this user (accepted shares)
    accepted_share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "accepted"
    ).first()
    
    if accepted_share:
        return {
            "can_edit": accepted_share.role == "editor",
            "can_view": True,
            "role": accepted_share.role
        }
    
    return {"can_edit": False, "can_view": False, "role": None}

router = APIRouter()

class CircuitSimulationRequest(BaseModel):
    circuit_data: str

class CircuitVersionRequest(BaseModel):
    data_json: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/test")
def test_circuits():
    return {"message": "Circuits router is working"}

@router.post("/{project_id}/save_version", response_model=dict)
def save_circuit_version(project_id: int, request: CircuitVersionRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check project access and permissions
    permissions = check_project_permissions(project_id, current_user, db)
    if not permissions["can_view"]:
        raise HTTPException(status_code=403, detail="No access to this project")
    
    # Only editors can save versions
    if not permissions["can_edit"]:
        raise HTTPException(status_code=403, detail="Only editors can save circuit versions")
    
    # Get the next version number for this project
    latest_version = db.query(models.CircuitVersion).filter_by(project_id=project_id).order_by(models.CircuitVersion.version_number.desc()).first()
    next_version_number = 1 if latest_version is None else latest_version.version_number + 1
    
    # Debug logging
    print(f"=== SAVE VERSION DEBUG ===")
    print(f"Project ID: {project_id}")
    print(f"Latest version found: {latest_version.version_number if latest_version else None}")
    print(f"Next version number: {next_version_number}")
    
    # Check global max version number for comparison
    global_max = db.query(models.CircuitVersion.version_number).order_by(models.CircuitVersion.version_number.desc()).first()
    print(f"Global max version number: {global_max[0] if global_max else 0}")
    
    # Update project's updated_at field
    project = db.query(models.Project).filter_by(id=project_id).first()
    if project:
        print(f"=== UPDATING PROJECT {project_id} ===")
        print(f"Old updated_at: {project.updated_at}")
        project.updated_at = datetime.utcnow()
        print(f"New updated_at: {project.updated_at}")
        print(f"=== END UPDATE ===")
    
    version = models.CircuitVersion(
        project_id=project_id, 
        version_number=next_version_number,
        data_json=request.data_json
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    
    print(f"Created version: ID={version.id}, Version={version.version_number}")
    print(f"=== END DEBUG ===")
    
    return {"id": version.id, "version_number": version.version_number, "created_at": version.created_at}

@router.get("/{project_id}/versions", response_model=List[dict])
def list_circuit_versions(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check project access
    project = check_project_access(project_id, current_user, db)
    if not project:
        raise HTTPException(status_code=403, detail="No access to this project")
    
    versions = db.query(models.CircuitVersion).filter_by(project_id=project_id).order_by(models.CircuitVersion.version_number.desc()).all()
    return [{"id": v.id, "version_number": v.version_number, "created_at": v.created_at, "data_json": v.data_json} for v in versions]

@router.post("/{project_id}/simulate", response_model=dict)
def simulate_circuit(project_id: int, request: CircuitSimulationRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check project access and permissions
    permissions = check_project_permissions(project_id, current_user, db)
    if not permissions["can_view"]:
        raise HTTPException(status_code=403, detail="No access to this project")
    
    # Only editors can run simulations
    if not permissions["can_edit"]:
        raise HTTPException(status_code=403, detail="Only editors can run simulations")
    try:
        # Parse the circuit data (assuming it's JSON string)
        import json
        circuit_data = json.loads(request.circuit_data)
        voltage = float(circuit_data.get("voltage", 0))
        resistances = circuit_data.get("resistances", [])
        # Update project's updated_at field
        project = db.query(models.Project).filter_by(id=project_id).first()
        if project:
            project.updated_at = datetime.utcnow()
        
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
    # Check project access
    project = check_project_access(project_id, current_user, db)
    if not project:
        raise HTTPException(status_code=403, detail="No access to this project")
    
    sims = db.query(models.Simulation).filter_by(project_id=project_id).order_by(models.Simulation.simulated_at.desc()).all()
    return [{"id": s.id, "simulated_at": s.simulated_at, "result": s.result_json} for s in sims]
