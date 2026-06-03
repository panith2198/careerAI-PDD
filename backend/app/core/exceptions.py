from fastapi import HTTPException, status
from typing import Any, Optional, Dict

class CareerAIException(Exception):
    """
    Base exception class for all custom CareerAI errors.
    AI Prompt Role: Error classifier.
    """
    def __init__(
        self, 
        message: str, 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class AuthenticationException(CareerAIException):
    """Raised when authentication credentials fail or JWT expires."""
    def __init__(self, message: str = "Invalid credentials or expired session", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_401_UNAUTHORIZED, 
            details=details
        )

class PermissionDeniedException(CareerAIException):
    """Raised when user lacks RBAC roles for resource."""
    def __init__(self, message: str = "Permission denied for this operation", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_403_FORBIDDEN, 
            details=details
        )

class NotFoundException(CareerAIException):
    """Raised when request database records do not exist."""
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_404_NOT_FOUND, 
            details=details
        )

class ValidationException(CareerAIException):
    """Raised when request payload fails structural validation."""
    def __init__(self, message: str = "Validation failed for request inputs", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            details=details
        )

class DatabaseException(CareerAIException):
    """Raised when transaction failures occur on connection pools."""
    def __init__(self, message: str = "Database transaction failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            details=details
        )

class ExternalServiceException(CareerAIException):
    """Raised when external downstream APIs (like Mistral) time out or fail."""
    def __init__(self, message: str = "External downstream API error", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_502_BAD_GATEWAY, 
            details=details
        )
