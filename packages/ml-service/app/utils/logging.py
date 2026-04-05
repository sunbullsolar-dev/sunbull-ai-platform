"""Structured logging configuration for Sunbull AI ML Service."""

import logging
import structlog
from app.config import settings


def setup_logging() -> None:
    """Initialize structured logging with structlog."""
    
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure stdlib logging
    logging.basicConfig(
        format="%(message)s",
            level=settings.log_level.upper(),
    )


def get_logger(name: str):
    """Get a structured logger instance."""
    return structlog.get_logger(name)
