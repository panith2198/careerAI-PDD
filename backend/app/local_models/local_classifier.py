import logging
from typing import List, Dict, Any
from app.local_models.model_manager import model_manager

logger = logging.getLogger("local_classifier")

class LocalClassifier:
    """
    Zero-Shot career classification specialist utilizing HuggingFace's bart-large-mnli
    to categorize long texts (like resumes or JDs) into target career domains.
    """
    
    @staticmethod
    def classify_category(text: str, candidate_labels: List[str]) -> Dict[str, Any]:
        """Classify target text over custom list of labels. Returns scored probability dict."""
        if not text or not candidate_labels:
            return {"labels": [], "scores": []}

        classifier = model_manager.load_model("classifier")
        
        # 1. Fallback when transformer pipelines are unconfigured
        if not classifier or classifier == "fallback":
            logger.warning("Local Classifier in fallback mode. Returning generic probability metrics.")
            # Yield uniform probability distribution as default fallback
            prob = 1.0 / len(candidate_labels)
            return {
                "sequence": text[:50],
                "labels": candidate_labels,
                "scores": [prob] * len(candidate_labels)
            }

        # 2. Pipeline Zero-Shot Classification execution
        try:
            result = classifier(text, candidate_labels, multi_label=False)
            logger.info("Successfully completed local zero-shot classification task.")
            return {
                "sequence": result["sequence"][:50],
                "labels": result["labels"],
                "scores": [float(s) for s in result["scores"]]
            }
        except Exception as e:
            logger.error(f"Zero-shot classification pipeline failed: {e}")
            return {"labels": candidate_labels, "scores": [0.0] * len(candidate_labels)}

local_classifier = LocalClassifier()
