from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

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

