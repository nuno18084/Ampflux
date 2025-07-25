# AmpFlux Backend Architecture

Comprehensive documentation of the AmpFlux backend system architecture, including design patterns, data flow, security considerations, and scalability strategies.

## 🏗️ System Overview

AmpFlux is a modern, scalable SaaS platform for electrical engineering simulation with AI assistance. The backend is built using FastAPI (Python) with a microservices-inspired architecture that supports real-time collaboration, advanced simulations, and intelligent AI features.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Web App   │  │  Mobile App │  │   Desktop   │  │   API Client│    │
│  │   (React)   │  │   (React)   │  │   (Electron)│  │   (Python)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Application                             │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │    │
│  │  │   Auth      │ │   Users     │ │  Projects   │ │   Circuits  │ │    │
│  │  │   Router    │ │   Router    │ │   Router    │ │   Router    │ │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │    │
│  │  │     AI      │ │  Security   │ │ Validation  │ │   CORS      │ │    │
│  │  │   Router    │ │  Middleware │ │  Middleware │ │  Middleware │ │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Auth      │  │   User      │  │   Project   │  │   Circuit   │    │
│  │   Service   │  │  Management │  │  Management │  │  Simulation │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     AI      │  │   License   │  │   Audit     │  │ Background  │    │
│  │   Service   │  │  Management │  │   Logging   │  │   Tasks     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ SQLAlchemy  │  │   Redis     │  │   Celery    │  │   Alembic   │    │
│  │     ORM     │  │   Cache     │  │   Tasks     │  │ Migrations  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ PostgreSQL  │  │    Redis    │  │   Docker    │  │   OpenAI    │    │
│  │  Database   │  │   Cache &   │  │  Containers │  │     API     │    │
│  │             │  │   Message   │  │             │  │             │    │
│  │             │  │    Broker    │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🏛️ Core Components

### **1. API Gateway Layer**

#### **FastAPI Application**

- **Framework**: FastAPI (Python 3.12)
- **Server**: Uvicorn with ASGI
- **Features**:
  - Automatic API documentation (Swagger/ReDoc)
  - Request/response validation
  - Dependency injection
  - Async support
  - CORS middleware

#### **Router Structure**

```
app/routers/
├── auth.py          # Authentication endpoints
├── users.py         # User management
├── projects.py      # Project CRUD operations
├── circuits.py      # Circuit simulation
└── ai.py           # AI assistant
```

#### **Middleware Stack**

1. **CORS Middleware**: Cross-origin resource sharing
2. **Security Middleware**: JWT validation, rate limiting
3. **Validation Middleware**: Request/response validation
4. **Logging Middleware**: Request/response logging

### **2. Business Logic Layer**

#### **Service Layer Pattern**

Each domain has its own service class:

```python
# Example: UserService
class UserService:
    def create_user(self, user_data: UserCreate) -> User
    def get_user_by_id(self, user_id: int) -> User
    def update_user(self, user_id: int, user_data: UserUpdate) -> User
    def delete_user(self, user_id: int) -> bool
```

#### **Domain Services**

- **AuthService**: JWT token management, password hashing
- **UserService**: User CRUD operations, company management
- **ProjectService**: Project lifecycle management
- **CircuitService**: Circuit versioning and simulation
- **AIService**: OpenAI integration, response caching
- **LicenseService**: Subscription management (planned)

### **3. Data Access Layer**

#### **SQLAlchemy ORM**

- **Pattern**: Repository pattern with SQLAlchemy
- **Features**:
  - Connection pooling
  - Transaction management
  - Migration support
  - Query optimization

#### **Redis Integration**

- **Purpose**: Caching and session storage
- **Features**:
  - AI response caching (1 hour TTL)
  - Session storage
  - Rate limiting counters
  - Celery message broker

#### **Celery Background Tasks**

- **Broker**: Redis
- **Backend**: Redis
- **Tasks**:
  - Circuit simulation calculations
  - Email notifications
  - Data processing

## 🔐 Security Architecture

### **Authentication System**

#### **JWT Token Flow**

```
1. User Login → Validate Credentials
2. Generate JWT Tokens → Access + Refresh
3. Client Stores Tokens → Secure Storage
4. API Requests → Include Access Token
5. Token Validation → Extract User Info
6. Token Expiry → Use Refresh Token
```

#### **Security Features**

- **Password Hashing**: bcrypt with salt
- **Token Expiration**: Configurable (30 minutes default)
- **Refresh Tokens**: Secure token renewal
- **Role-Based Access**: company_admin vs user
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM

### **Authorization Model**

#### **Role Hierarchy**

