import time
import uuid
import logging
from typing import Dict, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("middleware")

class TokenBucketRateLimiter:
    """
    O(1) Token Bucket Rate Limiting Algorithm.
    Ensures state updates and rate limit evaluations occur in constant time.
    """
    def __init__(self, rate: float = 5.0, capacity: float = 10.0):
        # rate = tokens replenished per second
        self.rate = rate
        self.capacity = capacity
        # ip -> (tokens, last_update_time)
        self.buckets: Dict[str, Tuple[float, float]] = {}

    def is_allowed(self, ip: str) -> bool:
        now = time.time()
        if ip not in self.buckets:
            self.buckets[ip] = (self.capacity, now)
            return True

        tokens, last_update = self.buckets[ip]
        # Replenish tokens based on elapsed time
        elapsed = now - last_update
        replenished = elapsed * self.rate
        new_tokens = min(self.capacity, tokens + replenished)

        if new_tokens >= 1.0:
            self.buckets[ip] = (new_tokens - 1.0, now)
            return True
        else:
            self.buckets[ip] = (new_tokens, now)
            return False

# Instantiate rate limiter (default: 5 requests/sec, capacity of 10 requests)
rate_limiter = TokenBucketRateLimiter(rate=5.0, capacity=10.0)

class CoreMiddleware(BaseHTTPMiddleware):
    """
    Core middleware handling:
      - Custom O(1) Token Bucket Rate Limiting
      - Tracing header tracking (X-Correlation-ID)
      - Access/duration logging
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        # 1. Rate Limiting Check
        client_ip = request.client.host if request.client else "127.0.0.1"
        # Exempt internal/localhost loopback from aggressive blocking if debugging
        if client_ip != "127.0.0.1" and not rate_limiter.is_allowed(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "correlation_id": correlation_id
                }
            )

        start_time = time.time()
        
        # Inject correlation id in request state
        request.state.correlation_id = correlation_id

        # 2. Process Request
        try:
            response: Response = await call_next(request)
        except Exception as e:
            logger.exception(f"Unhandled exception in middleware path: {e} [CorrelationID: {correlation_id}]")
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error occurred.",
                    "correlation_id": correlation_id
                }
            )

        duration = time.time() - start_time
        
        # 3. Tracing Headers Injection
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Process-Time"] = f"{duration:.4f}"

        # 4. Request Logging
        logger.info(
            f"Method: {request.method} | Path: {request.url.path} | "
            f"Status: {response.status_code} | Duration: {duration:.4f}s | "
            f"IP: {client_ip} | CorrelationID: {correlation_id}"
        )

        return response
