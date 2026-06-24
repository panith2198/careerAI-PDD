import logging
from typing import List
from app.local_models.model_manager import model_manager

logger = logging.getLogger("local_embedder")

class LocalEmbedder:
    """
    Offline local Embeddings Generator utilizing sentence-transformers/all-MiniLM-L6-v2
    generating 384-dimensional dense vectors with zero API costs.
    """
    
    @staticmethod
    def get_embeddings(texts: List[str]) -> List[List[float]]:
        """Generate 384-dim dense vectors in batches."""
        if not texts:
            return []

        model = model_manager.load_model("embeddings")
        
        # 1. Fail when model framework is unconfigured
        if not model or model == "fallback":
            raise ValueError("Local Embedder model framework is unconfigured.")

        # 2. Generate vector embeddings
        try:
            embeddings = model.encode(texts, batch_size=32, show_progress_bar=False)
            # Convert numpy arrays to float lists
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Local embedding generation failed: {e}")
            raise e

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        """Generate embedding vector for a single text input."""
        results = cls.get_embeddings([text])
        return results[0] if results else [0.0] * 384

local_embedder = LocalEmbedder()
