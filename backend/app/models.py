from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    company_admin = "company_admin"
    user = "user"

class ProjectRole(str, enum.Enum):
    viewer = "viewer"
    editor = "editor"

class LicenseStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    trial = "trial"
    expired = "expired"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="users")
    projects = relationship("ProjectMember", back_populates="user")

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    users = relationship("User", back_populates="company")
    licenses = relationship("License", back_populates="company")
    projects = relationship("Project", back_populates="company")

class License(Base):
    __tablename__ = "licenses"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    plan = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(LicenseStatus), nullable=False, default=LicenseStatus.active)
    company = relationship("Company", back_populates="licenses")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    company = relationship("Company", back_populates="projects")
    owner = relationship("User")
    members = relationship("ProjectMember", back_populates="project")
    circuit_versions = relationship("CircuitVersion", back_populates="project")
    simulations = relationship("Simulation", back_populates="project")
    audit_logs = relationship("AuditLog", back_populates="project")

class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(ProjectRole), nullable=False, default=ProjectRole.viewer)
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="projects")

class CircuitVersion(Base):
    __tablename__ = "circuit_versions"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    data_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="circuit_versions")

class Simulation(Base):
    __tablename__ = "simulations"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    result_json = Column(JSON, nullable=False)
    simulated_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="simulations")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="audit_logs")
