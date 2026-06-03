import json
import re
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, ValidationError

logger = logging.getLogger("response_parser")

class ResponseParser:
    """
    Parses and sanitizes LLM output strings, extracting clean JSON blocks 
    and validating them against Pydantic schemas with regex pre-parsers.
    """

    @staticmethod
    def extract_json(raw_text: str) -> str:
        """Find and extract a JSON substring from conversational text using regular expressions."""
        # 1. Look for standard markdown code block formatting: ```json ... ```
        markdown_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL | re.IGNORECASE)
        if markdown_match:
            return markdown_match.group(1).strip()

        # 2. Fallback to matching braces directly
        brace_match = re.search(r"(\{.*?\})", raw_text, re.DOTALL)
        if brace_match:
            return brace_match.group(1).strip()

        return raw_text.strip()

    @classmethod
    def parse_and_validate(cls, raw_text: str, schema: BaseModel) -> Optional[BaseModel]:
        """Sanitize text, extract target JSON blocks, and validate against Pydantic validation structures."""
        clean_json_str = cls.extract_json(raw_text)
        
        try:
            parsed_dict = json.loads(clean_json_str)
            validated_model = schema.model_validate(parsed_dict)
            return validated_model
        except json.JSONDecodeError as je:
            logger.error(f"Failed to decode extracted JSON string: {je}. Extracted text: {clean_json_str}")
            return None
        except ValidationError as ve:
            logger.error(f"Pydantic validation failed for schema {schema.__name__}: {ve}")
            return None
