import asyncio
import time
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("mistral_client")

class CircuitBreakerException(Exception):
    pass

class CircuitBreaker:
    """Implements a stateful Circuit Breaker to prevent cascading failures to MistralAI."""
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN
        self.last_state_change = time.time()

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.last_state_change = time.time()
            logger.critical(f"Circuit Breaker tripped to OPEN. Threshold: {self.failure_threshold} failures.")

    def allow_request(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            # Check if recovery timeout has passed
            if time.time() - self.last_state_change > self.recovery_timeout:
                self.state = "HALF-OPEN"
                logger.warning("Circuit Breaker transitioned to HALF-OPEN for recovery check.")
                return True
            return False
        if self.state == "HALF-OPEN":
            return True
        return False

# Global circuit breaker instance for LLM queries
breaker = CircuitBreaker()

class MistralClient:
    """
    High-performance native-ready MistralAI client wrapper.
    Features stateful circuit breakers and exponential backoff retry algorithms.
    """
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.base_url = "https://api.mistral.ai/v1"
        self.model = "mistral-large-latest"

    async def chat_completion(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
        response_format: Optional[str] = None
    ) -> str:
        """Execute chat completions with exponential backoff and breaker gates."""
        if not breaker.allow_request():
            logger.error("MistralAI request blocked by stateful Circuit Breaker.")
            raise CircuitBreakerException("Circuit Breaker is OPEN. MistralAI requests temporarily blocked.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}

        # Exponential Backoff variables
        base_delay = 1.0
        max_retries = 3

        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(max_retries):
                try:
                    # Mock connection fallback if api key is missing to keep dev/staging compilations intact
                    if not self.api_key or self.api_key == "your-mistral-api-key-here":
                        logger.warning("Mistral API Key is unconfigured. Returning mock schema response.")
                        breaker.record_success()
                        return '{"response": "Mock career guidance result: Set MISTRAL_API_KEY in .env to call live LLMs."}'

                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        breaker.record_success()
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                        
                    elif response.status_code in [429, 503]:
                        # Server overloaded or rate limited: trigger exponential delay
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited or server busy. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                    else:
                        logger.error(f"Mistral API returned error code {response.status_code}: {response.text}")
                        breaker.record_failure()
                        raise HTTPException(status_code=response.status_code, detail="Mistral service returned an error.")
                        
                except httpx.RequestError as e:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Network error on attempt {attempt+1}: {e}. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    if attempt == max_retries - 1:
                        breaker.record_failure()
                        raise HTTPException(status_code=500, detail="Mistral network connection timed out.")
                        
        breaker.record_failure()
        raise HTTPException(status_code=500, detail="MistralAI completion failed after maximum retries.")

mistral_client = MistralClient()
