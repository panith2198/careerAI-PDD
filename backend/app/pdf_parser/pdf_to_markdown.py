import os
import logging
from app.pdf_parser.pdf_extractor import PDFExtractor

logger = logging.getLogger("pdf_to_markdown")

class PDFToMarkdown:
    """
    Parses hierarchical blocks in PDFs and reassembles them into clean markdown
    text blocks suitable for RAG chunking and LLM prompt augmentation.
    """
    
    @staticmethod
    def convert_to_markdown(file_path: str) -> str:
        """Convert a PDF document into a structured Markdown string."""
        raw_text = PDFExtractor.extract_text(file_path)
        if not raw_text:
            return ""

        markdown_lines = []
        lines = raw_text.split("\n")
        
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                markdown_lines.append("")
                continue
                
            # Simple heuristic mapping for headings:
            # 1. Very short lines in uppercase or starting with section numerals
            if len(line_clean) < 50 and (line_clean.isupper() or line_clean[0].isdigit() and "." in line_clean[:3]):
                markdown_lines.append(f"\n## {line_clean.title()}\n")
            # 2. Bullet list mapping
            elif line_clean.startswith("•") or line_clean.startswith("-") or line_clean.startswith("*"):
                # Standardize bullet prefixes
                clean_bullet = line_clean.lstrip("•-* ").strip()
                markdown_lines.append(f"* {clean_bullet}")
            else:
                markdown_lines.append(line_clean)
                
        logger.info(f"Converted PDF to structured markdown: {os.path.basename(file_path)}")
        return "\n".join(markdown_lines)
