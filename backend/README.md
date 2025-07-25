# AmpFlux Backend API

A comprehensive FastAPI backend for the AmpFlux Electric Short-Circuit Simulator platform, featuring AI-powered assistance, real-time collaboration, and advanced electrical engineering simulation capabilities.

## 🚀 Current Status

### ✅ **Fully Implemented & Working:**

- **Authentication System**: JWT-based auth with role-based access control
- **User & Company Management**: Complete CRUD operations
- **Project Management**: Create, update, delete projects with member management
- **Circuit Versioning**: Save and retrieve circuit versions
- **Simulation Engine**: Asynchronous short-circuit calculations using Celery
- **AI Assistant**: OpenAI GPT-3.5 integration with caching
- **Database**: PostgreSQL with Alembic migrations
- **Caching**: Redis for AI responses and session management
- **Docker**: Complete containerized setup

### 🔧 **Recent Fixes Applied:**

- Fixed JWT authentication dependency issues
- Updated OpenAI client configuration for compatibility
- Resolved Docker container networking issues
- Fixed database connection and migration setup
- Updated requirements.txt with correct package versions

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   PostgreSQL    │
│   (React)       │◄──►│   Backend       │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis Cache   │    │   OpenAI API    │
                       │   (AI/Sessions) │    │   (GPT-3.5)     │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Celery        │
                       │   (Simulations) │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### **Core Framework**

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations
- **Alembic**: Database migration tool

### **Authentication & Security**

- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing
- **python-jose**: JWT encoding/decoding
- **passlib**: Password hashing utilities

### **Database & Caching**

- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **psycopg2**: PostgreSQL adapter

### **AI & Machine Learning**

- **OpenAI GPT-3.5**: AI assistant for electrical engineering
- **NumPy**: Numerical computations for simulations
- **SciPy**: Scientific computing for circuit analysis

### **Asynchronous Processing**

- **Celery**: Distributed task queue
- **Redis**: Message broker for Celery

### **DevOps & Deployment**

- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **Uvicorn**: ASGI server

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Application configuration
│   ├── database.py             # Database connection setup
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic schemas
│   ├── routers/                # API route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User management
│   │   ├── projects.py        # Project CRUD operations
│   │   ├── circuits.py        # Circuit versioning & simulation
│   │   └── ai.py              # AI assistant endpoints
│   ├── utils/                  # Utility functions
│   │   ├── security.py        # JWT & password utilities
│   │   └── ai.py              # OpenAI integration
│   └── tasks/                  # Celery background tasks
│       └── simulation.py      # Simulation calculations
├── migrations/                 # Alembic database migrations
├── docs/                       # Documentation
│   ├── API_ENDPOINTS.md       # Complete API documentation
│   ├── DATABASE_SCHEMA.md     # Database design documentation
│   ├── STARTUP_GUIDE.md       # Step-by-step setup guide
│   └── ARCHITECTURE.md        # System architecture details
├── docker-compose.yml         # Docker services configuration
├── Dockerfile                 # Backend container definition
├── requirements.txt           # Python dependencies
├── alembic.ini               # Alembic configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### **Prerequisites**

- Docker and Docker Compose
- OpenAI API key (for AI features)

### **1. Environment Setup**

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Create environment file
cp .env.example .env
# Edit .env with your OpenAI API key
```

### **2. Start Services**

```bash
# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend alembic upgrade head
```

### **3. Verify Installation**

```bash
# Check API health
curl http://localhost:8000/

# Expected response:
# {"message": "AmpFlux Backend API is running"}
```

### **4. Test AI Assistant**

```bash
# Register a user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Login to get token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test AI (replace YOUR_TOKEN)
curl -X POST "http://localhost:8000/ai/assistant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt": "Explain short-circuit calculation", "context": "480V system"}'
```

## 🔧 Configuration

### **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/ampflux

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://redis:6379/0
```

### **Docker Services**

- **Backend**: FastAPI application (port 8000)
- **Database**: PostgreSQL (port 5432)
- **Redis**: Caching and message broker (port 6379)

## 📚 API Documentation

