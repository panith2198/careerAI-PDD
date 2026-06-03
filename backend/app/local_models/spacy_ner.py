import logging
from typing import List, Dict, Any
from app.local_models.model_manager import model_manager

logger = logging.getLogger("spacy_ner")

class SpacyNER:
    """
    Named Entity Recognition (NER) pipeline utilizing local spaCy 'en_core_web_trf'
    to identify skills, dates, and organizations from resume and JD documents.
    """
    
    @staticmethod
    def extract_entities(text: str) -> Dict[str, List[str]]:
        """Extract lists of ORG, DATE, and skill entities from text."""
        nlp = model_manager.load_model("ner")
        
        entities = {
            "organizations": [],
            "dates": [],
            "skills_detected": []
        }
        
        # 1. Standard fallback when spaCy packages are unconfigured
        if not nlp or nlp == "fallback":
            logger.warning("spaCy NER is in fallback mode. Running basic regex extractors.")
            # Basic email/phone/date extraction fallback
            import re
            dates = re.findall(r"\b(19|20)\d{2}\b", text)
            entities["dates"] = list(dict.fromkeys(dates))
            return entities

        # 2. Parse text with spaCy model
        try:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    entities["organizations"].append(ent.text.strip())
                elif ent.label_ == "DATE":
                    entities["dates"].append(ent.text.strip())
                elif ent.label_ in ["PRODUCT", "WORK_OF_ART", "LAW"]: # Heuristics for technical skills
                    entities["skills_detected"].append(ent.text.strip())
                    
            # Deduplicate entries while preserving sequence order
            entities["organizations"] = list(dict.fromkeys(entities["organizations"]))
            entities["dates"] = list(dict.fromkeys(entities["dates"]))
            entities["skills_detected"] = list(dict.fromkeys(entities["skills_detected"]))
            
            logger.info("Successfully completed spaCy NER extraction pipeline.")
        except Exception as e:
            logger.error(f"spaCy entity parser execution failed: {e}")
            
        return entities
spacy_ner = SpacyNER()
