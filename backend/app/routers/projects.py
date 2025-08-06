from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas
from app.utils.security import get_current_user, require_company_admin
from typing import List
from pydantic import BaseModel

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=dict)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = models.Project(name=project_data.name, company_id=current_user.company_id, owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    # Add owner as project member (editor)
    member = models.ProjectMember(project_id=project.id, user_id=current_user.id, role=models.ProjectRole.editor)
    db.add(member)
    db.commit()
    return {"id": project.id, "name": project.name, "created_at": project.created_at.isoformat() if project.created_at else None, "updated_at": project.updated_at.isoformat() if project.updated_at else None}

@router.get("/", response_model=List[dict])
def list_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    projects = db.query(models.Project).filter(models.Project.company_id == current_user.company_id).order_by(models.Project.updated_at.desc()).all()
    return [{"id": p.id, "name": p.name, "created_at": p.created_at.isoformat() if p.created_at else None, "updated_at": p.updated_at.isoformat() if p.updated_at else None} for p in projects]

@router.get("/{project_id}", response_model=dict)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.company_id == current_user.company_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project.id, "name": project.name, "created_at": project.created_at.isoformat() if project.created_at else None, "updated_at": project.updated_at.isoformat() if project.updated_at else None}

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.company_id == current_user.company_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Allow deletion if user is project owner or company admin
    if project.owner_id != current_user.id and current_user.role != models.UserRole.company_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this project")
    
    # Delete related records first to avoid foreign key constraint violations
    # Delete project members
    db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).delete()
    
    # Delete circuit versions
    db.query(models.CircuitVersion).filter(models.CircuitVersion.project_id == project_id).delete()
    
    # Delete simulations
    db.query(models.Simulation).filter(models.Simulation.project_id == project_id).delete()
    
    # Delete audit logs
    db.query(models.AuditLog).filter(models.AuditLog.project_id == project_id).delete()
    
    # Finally delete the project
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@router.post("/{project_id}/add_member")
def add_member(project_id: int, user_id: int, role: models.ProjectRole, db: Session = Depends(get_db), current_user: models.User = Depends(require_company_admin)):
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user_id).first()
    if member:
        raise HTTPException(status_code=400, detail="User already a member")
    new_member = models.ProjectMember(project_id=project_id, user_id=user_id, role=role)
    db.add(new_member)
    db.commit()
    return {"message": "Member added"}

@router.post("/{project_id}/remove_member")
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_company_admin)):
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}

