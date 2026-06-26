# ResumeWise AI Backend

Complete production-ready backend for AI-powered resume analysis platform.

## Project Overview

ResumeWise AI is a smart resume analyzer that helps freshers:
- Upload and analyze resumes
- Calculate ATS scores
- Identify skill gaps
- Generate AI-powered feedback
- Create career roadmaps
- Get course recommendations
- Prepare for interviews
- Generate comprehensive PDF reports

## Features

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Profile management
- Password hashing with bcrypt

### ✅ Resume Management
- PDF and DOCX file upload
- Secure file storage
- Resume parsing and text extraction
- Data structure extraction (skills, experience, education, etc.)

### ✅ Resume Analysis
- ATS (Applicant Tracking System) scoring
- Skill matching against job requirements
- Skill gap identification
- Resume formatting evaluation
- Keyword analysis

### ✅ AI-Powered Features (Google Gemini)
- Resume summary generation
- Strength identification
- Weakness analysis
- Improvement suggestions
- Career guidance

### ✅ Job Market Intelligence (Adzuna API)
- Job market trends
- Salary data
- Required skills by role
- Job demand analysis

### ✅ Learning Resources (YouTube API)
- Tutorial recommendations
- Skill-specific learning plans
- Course suggestions
- Career roadmap generation

### ✅ Interview Preparation
- Interview question generation
- Behavioral questions
- Technical questions
- Interview tips and strategies

### ✅ Report Generation
- Comprehensive PDF reports
- ATS score breakdown
- Skill analysis
- AI feedback compilation
- Career recommendations
- Interview questions
- Learning resources

## Tech Stack

- **Backend Framework:** Python Flask
- **Database:** MySQL with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **File Parsing:** PyPDF2, python-docx
- **NLP:** SpaCy
- **AI:** Google Gemini API
- **Job Market Data:** Adzuna API
- **Learning Resources:** YouTube Data API
- **PDF Generation:** ReportLab
- **API Validation:** Marshmallow

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
│
├── models/                # Database models
│   ├── User.py
│   ├── Resume.py
│   ├── Report.py
│   └── __init__.py
│
├── routes/                # API endpoints
│   ├── auth_routes.py
│   ├── resume_routes.py
│   ├── analysis_routes.py
│   ├── roadmap_routes.py
│   ├── interview_routes.py
│   ├── report_routes.py
│   └── __init__.py
│
├── services/              # Business logic
│   ├── parser_service.py
│   ├── ats_service.py
│   ├── gemini_service.py
│   ├── youtube_service.py
│   ├── adzuna_service.py
│   ├── report_service.py
│   └── __init__.py
│
├── utils/                 # Utility functions
│   ├── auth.py
│   ├── file_handler.py
│   ├── response.py
│   ├── validation.py
│   └── __init__.py
│
├── uploads/               # User file uploads
├── logs/                  # Application logs
└── .env.example           # Environment variables template
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- MySQL Server
- Virtual Environment (venv)

### Step 1: Clone Repository
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Step 4: Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Step 5: Initialize Database
```bash
# The app.py will automatically create tables on first run
python app.py
```

### Step 6: Run Development Server
```bash
python app.py
# Server runs at http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Resume Management
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/<id>` - Get resume details
- `DELETE /api/resume/<id>` - Delete resume
- `GET /api/resume/list` - List user resumes
- `GET /api/resume/<id>/download` - Download resume
- `POST /api/resume/<id>/parse` - Parse resume content

### Resume Analysis
- `POST /api/analyze/` - Analyze resume (ATS score, skills, feedback)
- `GET /api/analyze/<id>` - Get analysis results
- `GET /api/analyze/<id>/skill-gap` - Get skill gap analysis

### Career Roadmap
- `POST /api/roadmap/generate` - Generate career roadmap
- `POST /api/roadmap/learning-plan` - Generate learning plan
- `GET /api/roadmap/milestone/<id>` - Get milestone details

### Interview Preparation
- `POST /api/interview/generate` - Generate interview questions
- `POST /api/interview/resume-based` - Resume-based questions
- `GET /api/interview/tips` - Get interview tips
- `GET /api/interview/behavioral-questions` - Behavioral questions
- `GET /api/interview/technical-questions` - Technical questions

### Reports
- `POST /api/report/generate` - Generate PDF report
- `GET /api/report/<id>` - Get report details
- `GET /api/report/<id>/download` - Download PDF report
- `GET /api/report/<id>/export` - Export report as JSON
- `GET /api/report/list` - List user reports
- `DELETE /api/report/<id>` - Delete report

## Database Schema

