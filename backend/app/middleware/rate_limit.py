import time
from typing import Dict, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class TokenBucketLimiter:
    """
    O(1) Token Bucket Rate Limiting Algorithm.
    """
    def __init__(self, rate: float = 10.0, capacity: float = 20.0):
        self.rate = rate
        self.capacity = capacity
        self.buckets: Dict[str, Tuple[float, float]] = {}

    def is_allowed(self, ip: str) -> bool:
        now = time.time()
        if ip not in self.buckets:
            self.buckets[ip] = (self.capacity, now)
            return True

        tokens, last_update = self.buckets[ip]
        elapsed = now - last_update
        replenished = elapsed * self.rate
        new_tokens = min(self.capacity, tokens + replenished)

        if new_tokens >= 1.0:
            self.buckets[ip] = (new_tokens - 1.0, now)
            return True
        else:
            self.buckets[ip] = (new_tokens, now)
            return False

# Global instance: 10 requests per second, burst up to 20
rate_limiter = TokenBucketLimiter(rate=10.0, capacity=20.0)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limit API requests on client IP bounds."""
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        
        # Bypass local requests in dev environment
        if client_ip != "127.0.0.1" and not rate_limiter.is_allowed(client_ip):
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."}
            )
            
        return await call_next(request)
