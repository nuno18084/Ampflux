from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/ampflux"
    SECRET_KEY: str = ""  # Will be loaded from environment variable
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OPENAI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate a secure secret key if not provided
        if not self.SECRET_KEY:
            self.SECRET_KEY = secrets.token_urlsafe(32)

settings = Settings()