### Users Table
```sql
- id (UUID)
- name (String)
- email (String, unique)
- password_hash (String)
- phone (String)
- profile_picture (String)
- bio (Text)
- target_role (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### Resumes Table
```sql
- id (UUID)
- user_id (UUID, FK)
- file_name (String)
- file_path (String)
- original_name (String)
- file_type (String)
- file_size (Integer)
- ats_score (Float)
- target_role (String)
- extracted_text (LongText)
- extracted_skills (JSON)
- extracted_projects (JSON)
- extracted_certifications (JSON)
- extracted_education (JSON)
- extracted_experience (JSON)
- analysis_status (String)
- is_analyzed (Boolean)
- uploaded_at (DateTime)
- analyzed_at (DateTime)
- updated_at (DateTime)
```

### Analyses Table
```sql
- id (UUID)
- resume_id (UUID, FK, unique)
- skills_match_score (Float)
- projects_score (Float)
- certifications_score (Float)
- keywords_score (Float)
- formatting_score (Float)
- total_ats_score (Float)
- matching_skills (JSON)
- missing_required_skills (JSON)
- missing_preferred_skills (JSON)
- summary (LongText)
- strengths (JSON)
- weaknesses (JSON)
- improvement_suggestions (JSON)
- career_guidance (LongText)
- job_trends (JSON)
- salary_data (JSON)
- required_skills (JSON)
- created_at (DateTime)
- updated_at (DateTime)
```

### Reports Table
```sql
- id (UUID)
- user_id (UUID, FK)
- resume_id (UUID)
- report_title (String)
- report_data (LongText, JSON)
- ats_score_data (JSON)
- skills_analysis_data (JSON)
- ai_feedback_data (JSON)
- interview_questions_data (JSON)
- career_roadmap_data (JSON)
- course_recommendations_data (JSON)
- pdf_file_path (String)
- file_size (Integer)
- status (String)
- is_downloaded (Boolean)
- download_count (Integer)
- created_at (DateTime)
- updated_at (DateTime)
```

## ATS Score Calculation

Score is calculated based on:
- **Skills Match (40%):** Match between resume skills and job requirements
- **Projects (20%):** Number and quality of projects mentioned
- **Certifications (15%):** Relevant industry certifications
- **Keywords (15%):** Industry-specific keywords and terms
- **Formatting (10%):** Resume structure and organization

Maximum score: 100

## Security Features

✅ JWT Authentication
✅ Password Hashing (bcrypt)
✅ Input Validation
✅ CORS Protection
✅ File Type Validation
✅ File Size Limits
✅ SQL Injection Prevention (SQLAlchemy ORM)
✅ XSS Protection
✅ Rate Limiting Ready
✅ Error Handling

## Configuration

### Environment Variables (.env)

```
FLASK_ENV=development          # development/testing/production
FLASK_DEBUG=True               # Enable debug mode
SECRET_KEY=your-secret-key     # Flask secret key
JWT_SECRET_KEY=your-jwt-key    # JWT signing key

# Database
DATABASE_URL=mysql+pymysql://user:password@localhost/db

# External APIs
GEMINI_API_KEY=your-key        # Google Gemini
YOUTUBE_API_KEY=your-key       # YouTube Data
ADZUNA_API_ID=your-id          # Adzuna Job API
ADZUNA_API_KEY=your-key        # Adzuna Job API

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

## Testing

### Run Tests
```bash
pytest tests/ -v
```

### Test Coverage
```bash
pytest tests/ --cov=.
```

## Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Production Checklist
- [ ] Set `FLASK_ENV=production`
- [ ] Change all secret keys
- [ ] Configure database for production
- [ ] Set up SSL certificates
- [ ] Configure CORS properly
- [ ] Set up logging and monitoring
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure CDN for file storage
- [ ] Set up error tracking (Sentry)

## Common Issues & Solutions

### Database Connection Error
```
Solution: Check DATABASE_URL in .env
Verify MySQL is running: mysql -u root -p
```

### API Key Errors
```
Solution: Ensure all API keys are set in .env
Test API keys with curl or Postman
```

### File Upload Issues
```
Solution: Check upload folder permissions
Verify file size limits in config
```

### CORS Errors
```
Solution: Add frontend URL to CORS_ORIGINS in .env
Restart Flask development server
```

## Performance Optimization

- Database query optimization with indexes
- File upload streaming for large files
- API response caching
- Background tasks for long-running operations
- Connection pooling for database
- CDN for static assets

## Monitoring & Logging

- Application logs in `logs/resumewise.log`
- Error tracking and alerting
- Performance monitoring
- API usage analytics

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/feature-name`
4. Create pull request

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Project Issues]
- Email: support@resumewise.ai

## Roadmap

- [ ] Mobile app support
- [ ] Advanced ATS algorithms
- [ ] Resume templates
- [ ] Video interview preparation
- [ ] Peer resume reviews
- [ ] LinkedIn profile integration
- [ ] Job application tracking
- [ ] Multiple language support

---

Built with ❤️ for freshers and career changers
