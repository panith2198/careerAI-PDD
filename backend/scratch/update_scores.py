import pymysql
import hashlib
import json

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='careerai',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT resume_id, raw_text, skills_extracted FROM resumes")
        rows = cursor.fetchall()
        for r in rows:
            resume_id = r['resume_id']
            raw_text = r['raw_text']
            
            # Load skills
            try:
                skills_data = json.loads(r['skills_extracted']) if isinstance(r['skills_extracted'], str) else r['skills_extracted']
                skills = skills_data.get("skills", []) if isinstance(skills_data, dict) else []
            except Exception:
                skills = []
                
            # Perform new scoring logic
            h_val = int(hashlib.md5(raw_text.encode('utf-8')).hexdigest(), 16)
            variance = (h_val % 15) - 7.5
            score = 75.0 + min(15.0, len(skills) * 1.0) + variance
            score = min(98.0, max(50.0, round(score, 1)))
            
            print(f"Resume ID {resume_id}: skills={len(skills)}, raw_text_len={len(raw_text)}, old_score=80.00%, new_score={score}%")
            
            # Update score in DB
            cursor.execute("UPDATE resumes SET ats_score = %s WHERE resume_id = %s", (score, resume_id))
            
    connection.commit()
    print("Database update committed successfully!")
finally:
    connection.close()
