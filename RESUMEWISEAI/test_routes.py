import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000/api"

# Test 1: Register user
print("=" * 60)
print("TEST 1: User Registration")
print("=" * 60)

register_data = {
    "name": "Test User",
    "email": f"test{int(time.time())}@resumewise.ai",
    "password": "TestPass123!"
}

r = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(f"Status: {r.status_code}")
resp = r.json()
print(json.dumps(resp, indent=2))

if resp.get("success"):
    access_token = resp.get("data", {}).get("tokens", {}).get("access_token")
    user_id = resp.get("data", {}).get("user", {}).get("id")
    print(f"\n✓ User registered: {user_id}")
    print(f"✓ Access token: {access_token[:20]}...")
    
    # Test 2: Get profile (protected route)
    print("\n" + "=" * 60)
    print("TEST 2: Get User Profile (Protected Route)")
    print("=" * 60)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    print(f"Status: {r.status_code}")
    resp = r.json()
    print(json.dumps(resp, indent=2))
    
    # Test 3: Generate roadmap (protected, AI-dependent)
    print("\n" + "=" * 60)
    print("TEST 3: Generate Career Roadmap (AI Service)")
    print("=" * 60)
    
    roadmap_data = {
        "currentSkills": ["Python", "SQL"],
        "goalRole": "Python Developer",
        "months": 6
    }
    
    r = requests.post(f"{BASE_URL}/roadmap/generate", json=roadmap_data, headers=headers)
    print(f"Status: {r.status_code}")
    resp = r.json()
    if resp.get("success"):
        print("✓ Roadmap generated successfully")
        roadmap = resp.get("data", {}).get("roadmap", {})
        print(f"✓ Roadmap months: {list(roadmap.keys())[:3]}")
    else:
        print(f"✗ Error: {resp.get('message')}")
    
    # Test 4: Generate interview questions (protected)
    print("\n" + "=" * 60)
    print("TEST 4: Generate Interview Questions (AI Service)")
    print("=" * 60)
    
    interview_data = {
        "role": "Python Developer",
        "experience": "mid",
        "count": 5
    }
    
    r = requests.post(f"{BASE_URL}/interview/generate", json=interview_data, headers=headers)
    print(f"Status: {r.status_code}")
    resp = r.json()
    if resp.get("success"):
        print("✓ Interview questions generated")
        questions = resp.get("data", {}).get("questions", [])
        print(f"✓ Questions count: {len(questions)}")
        if questions:
            print(f"  - Sample: {questions[0][:60]}...")
    else:
        print(f"✗ Error: {resp.get('message')}")
    
else:
    print(f"✗ Registration failed: {resp.get('message')}")

print("\n" + "=" * 60)
print("✅ ROUTE TESTS COMPLETE")
print("=" * 60)
