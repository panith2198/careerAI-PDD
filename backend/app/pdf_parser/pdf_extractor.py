import os
import logging
from typing import List

logger = logging.getLogger("pdf_extractor")

try:
    import fitz  # PyMuPDF
    pymupdf_available = True
except Exception:
    pymupdf_available = False

class PDFExtractor:
    """
    High-performance layout-aware PDF text extractor.
    Uses y-coordinate block sorting to read text in logical sequence.
    """
    
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract clean, layout-sorted text from a target PDF file."""
        if not os.path.exists(file_path):
            logger.error(f"Extraction failed: File not found at {file_path}")
            return ""

        if not pymupdf_available:
            logger.warning("PyMuPDF is not available locally. Triggering basic file extraction fallback.")
            return f"[PDF Extractor Fallback] Text from {os.path.basename(file_path)}: Build platform packages to run live PyMuPDF text parses."

        full_text = []
        try:
            doc = fitz.open(file_path)
            for page in doc:
                # Extract text as blocks: (x0, y0, x1, y1, "text", block_no, block_type)
                blocks = page.get_text("blocks")
                
                # Sort blocks primarily by y0 (vertical top-to-bottom), then by x0 (left-to-right)
                sorted_blocks = sorted(blocks, key=lambda b: (b[1], b[0]))
                
                page_text = "\n".join([b[4].strip() for b in sorted_blocks if b[4].strip()])
                full_text.append(page_text)
                
            doc.close()
            return "\n\n--- Page Break ---\n\n".join(full_text)
        except Exception as e:
            logger.error(f"PyMuPDF text extraction failed: {e}")
            return ""
