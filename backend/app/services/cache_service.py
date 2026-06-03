import time
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("cache_service")

try:
    import redis
    redis_available = True
except Exception:
    redis_available = False

class LocalLRUCache:
    """Fallback in-memory LRU cache with clean expiration (TTL) triggers."""
    def __init__(self, max_size: int = 100):
        self.max_size = max_size
        self.cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[str]:
        if key in self.cache:
            entry = self.cache[key]
            # Verify TTL has not expired
            if time.time() < entry["expires_at"]:
                # Access updates LRU order (re-insert)
                self.cache[key] = self.cache.pop(key)
                return entry["value"]
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: str, ttl_seconds: int = 3600):
        if len(self.cache) >= self.max_size:
            # Evict oldest item (first item in dict)
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds
        }

class CacheService:
    """
    Stateful Redis-backed LRU Response Caching Service.
    Saves Mistral LLM completions with dynamic TTL expiration schedules.
    Automatically falls back to local in-memory dictionaries if Redis is offline.
    """
    def __init__(self):
        self.redis_url = "redis://localhost:6379/0"
        self._client = None
        self._local_cache = LocalLRUCache(max_size=100)

    def _get_client(self):
        """Lazy loader for Redis client connection."""
        if self._client is None and redis_available:
            try:
                self._client = redis.from_url(self.redis_url, decode_responses=True)
                # Quick test connection check
                self._client.ping()
                logger.info(f"Initialized Redis connection client at: {self.redis_url}")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis server: {e}. Falling back to Local Memory Cache.")
                self._client = "fallback"
        return self._client

    def get_cached_response(self, key: str) -> Optional[str]:
        """Fetch cached response string by key."""
        client = self._get_client()
        if not client or client == "fallback":
            return self._local_cache.get(key)
        try:
            return client.get(key)
        except Exception as e:
            logger.error(f"Redis cache GET operation failed: {e}")
            return self._local_cache.get(key)

    def cache_response(self, key: str, value: str, ttl_seconds: int = 3600):
        """Cache response string with custom Time-To-Live limits."""
        client = self._get_client()
        if not client or client == "fallback":
            self._local_cache.set(key, value, ttl_seconds)
            return
        try:
            client.setex(name=key, time=ttl_seconds, value=value)
            logger.info(f"Successfully cached response under key: '{key[:30]}...' with TTL: {ttl_seconds}s")
        except Exception as e:
            logger.error(f"Redis cache SETEX operation failed: {e}")
            self._local_cache.set(key, value, ttl_seconds)

cache_service = CacheService()
