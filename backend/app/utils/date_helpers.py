import datetime
from typing import Optional

class DateHelpers:
    """
    Date parsing and standard formatting helpers.
    """
    @staticmethod
    def parse_iso_datetime(dt_str: str) -> Optional[datetime.datetime]:
        """Parse standard ISO formatted date strings safely."""
        try:
            return datetime.datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None

    @staticmethod
    def get_current_utc() -> datetime.datetime:
        """Fetch current UTC timestamp."""
        return datetime.datetime.utcnow()

    @staticmethod
    def format_to_standard(dt: datetime.datetime) -> str:
        """Format datetime object into human-readable standard format."""
        return dt.strftime("%Y-%m-%d %H:%M:%S")
