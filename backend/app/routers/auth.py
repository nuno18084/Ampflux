from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user_from_refresh_token, blacklist_token
from datetime import timedelta
import uuid
import secrets

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
    # Validate password strength
    if len(user_in.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Check for common password patterns
    if user_in.password.lower() in ['password', '123456', 'qwerty', 'admin']:
        raise HTTPException(status_code=400, detail="Password is too common")
    
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

@router.post("/login", response_model=schemas.UserRead)
def login(user_in: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access and refresh tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=15)  # Short-lived access token
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=7)  # Longer-lived refresh token
    )
    
    # Set httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=False,  # Temporarily disabled for debugging
        secure=False,  # Set to False for development (localhost)
        samesite="lax",  # Changed to lax for development
        max_age=900  # 15 minutes
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=False,  # Temporarily disabled for debugging
        secure=False,  # Set to False for development (localhost)
        samesite="lax",  # Changed to lax for development
        max_age=604800  # 7 days
    )
    
    return user

@router.post("/refresh", response_model=schemas.UserRead)
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        # Get user from refresh token
        user = get_current_user_from_refresh_token(request, db)
        
        # Create new access token
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role.value},
            expires_delta=timedelta(minutes=15)
        )
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=False,  # Temporarily disabled for debugging
            secure=False,  # Set to False for development (localhost)
            samesite="lax",  # Changed to lax for development
            max_age=900
        )
        
        return user
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout(request: Request, response: Response):
    # Get tokens from cookies to blacklist them
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    
    # Blacklist tokens if they exist
    if access_token:
        blacklist_token(access_token)
    if refresh_token:
        blacklist_token(refresh_token)
    
    # Clear cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

