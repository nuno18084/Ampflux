from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings
from fastapi import Depends, HTTPException, status, Request
from jose import JWTError
from app import models
from sqlalchemy.orm import Session
from app.database import SessionLocal
from fastapi.security import OAuth2PasswordBearer
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Password hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Password validation
def validate_password(password: str) -> bool:
    """
    Validate password strength:
    - At least 8 characters
    - Contains uppercase and lowercase letters
    - Contains at least one number
    - Contains at least one special character
    """
    if len(password) < 8:
        return False
    
    if not re.search(r"[A-Z]", password):
        return False
    
    if not re.search(r"[a-z]", password):
        return False
    
    if not re.search(r"\d", password):
        return False
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    
    return True

# JWT helpers
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# Token blacklisting (simple in-memory for now, should use Redis in production)
blacklisted_tokens = set()

def blacklist_token(token: str):
    """Add token to blacklist"""
    blacklisted_tokens.add(token)

def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return token in blacklisted_tokens

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from cookie instead of Authorization header
    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception
    
    # Check if token is blacklisted
    if is_token_blacklisted(token):
        raise credentials_exception
    
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        # Verify token type
        if payload.get("type") != "access":
            raise credentials_exception
        
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_from_refresh_token(request: Request, db: Session = Depends(get_db)):
    """Get user from refresh token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.cookies.get("refresh_token")
    if not token:
        raise credentials_exception
    
    if is_token_blacklisted(token):
        raise credentials_exception
    
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        # Verify token type
        if payload.get("type") != "refresh":
            raise credentials_exception
        
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_company_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.company_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
