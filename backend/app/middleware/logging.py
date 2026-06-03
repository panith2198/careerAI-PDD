import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("request_logger")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Standard request logging middleware that assigns unique Correlation IDs 
    and measures route durations.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        
        start_time = time.time()
        
        try:
            response: Response = await call_next(request)
        except Exception as e:
            logger.error(f"Request failed: {request.method} {request.url.path} | Error: {e} | Trace: {correlation_id}")
            raise e
            
        duration = time.time() - start_time
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Process-Time"] = f"{duration:.4f}"
        
        logger.info(
            f"Method: {request.method} | Path: {request.url.path} | "
            f"Status: {response.status_code} | Duration: {duration:.4f}s | "
            f"Trace: {correlation_id}"
        )
        return response
