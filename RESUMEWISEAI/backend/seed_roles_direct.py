"""
Direct seed script: Creates job_roles table and inserts all roles using raw SQLAlchemy.
Does NOT import the Flask app — bypasses any incompatible dependencies.
Run: python seed_roles_direct.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    Integer, String, Boolean, DateTime, text
)
from datetime import datetime

DB_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:pranav%40123@localhost:3306/resumewise')

JOB_ROLES = [
    # AI & Machine Learning
    ("AI Engineer",                    "AI & Machine Learning"),
    ("Generative AI Engineer",         "AI & Machine Learning"),
    ("Machine Learning Engineer",      "AI & Machine Learning"),
    ("Deep Learning Engineer",         "AI & Machine Learning"),
    ("LLM Engineer",                   "AI & Machine Learning"),
    ("Prompt Engineer",                "AI & Machine Learning"),
    ("Computer Vision Engineer",       "AI & Machine Learning"),
    ("NLP Engineer",                   "AI & Machine Learning"),
    ("MLOps Engineer",                 "AI & Machine Learning"),

    # Data & Analytics
    ("Data Scientist",                 "Data & Analytics"),
    ("Data Analyst",                   "Data & Analytics"),
    ("Data Engineer",                  "Data & Analytics"),

    # Software Development
    ("Python Developer",               "Software Development"),
    ("Java Developer",                 "Software Development"),
    ("C++ Developer",                  "Software Development"),
    ("PHP Developer",                  "Software Development"),
    (".NET Developer",                 "Software Development"),
    ("Software Engineer",              "Software Development"),
    ("Software Developer",             "Software Development"),
    ("Application Developer",          "Software Development"),

    # Web Development
    ("Full Stack Developer",           "Web Development"),
    ("Frontend Developer",             "Web Development"),
    ("Backend Developer",              "Web Development"),
    ("MERN Stack Developer",           "Web Development"),
    ("MEAN Stack Developer",           "Web Development"),
    ("React Developer",                "Web Development"),
    ("Angular Developer",              "Web Development"),
    ("Node.js Developer",              "Web Development"),

    # Mobile Development
    ("Flutter Developer",              "Mobile Development"),
    ("Android Developer",              "Mobile Development"),
    ("iOS Developer",                  "Mobile Development"),

    # DevOps & Cloud
    ("DevOps Engineer",                "DevOps & Cloud"),
    ("Cloud Engineer",                 "DevOps & Cloud"),
    ("AWS Cloud Engineer",             "DevOps & Cloud"),
    ("Azure Cloud Engineer",           "DevOps & Cloud"),
    ("Google Cloud Engineer",          "DevOps & Cloud"),
    ("Site Reliability Engineer",      "DevOps & Cloud"),
    ("Platform Engineer",              "DevOps & Cloud"),

    # Database
    ("Database Administrator",         "Database"),
    ("SQL Developer",                  "Database"),
    ("Database Engineer",              "Database"),

    # QA & Testing
    ("QA Engineer",                    "QA & Testing"),
    ("Automation Test Engineer",       "QA & Testing"),
    ("Manual Test Engineer",           "QA & Testing"),
    ("Performance Test Engineer",      "QA & Testing"),

    # Cyber Security
    ("Cyber Security Engineer",        "Cyber Security"),
    ("Cyber Security Analyst",         "Cyber Security"),
    ("Ethical Hacker",                 "Cyber Security"),
    ("Penetration Tester",             "Cyber Security"),
    ("SOC Analyst",                    "Cyber Security"),
    ("Network Security Engineer",      "Cyber Security"),
    ("Cloud Security Engineer",        "Cyber Security"),
    ("Information Security Analyst",   "Cyber Security"),
    ("Digital Forensics Analyst",      "Cyber Security"),
    ("Security Consultant",            "Cyber Security"),

    # Networking & Sysadmin
    ("Network Engineer",               "Networking & Sysadmin"),
    ("System Administrator",           "Networking & Sysadmin"),
    ("Linux Administrator",            "Networking & Sysadmin"),
    ("Windows Administrator",          "Networking & Sysadmin"),

    # Design
    ("UI Designer",                    "Design"),
    ("UX Designer",                    "Design"),
    ("UI/UX Designer",                 "Design"),
    ("Product Designer",               "Design"),
    ("Graphic Designer",               "Design"),

    # Blockchain & Web3
    ("Blockchain Developer",           "Blockchain & Web3"),
    ("Web3 Developer",                 "Blockchain & Web3"),
    ("Smart Contract Developer",       "Blockchain & Web3"),

    # Embedded & Hardware
    ("Embedded Systems Engineer",      "Embedded & Hardware"),
    ("IoT Engineer",                   "Embedded & Hardware"),
    ("Robotics Engineer",              "Embedded & Hardware"),
    ("Firmware Engineer",              "Embedded & Hardware"),
]


def seed():
    engine = create_engine(
        DB_URL,
        pool_pre_ping=True,
        connect_args={'charset': 'utf8mb4'},
    )
    meta = MetaData()

    # Define job_roles table schema (mirrors JobRole model)
    job_roles_table = Table(
        'job_roles', meta,
        Column('id',         Integer,     primary_key=True, autoincrement=True),
        Column('title',      String(255), nullable=False, unique=True),
        Column('category',   String(100), nullable=True),
        Column('is_active',  Boolean,     default=True, nullable=False),
        Column('created_at', DateTime,    default=datetime.utcnow),
    )

    with engine.begin() as conn:
        # Create table if not exists
        meta.create_all(engine, checkfirst=True)
        print("[OK] job_roles table ready.")

        # Fetch existing titles to skip duplicates
        existing = {row[0] for row in conn.execute(text("SELECT title FROM job_roles")).fetchall()}

        inserted = 0
        skipped  = 0
        now = datetime.utcnow()

        for title, category in JOB_ROLES:
            if title in existing:
                skipped += 1
                continue
            conn.execute(job_roles_table.insert().values(
                title=title,
                category=category,
                is_active=True,
                created_at=now,
            ))
            inserted += 1

        total = conn.execute(text("SELECT COUNT(*) FROM job_roles")).scalar()

    print("\n[OK] Seeding complete!")
    print(f"  Inserted : {inserted}")
    print(f"  Skipped  : {skipped} (already existed)")
    print(f"  Total    : {total} roles in database\n")

    # Print breakdown
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT category, COUNT(*) AS cnt FROM job_roles GROUP BY category ORDER BY category")
        ).fetchall()
        print("  Breakdown by category:")
        for cat, cnt in rows:
            print(f"    {(cat or 'Uncategorized'):<32} {cnt} roles")


if __name__ == '__main__':
    seed()