### **Interactive Documentation**

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### **Key Endpoints**

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /users/` - List company users
- `POST /projects/` - Create new project
- `POST /circuits/{project_id}/simulate` - Run simulation
- `POST /ai/assistant` - AI assistant

## 🔒 Security Features

### **Authentication**

- JWT-based stateless authentication
- Access and refresh token system
- Role-based access control (company_admin, user)

### **Authorization**

- Company-scoped data access
- Project-level permissions
- Admin-only operations protection

### **Data Protection**

- Password hashing with bcrypt
- Secure token generation
- Input validation with Pydantic

## 🤖 AI Integration

### **OpenAI GPT-3.5 Assistant**

- **Purpose**: Electrical engineering expertise
- **Features**:
  - Circuit analysis explanations
  - Component recommendations
  - Simulation result interpretation
  - Error detection and suggestions
- **Caching**: Redis-based response caching (1 hour TTL)
- **Context**: Project-aware responses

### **Usage Example**

```python
# AI will receive context like:
{
  "prompt": "Explain this circuit behavior",
  "context": "Project: Motor Control, Voltage: 480V, Components: 3-phase motor, contactor"
}
```

## 📊 Database Schema

### **Core Tables**

- **users**: User accounts and authentication
- **companies**: Organization management
- **projects**: Circuit projects and metadata
- **circuit_versions**: Versioned circuit data
- **simulations**: Calculation results and history
- **audit_logs**: User action tracking

### **Relationships**

- Users belong to companies
- Projects belong to companies
- Circuit versions belong to projects
- Simulations track project calculations

## 🔄 Background Tasks

### **Celery Integration**

- **Purpose**: Asynchronous simulation processing
- **Broker**: Redis
- **Tasks**: Short-circuit calculations, email notifications
- **Monitoring**: Task status tracking

### **Simulation Engine**

```python
# Example simulation task
@celery_app.task
def run_short_circuit_simulation(voltage, resistances):
    # NumPy/SciPy calculations
    # Result storage
    # Email notification
```

## 🧪 Testing

### **Manual Testing**

```bash
# Health check
curl http://localhost:8000/

# Authentication flow
curl -X POST "http://localhost:8000/auth/register" -H "Content-Type: application/json" -d '{"name": "Test", "email": "test@example.com", "password": "password123"}'

# AI testing (requires valid OpenAI API key)
curl -X POST "http://localhost:8000/ai/assistant" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"prompt": "Test prompt", "context": "Test context"}'
```

### **API Testing**

- Use Swagger UI at http://localhost:8000/docs
- Import Postman collection (available in docs/)
- Automated tests (planned for future)

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Database Connection Errors**

```bash
# Check if database is running
docker compose ps

# Restart database
docker compose restart db

# Run migrations
docker compose exec backend alembic upgrade head
```

#### **2. AI API Errors**

```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Verify API key in .env file
cat .env | grep OPENAI_API_KEY

# Test OpenAI connection
curl -H "Authorization: Bearer YOUR_OPENAI_KEY" https://api.openai.com/v1/models
```

#### **3. Docker Issues**

```bash
# Rebuild containers
docker compose build --no-cache

# Clean up volumes
docker compose down -v
docker compose up -d
```

### **Logs**

```bash
# Backend logs
docker compose logs backend

# Database logs
docker compose logs db

# Redis logs
docker compose logs redis
```

## 📈 Performance

### **Optimizations**

- **Database**: Connection pooling, indexed queries
- **Caching**: Redis for AI responses and sessions
- **Async**: FastAPI async endpoints
- **Background Tasks**: Celery for heavy computations

### **Monitoring**

- **Health Checks**: `/` endpoint
- **Database**: Connection status
- **Redis**: Cache hit rates
- **AI**: Response times and token usage

## 🔮 Future Enhancements

### **Planned Features**

- **Real-time Collaboration**: WebSocket integration
- **Advanced Simulations**: More complex circuit analysis
- **Export/Import**: Circuit data formats
- **Advanced AI**: Circuit generation from descriptions
- **Analytics**: Usage tracking and insights
- **Multi-tenancy**: Enhanced company isolation

### **Infrastructure**

- **CI/CD**: GitHub Actions pipeline
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with ELK stack
- **Security**: Rate limiting, API keys

## 📖 Learning Resources

### **FastAPI**

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/14/tutorial/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)

### **Docker**

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Docker builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)

### **AI & ML**

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [NumPy Tutorial](https://numpy.org/doc/stable/user/quickstart.html)
- [SciPy Documentation](https://docs.scipy.org/doc/scipy/)

### **Electrical Engineering**

- [Short Circuit Analysis](https://en.wikipedia.org/wiki/Short_circuit)
- [Circuit Theory](https://en.wikipedia.org/wiki/Circuit_theory)

## 🤝 Contributing

### **Development Setup**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Style**

- Follow PEP 8 for Python code
- Use type hints
- Add docstrings to functions
- Keep functions small and focused

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### **Getting Help**

- Check the documentation in `/docs/`
- Review the troubleshooting section
- Open an issue on GitHub
- Contact the development team

### **Useful Commands**

```bash
# Start development
docker compose up -d

# View logs
docker compose logs -f backend

# Access database
docker compose exec db psql -U postgres -d ampflux

# Run migrations
docker compose exec backend alembic upgrade head

# Rebuild after changes
docker compose build backend
docker compose up -d backend
```

---

**AmpFlux Backend** - Powering the future of electrical engineering simulation with AI assistance. ⚡
