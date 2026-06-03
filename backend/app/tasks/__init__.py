from app.tasks.ai_tasks import process_async_resume_analysis, generate_async_career_roadmap, celery_app as celery
from app.tasks.email_tasks import send_otp_email, send_welcome_email, send_career_report_pdf_email
from app.tasks.index_tasks import rebuild_skill_vectors_nightly
from app.tasks.report_tasks import generate_weekly_career_reports
from app.tasks.sync_tasks import sync_external_jobs_rate_limited

__all__ = [
    "celery",
    "process_async_resume_analysis",
    "generate_async_career_roadmap",
    "send_otp_email",
    "send_welcome_email",
    "send_career_report_pdf_email",
    "rebuild_skill_vectors_nightly",
    "generate_weekly_career_reports",
    "sync_external_jobs_rate_limited",
]
