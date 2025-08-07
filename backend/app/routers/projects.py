from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas
from app.utils.security import get_current_user
from typing import List
from datetime import datetime
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
    
    # Check if project is shared with this user
    share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "pending"
    ).first()
    
    if share:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        return project
    
    return None

def check_project_permissions(project_id: int, current_user: models.User, db: Session) -> dict:
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
    # Get owned projects (same company)
    owned_projects = db.query(models.Project).filter(
        models.Project.company_id == current_user.company_id
    ).order_by(models.Project.updated_at.desc()).all()
    
    # Get projects where user is a member (but not shared projects)
    member_projects = db.query(models.Project).join(
        models.ProjectMember, models.Project.id == models.ProjectMember.project_id
    ).filter(
        models.ProjectMember.user_id == current_user.id
    ).order_by(models.Project.updated_at.desc()).all()
    
    # Combine owned and member projects (exclude shared projects from main list)
    all_projects = list(owned_projects) + list(member_projects)
    unique_projects = {p.id: p for p in all_projects}.values()
    
    return [
        {
            "id": p.id, 
            "name": p.name, 
            "created_at": p.created_at.isoformat() if p.created_at else None, 
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        } 
        for p in sorted(unique_projects, key=lambda x: x.updated_at, reverse=True)
    ]

@router.get("/{project_id}", response_model=dict)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = check_project_access(project_id, current_user, db)
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

class AddMemberRequest(BaseModel):
    user_id: int
    role: models.ProjectRole

