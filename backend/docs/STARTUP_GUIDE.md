# AmpFlux Backend Startup Guide

A comprehensive step-by-step guide to set up and start the AmpFlux backend application, including all services, database migrations, and testing procedures.

## 📋 Prerequisites

### **Required Software**

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For version control
- **Text Editor**: VS Code, Sublime Text, or similar

### **System Requirements**

- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Internet connection for Docker images and OpenAI API

### **Optional but Recommended**

- **OpenAI API Key**: For AI assistant features
- **Postman**: For API testing
- **pgAdmin**: For database management

## 🚀 Quick Start (5 Minutes)

### **Step 1: Clone and Navigate**

```bash
# Navigate to your project directory
cd /path/to/your/project
cd backend

# Verify you're in the correct directory
ls -la
# Should show: docker-compose.yml, requirements.txt, app/, etc.
```

### **Step 2: Environment Setup**

```bash
# Create environment file
touch .env

# Add your OpenAI API key (optional but recommended)
echo "OPENAI_API_KEY=your-openai-api-key-here" >> .env
```

### **Step 3: Start Services**

```bash
# Start all services (database, redis, backend)
docker compose up -d

# Check if services are running
docker compose ps
```

### **Step 4: Run Migrations**

```bash
# Run database migrations
docker compose exec backend alembic upgrade head
```

### **Step 5: Test Installation**

```bash
# Test the API
curl http://localhost:8000/

# Expected response:
# {"message": "AmpFlux Backend API is running"}
```

## 🔧 Detailed Setup Guide

### **Phase 1: Environment Preparation**

#### **1.1 Verify Docker Installation**

```bash
# Check Docker version
docker --version
docker compose version

# Expected output:
# Docker version 20.10.x
# Docker Compose version 2.x.x
```

#### **1.2 Create Environment File**

```bash
# Create .env file with required variables
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/ampflux

# Security Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here

# Redis Configuration
REDIS_URL=redis://redis:6379/0
EOF
```

#### **1.3 Verify Project Structure**

```bash
# Check that all required files exist
ls -la

# Expected files:
# - docker-compose.yml
# - requirements.txt
# - Dockerfile
# - alembic.ini
# - app/ (directory)
# - migrations/ (directory)
```

### **Phase 2: Service Startup**

#### **2.1 Build Docker Images**

```bash
# Build all services
docker compose build

# Expected output:
# [+] Building X.Xs (X/X) FINISHED
# => [internal] load build definition from Dockerfile
# => transferring dockerfile: XB
# => [internal] load .dockerignore
# => transferring context: XB
# => [internal] load metadata for docker.io/library/python:3.12-slim
# => [CACHED] python:3.12-slim
# => [internal] load build context
# => transferring context: X.XMB
# => [CACHED] WORKDIR /code
# => [CACHED] COPY requirements.txt ./
# => [CACHED] RUN pip install --no-cache-dir -r requirements.txt
# => [CACHED] COPY . .
# => exporting to image
# => => writing image sha256:...
# => => naming to docker.io/library/backend-backend
```

#### **2.2 Start Services**

```bash
# Start all services in detached mode
docker compose up -d

# Check service status
docker compose ps

# Expected output:
# NAME                COMMAND                  SERVICE             STATUS              PORTS
# backend-backend-1   "uvicorn app.main:app"  backend            running             0.0.0.0:8000->8000/tcp
# backend-db-1        "docker-entrypoint.s…"  db                 running             0.0.0.0:5432->5432/tcp
# backend-redis-1     "docker-entrypoint.s…"  redis              running             0.0.0.0:6379->6379/tcp
```

#### **2.3 Verify Service Health**

```bash
# Check backend logs
docker compose logs backend

# Expected output:
# backend-1  | INFO:     Will watch for changes in these directories: ['/code']
# backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# backend-1  | INFO:     Started reloader process [1] using WatchFiles
# backend-1  | INFO:     Started server process [8]
# backend-1  | INFO:     Waiting for application startup.
# backend-1  | INFO:     Application startup complete.

# Check database logs
docker compose logs db

# Check Redis logs
docker compose logs redis
```

