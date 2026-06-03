import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("image_extractor")

try:
    import fitz  # PyMuPDF
    pymupdf_available = True
except Exception:
    pymupdf_available = False

class ImageExtractor:
    """
    Extracts raw embedded raster images (JPEG/PNG) from PDF streams
    for saving profile photos, diagrams, or certificate validation files.
    """
    
    @staticmethod
    def extract_images(file_path: str, output_dir: str) -> List[str]:
        """Extract embedded PDF images and persist them inside output_dir."""
        if not os.path.exists(file_path):
            return []

        if not pymupdf_available:
            logger.warning("PyMuPDF is not available locally. Image extraction skipped.")
            return []

        os.makedirs(output_dir, exist_ok=True)
        extracted_paths = []
        
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                images = doc[page_num].get_images(full=True)
                
                for img_idx, img in enumerate(images):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]  # png, jpeg, etc.
                    
                    file_name = f"page{page_num+1}_img{img_idx+1}.{image_ext}"
                    out_path = os.path.join(output_dir, file_name)
                    
                    with open(out_path, "wb") as f:
                        f.write(image_bytes)
                        
                    extracted_paths.append(out_path)
                    
            doc.close()
            logger.info(f"Extracted {len(extracted_paths)} raster images to {output_dir}")
        except Exception as e:
            logger.error(f"Image extraction pipeline failed: {e}")
            
        return extracted_paths
