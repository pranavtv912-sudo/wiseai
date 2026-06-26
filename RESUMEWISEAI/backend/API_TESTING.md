# ResumeWise AI Backend - API Testing Guide

This document contains example requests and responses for all API endpoints.

## Authentication Endpoints

### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "token_type": "Bearer",
      "expires_in": 2592000
    }
  }
}
```

### 2. Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "token_type": "Bearer"
    }
  }
}
```

### 3. Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "bio": "Software Developer",
      "target_role": "Python Developer",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00"
    }
  }
}
```

## Resume Management Endpoints

### 4. Upload Resume
```bash
POST /api/resume/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

FormData:
- file: <resume.pdf>
- target_role: Python Developer

Response (201):
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume": {
      "id": "uuid",
      "file_name": "resume.pdf",
      "file_type": "pdf",
      "file_size": 245000,
      "ats_score": 0,
      "target_role": "Python Developer",
      "is_analyzed": false,
      "analysis_status": "pending",
      "uploaded_at": "2024-01-15T11:00:00"
    }
  }
}
```

### 5. List Resumes
```bash
GET /api/resume/list?page=1&per_page=20
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Resumes retrieved successfully",
  "data": {
    "resumes": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 6. Get Resume Details
```bash
GET /api/resume/<resume_id>
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Resume retrieved successfully",
  "data": {
    "resume": {
      "id": "uuid",
      "file_name": "resume.pdf",
      "ats_score": 85,
      "is_analyzed": true,
      "analysis": {
        "id": "uuid",
        "total_ats_score": 85,
        "matching_skills": ["Python", "Flask", "SQL"]
      }
    }
  }
}
```

### 7. Parse Resume
```bash
POST /api/resume/<resume_id>/parse
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "parsed_data": {
      "skills": ["Python", "Flask", "MySQL", "Docker"],
      "experience": [...],
      "education": [...],
      "certifications": ["AWS", "Docker"],
      "projects": [...],
      "contact_info": {
        "email": "john@example.com",
        "phone": "+1234567890",
        "linkedin": "https://linkedin.com/in/john"
      }
    }
  }
}
```

## Resume Analysis Endpoints

### 8. Analyze Resume
```bash
POST /api/analyze/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "resumeId": "uuid",
  "targetRole": "Python Developer"
}

Response (200):
{
  "success": true,
  "message": "Resume analysis completed",
  "data": {
    "analysis": {
      "atsScore": 84,
      "scoreBreakdown": {
        "skills_match": 85,
        "projects": 80,
        "certifications": 90,
        "keywords": 75,
        "formatting": 85
      },
      "matchingSkills": ["Python", "Flask", "SQL"],
      "missingRequiredSkills": ["Docker", "Kubernetes"],
      "strengths": [
        "Strong Python foundation",
        "Good project experience"
      ],
      "weaknesses": [
        "Limited DevOps experience",
        "No cloud platform experience"
      ],
      "suggestions": [
        "Add Docker projects to portfolio",
        "Learn AWS or Azure"
      ],
      "marketData": {
        "jobTrends": {
          "growth": "Very High",
          "demand": 5000
        },
        "salaryData": {
          "average_min": 60000,
          "average_max": 120000
        }
      }
    }
  }
}
```

### 9. Get Skill Gap Analysis
```bash
GET /api/analyze/<resume_id>/skill-gap
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Skill gap analysis retrieved",
  "data": {
    "skillGap": {
      "target_role": "Python Developer",
      "matching_skills": ["Python", "Flask", "SQL"],
      "missing_required_skills": ["Docker", "Git"],
      "missing_preferred_skills": ["Kubernetes", "Jenkins"],
      "coverage_percentage": 75
    }
  }
}
```

## Career Roadmap Endpoints

### 10. Generate Roadmap
```bash
POST /api/roadmap/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentSkills": ["Python", "SQL"],
  "goalRole": "AI Engineer",
  "months": 12
}

Response (200):
{
  "success": true,
  "message": "Career roadmap generated successfully",
  "data": {
    "roadmap": {
      "month_1": {
        "focus": "Advanced Python & ML Fundamentals",
        "resources": ["Andrew Ng's ML Course", "Python Advanced"],
        "project": "Build ML classifier",
        "milestone": "Complete ML basics"
      },
      ...
    },
    "learningResources": {
      "month_1": [...],
      ...
    },
    "goalRole": "AI Engineer",
    "months": 12
  }
}
```

### 11. Generate Learning Plan
```bash
POST /api/roadmap/learning-plan
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "skills": ["Docker", "Kubernetes", "AWS"],
  "duration": 3
}

Response (200):
{
  "success": true,
  "message": "Learning plan generated successfully",
  "data": {
    "learningPlan": {
      "totalDuration": 3,
      "skills": [
        {
          "skill": "Docker",
          "startWeek": 1,
          "endWeek": 4,
          "resources": [...],
          "projects": ["Containerize an app", "Create docker-compose setup"]
        },
        ...
      ]
    }
  }
}
```

## Interview Preparation Endpoints

### 12. Generate Interview Questions
```bash
POST /api/interview/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "Python Developer",
  "experience": "mid",
  "count": 10
}

Response (200):
{
  "success": true,
  "message": "Interview questions generated",
  "data": {
    "questions": [
      "Tell me about your most challenging Python project",
      "How would you optimize a slow database query?",
      ...
    ],
    "categories": {
      "technical": [...],
      "behavioral": [...],
      "situational": [...]
    }
  }
}
```

### 13. Get Interview Tips
```bash
GET /api/interview/tips?role=Python%20Developer&experience=mid
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Interview tips retrieved",
  "data": {
    "tips": [
      "Arrive 15 minutes early",
      "Research the company thoroughly",
      "Prepare code samples",
      ...
    ]
  }
}
```

## Report Generation Endpoints

### 14. Generate Report
```bash
POST /api/report/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "resumeId": "uuid"
}

Response (201):
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "report": {
      "id": "uuid",
      "report_title": "Resume Analysis Report - John Doe",
      "status": "generated",
      "is_downloaded": false,
      "created_at": "2024-01-15T12:00:00"
    },
    "reportData": {
      "generated_at": "...",
      "user": {...},
      "resume_analysis": {...},
      "extracted_content": {...},
      "ai_feedback": {...}
    }
  }
}
```

### 15. Download Report
```bash
GET /api/report/<report_id>/download
Authorization: Bearer <access_token>

Response: PDF file binary data
Content-Type: application/pdf
```

## Common Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authorization token is missing",
  "data": null
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resume not found",
  "data": null
}
```

### 422 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": ["Email is required", "Password must be at least 8 characters"]
  }
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "An error occurred: ...",
  "data": null
}
```

## Postman Collection

Import `resumewise-ai-api.postman_collection.json` to Postman for easy testing of all endpoints.

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'

# Get Profile
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"

# Upload Resume
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@resume.pdf" \
  -F "target_role=Python Developer"
```
