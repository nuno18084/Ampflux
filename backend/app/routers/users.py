from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import SessionLocal
from app import models, schemas
from app.utils.security import get_current_user, require_company_admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me", response_model=schemas.UserRead)
def get_current_user_info(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch user with company information
    user = db.query(models.User).options(joinedload(models.User.company)).filter(models.User.id == current_user.id).first()
    return user

@router.get("/", response_model=list[schemas.UserRead])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    users = db.query(models.User).options(joinedload(models.User.company)).filter(models.User.company_id == current_user.company_id).all()
    return users

@router.get("/company", response_model=schemas.CompanyRead)
def get_company(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/invite")
def invite_user(email: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_company_admin)):
    # Stub: In real implementation, send invite email and create user with pending status
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    # Here you would send an invite email and create a pending user record
    return {"message": f"Invite sent to {email}"}