```
company_admin
├── Manage company users
├── Create/delete projects
├── Manage project members
├── Access all company data
└── License management

user
├── Create/edit projects
├── Run simulations
├── Use AI assistant
└── View company projects
```

#### **Resource Access Control**

- **Company-Scoped**: Users only see their company's data
- **Project-Level**: Project members have specific permissions
- **Resource Ownership**: Users own their created resources

## 🗄️ Database Architecture

### **Schema Design**

#### **Core Tables**

```sql
-- User management
users (id, name, email, password_hash, role, company_id)
companies (id, name, created_at)

-- Project management
projects (id, name, description, company_id, owner_id, created_at, updated_at)
project_members (id, project_id, user_id, role)

-- Circuit data
circuit_versions (id, project_id, data_json, created_at)
simulations (id, project_id, result_json, simulated_at)

-- System tables
audit_logs (id, user_id, project_id, action, timestamp)
licenses (id, company_id, plan, start_date, end_date, status)
```

#### **Relationships**

```
companies (1) ←→ (N) users
companies (1) ←→ (N) projects
projects (1) ←→ (N) circuit_versions
projects (1) ←→ (N) simulations
projects (1) ←→ (N) project_members
users (1) ←→ (N) project_members
```

### **Data Flow Patterns**

#### **Circuit Versioning**

```
1. User edits circuit → Frontend sends JSON
2. Save version → Store in circuit_versions
3. Retrieve history → Query by project_id
4. Restore version → Load specific version
```

#### **Simulation Pipeline**

```
1. User requests simulation → API endpoint
2. Validate input → Pydantic validation
3. Queue task → Celery background task
4. Process simulation → NumPy/SciPy calculations
5. Store results → Database + cache
6. Notify user → Email/WebSocket (planned)
```

## 🤖 AI Integration Architecture

### **OpenAI Integration**

#### **Service Design**

```python
class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.cache = redis.Redis.from_url(settings.REDIS_URL)

    def ask_assistant(self, prompt: str, context: str) -> str:
        # Check cache first
        # Generate response if not cached
        # Cache response for 1 hour
        # Return response
```

#### **Caching Strategy**

- **Cache Key**: SHA256 hash of (system_message + prompt)
- **TTL**: 1 hour (configurable)
- **Benefits**:
  - Reduced API costs
  - Faster responses
  - Rate limit protection

#### **Context Engineering**

```python
# System message for electrical engineering expertise
SYSTEM_MESSAGE = """
You are an expert electrical engineer AI assistant specializing in:
- Short-circuit calculations
- Circuit analysis
- Component selection
- Safety standards (NEC, IEEE)
- Power distribution systems
"""

# Context includes project information
CONTEXT = f"""
Project: {project_name}
Voltage: {voltage}V
Components: {components}
Previous simulations: {simulation_history}
"""
```

### **AI Features**

#### **Capabilities**

- **Circuit Analysis**: Explain circuit behavior
- **Component Recommendations**: Suggest appropriate components
- **Safety Validation**: Check for code compliance
- **Simulation Interpretation**: Explain calculation results
- **Error Detection**: Identify potential issues

#### **Error Handling**

```python
try:
    response = client.chat.completions.create(...)
    return response.choices[0].message.content
except Exception as e:
    return f"[AI Error] {str(e)}"
```

## 🔄 Background Processing

### **Celery Task Architecture**

#### **Task Design**

```python
@celery_app.task(bind=True)
def run_simulation(self, voltage: float, resistances: List[float]):
    try:
        # Perform calculations
        result = calculate_fault_current(voltage, resistances)

        # Store results
        save_simulation_result(result)

        # Send notifications
        notify_user_completion(result)

        return result
    except Exception as e:
        self.retry(countdown=60, max_retries=3)
```

#### **Task Types**

- **Simulation Tasks**: Circuit calculations
- **Notification Tasks**: Email/SMS alerts
- **Data Processing**: Batch operations
- **Maintenance Tasks**: Cleanup operations

### **Message Queue Architecture**

#### **Redis as Message Broker**

```
Producer (API) → Redis Queue → Consumer (Celery Worker)
     ↓              ↓              ↓
  Task Request   Message Queue   Task Execution
```

#### **Queue Management**

- **Default Queue**: General tasks
- **Priority Queues**: High-priority simulations
- **Dead Letter Queue**: Failed task handling

## 📊 Performance Architecture

### **Caching Strategy**

#### **Multi-Level Caching**

```
1. Application Cache (Redis)
   ├── AI responses (1 hour TTL)
   ├── User sessions (24 hours TTL)
   ├── Simulation results (1 week TTL)
   └── Rate limiting counters

2. Database Cache
   ├── Query result caching
   ├── Connection pooling
   └── Prepared statements
```

