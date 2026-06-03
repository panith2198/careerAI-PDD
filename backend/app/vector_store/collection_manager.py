import logging
from typing import List
from app.vector_store.chroma_client import chroma_client_wrapper

logger = logging.getLogger("collection_manager")

class CollectionManager:
    """
    Orchestrates target vector database namespaces.
    Sets up default collections: careers, skills, jobs, resumes, and knowledge base chunks.
    """
    def __init__(self):
        self.collections = ["careers", "skills", "jobs", "resumes", "kb"]

    def initialize_system_collections(self):
        """Pre-configure and seed HNSW collections on database startup lifecycle."""
        logger.info("Initializing system-wide vector database collections namespaces...")
        for col in self.collections:
            # Upsert namespace metadata via chroma wrapper
            chroma_client_wrapper.get_or_create_collection(col)
        logger.info("Vector collections namespaces fully synchronized.")

    def delete_collection(self, name: str) -> bool:
        """Purge and delete a collection namespace."""
        client = chroma_client_wrapper._get_client()
        if not client:
            logger.warning("ChromaDB is unavailable. Skipping collection deletion.")
            return False
        try:
            client.delete_collection(name=name)
            logger.warning(f"Purged vector collection: {name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection '{name}': {e}")
            return False

collection_manager = CollectionManager()
