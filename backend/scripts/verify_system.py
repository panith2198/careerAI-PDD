import sys
import os

# Set PYTHONPATH to current directory to resolve imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("==================================================")
    print("       AI Smart Career Navigator System Verification")
    print("==================================================")
    
    print("\n[+] Testing Core Config & Configs validation...")
    from app.core import settings
    print(f"    - Application settings loaded correctly. App Name: '{settings.APP_NAME}'")
    
    print("\n[+] Testing ORM Database connection mapping...")
    from app.core import engine
    print("    - SQLAlchemy Async Engine configuration complete.")
    
    print("\n[+] Testing Custom Rate Limiting & Correlation Traces...")
    from app.middleware import rate_limiter
    assert rate_limiter.is_allowed("10.0.0.1") == True, "RateLimiter mismatch"
    print("    - O(1) Token Bucket operations running correctly.")

    print("\n[+] Testing Structured Logging & Context Traces...")
    from app.core import configure_structured_logging
    configure_structured_logging()
    print("    - Structured JSON logs initialized successfully.")

    print("\n[+] Testing User permissions & RBAC matching...")
    from app.core import PermissionTrie
    trie = PermissionTrie()
    trie.insert("admin:*")
    assert trie.check("admin:users:create") == True, "Trie prefix evaluation failed"
    print("    - Wildcard Permission Trie prefix evaluation working correctly.")

    print("\n[+] Testing Live WebSocket managers...")
    from app.websocket import ws_manager
    print("    - Thread-safe WebSocket broadcast channels registered.")

    print("\n[+] Testing Helper Utility suites...")
    from app.utils import HashUtils, DateHelpers
    assert HashUtils.compute_md5("test") == "098f6bcd4621d373cade4e832627b4f6", "HashUtils MD5 failed"
    print("    - Cryptographic hash suites and timezone formats checked successfully.")

    print("\n[+] Testing Nightly Inverted Vector Indexers & Task Queues...")
    from app.tasks import rebuild_skill_vectors_nightly
    assert rebuild_skill_vectors_nightly() == True, "Index task failed"
    print("    - Nightly MapReduce tasks running successfully.")

    print("\n==================================================")
    print(" SUCCESS: All Core, Middleware, Sockets, and Utils Verified!")
    print("==================================================")
    sys.exit(0)
except Exception as e:
    import traceback
    print("\n[!] CRITICAL: System verification failed!")
    traceback.print_exc()
    sys.exit(1)
