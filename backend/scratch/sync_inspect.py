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
        cursor.execute("SELECT assessment_id, title, career_id, skill_id, type FROM assessments")
        rows = cursor.fetchall()
        print("ASSESSMENTS IN DB:")
        for r in rows:
            print(f"ID: {r['assessment_id']} | Title: {r['title']} | Career: {r['career_id']} | Skill: {r['skill_id']} | Type: {r['type']}")
finally:
    connection.close()
