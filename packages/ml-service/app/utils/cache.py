"""Redis caching utilities for Sunbull AI ML Service."""

import json
import redis
from typing import Any, Optional
from app.config import settings


class RedisCache:
    """Redis caching wrapper with TTL management."""

    def __init__(self, url: str = settings.redis_url, ttl: int = settings.cache_ttl):
        """Initialize Redis connection."""
        try:
            self.client = redis.from_url(url, decode_responses=True)
            self.client.ping()
            self.available = True
        except Exception:
            self.client = None
            self.available = False
        self.ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache."""
        if not self.available:
            return None
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
        except Exception:
            pass
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Store value in cache with TTL."""
        if not self.available:
            return False
        try:
            ttl = ttl or self.ttl
            self.client.setex(key, ttl, json.dumps(value))
            return True
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.available:
            return False
        try:
            self.client.delete(key)
            return True
        except Exception:
            return False

    def flush(self) -> bool:
        """Flush all cache entries."""
        if not self.available:
            return False
        try:
            self.client.flushdb()
            return True
        except Exception:
            return False


# Global cache instance
cache = RedisCache()
