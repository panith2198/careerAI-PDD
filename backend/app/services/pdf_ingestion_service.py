import os
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.pdf_parser.pdf_validator import PDFValidator
from app.pdf_parser.pdf_extractor import PDFExtractor
from app.pdf_parser.resume_parser import ResumeParser
from app.local_models.spacy_ner import spacy_ner
from app.models.models import Resume

logger = logging.getLogger("pdf_ingestion_service")

class PDFIngestionService:
    """
    End-to-End PDF Ingestion Service.
    Coordinates file validation, magic byte checking, PyMuPDF block parsing,
    local spaCy NER entities extraction, and MySQL table seed updates.
    """
    
    @staticmethod
    async def ingest_resume(
        file_path: str,
        user_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Ingest, validate, and execute resume parsing pipeline."""
        # 1. Validate PDF structure
        if not PDFValidator.validate_pdf(file_path):
            raise ValueError("Corrupt PDF file or invalid magic bytes header.")
            
        # Calculate SHA256 duplicate checks
        checksum = PDFValidator.calculate_checksum(file_path)
        logger.info(f"PDF integrity validated. SHA256: {checksum}")
        
        # 2. Extract layout-aware blocks
        raw_text = PDFExtractor.extract_text(file_path)
        if not raw_text:
            raise ValueError("Empty document or extraction failure.")
            
        # 3. Parse segments and run spaCy NER
        parsed_resume = ResumeParser.parse_resume(raw_text)
        ner_entities = spacy_ner.extract_entities(raw_text)
        
        # Integrate spaCy detected skills into parsed resume skill lists
        ner_skills = ner_entities.get("skills_detected", [])
        combined_skills = list(dict.fromkeys(parsed_resume["skills_detected"] + ner_skills))
        
        # Calculate mock ATS score based on basic metrics
        score = 60.0 + min(20.0, len(combined_skills) * 2.0)
        
        # 4. Save into database
        new_resume = Resume(
            user_id=user_id,
            file_url=file_path,
            file_size_kb=os.path.getsize(file_path) // 1024,
            page_count=1,
            raw_text=raw_text,
            structured_json={
                "contact": parsed_resume["contact"],
                "education": parsed_resume["education_raw"],
                "experience": parsed_resume["experience_raw"],
                "organizations": ner_entities["organizations"]
            },
            skills_extracted={"skills": combined_skills},
            ats_score=score,
            parser_version="spacy-ner-v2",
            parse_status="done"
        )
        
        db.add(new_resume)
        await db.flush()
        
        return {
            "resume_id": new_resume.resume_id,
            "ats_score": float(new_resume.ats_score),
            "skills_detected": combined_skills,
            "entities": ner_entities
        }
        
pdf_ingestion_service = PDFIngestionService()
