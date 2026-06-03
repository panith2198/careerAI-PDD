from typing import List
from app.rag_engine.document_loader import Document

class Chunker:
    """
    Splits long Document page-content inputs into overlap-controlled chunks
    using recursive character sliding windows (512 tokens / 2048 chars, 64 token overlap).
    """
    def __init__(self, chunk_size: int = 2048, chunk_overlap: int = 256):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", " ", ""]

    def split_text(self, text: str) -> List[str]:
        """Recursive Character Splitting logic."""
        if not text:
            return []
            
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + self.chunk_size, text_len)
            
            # If we are not at the end of the text, try to find a separator boundary
            if end < text_len:
                boundary = -1
                for sep in self.separators:
                    if not sep:
                        continue
                    # Search backward within the boundary window
                    boundary = text.rfind(sep, start, end)
                    if boundary != -1:
                        end = boundary + len(sep)
                        break
                        
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
                
            start = end - self.chunk_overlap
            if start >= end:
                start = end
                
        return chunks

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """Split a list of Document objects into nested child Document chunks."""
        chunked_docs = []
        
        for doc in documents:
            chunks = self.split_text(doc.page_content)
            for idx, chunk in enumerate(chunks):
                chunk_metadata = dict(doc.metadata)
                chunk_metadata["chunk_index"] = idx
                
                chunked_docs.append(Document(page_content=chunk, metadata=chunk_metadata))
                
        return chunked_docs
