try:
    import fitz  # PyMuPDF
    pymupdf_available = True
except Exception as e:
    pymupdf_available = False

import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("document_loader")

class Document:
    """Standard document object representing loaded page texts and schemas."""
    def __init__(self, page_content: str, metadata: Dict[str, Any]):
        self.page_content = page_content
        self.metadata = metadata

class DocumentLoader:
    """
    High-performance layout-aware document loader utilizing PyMuPDF
    for extremely fast text ingestion with page-level metadata.
    """
    
    @staticmethod
    def load_pdf(file_path: str) -> List[Document]:
        """Load and extract text from a PDF file page-by-page."""
        if not os.path.exists(file_path):
            logger.error(f"Loader failed: Target file path does not exist: {file_path}")
            return []

        if not pymupdf_available:
            logger.warning("PyMuPDF is not available in local environment. Running document fallback parser.")
            file_name = os.path.basename(file_path)
            metadata = {
                "source": file_path,
                "title": file_name,
                "page": 1,
                "total_pages": 1
            }
            return [Document(
                page_content=f"[Fallback Ingest] Ingestion completed for PDF: {file_name}. Build full platform libraries to parse standard pages.",
                metadata=metadata
            )]

        documents = []
        try:
            # Open PDF using PyMuPDF (fitz)
            doc = fitz.open(file_path)
            file_name = os.path.basename(file_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Layout-aware block parsing
                text = page.get_text("blocks")
                
                # Sort text blocks by vertical y-coord to guarantee reading order layout
                sorted_blocks = sorted(text, key=lambda b: (b[1], b[0]))
                page_text = "\n".join([block[4] for block in sorted_blocks])
                
                metadata = {
                    "source": file_path,
                    "title": file_name,
                    "page": page_num + 1,
                    "total_pages": len(doc)
                }
                
                documents.append(Document(page_content=page_text, metadata=metadata))
                
            doc.close()
            logger.info(f"Successfully loaded {len(documents)} pages from PDF: {file_name}")
        except Exception as e:
            logger.error(f"PyMuPDF loader failed for {file_path}: {e}")
            
        return documents

    @staticmethod
    def load_txt(file_path: str) -> List[Document]:
        """Load standard text files."""
        if not os.path.exists(file_path):
            return []
            
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            metadata = {
                "source": file_path,
                "title": os.path.basename(file_path),
                "page": 1
            }
            return [Document(page_content=text, metadata=metadata)]
        except Exception as e:
            logger.error(f"Text loader failed for {file_path}: {e}")
            return []
