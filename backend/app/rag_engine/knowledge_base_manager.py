import os
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.rag_engine.document_loader import DocumentLoader
from app.rag_engine.chunker import Chunker
from app.rag_engine.embedder import Embedder
from app.rag_engine.vector_indexer import VectorIndexer
from app.models.models import RagDocument

logger = logging.getLogger("knowledge_base_manager")

class KnowledgeBaseManager:
    """
    RAG Knowledge Base Management Agent. Handles document indexing pipelines,
    persisting metadata inside SQL databases and vectors inside the indexer.
    """
    
    @staticmethod
    async def ingest_kb_document(
        file_path: str,
        collection_name: str,
        source_type: str,
        db: AsyncSession
    ) -> bool:
        """
        Orchestrate document ingestion:
        1. Loader: Ingest layout blocks via PyMuPDF/fitz.
        2. Chunker: Split text characters into overlap-controlled chunks.
        3. Embedder: Batch generate 1024-dim semantic embeddings using Mistral.
        4. Vector Indexer: Save vectors into local stores.
        5. Database Sync: Seed records inside the MySQL 'rag_documents' table.
        """
        logger.info(f"Triggering KB Ingestion for: {file_path} into collection: {collection_name}")
        
        # 1. Ingest Text Blocks
        if source_type.lower() == "pdf":
            documents = DocumentLoader.load_pdf(file_path)
        else:
            documents = DocumentLoader.load_txt(file_path)
            
        if not documents:
            logger.error("Ingestion failed: No document pages extracted.")
            return False
            
        # 2. Split characters into chunks (Recursive character splitter)
        chunker = Chunker(chunk_size=2048, chunk_overlap=256)
        chunked_docs = chunker.split_documents(documents)
        
        if not chunked_docs:
            logger.error("Ingestion failed: No text chunks compiled.")
            return False
            
        # 3. Generate high-fidelity embeddings
        chunk_texts = [doc.page_content for doc in chunked_docs]
        embeddings = await Embedder.embed_documents(chunk_texts)
        
        # 4. Save vectors locally
        await VectorIndexer.index_documents(collection_name, chunked_docs, embeddings)
        
        # 5. Seed metadata inside relational MySQL tables
        for idx, doc in enumerate(chunked_docs):
            db_doc = RagDocument(
                collection_name=collection_name,
                source_type=source_type,
                source_path=file_path,
                title=doc.metadata["title"],
                chunk_index=doc.metadata["chunk_index"],
                chunk_text=doc.page_content,
                chroma_doc_id=doc.metadata["chroma_doc_id"],
                embedding_model="mistral-embed",
                embedding_dim=1024,
                token_count=len(doc.page_content) // 4,
                is_active=True
            )
            db.add(db_doc)
            
        await db.flush()
        logger.info(f"Ingested and synchronized {len(chunked_docs)} chunks inside MySQL database.")
        return True
