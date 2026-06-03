import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger("resume_parser")

class ResumeParser:
    """
    Parses full resume texts, identifying sections, extracting contact metrics,
    and capturing education, experience, and skill lists using regex.
    """
    
    @staticmethod
    def parse_contact_info(text: str) -> Dict[str, str]:
        """Extract email and phone contact details using regular expressions."""
        email_pattern = r"[\w\.-]+@[\w\.-]+\.\w+"
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        return {
            "email": email_match.group(0) if email_match else "",
            "phone": phone_match.group(0) if phone_match else ""
        }

    @staticmethod
    def extract_section_headers(text: str) -> Dict[str, str]:
        """Segment raw text based on standard block heading boundaries."""
        sections = {
            "education": "",
            "experience": "",
            "skills": "",
            "projects": ""
        }
        
        # Standard headings
        headers = {
            "education": [r"\beducation\b", r"\bacademics\b", r"\bqualification\b"],
            "experience": [r"\bexperience\b", r"\bemployment\b", r"\bwork history\b", r"\bprofessional history\b"],
            "skills": [r"\bskills\b", r"\btechnical skills\b", r"\bcompetencies\b"],
            "projects": [r"\bprojects\b", r"\bacademics projects\b", r"\bpersonal projects\b"]
        }
        
        lines = text.split("\n")
        current_section = None
        section_lines = {k: [] for k in sections.keys()}
        
        for line in lines:
            line_clean = line.strip().lower()
            header_matched = False
            
            for sec, patterns in headers.items():
                for pat in patterns:
                    if re.match(pat, line_clean):
                        current_section = sec
                        header_matched = True
                        break
                if header_matched:
                    break
                    
            if header_matched:
                continue
                
            if current_section:
                section_lines[current_section].append(line)
                
        for k in sections.keys():
            sections[k] = "\n".join(section_lines[k]).strip()
            
        return sections

    @classmethod
    def parse_resume(cls, text: str) -> Dict[str, Any]:
        """Complete resume segmentation pipeline."""
        contact = cls.parse_contact_info(text)
        sections = cls.extract_section_headers(text)
        
        # Extract basic skills (simple comma/newline splitting over the skills segment)
        skills_text = sections["skills"]
        skills_list = []
        if skills_text:
            # Split by commas, semicolons, or lines
            raw_skills = re.split(r"[,;\n•]", skills_text)
            skills_list = [s.strip() for s in raw_skills if s.strip() and len(s.strip()) < 30]
            
        return {
            "contact": contact,
            "education_raw": sections["education"],
            "experience_raw": sections["experience"],
            "projects_raw": sections["projects"],
            "skills_detected": skills_list
        }
