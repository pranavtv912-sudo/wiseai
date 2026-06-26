"""Quick verification script for role_data.py"""
import sys, os, importlib.util
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

spec = importlib.util.spec_from_file_location('role_data', 'services/role_data.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

SKILL_DATABASE  = m.SKILL_DATABASE
MARKET_DATABASE = m.MARKET_DATABASE
ALL_ROLE_NAMES  = m.ALL_ROLE_NAMES

print(f"SKILL_DATABASE : {len(SKILL_DATABASE)} roles")
print(f"MARKET_DATABASE: {len(MARKET_DATABASE)} roles")
print(f"ALL_ROLE_NAMES : {len(ALL_ROLE_NAMES)} entries")

bad = [r for r, d in SKILL_DATABASE.items() if not d.get('required') or not d.get('preferred')]
print(f"Roles missing required/preferred: {bad if bad else 'none - OK'}")

missing_market = [r for r in SKILL_DATABASE if r not in MARKET_DATABASE]
print(f"Roles missing market data       : {missing_market if missing_market else 'none - OK'}")

print("\nSample spot-checks:")
spots = [
    'AI Engineer', 'Generative AI Engineer', 'LLM Engineer', 'Prompt Engineer',
    'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
    'MLOps Engineer', 'Data Engineer', 'Cyber Security Engineer',
    'Ethical Hacker', 'Penetration Tester', 'SOC Analyst', 'Cloud Engineer',
    'AWS Cloud Engineer', 'Azure Cloud Engineer', 'Google Cloud Engineer',
    'DevOps Engineer', 'React Developer', 'MERN Stack Developer', 'Java Developer',
    'Solidity Developer', 'Robotics Engineer', 'Site Reliability Engineer',
    'MEAN Stack Developer', 'Vue.js Developer', 'Flutter Developer',
]
for role in spots:
    r  = SKILL_DATABASE.get(role, {})
    mk = MARKET_DATABASE.get(role, {})
    req  = len(r.get('required', []))
    pref = len(r.get('preferred', []))
    sal  = mk.get('salary_data', {}).get('average_salary', 'N/A')
    grw  = mk.get('job_trends',  {}).get('growth', 'N/A')
    gpct = mk.get('job_trends',  {}).get('growth_pct', 'N/A')
    sal_str = "${:,}".format(sal) if isinstance(sal, int) else str(sal)
    print(f"  {role:<36} req={req:>2} pref={pref:>2} salary={sal_str:<11} growth={grw} (+{gpct}%)")

print("\nAll roles (alphabetical):")
for name in ALL_ROLE_NAMES:
    print(f"  - {name}")
