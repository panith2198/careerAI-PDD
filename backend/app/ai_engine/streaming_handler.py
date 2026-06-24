import json
import httpx
import logging
from typing import AsyncGenerator, Optional
from app.core.config import settings

logger = logging.getLogger("streaming_handler")

class StreamingHandler:
    """
    Manages asynchronous token streams and packages MistralAI chat completions
    into standard Server-Sent Events (SSE) stream payloads.
    """
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.base_url = "https://api.mistral.ai/v1/chat/completions"
        self.model = "mistral-large-latest"

    async def stream_completion(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Connect to Mistral API in stream mode and yield standardized Server-Sent Events.
        Format: 'data: {"text": "..."}\n\n'
        """
        # Fail if API Key is missing or placeholder
        if not self.api_key or self.api_key == "your-mistral-api-key-here":
            raise ValueError("Mistral API Key is unconfigured. Please configure MISTRAL_API_KEY in .env.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                async with client.stream("POST", self.base_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        logger.error(f"Mistral Stream API returned status code {response.status_code}")
                        raise httpx.HTTPStatusError(f"Mistral Stream API returned status code {response.status_code}", request=response.request, response=response)

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                            
                        # Clean prefix formatting
                        line = line.strip()
                        if line.startswith("data:"):
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                yield "data: [DONE]\n\n"
                                break
                                
                            try:
                                chunk_json = json.loads(data_str)
                                token = chunk_json["choices"][0]["delta"].get("content", "")
                                if token:
                                    # Forward standardized JSON SSE envelope
                                    yield f"data: {json.dumps({'text': token})}\n\n"
                            except Exception as e:
                                logger.error(f"Error parsing stream chunk: {e}. Raw chunk: {line}")
                                continue
                                
            except Exception as e:
                logger.error(f"Stream generation encountered a network error: {e}")
                raise e

streaming_handler = StreamingHandler()
