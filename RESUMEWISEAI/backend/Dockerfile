# =========================================================
# ResumeWise AI Backend - Production Dockerfile
# =========================================================

FROM python:3.11-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Working directory
WORKDIR /app

# Install Linux packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements first
COPY requirements.txt .

# Install Python packages
RUN pip install -r requirements.txt

# Download SpaCy model (remove this line if you don't use it)
RUN python -m spacy download en_core_web_sm

# Copy project
COPY . .

# Create folders
RUN mkdir -p uploads logs

# Railway provides PORT automatically
ENV PORT=5000

EXPOSE 5000

# Start Gunicorn
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT:-5000} --workers 2 --threads 4 --timeout 120"]