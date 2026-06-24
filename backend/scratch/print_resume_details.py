import pymysql

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
        cursor.execute("SELECT resume_id, file_url, ats_score, raw_text, skills_extracted FROM resumes WHERE user_id = 5")
        rows = cursor.fetchall()
        for r in rows:
            print("="*60)
            print(f"RESUME ID: {r['resume_id']}")
            print(f"URL: {r['file_url']}")
            print(f"ATS Score: {r['ats_score']}%")
            print(f"Skills Extracted: {r['skills_extracted']}")
            raw_preview = r['raw_text'][:200].replace('\n', ' ')
            print(f"Raw Text Preview: {raw_preview}")
finally:
    connection.close()
