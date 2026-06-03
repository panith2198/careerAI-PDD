import json
import os
import sys

# Ensure UTF-8 stdout on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

path = r"C:\Users\hp\.gemini\antigravity-ide\brain\9e92b45b-9ac6-457b-934c-e3033e7a91bd\.system_generated\logs\transcript.jsonl"

if not os.path.exists(path):
    print("Log file not found")
    exit(1)

with open(path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        data = json.loads(line)
        content = data.get("content", "")
        if not content and "tool_calls" in data:
            content = str(data["tool_calls"])
        if "celery" in content.lower():
            if data.get("type") == "USER_INPUT" or "clean the celery" in content.lower():
                print(f"Line {idx} ({data.get('type')}):")
                print(repr(content))
                print("="*60)
