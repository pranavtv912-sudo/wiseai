"""
Utility script to create the MySQL database for ResumeWise AI.
Run once before starting the Flask server for the first time.
"""

import sys

try:
    import pymysql
except ImportError:
    print("[ERROR] PyMySQL is not installed. Run: pip install PyMySQL")
    sys.exit(1)

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "pranav@123",
}

DB_NAME = "resumewise"

try:
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute(
        f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    conn.commit()
    print(f"[OK] Database `{DB_NAME}` created/verified successfully.")

    cursor.execute("SHOW DATABASES")
    databases = [row[0] for row in cursor.fetchall()]
    print(f"[OK] Available databases: {databases}")

    cursor.close()
    conn.close()
    print("\n[OK] MySQL connection verified. You can now start the Flask server.")

except pymysql.err.OperationalError as e:
    code, msg = e.args
    print(f"\n[ERROR] MySQL connection failed! (Error {code})")
    if code == 1045:
        print("  Reason: Access denied — wrong username or password.")
    elif code == 2003:
        print("  Reason: Cannot connect to MySQL server on localhost:3306.")
        print("  Fix: Make sure MySQL service is running.")
    else:
        print(f"  Reason: {msg}")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Unexpected error: {e}")
    sys.exit(1)
