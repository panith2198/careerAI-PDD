import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("table_extractor")

try:
    import pdfplumber
    pdfplumber_available = True
except Exception:
    pdfplumber_available = False

class TableExtractor:
    """
    Layout-aware PDF tabular extractor.
    Utilizes pdfplumber for cell grid detection and structural bounding box parsing.
    """
    
    @staticmethod
    def extract_tables(file_path: str) -> List[List[List[str]]]:
        """
        Extract clean table grids from PDF pages.
        Returns a list of tables, where each table is a list of rows, and each row is a list of cells.
        """
        if not os.path.exists(file_path):
            return []

        if not pdfplumber_available:
            logger.warning("pdfplumber is not available in local environment. Triggering empty table fallback.")
            return []

        tables = []
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_tables()
                    for t in extracted:
                        # Clean cell values (remove excessive whitespaces and newlines)
                        cleaned_table = []
                        for row in t:
                            cleaned_row = [str(cell).strip().replace("\n", " ") if cell is not None else "" for cell in row]
                            cleaned_table.append(cleaned_row)
                        tables.append(cleaned_table)
            
            logger.info(f"Successfully extracted {len(tables)} tables from {os.path.basename(file_path)}")
        except Exception as e:
            logger.error(f"pdfplumber table extraction failed: {e}")
            
        return tables
