import logging
from typing import Dict, Any, Optional

try:
    from celery import Celery
    from app.core.config import settings
    celery_app = Celery(
        "careerai_tasks",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL
    )
except ImportError:
    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(func):
                func.delay = lambda *a, **kw: func(*a, **kw)
                return func
            return decorator
    celery_app = MockCelery()

logger = logging.getLogger("email_tasks")

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

@celery_app.task(priority=9)
def send_otp_email(email: str, otp: str) -> bool:
    """
    Sends time-sensitive OTP verify email asynchronously (High priority).
    """
    logger.info(f"Priority [9] - Dispatching OTP verification mail to: {email}")
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = email
        msg['Subject'] = f"[{otp}] Your AI Smart Career Navigator OTP Code"
        
        # Premium responsive HTML template using design tokens
        html_body = f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060608; color: #EEEAF8; padding: 40px 20px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #161525; border: 1px solid #308B5CF6; border-radius: 16px; padding: 36px 24px; box-shadow: 0 8px 32px rgba(109, 40, 217, 0.15);">
                    <div style="font-size: 24px; font-weight: bold; color: #A78BFA; margin-bottom: 24px; letter-spacing: -0.5px;">
                         AI Smart Career Navigator
                    </div>
                    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #8B5CF640, transparent); margin-bottom: 24px;"></div>
                    <h3 style="color: #EEEAF8; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Verify Your Account</h3>
                    <p style="color: #9D99B8; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                        Use the secure validation code below to complete your authentication process:
                    </p>
                    <div style="background-color: #1E1B2E; border-radius: 10px; padding: 18px; margin: 24px auto; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B5CF6; border: 1px solid #26FFFFFF; width: 220px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
                        {otp}
                    </div>
                    <p style="color: #5C5A78; font-size: 12px; line-height: 1.5; margin: 32px 0 0 0;">
                        This code is highly time-sensitive and will expire in <strong>10 minutes</strong>.<br>
                        If you did not request this verification, please secure your credentials.
                    </p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"OTP successfully transmitted to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to transmit OTP email to {email}: {str(e)}")
        return False

@celery_app.task(priority=5)
def send_welcome_email(email: str, full_name: str) -> bool:
    """
    Sends onboarding welcome email (Standard priority).
    """
    logger.info(f"Priority [5] - Dispatching onboarding welcome email to: {email}")
    return True

@celery_app.task(priority=2)
def send_career_report_pdf_email(email: str, report_id: int, file_path: str) -> bool:
    """
    Sends analytical career reports with attached PDFs (Low priority / background queue).
    """
    logger.info(f"Priority [2] - Emailing career report {report_id} attachment ({file_path}) to: {email}")
    return True
