import logging
import json
import datetime
from contextvars import ContextVar

# Thread-safe ContextVar to hold current Correlation ID across request chains
correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")

class JSONFormatter(logging.Formatter):
    """
    Structured JSON Log Formatter.
    Transforms raw logs into unified JSON objects, injecting global correlation IDs.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_payload = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": correlation_id_var.get() or ""
        }
        
        # Inject standard exception traceback if present
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_payload)

def configure_structured_logging(log_level: int = logging.INFO):
    """
    Sets up basic config using JSONFormatter for root log stream.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove all existing handlers to prevent duplicate outputs
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
        
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(console_handler)
