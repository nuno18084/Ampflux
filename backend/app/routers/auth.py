from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from app.utils.security import hash_password, verify_password, create_access_token
from datetime import timedelta
import uuid

router = APIRouter()

# Dependency to get DB session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserRead)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_password(user_in.password)
    
    # Handle company assignment
    if user_in.is_company and user_in.company_name:
        # Create new company with provided name
        company_name = user_in.company_name
        # Check if company name exists and make it unique
        existing_company = db.query(models.Company).filter(models.Company.name == company_name).first()
        if existing_company:
            # Add a unique suffix to make the name unique
            unique_suffix = str(uuid.uuid4())[:8]
            company_name = f"{company_name} ({unique_suffix})"
        
        company = models.Company(name=company_name)
        db.add(company)
        db.flush()  # get company.id
        company_id = company.id
        user_role = models.UserRole.company_admin  # Company creator is admin
    else:
        # Create default company name for individual users
        company_name = f"{user_in.name}'s Company"
        # Check if company name exists and make it unique
        existing_company = db.query(models.Company).filter(models.Company.name == company_name).first()
        if existing_company:
            # Add a unique suffix to make the name unique
            unique_suffix = str(uuid.uuid4())[:8]
            company_name = f"{user_in.name}'s Company ({unique_suffix})"
        
        company = models.Company(name=company_name)
        db.add(company)
        db.flush()  # get company.id
        company_id = company.id
        user_role = models.UserRole.company_admin  # Individual users are admin of their company
    
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pw,
        role=user_role,
        company_id=company_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=30)
    )
    # For now, refresh_token is same as access_token (MVP)
    return schemas.Token(access_token=access_token, refresh_token=access_token)

