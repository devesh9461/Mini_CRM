from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://mini_crm:mini_crm_secret@db:5432/mini_crm"
    SECRET_KEY: str = "mini-crm-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "https://mini-crm-kohl.vercel.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:80,http://localhost"

    # Rate limiting
    RATE_LIMIT_GLOBAL: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
