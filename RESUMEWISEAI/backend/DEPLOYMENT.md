# ResumeWise AI Backend - Deployment Guide

## Production Deployment

This guide covers deploying the ResumeWise AI backend to production environments.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups configured
- [ ] SSL certificates ready
- [ ] Monitoring and logging set up
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] API documentation updated

## Deployment Options

### Option 1: Traditional Server (Ubuntu/Debian)

#### Prerequisites
```bash
sudo apt-get update
sudo apt-get install python3.9 python3-pip python3-venv mysql-server nginx
```

#### Setup
```bash
# Clone repository
git clone <repo-url>
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Setup environment
cp .env.example .env
# Edit .env with production values
nano .env

# Initialize database
python init_db.py init
python init_db.py seed
```

#### Gunicorn Configuration
```bash
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/resumewise`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;
    }

    # Static file serving
    location /static/ {
        alias /var/www/resumewise/static/;
        expires 30d;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/resumewise/uploads/;
        expires 7d;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/resumewise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Systemd Service
Create `/etc/systemd/system/resumewise.service`:

```ini
[Unit]
Description=ResumeWise AI Backend
After=network.target mysql.service

[Service]
User=www-data
WorkingDirectory=/var/www/resumewise/backend
Environment="PATH=/var/www/resumewise/backend/venv/bin"
ExecStart=/var/www/resumewise/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable resumewise
sudo systemctl start resumewise
sudo systemctl status resumewise
```

### Option 2: Docker Deployment

#### Build and Push
```bash
docker build -t your-registry/resumewise-ai-backend:latest .
docker push your-registry/resumewise-ai-backend:latest
```

#### Docker Compose Production
```bash
docker-compose -f docker-compose.yml up -d
docker-compose logs -f backend
```

#### Docker Swarm
```bash
docker stack deploy -c docker-compose.yml resumewise
docker stack services resumewise
```

### Option 3: Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resumewise-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resumewise-backend
  template:
    metadata:
      labels:
        app: resumewise-backend
    spec:
      containers:
      - name: backend
        image: your-registry/resumewise-ai-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: resumewise-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

Deploy:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Option 4: Heroku Deployment

#### Setup
```bash
heroku create resumewise-ai-backend
heroku addons:create cleardb:ignite
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=<generate-new-key>
```

#### Deploy
```bash
git push heroku main
heroku logs --tail
```

### Option 5: AWS Elastic Beanstalk

#### Prerequisites
```bash
pip install awseb-cli
eb init -p python-3.9 resumewise-ai-backend
```

#### Configuration
Create `.ebextensions/01_flask.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: app:app
  aws:elasticbeanstalk:application:environment:
    FLASK_ENV: production
    DATABASE_URL: <RDS-endpoint>
    PYTHONPATH: /var/app/current:$PYTHONPATH
```

#### Deploy
```bash
eb create
eb deploy
eb open
```

## Database Migrations

```bash
# Create database and tables
python init_db.py init

# Backup database
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Restore database
mysql -u user -p database < backup-20240115.sql
```

## Monitoring & Logging

### Application Logs
```bash
# View logs
tail -f logs/resumewise.log

# Rotate logs
logrotate -f /etc/logrotate.d/resumewise
```

### Performance Monitoring
- Set up New Relic or DataDog
- Configure slow query logging
- Monitor API response times

### Error Tracking
- Set up Sentry for error tracking
- Configure email alerts for critical errors

### Database Monitoring
- Enable MySQL query logging
- Monitor disk space
- Set up automated backups

## Scaling Considerations

### Horizontal Scaling
- Load balance with Nginx or HAProxy
- Use stateless application design
- Database connection pooling
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize database indexes
- Enable query caching
- Use CDN for static files

### Caching Strategy
```python
# Add Redis caching
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@app.route('/api/data')
@cache.cached(timeout=300)
def get_data():
    return {...}
```

## Security in Production

### Environment Variables
- Use AWS Secrets Manager
- Rotate API keys regularly
- Never commit secrets

### Database Security
- Use strong passwords
- Enable SSL for connections
- Restrict network access
- Regular backups and testing

### Application Security
- Enable HTTPS only
- Set security headers
- Implement rate limiting
- Validate all inputs
- Use CORS properly

### Infrastructure Security
- Firewall rules
- VPC configuration
- DDoS protection
- Web Application Firewall (WAF)

## Backup and Disaster Recovery

### Backup Strategy
```bash
# Daily database backup
0 2 * * * mysqldump -u user -p password database | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Upload to S3
aws s3 cp /backups/db-20240115.sql.gz s3://resumewise-backups/
```

### Recovery Testing
- Test restore procedures monthly
- Document recovery steps
- Maintain RTO and RPO targets

## Performance Optimization

### Database Optimization
```python
# Add indexes
db.Index('idx_user_email', User.email)
db.Index('idx_resume_user_id', Resume.user_id)

# Use pagination
resumes = Resume.query.paginate(page=1, per_page=20)
```

### Caching
- Cache API responses
- Cache database queries
- Use Redis for sessions

### Code Optimization
- Profile slow endpoints
- Optimize queries
- Async processing for heavy tasks

## Monitoring Commands

```bash
# Check service status
systemctl status resumewise

# View live logs
journalctl -u resumewise -f

# Monitor resource usage
htop

# Check database connection
mysql -h host -u user -p -e "SHOW PROCESSLIST;"

# Monitor Nginx
nginx -s status
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
systemctl status resumewise
journalctl -u resumewise -n 50

# Test locally
python app.py

# Check configuration
python -c "from app import app; print(app.config)"
```

### Database Connection Error
```bash
# Test MySQL connection
mysql -h host -u user -p database

# Check connection pool
# Monitor MySQL processes
SHOW PROCESSLIST;
```

### Performance Issues
```bash
# Profile application
python -m cProfile app.py

# Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
```

## Update and Maintenance

### Rolling Updates
```bash
# With Systemd
systemctl stop resumewise
git pull
systemctl start resumewise

# With Docker
docker-compose pull
docker-compose up -d
```

### Dependency Updates
```bash
pip list --outdated
pip install -r requirements.txt --upgrade
pip freeze > requirements.txt
```

## Cost Optimization

- Auto-scaling groups
- Reserved instances for databases
- Content delivery network (CDN)
- Database optimization
- Unused resource cleanup

## Compliance and Auditing

- Enable audit logging
- Encrypt data in transit and at rest
- GDPR compliance
- Data retention policies
- Regular security audits

---

For additional help:
- Check logs: `logs/resumewise.log`
- View documentation: `README.md`, `API_TESTING.md`
- Contact support: `support@resumewise.ai`
