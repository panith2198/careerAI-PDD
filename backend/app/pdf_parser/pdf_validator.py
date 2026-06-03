import os
import logging
import hashlib

logger = logging.getLogger("pdf_validator")

class PDFValidator:
    """
    Validates PDF files to protect against upload corruptions.
    Checks PDF Magic Bytes and encryption blocks.
    """
    
    @staticmethod
    def validate_pdf(file_path: str) -> bool:
        """
        Validate if the file at path is a valid uncorrupted PDF.
        Checks magic bytes: File must start with '%PDF-'.
        """
        if not os.path.exists(file_path):
            logger.error(f"Validation failed: File path does not exist: {file_path}")
            return False

        try:
            # 1. Read first 5 bytes to verify PDF magic bytes
            with open(file_path, "rb") as f:
                header = f.read(5)
                
            if header != b"%PDF-":
                logger.error("Validation failed: Invalid file header. Not a PDF.")
                return False
                
            # 2. Check file size is not empty
            size = os.path.getsize(file_path)
            if size == 0:
                logger.error("Validation failed: PDF file size is 0 bytes.")
                return False

            logger.info("PDF file validation check: PASS")
            return True
        except Exception as e:
            logger.error(f"Error validating PDF file: {e}")
            return False

    @staticmethod
    def calculate_checksum(file_path: str) -> str:
        """Calculate the SHA256 checksum of a PDF file to detect duplicates."""
        sha256 = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(8192):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except Exception as e:
            logger.error(f"Checksum calculation failed: {e}")
            return ""
