"""
Isolated test: Verify SQLAlchemy + PyMySQL + MySQL connection.
Does NOT import the full Flask app (avoids google-generativeai issue).
"""

import sys
import os

# Load .env manually
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from sqlalchemy import create_engine, text

db_url = os.getenv('DATABASE_URL', '')
print(f"Testing connection to: {db_url.split('@')[-1] if '@' in db_url else db_url}")

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args={'charset': 'utf8mb4'},
    )
    with engine.connect() as conn:
        result = conn.execute(text('SELECT DATABASE(), VERSION()'))
        row = result.fetchone()
        print("[OK] Connected to MySQL successfully")
        print(f"  Active database : {row[0]}")
        print(f"  MySQL version   : {row[1]}")

        # Show tables in the database
        tables = conn.execute(text("SHOW TABLES")).fetchall()
        table_names = [t[0] for t in tables]
        if table_names:
            print(f"  Existing tables : {table_names}")
        else:
            print("  Existing tables : (none yet — will be created by Flask app)")

    print("\n[OK] SQLAlchemy + PyMySQL + MySQL stack is fully working.")
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")
    sys.exit(1)
