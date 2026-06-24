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
        cursor.execute("SELECT resume_id, user_id, file_url, file_size_kb, ats_score, parse_status, created_at FROM resumes")
        rows = cursor.fetchall()
        print("RESUMES IN DB:")
        for r in rows:
            print(f"ID: {r['resume_id']} | User ID: {r['user_id']} | URL: {r['file_url']} | Size: {r['file_size_kb']}KB | ATS: {r['ats_score']}% | Status: {r['parse_status']} | Created: {r['created_at']}")
finally:
    connection.close()
