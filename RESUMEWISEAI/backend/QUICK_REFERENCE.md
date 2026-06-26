# ResumeWise AI - Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### Installation
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Setup
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

### Run
```bash
python app.py
# Open http://localhost:5000/api/health
```

---

## 📁 File Structure Quick Guide

| File | Purpose |
|------|---------|
| `app.py` | Main Flask app - entry point |
| `config.py` | Environment configuration |
| `models/` | Database tables (User, Resume, Analysis, Report) |
| `routes/` | API endpoints |
| `services/` | Business logic (parsing, ATS, AI, etc.) |
| `utils/` | Helpers (auth, validation, response) |

---

## 🔑 Environment Variables

```
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://user:pass@localhost/resumewise_ai
JWT_SECRET_KEY=your-secret
GEMINI_API_KEY=your-gemini-key
YOUTUBE_API_KEY=your-youtube-key
ADZUNA_API_ID=your-adzuna-id
ADZUNA_API_KEY=your-adzuna-key
CORS_ORIGINS=http://localhost:3000
```

---

## 🔐 Authentication

All protected endpoints need:
```
Authorization: Bearer <access_token>
```

### Get Token
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

---

## 📝 Common Tasks

### Add New Route
1. Create function in `routes/xxx_routes.py`
2. Use `@token_required` decorator for protected routes
3. Return `success_response()` or `error_response()`

Example:
```python
@auth_routes.route('/new-endpoint', methods=['POST'])
@token_required
def new_endpoint(user, payload):
    data = request.get_json()
    # Your logic here
    return success_response('Success message', data)
```

### Add New Service
1. Create `services/xxx_service.py`
2. Create class with methods
3. Import in `services/__init__.py`
4. Use in routes

Example:
```python
from services import MyService

service = MyService()
result = service.do_something()
```

### Add Database Model
1. Create model in `models/xxx.py`
2. Add to `models/__init__.py`
3. Run `python init_db.py init`

---

## 🧪 Testing Endpoints

### With cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!"}'

# Protected endpoint
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### With Postman
1. Create request
2. Set Authorization to "Bearer Token"
3. Paste token in Token field

---

## 🐛 Debugging

### View Logs
```bash
tail -f logs/resumewise.log
```

### Database Query
```python
from models import User, db

# Query
users = User.query.all()
user = User.query.filter_by(email='test@example.com').first()

# Create
new_user = User(name='John', email='john@example.com')
db.session.add(new_user)
db.session.commit()
```

### Print Debug Info
```python
from flask import current_app

print(current_app.config)
app.logger.info('Debug message')
```

---

## 📊 Database Quick Commands

```bash
# Connect to MySQL
mysql -u user -p database

# Show tables
SHOW TABLES;

# Show table structure
DESCRIBE users;
DESC resumes;

# View data
SELECT * FROM users;
SELECT * FROM resumes WHERE user_id = 'uuid';

# Count records
SELECT COUNT(*) FROM users;
```

---

## 🚀 Deployment Quick Start

### Docker
```bash
docker-compose up -d
docker-compose logs -f backend
```

### Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Systemd Service
```bash
sudo cp systemd/resumewise.service /etc/systemd/system/
sudo systemctl start resumewise
sudo systemctl status resumewise
```

---

## 📚 Key Files

| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| `auth_routes.py` | User auth | register, login, profile |
| `resume_routes.py` | Resume mgmt | upload, parse, list |
| `analysis_routes.py` | ATS analysis | analyze_resume, get_analysis |
| `parser_service.py` | Parse resumes | ResumeParser.parse_resume() |
| `ats_service.py` | ATS scoring | ATSScoreCalculator.calculate_ats_score() |
| `gemini_service.py` | AI feedback | GeminiAIService.generate_*() |
| `utils/auth.py` | JWT helpers | generate_tokens, verify_token |
| `utils/response.py` | Response format | success_response, error_response |

---

## 🔄 API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { "id": "123", ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## 🛡️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Failed |
| 500 | Server Error |

---

## 💡 Tips & Tricks

### Enable Debug Mode
```python
# In .env
FLASK_DEBUG=True

# Or in code
app.run(debug=True)
```

### Fast Iteration
```bash
# Use Flask dev server with auto-reload
python app.py
# Changes auto-reload when you save
```

### Database Reset
```bash
python init_db.py reset
# Deletes all data and creates fresh tables
```

### Add Sample Data
```bash
python init_db.py seed
# Creates demo user for testing
```

---

## 📞 Useful Commands

```bash
# Run tests
pytest tests/ -v

# Check code style
flake8

# Format code
black .

# Check for security issues
bandit -r .

# Check dependencies
pip list

# Update dependencies
pip install -r requirements.txt --upgrade

# Create requirements file
pip freeze > requirements.txt
```

---

## 🎯 Common Workflows

### Upload and Analyze Resume
1. `POST /api/resume/upload` → get resume_id
2. `POST /api/resume/{id}/parse` → extract data
3. `POST /api/analyze/` → calculate scores

### Generate Career Plan
1. Get user's skills from resume
2. `POST /api/roadmap/generate` → 12-month plan
3. `GET /api/roadmap/learning-plan` → courses

### Prepare for Interview
1. `POST /api/interview/generate` → questions
2. `GET /api/interview/tips` → preparation tips
3. `POST /api/report/generate` → download PDF

---

## 🔗 Important Links

- **Main App**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Docs**: See API_TESTING.md
- **Deployment**: See DEPLOYMENT.md
- **Full Project**: See PROJECT_SUMMARY.md

---

## 🆘 Troubleshooting

### Port in use
```bash
# Find process using port 5000
lsof -i :5000
# Kill it
kill -9 <PID>
```

### Database error
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"
# Check DATABASE_URL in .env
```

### Import error
```bash
# Ensure you're in venv
source venv/bin/activate
# Check imports are correct
python -c "from app import app"
```

### Token expired
```bash
# Get new token by logging in again
POST /api/auth/login
```

---

## 📖 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [JWT Auth](https://pyjwt.readthedocs.io/)
- [Google Gemini](https://ai.google.dev/)
- [ReportLab](https://www.reportlab.com/)

---

## 🎓 Code Examples

### Create User
```python
from models import User, db

user = User(name='John', email='john@example.com')
user.set_password('Password123!')
db.session.add(user)
db.session.commit()
```

### Query Resume
```python
from models import Resume

# Get all resumes for user
resumes = Resume.query.filter_by(user_id=user_id).all()

# Get specific resume
resume = Resume.query.get(resume_id)
```

### Generate Response
```python
from utils import success_response, error_response

# Success
return success_response('Done!', {'data': 123}, 200)

# Error
return error_response('Failed!', None, 400)
```

---

## 🚀 Ready to Code!

Start with `app.py` and follow the structure. All imports are set up and ready to use.

Happy coding! 🎉
