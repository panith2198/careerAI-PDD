import hashlib
from typing import Union

class HashUtils:
    """
    Cryptographic and hashing helper utilities.
    """
    @staticmethod
    def compute_md5(data: Union[str, bytes]) -> str:
        """Calculate MD5 hex digest checksum for change tracking."""
        if isinstance(data, str):
            data = data.encode("utf-8")
        return hashlib.md5(data).hexdigest()

    @staticmethod
    def compute_sha256(data: Union[str, bytes]) -> str:
        """Calculate SHA256 hex digest signature."""
        if isinstance(data, str):
            data = data.encode("utf-8")
        return hashlib.sha256(data).hexdigest()
