import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Resolve .env relative to this file: backend/app/config.py -> backend/.env
_backend_root = Path(__file__).resolve().parent.parent
_dotenv_path = _backend_root / ".env"
load_dotenv(dotenv_path=_dotenv_path)

class Settings(BaseSettings):
    # Default SQLite database located in backend/db folder
    DATABASE_URL: str = f"sqlite:///{_backend_root / 'db' / 'mini_crm.db'}"
    SECRET_KEY: str = "mini-crm-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    RATE_LIMIT_GLOBAL: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    
    # Security parameters
    ALLOWED_REGISTRATION_DOMAINS: str = "diplox.com,diplox.in,diplox.co"
    ENFORCE_STRONG_PASSWORDS: bool = True
    BLOCK_DISPOSABLE_EMAILS: bool = True

    class Config:
        env_file = str(_dotenv_path)
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
