# Backend Testing Guide - Without Frontend

## 🚀 Getting Started - Start the Server

### Option 1: Using Python Directly
```bash
cd "d:\internship RS\RESUMEWISEAI\backend"
python run_test_server.py
```

### Option 2: Using Flask CLI
```bash
cd "d:\internship RS\RESUMEWISEAI\backend"
python -m flask run
```

### Expected Output
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

**Server is ready when you see:** `Running on http://127.0.0.1:5000`

---

## 📡 Testing Endpoints - PowerShell Commands

### 1. Health Check (No Authentication Required)
```powershell
curl http://localhost:5000/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Backend is running",
  "data": null
}
```

---

### 2. Register New User
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/register `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 3. Login (Get Access Token)
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

$response = curl -X POST http://localhost:5000/api/auth/login `
  -ContentType "application/json" `
  -Body $body

# Convert response to object
$data = $response | ConvertFrom-Json
$token = $data.data.access_token

Write-Host "Your Access Token: $token"
```

---

### 4. Get User Profile (Protected - Requires Token)
```powershell
# First login to get token (see step 3)
$token = "your-access-token-from-login"

curl -X GET http://localhost:5000/api/auth/profile `
  -Headers @{ "Authorization" = "Bearer $token" }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Test User",
    "email": "test@example.com",
    "phone": null,
    "bio": null,
    "target_role": null,
    "is_active": true,
    "created_at": "2026-06-19T..."
  }
}
```

---

### 5. Update User Profile
```powershell
$token = "your-access-token"

$body = @{
    name = "Updated Name"
    phone = "1234567890"
    bio = "Software Developer"
    target_role = "Senior Backend Developer"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/auth/profile `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

### 6. Change Password
```powershell
$token = "your-access-token"

$body = @{
    old_password = "TestPassword123!"
    new_password = "NewPassword123!"
    confirm_password = "NewPassword123!"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/change-password `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

## 📄 Resume Upload & Testing

### 7. Upload Resume (Requires Test PDF File)
```powershell
$token = "your-access-token"
$filePath = "C:\path\to\your\resume.pdf"

curl -X POST http://localhost:5000/api/resume/upload `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Form @{
    file = @{
      path = $filePath
      # File will be uploaded
    }
    target_role = "Python Developer"
  }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "id": "resume-uuid",
    "file_name": "resume_123456.pdf",
    "original_name": "resume.pdf",
    "file_size": 125456,
    "uploaded_at": "2026-06-19T..."
  }
}
```

---

### 8. List User's Resumes
```powershell
$token = "your-access-token"

curl -X GET "http://localhost:5000/api/resume/list?page=1&per_page=10" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

### 9. Get Resume Details
```powershell
$token = "your-access-token"
$resumeId = "resume-uuid-from-upload"

curl -X GET http://localhost:5000/api/resume/$resumeId `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

### 10. Parse Resume (Extract Text & Data)
```powershell
$token = "your-access-token"
$resumeId = "resume-uuid"

curl -X POST http://localhost:5000/api/resume/$resumeId/parse `
  -Headers @{ "Authorization" = "Bearer $token" }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "extracted_text": "Full resume text...",
    "extracted_skills": ["Python", "Flask", "PostgreSQL", ...],
    "extracted_experience": [...],
    "extracted_education": [...],
    "extracted_certifications": [...]
  }
}
```

---

## 📊 Resume Analysis

### 11. Analyze Resume (Get ATS Score)
```powershell
$token = "your-access-token"