#### **Cache Invalidation**

- **Time-based**: Automatic expiration
- **Event-based**: Cache invalidation on data changes
- **Manual**: Admin-triggered cache clearing

### **Database Optimization**

#### **Indexing Strategy**

```sql
-- Primary indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_circuit_versions_project ON circuit_versions(project_id);

-- Composite indexes
CREATE INDEX idx_simulations_project_date ON simulations(project_id, simulated_at);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, timestamp);
```

#### **Query Optimization**

- **Connection Pooling**: SQLAlchemy engine configuration
- **Lazy Loading**: Relationship loading strategies
- **Query Optimization**: Eager loading for complex queries

### **API Performance**

#### **Response Time Optimization**

- **Async Endpoints**: FastAPI async support
- **Pagination**: Large dataset handling
- **Compression**: Gzip response compression
- **CDN Integration**: Static asset delivery

## 🔧 Configuration Management

### **Environment-Based Configuration**

#### **Configuration Hierarchy**

```
1. Environment Variables (Production)
2. .env file (Development)
3. Default values (Fallback)
```

#### **Configuration Schema**

```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI
    OPENAI_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"
```

### **Feature Flags**

```python
# Feature toggles for gradual rollout
FEATURE_FLAGS = {
    "ai_assistant": True,
    "real_time_collaboration": False,
    "advanced_simulations": True,
    "email_notifications": False,
}
```

## 🚀 Deployment Architecture

### **Container Orchestration**

#### **Docker Services**

```yaml
services:
  backend:
    build: .
    ports: ["8000:8000"]
    depends_on: [db, redis]

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ampflux
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

#### **Service Discovery**

- **Internal Communication**: Docker network
- **External Access**: Port mapping
- **Health Checks**: Container health monitoring

### **Scaling Strategy**

#### **Horizontal Scaling**

```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance N
```

#### **Database Scaling**

- **Read Replicas**: For read-heavy operations
- **Connection Pooling**: Efficient connection management
- **Sharding**: Future consideration for large datasets

## 📈 Monitoring and Observability

### **Health Checks**

#### **Service Health Endpoints**

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

@app.get("/health/detailed")
async def detailed_health_check():
    return {
        "database": check_database_connection(),
        "redis": check_redis_connection(),
        "ai_service": check_openai_connection(),
        "celery": check_celery_status()
    }
```

### **Logging Strategy**

#### **Structured Logging**

```python
import logging

logger = logging.getLogger(__name__)

def log_user_action(user_id: int, action: str, details: dict):
    logger.info(
        "User action",
        extra={
            "user_id": user_id,
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow()
        }
    )
```

#### **Log Levels**

- **DEBUG**: Development debugging
- **INFO**: General application flow
- **WARNING**: Potential issues
- **ERROR**: Application errors
- **CRITICAL**: System failures

### **Metrics Collection**

#### **Key Metrics**

- **API Response Times**: Endpoint performance
- **Database Query Times**: Query optimization
- **Cache Hit Rates**: Cache effectiveness
- **Error Rates**: System reliability
- **User Activity**: Usage patterns

## 🔮 Future Architecture Enhancements

### **Planned Improvements**

#### **Real-Time Features**

- **WebSocket Integration**: Live collaboration
- **Server-Sent Events**: Real-time updates
- **Message Queues**: Event-driven architecture

#### **Advanced AI Features**

- **Circuit Generation**: AI-powered circuit design
- **Component Recognition**: Image-based component identification
- **Predictive Analytics**: Usage pattern analysis

#### **Scalability Enhancements**

- **Microservices**: Service decomposition
- **API Gateway**: Advanced routing and rate limiting
- **Event Sourcing**: Audit trail and data consistency

#### **Security Enhancements**

- **OAuth2 Integration**: Third-party authentication
- **API Keys**: Developer access control
- **Rate Limiting**: Advanced throttling
- **Audit Logging**: Comprehensive activity tracking

## 📚 Best Practices

### **Code Organization**

- **Domain-Driven Design**: Business logic organization
- **Dependency Injection**: Loose coupling
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation

### **Error Handling**

- **Graceful Degradation**: System resilience
- **Comprehensive Logging**: Debugging support
- **User-Friendly Messages**: Clear error communication
- **Retry Mechanisms**: Transient failure handling

### **Testing Strategy**

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **API Tests**: Endpoint functionality testing
- **Performance Tests**: Load and stress testing

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

This architecture provides a solid foundation for the AmpFlux platform, supporting current requirements while enabling future growth and feature expansion.
