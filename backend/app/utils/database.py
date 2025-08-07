from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from typing import Optional

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_project_access(project_id: int, current_user: models.User, db: Session) -> models.Project:
    """Check if user has access to project"""
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.company_id == current_user.company_id
    ).first()
    
    if not project:
        raise ValueError("Project not found or access denied")
    
    return project

def check_project_permissions(project_id: int, current_user: models.User, db: Session) -> dict:
    """Check user permissions for a project"""
    project = check_project_access(project_id, current_user, db)
    
    # Check if user is project owner
    if project.owner_id == current_user.id:
        return {
            "canEdit": True,
            "canDelete": True,
            "canShare": True,
            "role": "owner"
        }
    
    # Check if user is project member
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    
    if member:
        return {
            "canEdit": member.role in ["editor", "owner"],
            "canDelete": member.role == "owner",
            "canShare": member.role in ["editor", "owner"],
            "role": member.role
        }
    
    # Check if user is company admin
    if current_user.role == "company_admin":
        return {
            "canEdit": True,
            "canDelete": True,
            "canShare": True,
            "role": "company_admin"
        }
    
    # Default: no access
    return {
        "canEdit": False,
        "canDelete": False,
        "canShare": False,
        "role": None
    }

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_project_by_id(db: Session, project_id: int) -> Optional[models.Project]:
    """Get project by ID"""
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_company_by_id(db: Session, company_id: int) -> Optional[models.Company]:
    """Get company by ID"""
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_project_members(db: Session, project_id: int) -> list:
    """Get all members of a project"""
    return db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()

def get_circuit_versions(db: Session, project_id: int) -> list:
    """Get all circuit versions for a project"""
    return db.query(models.CircuitVersion).filter(
        models.CircuitVersion.project_id == project_id
    ).order_by(models.CircuitVersion.version_number.desc()).all()

def get_latest_circuit_version(db: Session, project_id: int) -> Optional[models.CircuitVersion]:
    """Get the latest circuit version for a project"""
    return db.query(models.CircuitVersion).filter(
        models.CircuitVersion.project_id == project_id
    ).order_by(models.CircuitVersion.version_number.desc()).first()

def get_next_version_number(db: Session, project_id: int) -> int:
    """Get the next version number for a project"""
    latest_version = get_latest_circuit_version(db, project_id)
    return (latest_version.version_number + 1) if latest_version else 1

def get_shared_projects(db: Session, user_id: int) -> list:
    """Get all projects shared with a user"""
    return db.query(models.ProjectShare).filter(
        models.ProjectShare.shared_with_user_id == user_id,
        models.ProjectShare.status.in_(["pending", "accepted"])
    ).all() 