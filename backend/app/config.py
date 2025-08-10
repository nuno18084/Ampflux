from pydantic_settings import BaseSettings
import secrets
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ampflux"
    SECRET_KEY: str  # Required - will raise error if not set
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes - much shorter
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days for refresh tokens
    OPENAI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Require SECRET_KEY to be set
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set in environment variables")

settings = Settings()

