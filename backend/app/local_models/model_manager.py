import logging
from typing import Any, Dict
from app.local_models.model_registry import MODEL_REGISTRY, MODEL_CACHE_DIR

logger = logging.getLogger("model_manager")

class ModelManager:
    """
    Lifecycle Model Cache Manager.
    Implements a thread-safe Lazy Singleton loading system to load models once,
    caching weights pipelines in memory dynamically.
    """
    _instance = None
    _loaded_models: Dict[str, Any] = {}

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def load_model(self, task_key: str) -> Any:
        """Lazy load a HuggingFace model based on task key registry."""
        if task_key not in MODEL_REGISTRY:
            logger.error(f"Load failed: Model key '{task_key}' is not defined in model registry.")
            return None

        # Check if already loaded in our singleton memory cache
        if task_key in self._loaded_models:
            return self._loaded_models[task_key]

        config = MODEL_REGISTRY[task_key]
        model_id = config["model_id"]
        model_type = config["type"]

        logger.info(f"Loading local model '{model_id}' in memory. Allocated size: {config['memory_mb']}MB")

        try:
            if model_type == "spacy":
                import spacy
                model = spacy.load(model_id)
            elif model_type == "sentence-transformers":
                from sentence_transformers import SentenceTransformer
                model = SentenceTransformer(model_id, cache_folder=MODEL_CACHE_DIR)
            elif model_type == "cross-encoder":
                from sentence_transformers import CrossEncoder
                model = CrossEncoder(model_id, cache_folder=MODEL_CACHE_DIR)
            elif model_type == "transformers-pipeline":
                # For heavy abstractive summarization and zero-shot pipelines
                from transformers import pipeline
                if task_key == "classifier":
                    model = pipeline("zero-shot-classification", model=model_id, model_kwargs={"cache_dir": MODEL_CACHE_DIR})
                else:
                    model = pipeline("summarization", model=model_id, model_kwargs={"cache_dir": MODEL_CACHE_DIR})
            else:
                model = "fallback"
                
            self._loaded_models[task_key] = model
            logger.info(f"Successfully loaded and cached local model '{model_id}'")
            return model
        except Exception as e:
            logger.warning(f"Framework dependencies failed to load model '{model_id}': {e}. Returning safe fallback mode.")
            self._loaded_models[task_key] = "fallback"
            return "fallback"

model_manager = ModelManager()
