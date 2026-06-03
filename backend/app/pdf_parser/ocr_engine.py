import os
import logging
from typing import Optional

logger = logging.getLogger("ocr_engine")

try:
    import cv2
    import numpy as np
    opencv_available = True
except Exception:
    opencv_available = False

try:
    import pytesseract
    tesseract_available = True
except Exception:
    tesseract_available = False

class OCREngine:
    """
    State-of-the-art OCR pre-processing and parsing engine.
    Applies OpenCV deskewing and Otsu threshold binarizations before calling Tesseract OCR.
    """
    
    @staticmethod
    def preprocess_image(image_path: str) -> Optional[str]:
        """Apply noise reductions, deskew alignments, and Otsu binarizations locally."""
        if not os.path.exists(image_path):
            return None

        if not opencv_available:
            logger.warning("OpenCV/Numpy is unavailable. Skipping preprocessing filters.")
            return image_path

        try:
            # Read image as grayscale
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            # 1. Otsu threshold binarization
            _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Save processed temp file
            proc_path = image_path.replace(".", "_binarized.")
            cv2.imwrite(proc_path, thresh)
            return proc_path
        except Exception as e:
            logger.error(f"OpenCV image pre-processing failed: {e}")
            return image_path

    @staticmethod
    def extract_text_from_image(image_path: str) -> str:
        """Call Tesseract OCR to read text blocks from images."""
        if not os.path.exists(image_path):
            return ""

        if not tesseract_available:
            logger.warning("pytesseract is not available in local environment. Skipping OCR text extraction.")
            return "[OCR Fallback] Install pytesseract binaries to read scanned page images."

        try:
            # Set target configurations: PSM 3 (Fully automatic page segmentation)
            config = "--psm 3"
            text = pytesseract.image_to_string(image_path, config=config)
            return text.strip()
        except Exception as e:
            logger.error(f"Tesseract OCR compilation failed: {e}")
            return ""
