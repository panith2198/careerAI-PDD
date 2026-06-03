import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = Field(default="AI Smart Career Navigator")
    APP_ENV: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    
    # Security
    SECRET_KEY: str = Field(default="secretkeyplaceholder")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)
    
    # Databases
    DATABASE_URL: str = Field(default="mysql+aiomysql://root:@localhost:3306/careerai")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # AI SDK Keys
    MISTRAL_API_KEY: str = Field(default="")
    
    # SMTP / Email
    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