$body = @{
    resume_id = "resume-uuid"
    target_role = "Python Developer"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/analyze/ `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "ats_score": 78.5,
    "score_breakdown": {
      "skills_match": 85,
      "projects": 70,
      "certifications": 75,
      "keywords": 80,
      "formatting": 85
    },
    "matching_skills": ["Python", "Flask", "SQL"],
    "missing_skills": ["Docker", "Kubernetes"],
    "strengths": [...],
    "weaknesses": [...]
  }
}
```

---

### 12. Get Skill Gap Analysis
```powershell
$token = "your-access-token"
$analysisId = "analysis-uuid"

curl -X GET http://localhost:5000/api/analyze/$analysisId/skill-gap `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 🎯 Career Roadmap

### 13. Generate Career Roadmap
```powershell
$token = "your-access-token"

$body = @{
    current_skills = @("Python", "Flask", "SQL")
    goal_role = "Senior Backend Developer"
    months = 12
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/roadmap/generate `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

### 14. Generate Learning Plan
```powershell
$token = "your-access-token"

$body = @{
    skills = @("Docker", "Kubernetes", "AWS")
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/roadmap/learning-plan `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

## 🎤 Interview Preparation

### 15. Generate Interview Questions
```powershell
$token = "your-access-token"

$body = @{
    job_title = "Backend Developer"
    company = "Tech Company"
    skills = @("Python", "Flask")
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/interview/generate `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

### 16. Get Behavioral Interview Questions
```powershell
$token = "your-access-token"

curl -X GET http://localhost:5000/api/interview/behavioral-questions `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

### 17. Get Technical Interview Questions
```powershell
$token = "your-access-token"

curl -X GET "http://localhost:5000/api/interview/technical-questions?topic=Python" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

### 18. Get Interview Tips
```powershell
$token = "your-access-token"

curl -X GET http://localhost:5000/api/interview/tips `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 📋 Report Generation

### 19. Generate Report
```powershell
$token = "your-access-token"

$body = @{
    resume_id = "resume-uuid"
    include_components = @("ats_score", "skills_analysis", "ai_feedback", "career_roadmap")
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/report/generate `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

---

### 20. List Reports
```powershell
$token = "your-access-token"

curl -X GET "http://localhost:5000/api/report/list?page=1&per_page=10" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

### 21. Download Report as PDF
```powershell
$token = "your-access-token"
$reportId = "report-uuid"

curl -X GET http://localhost:5000/api/report/$reportId/download `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -OutFile "report.pdf"

Write-Host "Report downloaded as report.pdf"
```

---

## 🧪 Alternative Testing Tools

### Using Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Select Authorization tab → "Bearer Token"
4. Paste your access token
5. Set request method and URL
6. Send request

### Using REST Client Extension (VS Code)
Create file `test.http`:
```http
### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}

### Get Profile (replace {{token}} with actual token)
GET http://localhost:5000/api/auth/profile
Authorization: Bearer {{token}}
```

---

## 🔍 Debugging Tips

### Check Server Logs
```powershell
# Logs are printed in the terminal where server is running
# Look for [yyyy-mm-dd hh:mm:ss] entries
```

### Common Issues

**Issue: "Connection refused"**
- Ensure Flask server is running
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Kill process using port: `taskkill /PID <PID> /F`

**Issue: "Token expired"**
- Get new token by logging in again
- Default token expiration: 30 days

**Issue: "File not found"**
- Ensure resume file exists before upload
- File must be PDF or DOCX format

**Issue: "Database locked"**
- Ensure only one Flask instance is running
- SQLite database is locked; close all connections

---

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Register new user
- [ ] Login returns access token
- [ ] Get profile with token
- [ ] Update profile
- [ ] Change password
- [ ] Upload resume (needs PDF file)
- [ ] List resumes
- [ ] Get resume details
- [ ] Parse resume
- [ ] Analyze resume (ATS score)
- [ ] Get skill gap
- [ ] Generate roadmap
- [ ] Generate learning plan
- [ ] Generate interview questions
- [ ] Get interview tips
- [ ] Generate report
- [ ] Download PDF report

---

## 📚 Database Check

### View SQLite Database
```powershell
# Download sqlite3 CLI or use:
# Install: choco install sqlite

sqlite3 resumewise.db

# Inside sqlite3:
.tables                    # List all tables
SELECT * FROM users;      # View users
SELECT * FROM resumes;    # View resumes
.quit                      # Exit
```

---

## 🎉 Backend Testing Complete!

Your backend is fully functional and ready for:
- ✅ API testing with cURL/Postman
- ✅ Frontend integration
- ✅ Production deployment

**Next Steps:**
1. Test all endpoints (see checklist above)
2. Build React/Next.js frontend
3. Integrate frontend with backend APIs
4. Deploy to production

---

For more details, see: `API_TESTING.md` and `QUICK_REFERENCE.md`
