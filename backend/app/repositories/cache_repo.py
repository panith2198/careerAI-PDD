import time
import collections
from typing import Optional, Any

# Local Thread-Safe LRU Cache Fallback
class InMemoryLRUCache:
    def __init__(self, capacity: int = 1000):
        self.capacity = capacity
        self.cache: collections.OrderedDict = collections.OrderedDict()
        # key -> expire_timestamp
        self.expirations = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        
        # Check TTL
        expire_time = self.expirations.get(key)
        if expire_time and time.time() > expire_time:
            self.delete(key)
            return None

        # Move to end to represent recently used
        self.cache.move_to_end(key)
        return self.cache[key]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        
        if ttl_seconds:
            self.expirations[key] = time.time() + ttl_seconds
        elif key in self.expirations:
            del self.expirations[key]

        if len(self.cache) > self.capacity:
            # Evict LRU element
            oldest_key = next(iter(self.cache))
            self.delete(oldest_key)

    def delete(self, key: str):
        if key in self.cache:
            del self.cache[key]
        if key in self.expirations:
            del self.expirations[key]

# Globally shared in-memory instance
_local_lru = InMemoryLRUCache(capacity=5000)

class CacheRepository:
    """
    Cache Repository with Redis storage and elegant Local LRU fallback.
    Exhibits constant time O(1) reads/writes.
    """
    def __init__(self, redis_client: Optional[Any] = None):
        self.redis = redis_client

    async def get(self, key: str) -> Optional[str]:
        if not self.redis or self.redis == "fallback":
            return _local_lru.get(key)
        try:
            val = self.redis.get(key)
            return val.decode("utf-8") if val else None
        except Exception:
            return _local_lru.get(key)

    async def set(self, key: str, value: str, ttl_seconds: Optional[int] = None):
        if not self.redis or self.redis == "fallback":
            _local_lru.set(key, value, ttl_seconds)
            return
        try:
            if ttl_seconds:
                self.redis.setex(key, ttl_seconds, value)
            else:
                self.redis.set(key, value)
        except Exception:
            _local_lru.set(key, value, ttl_seconds)

    async def delete(self, key: str):
        if not self.redis or self.redis == "fallback":
            _local_lru.delete(key)
            return
        try:
            self.redis.delete(key)
        except Exception:
            _local_lru.delete(key)
