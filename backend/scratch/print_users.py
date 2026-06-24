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
        cursor.execute("SELECT * FROM users LIMIT 1")
        row = cursor.fetchone()
        if row:
            print("KEYS IN USER ROW:")
            print(list(row.keys()))
        
        cursor.execute("SELECT user_id, full_name, email, role FROM users")
        rows = cursor.fetchall()
        print("\nUSERS IN DB:")
        for r in rows:
            print(f"ID: {r['user_id']} | Name: {r['full_name']} | Email: {r['email']} | Role: {r['role']}")
finally:
    connection.close()
