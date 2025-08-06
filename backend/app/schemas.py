from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    company_admin = "company_admin"
    user = "user"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: Optional[str] = None
    is_company: bool = False

class CompanyRead(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    company_id: int
    company: CompanyRead
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: int
    exp: int
    role: UserRole

class CompanyCreate(BaseModel):
    name: str

class ProjectShareCreate(BaseModel):
    email: str
    role: str = "viewer"  # viewer, editor

class ProjectShareRead(BaseModel):
    id: int
    project_id: int
    shared_by_user_id: int
    shared_with_email: str
    role: str
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    accepted_by_user_id: Optional[int] = None
    shared_by_user: UserRead
    accepted_by_user: Optional[UserRead] = None

    class Config:
        orm_mode = True

