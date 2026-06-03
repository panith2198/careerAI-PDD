import logging
from typing import List, Dict, Any

logger = logging.getLogger("layout_analyzer")

class LayoutAnalyzer:
    """
    Analyzes PDF document structures and detects multi-column layouts.
    Uses K-Means clustering over text block coordinates (specifically x0 values)
    to identify column boundaries.
    """
    
    @staticmethod
    def detect_columns(blocks: List[Dict[str, Any]]) -> int:
        """
        Calculates column count using simple coordinate threshold clustering.
        If blocks are grouped around 2 dominant x0 starting positions, it's multi-column.
        """
        if not blocks or len(blocks) < 4:
            return 1  # Standard single column layout fallback

        # Extract x0 coordinates of starting block boundaries
        x_coords = []
        for b in blocks:
            # Assume block structure is dict or tuple
            if isinstance(b, dict) and "bbox" in b:
                x_coords.append(b["bbox"][0])
            elif isinstance(b, tuple) or isinstance(b, list):
                x_coords.append(b[0])

        if len(x_coords) < 4:
            return 1

        # Basic K-Means clustering (K=2) on 1D coordinates to separate columns
        # Step 1: Initialize centroids
        x_min, x_max = min(x_coords), max(x_coords)
        if x_max - x_min < 100:  # If coordinates are very close, it's single column
            return 1
            
        c1, c2 = x_min, x_max
        
        # Run 5 iterations of coordinate clustering
        for _ in range(5):
            g1, g2 = [], []
            for x in x_coords:
                if abs(x - c1) < abs(x - c2):
                    g1.append(x)
                else:
                    g2.append(x)
                    
            if not g1 or not g2:
                break
                
            c1 = sum(g1) / len(g1)
            c2 = sum(g2) / len(g2)

        # If centroids are separated and both clusters have at least 25% of points, it's multi-column
        separation = abs(c1 - c2)
        ratio_g1 = len(g1) / len(x_coords)
        ratio_g2 = len(g2) / len(x_coords)
        
        if separation > 150 and 0.2 < ratio_g1 < 0.8:
            logger.info(f"Multi-column layout identified: 2 columns detected. Separation: {separation}px.")
            return 2
            
        return 1
