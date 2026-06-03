from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import RagDocument

class VectorRepository:
    """
    Vector Repository managing indexing sync metadata for ChromaDB / RAG collections.
    AI Prompt Role: Vector indexing agent.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_document_chunk(self, doc_chunk: RagDocument) -> RagDocument:
        self.db.add(doc_chunk)
        await self.db.flush()
        return doc_chunk

    async def get_chunks_by_collection(self, collection_name: str) -> List[RagDocument]:
        stmt = select(RagDocument).where(
            RagDocument.collection_name == collection_name,
            RagDocument.is_active == True
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_chroma_id(self, chroma_doc_id: str) -> Optional[RagDocument]:
        stmt = select(RagDocument).where(RagDocument.chroma_doc_id == chroma_doc_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def deactivate_chunks(self, chroma_doc_ids: List[str]):
        """Soft-deactivate chunk elements in bulk."""
        for c_id in chroma_doc_ids:
            chunk = await self.get_by_chroma_id(c_id)
            if chunk:
                chunk.is_active = False
        await self.db.flush()
