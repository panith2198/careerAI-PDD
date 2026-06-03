import httpx
import logging
from typing import List
from app.core.config import settings

logger = logging.getLogger("mistral_embedder")

class MistralEmbedder:
    """
    Orchestrates batch generation of 1024-dimensional semantic embeddings
    using mistral-embed. Falls back dynamically if unconfigured.
    """
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.base_url = "https://api.mistral.ai/v1"
        self.model = "mistral-embed"

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate high-dimensional embeddings. Batches up to 512 items."""
        if not texts:
            return []

        # Batch inputs in segments of 512 (Mistral API limit)
        batched_results = []
        chunk_size = 512
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            for i in range(0, len(texts), chunk_size):
                chunk = texts[i : i + chunk_size]
                
                # Mock fallback for dev environments
                if not self.api_key or self.api_key == "your-mistral-api-key-here":
                    logger.warning("Mistral API Key is unconfigured. Returning mock 1024-dim vectors.")
                    # Yield mock 1024-dim float arrays
                    batched_results.extend([[0.01 * j] * 1024 for j in range(len(chunk))])
                    continue
                    
                payload = {
                    "model": self.model,
                    "input": chunk
                }
                
                try:
                    response = await client.post(
                        f"{self.base_url}/embeddings",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        embeddings = [item["embedding"] for item in data["data"]]
                        batched_results.extend(embeddings)
                    else:
                        logger.error(f"Mistral embedding error {response.status_code}: {response.text}")
                        # Return zeroed fallback arrays
                        batched_results.extend([[0.0] * 1024 for _ in range(len(chunk))])
                except Exception as e:
                    logger.error(f"Network failure generating embeddings: {e}")
                    batched_results.extend([[0.0] * 1024 for _ in range(len(chunk))])
                    
        return batched_results

    async def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single text input."""
        results = await self.get_embeddings([text])
        return results[0] if results else [0.0] * 1024

mistral_embedder = MistralEmbedder()
