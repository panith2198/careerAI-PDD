from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: str
    system_instruction: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 1024

class AIResponse(BaseModel):
    content: str
    token_usage: Dict[str, int]
    finish_reason: str

class EmbeddingRequest(BaseModel):
    texts: List[str]
    model: str = "mistral-embed"

class RagQueryRequest(BaseModel):
    query: str
    collection: str = "careers"

class RagQueryResponse(BaseModel):
    answer: str
    cited_documents: List[Dict[str, Any]]
