# ============================================
# ResumeWise AI Backend Dockerfile
# ============================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Ensure Python output is sent straight to terminal
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better Docker caching)
COPY requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download SpaCy model (if your project uses it)
RUN python -m spacy download en_core_web_sm

# Copy project files
COPY . .

# Create required directories
RUN mkdir -p logs uploads

# Flask environment
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Railway provides the PORT variable
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application
CMD gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120