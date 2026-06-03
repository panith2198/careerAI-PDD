import os

# Base directory for local HuggingFace weights cache
MODEL_CACHE_DIR = r"e:\CareerAI\backend\models_cache"
os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

# Configurations for all offline local models
MODEL_REGISTRY = {
    "ner": {
        "model_id": "en_core_web_trf",
        "type": "spacy",
        "description": "spaCy transformer NER for extraction of skills, organizations, dates",
        "memory_mb": 450
    },
    "embeddings": {
        "model_id": "sentence-transformers/all-MiniLM-L6-v2",
        "type": "sentence-transformers",
        "description": "384-dimensional dense semantic sentence embeddings",
        "memory_mb": 120
    },
    "reranker": {
        "model_id": "cross-encoder/ms-marco-MiniLM-L-6-v2",
        "type": "cross-encoder",
        "description": "BERT-based cross-encoder for semantic candidate reranking",
        "memory_mb": 90
    },
    "classifier": {
        "model_id": "facebook/bart-large-mnli",
        "type": "transformers-pipeline",
        "description": "BART Zero-Shot classification for career category matching",
        "memory_mb": 1600
    },
    "summarizer": {
        "model_id": "facebook/bart-large-cnn",
        "type": "transformers-pipeline",
        "description": "BART abstractive summarization of long resumes and JDs",
        "memory_mb": 1600
    }
}
