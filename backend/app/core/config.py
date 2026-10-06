from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://alrehman:alrehman_dev_pass@localhost:5432/alrehman_solar"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-at-least-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Admin bootstrap credentials
    ADMIN_EMAIL: str = "admin@alrehmansolars.com"
    ADMIN_PASSWORD: str = "Admin@2024!"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    PRODUCTION_URL: str = "https://alrehmansolars.com"

    # Email (optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@alrehmansolars.com"
    NOTIFICATION_EMAIL: Optional[str] = None

    # AI (optional)
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
