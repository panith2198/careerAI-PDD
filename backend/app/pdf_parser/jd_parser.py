import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger("jd_parser")

class JDParser:
    """
    Parses Job Description (JD) text blocks, categorizing qualifications,
    requirements, salary ranges, and classifying must-have vs nice-to-have skillsets.
    """
    
    @staticmethod
    def extract_work_mode(text: str) -> str:
        """Identify work mode requirements (remote, hybrid, onsite) using regex patterns."""
        text_lower = text.lower()
        if "remote" in text_lower or "work from home" in text_lower or "wfh" in text_lower:
            return "remote"
        if "hybrid" in text_lower or "remote friendly" in text_lower:
            return "hybrid"
        return "onsite"

    @staticmethod
    def extract_experience(text: str) -> int:
        """Extract minimum experience requirements in months."""
        # Look for patterns like: "X years", "X+ years", "X to Y years"
        match = re.search(r"(\d+)\s*(?:-|to)?\s*(?:\d+)?\s*years?(?:\s+experience)?", text, re.IGNORECASE)
        if match:
            try:
                years = int(match.group(1))
                return years * 12
            except ValueError:
                return 0
        return 0

    @classmethod
    def parse_job_description(cls, text: str) -> Dict[str, Any]:
        """Orchestrate entire JD parsing segments."""
        work_mode = cls.extract_work_mode(text)
        min_experience_months = cls.extract_experience(text)
        
        # Simple extraction for core skills (look under sections like Requirements / Preferred)
        skills = []
        # Standard keywords that indicate skill blocks
        keyword_pattern = re.compile(r"\b(python|javascript|fastapi|react|mysql|sql|node|docker|kubernetes|aws|css|html|git)\b", re.IGNORECASE)
        found = keyword_pattern.findall(text)
        if found:
            # Deduplicate while preserving order
            skills = list(dict.fromkeys([s.capitalize() for s in found]))
            
        return {
            "work_mode": work_mode,
            "min_experience_months": min_experience_months,
            "skills_extracted": skills,
            "is_fresher_eligible": 1 if min_experience_months <= 12 else 0
        }
