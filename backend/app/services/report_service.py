import logging
import os
from typing import Dict, Any

logger = logging.getLogger("report_service")

class ReportService:
    """
    Structured Report Generator.
    Assembles learning roadmaps, assessment achievements, and prioritized skill gaps
    into standardized PDF summaries or clean plain-text files.
    """
    
    @staticmethod
    def generate_career_pdf_report(
        user_name: str,
        career_title: str,
        metrics: Dict[str, Any],
        roadmap_phases: Dict[str, Any],
        output_path: str
    ) -> str:
        """
        Compile structured career roadmaps and milestones into a file.
        In production, calls reportlab/WeasyPrint pipelines to draw standard PDFs.
        """
        try:
            # Create parent directories
            dir_name = os.path.dirname(output_path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
                
            report_text = f"""
================================================================================
                       CAREER NAVIGATOR REPORT: {career_title.upper()}
================================================================================
Student display name: {user_name}
Target Career Goal: {career_title}
Generated On: 2026-05-26

--------------------------------------------------------------------------------
1. CURRENT ACHIEVEMENT METRICS
--------------------------------------------------------------------------------
* Total skills declared: {metrics.get("skills_count", 0)}
* Total assessments completed: {metrics.get("assessments_taken", 0)}
* Average assessment accuracy: {metrics.get("average_assessment_score", 0.0)}%

--------------------------------------------------------------------------------
2. TARGET LEARNING PATH ROADMAP
--------------------------------------------------------------------------------
"""
            phases = roadmap_phases.get("phases", [])
            for p in phases:
                report_text += f"\n> {p.get('phase', 'Phase')} ({p.get('weeks', 'Duration')})\n"
                report_text += f"  Topics to master: {', '.join(p.get('topics', []))}\n"
                report_text += f"  Reference study materials:\n"
                for res in p.get("resources", []):
                    report_text += f"   - {res}\n"
                    
            report_text += "\n================================================================================\n"
            
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(report_text.strip())
                
            logger.info(f"Successfully compiled structured career report to file: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Structured report writer compilation failed: {e}")
            return ""

report_service = ReportService()
