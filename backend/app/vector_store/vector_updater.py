import hashlib
import logging
from typing import Dict, List, Any, Tuple

logger = logging.getLogger("vector_updater")

class VectorUpdater:
    """
    Delta Ingestion Sync Agent.
    Calculates document MD5 hashes to detect modifications, executing re-embedding
    routines exclusively over modified or new files to minimize Mistral API workloads.
    """
    
    @staticmethod
    def calculate_md5(text: str) -> str:
        """Calculate standard MD5 hash representation of string contents."""
        if not text:
            return ""
        return hashlib.md5(text.encode("utf-8")).hexdigest()

    @classmethod
    def detect_deltas(
        cls, 
        existing_manifest: Dict[str, str], 
        incoming_documents: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Compare target hashes to filter deltas.
        Returns:
        * modified_docs: documents requiring re-embedding (hashes modified).
        * new_docs: fresh documents to embed (no prior record).
        """
        modified_docs = []
        new_docs = []
        
        for doc in incoming_documents:
            doc_id = doc["id"]
            doc_text = doc["text"]
            current_hash = cls.calculate_md5(doc_text)
            
            if doc_id in existing_manifest:
                prior_hash = existing_manifest[doc_id]
                if current_hash != prior_hash:
                    # Content updated: mark for delta sync
                    modified_docs.append(doc)
            else:
                # Prior registry absent: new document
                new_docs.append(doc)
                
        logger.info(f"Delta sync checks complete: {len(new_docs)} new files, {len(modified_docs)} modified files identified.")
        return new_docs, modified_docs