### **Phase 3: Database Setup**

#### **3.1 Run Database Migrations**

```bash
# Run all pending migrations
docker compose exec backend alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.runtime.migration] Will assume transactional DDL.
# INFO  [alembic.runtime.migration] Running upgrade  -> cabfb0850448, initial migration
```

#### **3.2 Verify Database Tables**

```bash
# Connect to database and list tables
docker compose exec db psql -U postgres -d ampflux -c "\dt"

# Expected output:
#              List of relations
#  Schema |       Name        | Type  |  Owner
# --------+-------------------+-------+----------
#  public | alembic_version   | table | postgres
#  public | audit_logs        | table | postgres
#  public | circuit_versions  | table | postgres
#  public | companies         | table | postgres
#  public | licenses          | table | postgres
#  public | project_members   | table | postgres
#  public | projects          | table | postgres
#  public | simulations       | table | postgres
#  public | users             | table | postgres
```

### **Phase 4: API Testing**

#### **4.1 Basic Health Check**

```bash
# Test API health endpoint
curl http://localhost:8000/

# Expected response:
# {"message": "AmpFlux Backend API is running"}
```

#### **4.2 Test Authentication Flow**

```bash
# Register a test user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response:
# {"id":1,"name":"Test User","email":"test@example.com","role":"company_admin","company_id":1}

# Login to get access token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response:
# {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","refresh_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","token_type":"bearer"}
```

#### **4.3 Test AI Assistant** (Requires OpenAI API Key)

```bash
# Extract access token from previous response
TOKEN="your-access-token-here"

# Test AI assistant
curl -X POST "http://localhost:8000/ai/assistant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain short-circuit calculation",
    "context": "Project: Test, Voltage: 480V"
  }'

# Expected response (if OpenAI API key is valid):
# {"answer": "For a 480V system, the short-circuit calculation involves..."}

# Expected response (if no OpenAI API key):
# {"answer": "[AI Error] You exceeded your current quota, please check your plan and billing details."}
```

## 🔍 Troubleshooting

### **Common Issues and Solutions**

#### **Issue 1: Docker Services Not Starting**

```bash
# Check Docker daemon
docker info

# Restart Docker Desktop (if on macOS/Windows)
# Then try again:
docker compose up -d
```

#### **Issue 2: Port Already in Use**

```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process or change port in docker-compose.yml
# ports:
#   - "8001:8000"  # Use port 8001 instead
```

#### **Issue 3: Database Connection Errors**

```bash
# Check if database is running
docker compose ps db

# Restart database
docker compose restart db

# Wait a few seconds, then run migrations
docker compose exec backend alembic upgrade head
```

#### **Issue 4: Module Import Errors**

```bash
# Rebuild backend container
docker compose build --no-cache backend
docker compose up -d backend

# Check if all packages are installed
docker compose exec backend pip list
```

#### **Issue 5: AI API Errors**

```bash
# Check OpenAI API key
docker compose exec backend env | grep OPENAI_API_KEY

# Update API key in .env file
echo "OPENAI_API_KEY=your-new-api-key" > .env

# Restart backend
docker compose restart backend
```

#### **Issue 6: Migration Errors**

```bash
# Reset database (WARNING: This will delete all data)
docker compose down -v
docker compose up -d db
docker compose exec backend alembic upgrade head
```

### **Debug Commands**

#### **View Logs**

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs db
docker compose logs redis

# Follow logs in real-time
docker compose logs -f backend
```

#### **Access Containers**

```bash
# Access backend container
docker compose exec backend bash

# Access database
docker compose exec db psql -U postgres -d ampflux

# Access Redis
docker compose exec redis redis-cli
```

#### **Check Service Health**

```bash
# Check if services are responding
curl http://localhost:8000/
docker compose exec db pg_isready -U postgres
docker compose exec redis redis-cli ping
```

## 🧪 Testing Procedures

### **Automated Testing Script**

```bash
#!/bin/bash
# test_backend.sh

