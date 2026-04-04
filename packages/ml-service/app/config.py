"""Configuration module for Sunbull AI ML Service."""

from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    app_name: str = "Sunbull AI ML Service"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"

    # OpenAI Configuration (optional in dev — proposal writer uses fallback)
    openai_api_key: str = ""
    openai_model: str = "gpt-4"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 86400  # 24 hours

    # Model Configuration
    sizing_model_path: str = "./models/trained"
    use_model_cache: bool = True

    # API Configuration
    cors_origins: List[str] = ["*"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["*"]
    cors_headers: List[str] = ["*"]

    # Logging Configuration
    log_level: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "protected_namespaces": ("settings_",),
    }


settings = Settings()
