#!/usr/bin/env python
"""
ResumeWise AI - Backend Test Runner
Starts the Flask development server for testing without frontend
"""

import os
import sys
from pathlib import Path

# Setup environment
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = 'True'

# Change to backend directory
backend_dir = Path(__file__).parent.absolute()
os.chdir(backend_dir)

print("=" * 60)
print("ResumeWise AI - Backend Test Server")
print("=" * 60)
print()

# Import and run the app
try:
    from app import create_app
    
    app = create_app()
    
    print("Backend Server Starting...")
    print()
    print("API Base URL: http://localhost:5000")
    print("API Documentation: http://localhost:5000/api/health")
    print()
    print("Test Credentials:")
    print("  Email: test@example.com")
    print("  Password: TestPassword123!")
    print()
    print("=" * 60)
    print("Quick Test Commands:")
    print("=" * 60)
    print()
    print("1. Health Check:")
    print("   curl http://localhost:5000/api/health")
    print()
    print("2. Register (Windows PowerShell):")
    print('   $body = @{"name"="TestUser";"email"="user@example.com";"password"="Pass123!"} | ConvertTo-Json')
    print('   curl -X POST http://localhost:5000/api/auth/register -ContentType "application/json" -Body $body')
    print()
    print("3. Login:")
    print('   $body = @{"email"="test@example.com";"password"="TestPassword123!"} | ConvertTo-Json')
    print('   curl -X POST http://localhost:5000/api/auth/login -ContentType "application/json" -Body $body')
    print()
    print("See API_TESTING.md for more examples...")
    print()
    print("=" * 60)
    print()
    
    # Run the Flask development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
    
except KeyboardInterrupt:
    print("\n\nServer stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"Error starting server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
