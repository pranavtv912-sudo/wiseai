"""
Seed script: Insert all job roles into the `job_roles` table.
Run once after the Flask app has created tables:
    python seed_roles.py
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

# All roles with their categories
JOB_ROLES = [
    # AI / ML
    ("AI Engineer",                    "AI & Machine Learning"),
    ("Generative AI Engineer",         "AI & Machine Learning"),
    ("Machine Learning Engineer",      "AI & Machine Learning"),
    ("Deep Learning Engineer",         "AI & Machine Learning"),
    ("LLM Engineer",                   "AI & Machine Learning"),
    ("Prompt Engineer",                "AI & Machine Learning"),
    ("Computer Vision Engineer",       "AI & Machine Learning"),
    ("NLP Engineer",                   "AI & Machine Learning"),
    ("MLOps Engineer",                 "AI & Machine Learning"),

    # Data
    ("Data Scientist",                 "Data & Analytics"),
    ("Data Analyst",                   "Data & Analytics"),
    ("Data Engineer",                  "Data & Analytics"),

    # Backend / Languages
    ("Python Developer",               "Software Development"),
    ("Java Developer",                 "Software Development"),
    ("C++ Developer",                  "Software Development"),
    ("PHP Developer",                  "Software Development"),
    (".NET Developer",                 "Software Development"),
    ("Software Engineer",              "Software Development"),
    ("Software Developer",             "Software Development"),
    ("Application Developer",          "Software Development"),

    # Web / Full Stack
    ("Full Stack Developer",           "Web Development"),
    ("Frontend Developer",             "Web Development"),
    ("Backend Developer",              "Web Development"),
    ("MERN Stack Developer",           "Web Development"),
    ("MEAN Stack Developer",           "Web Development"),
    ("React Developer",                "Web Development"),
    ("Angular Developer",              "Web Development"),
    ("Node.js Developer",              "Web Development"),

    # Mobile
    ("Flutter Developer",              "Mobile Development"),
    ("Android Developer",              "Mobile Development"),
    ("iOS Developer",                  "Mobile Development"),

    # DevOps / Cloud
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

    # QA / Testing
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

    # Networking / Sysadmin
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

    # Blockchain / Web3
    ("Blockchain Developer",           "Blockchain & Web3"),
    ("Web3 Developer",                 "Blockchain & Web3"),
    ("Smart Contract Developer",       "Blockchain & Web3"),

    # Embedded / Hardware
    ("Embedded Systems Engineer",      "Embedded & Hardware"),
    ("IoT Engineer",                   "Embedded & Hardware"),
    ("Robotics Engineer",              "Embedded & Hardware"),
    ("Firmware Engineer",              "Embedded & Hardware"),
]


def seed_roles():
    from app import app
    from models import db, JobRole

    with app.app_context():
        # Ensure the table exists
        db.create_all()

        inserted = 0
        skipped = 0

        for title, category in JOB_ROLES:
            exists = JobRole.query.filter_by(title=title).first()
            if exists:
                skipped += 1
                continue
            role = JobRole(title=title, category=category, is_active=True)
            db.session.add(role)
            inserted += 1

        db.session.commit()

        total = JobRole.query.count()
        print("\n[OK] Roles seeded successfully!")
        print(f"  Inserted : {inserted}")
        print(f"  Skipped  : {skipped} (already existed)")
        print(f"  Total    : {total} roles in database\n")

        # Print summary by category
        from sqlalchemy import func
        cats = (
            db.session.query(JobRole.category, func.count(JobRole.id))
            .group_by(JobRole.category)
            .order_by(JobRole.category)
            .all()
        )
        print("  Breakdown by category:")
        for cat, count in cats:
            print(f"    {cat:<30} {count} roles")


if __name__ == '__main__':
    seed_roles()