echo "🧪 Testing AmpFlux Backend..."

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:8000/)
if [[ $HEALTH == *"AmpFlux Backend API is running"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: User Registration
echo "2. Testing user registration..."
REGISTER=$(curl -s -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}')
if [[ $REGISTER == *"company_admin"* ]]; then
    echo "✅ User registration passed"
else
    echo "❌ User registration failed"
    exit 1
fi

# Test 3: User Login
echo "3. Testing user login..."
LOGIN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')
if [[ $LOGIN == *"access_token"* ]]; then
    echo "✅ User login passed"
    TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ User login failed"
    exit 1
fi

# Test 4: AI Assistant
echo "4. Testing AI assistant..."
AI_RESPONSE=$(curl -s -X POST "http://localhost:8000/ai/assistant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test", "context": "Test"}')
if [[ $AI_RESPONSE == *"answer"* ]]; then
    echo "✅ AI assistant passed"
else
    echo "❌ AI assistant failed"
    exit 1
fi

echo "🎉 All tests passed!"
```

### **Manual Testing Checklist**

- [ ] **Health Check**: `curl http://localhost:8000/`
- [ ] **User Registration**: Register a new user
- [ ] **User Login**: Login and get access token
- [ ] **Project Creation**: Create a new project
- [ ] **Circuit Save**: Save circuit data
- [ ] **Simulation**: Run a simulation
- [ ] **AI Assistant**: Ask AI a question
- [ ] **Database**: Verify data persistence
- [ ] **Logs**: Check for errors in logs

## 📊 Monitoring

### **Service Status**

```bash
# Check all services
docker compose ps

# Check resource usage
docker stats

# Check disk usage
docker system df
```

### **Performance Monitoring**

```bash
# Monitor API response times
time curl http://localhost:8000/

# Monitor database queries
docker compose exec db psql -U postgres -d ampflux -c "SELECT * FROM pg_stat_activity;"

# Monitor Redis usage
docker compose exec redis redis-cli info memory
```

## 🔄 Maintenance

### **Regular Maintenance Tasks**

#### **Weekly**

```bash
# Update Docker images
docker compose pull

# Clean up unused images
docker image prune -f

# Check disk usage
docker system df
```

#### **Monthly**

```bash
# Backup database
docker compose exec db pg_dump -U postgres ampflux > backup_$(date +%Y%m%d).sql

# Update dependencies
# Edit requirements.txt, then:
docker compose build --no-cache backend
docker compose up -d backend
```

### **Backup and Restore**

#### **Backup Database**

```bash
# Create backup
docker compose exec db pg_dump -U postgres ampflux > ampflux_backup.sql

# Compress backup
gzip ampflux_backup.sql
```

#### **Restore Database**

```bash
# Stop services
docker compose down

# Restore from backup
gunzip -c ampflux_backup.sql.gz | docker compose exec -T db psql -U postgres ampflux

# Start services
docker compose up -d
```

## 🚀 Production Deployment

### **Environment Variables for Production**

```bash
# Create production .env
cat > .env.production << EOF
DATABASE_URL=postgresql://user:password@host:5432/ampflux
SECRET_KEY=your-super-secure-production-key
OPENAI_API_KEY=your-production-openai-key
REDIS_URL=redis://host:6379/0
EOF
```

### **Security Checklist**

- [ ] Change default SECRET_KEY
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 📚 Additional Resources

### **Documentation**

- [API Endpoints](./API_ENDPOINTS.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture Overview](./ARCHITECTURE.md)

### **Useful Commands**

```bash
# Start development
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose build backend
docker compose up -d backend

# Access database
docker compose exec db psql -U postgres -d ampflux

# Run migrations
docker compose exec backend alembic upgrade head
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

For support or questions, please refer to the troubleshooting section or create an issue in the repository.