@router.post("/{project_id}/add_member")
def add_member(project_id: int, request: AddMemberRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if project exists and user has access
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.company_id == current_user.company_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Allow project owner or company admin to add members
    if project.owner_id != current_user.id and current_user.role != models.UserRole.company_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions to add members")
    
    # Check if target user exists in the same company
    target_user = db.query(models.User).filter(models.User.id == request.user_id, models.User.company_id == current_user.company_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in your company")
    
    # Check if user is already a member
    existing_member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=request.user_id).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
    
    # Add the member
    new_member = models.ProjectMember(project_id=project_id, user_id=request.user_id, role=request.role)
    db.add(new_member)
    db.commit()
    
    return {"message": "Member added successfully"}

@router.post("/{project_id}/remove_member")
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if project exists and user has access
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.company_id == current_user.company_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Allow project owner or company admin to remove members
    if project.owner_id != current_user.id and current_user.role != models.UserRole.company_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions to remove members")
    
    # Check if member exists
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Don't allow removing the project owner
    if user_id == project.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove project owner")
    
    db.delete(member)
    db.commit()
    return {"message": "Member removed successfully"}

@router.get("/{project_id}/members", response_model=List[dict])
def get_project_members(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if project exists and user has access
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.company_id == current_user.company_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all members of the project
    members = db.query(models.ProjectMember).filter_by(project_id=project_id).all()
    
    result = []
    for member in members:
        user = db.query(models.User).filter_by(id=member.user_id).first()
        if user:
            result.append({
                "id": member.id,
                "user_id": member.user_id,
                "user_name": user.name,
                "user_email": user.email,
                "role": member.role,
                "is_owner": member.user_id == project.owner_id
            })
    
    return result

@router.get("/{project_id}/permissions", response_model=dict)
def get_project_permissions(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get current user's permissions for a specific project"""
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    check_project_access(project_id, current_user, db)
    
    # Get user's permissions
    permissions = check_project_permissions(project_id, current_user, db)
    
    return {
        "can_edit": permissions["can_edit"],
        "can_view": permissions["can_view"],
        "can_share": project.owner_id == current_user.id,
        "can_delete": project.owner_id == current_user.id,
        "role": permissions["role"],
        "is_owner": project.owner_id == current_user.id
    }

@router.post("/add-test-users")
def add_test_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Add test users to the same company for testing sharing functionality"""
    print(f"=== ADDING TEST USERS ===")
    print(f"Current user: {current_user.name} (ID: {current_user.id})")
    print(f"Company ID: {current_user.company_id}")
    
    # Create test users in the same company
    test_users = [
        {
            "name": "John Doe",
            "email": "john.doe@test.com",
            "role": models.UserRole.user
        },
        {
            "name": "Jane Smith", 
            "email": "jane.smith@test.com",
            "role": models.UserRole.user
        },
        {
            "name": "Bob Wilson",
            "email": "bob.wilson@test.com", 
            "role": models.UserRole.user
        }
    ]
    
    created_users = []
    for test_user in test_users:
        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == test_user["email"]).first()
        if existing_user:
            print(f"User {test_user['email']} already exists")
            continue
            
        # Create new user in the same company
        from app.utils.security import hash_password
        new_user = models.User(
            name=test_user["name"],
            email=test_user["email"],
            password_hash=hash_password("password123"),  # Default password
            role=test_user["role"],
            company_id=current_user.company_id
        )
        db.add(new_user)
        created_users.append(new_user)
        print(f"Created user: {new_user.name} ({new_user.email})")
    
    db.commit()
    
    print(f"Created {len(created_users)} test users")
    print(f"=== END ADDING TEST USERS ===")
    
    return {
        "message": f"Created {len(created_users)} test users",
        "users": [{"id": u.id, "name": u.name, "email": u.email} for u in created_users]
    }

@router.get("/company/users", response_model=List[dict])
def get_company_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Get all users in the same company
    users = db.query(models.User).filter(models.User.company_id == current_user.company_id).all()
    
    return [{"id": user.id, "name": user.name, "email": user.email, "role": user.role} for user in users]

@router.post("/{project_id}/share", response_model=schemas.ProjectShareRead)
def share_project(
    project_id: int, 
    share_data: schemas.ProjectShareCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Share a project with someone by email"""
    # Check if project exists and user has access
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is project owner or company admin
    if project.owner_id != current_user.id and current_user.role != models.UserRole.company_admin:
        raise HTTPException(status_code=403, detail="Only project owners and company admins can share projects")
    
    # Check if already shared with this email
    existing_share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == share_data.email
    ).first()
    
    if existing_share:
        raise HTTPException(status_code=400, detail="Project already shared with this email")
    
    # Create the share
    project_share = models.ProjectShare(
        project_id=project_id,
        shared_by_user_id=current_user.id,
        shared_with_email=share_data.email,
        role=share_data.role
    )
    db.add(project_share)
    db.commit()
    db.refresh(project_share)
    
    # TODO: Send email notification here
    # For now, just return the share data
    return project_share

@router.get("/shared/with-me", response_model=List[dict])
def get_shared_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get projects shared with the current user"""
    # Get both pending and accepted shares
    shares = db.query(models.ProjectShare).filter(
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status.in_(["pending", "accepted"])
    ).all()
    
    result = []
    for share in shares:
        # Get project details
        project = db.query(models.Project).filter(models.Project.id == share.project_id).first()
        # Get shared by user details
        shared_by_user = db.query(models.User).filter(models.User.id == share.shared_by_user_id).first()
        
        result.append({
            "id": share.id,
            "project_id": share.project_id,
            "shared_by_user_id": share.shared_by_user_id,
            "shared_with_email": share.shared_with_email,
            "role": share.role,
            "status": share.status,
            "created_at": share.created_at,
            "accepted_at": share.accepted_at,
            "accepted_by_user_id": share.accepted_by_user_id,
            "project": {
                "id": project.id,
                "name": project.name,
                "created_at": project.created_at,
                "updated_at": project.updated_at
            } if project else None,
            "shared_by_user": {
                "id": shared_by_user.id,
                "name": shared_by_user.name,
                "email": shared_by_user.email
            } if shared_by_user else None
        })
    
    # Sort by project's updated_at (most recent first)
    result.sort(key=lambda x: x["project"]["updated_at"] if x["project"] else x["created_at"], reverse=True)
    
    return result

@router.post("/{project_id}/accept-share")
def accept_project_share(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Accept a project share invitation"""
    # Find the share
    share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_email == current_user.email,
        models.ProjectShare.status == "pending"
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share invitation not found")
    
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is already a member
    existing_member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    
    if not existing_member:
        # Add user as project member
        project_member = models.ProjectMember(
            project_id=project_id,
            user_id=current_user.id,
            role=share.role
        )
        db.add(project_member)
    
    # Update share status
    share.status = "accepted"
    share.accepted_at = datetime.utcnow()
    share.accepted_by_user_id = current_user.id
    
    db.commit()
    
    return {"message": "Project share accepted successfully"}

