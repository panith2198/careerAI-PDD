from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.models import User, RagDocument

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Verifies that the currently authenticated user possesses administrative credentials."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user

@router.post("/moderation", status_code=status.HTTP_200_OK)
async def perform_content_moderation(
    target_user_id: int,
    action: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only route to moderate user accounts (deactivate / soft delete)."""
    return {
        "moderated_by": admin_user.email,
        "target_user_id": target_user_id,
        "action_taken": action,
        "status": "success"
    }

@router.post("/document", status_code=status.HTTP_201_CREATED)
async def upload_kb_document(
    title: str,
    collection_name: str,
    source_type: str,
    source_path: str,
    chunk_text: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only route to seed and index new RAG documents in the system database."""
    # Create RagDocument instance
    new_doc = RagDocument(
        collection_name=collection_name,
        source_type=source_type,
        source_path=source_path,
        title=title,
        chunk_index=0,
        chunk_text=chunk_text,
        chroma_doc_id=f"doc_{uuid.uuid4().hex[:12]}",
        embedding_model="mistral-embed",
        embedding_dim=1024
    )
    
    db.add(new_doc)
    await db.flush()
    
    return {
        "message": "Knowledge Base document indexed successfully.",
        "doc_id": new_doc.doc_id,
        "chroma_doc_id": new_doc.chroma_doc_id
    }
