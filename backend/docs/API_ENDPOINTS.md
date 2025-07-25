# AmpFlux API Endpoints Documentation

Complete documentation for all AmpFlux Backend API endpoints, including authentication, user management, projects, circuits, simulations, and AI assistant.

## 📋 Table of Contents

1. [Base Information](#base-information)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Project Management](#project-management)
5. [Circuit Operations](#circuit-operations)
6. [AI Assistant](#ai-assistant)
7. [Error Handling](#error-handling)
8. [Testing Examples](#testing-examples)

## 🌐 Base Information

### **Base URL**

- **Development**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

### **Content Type**

All requests should include:

```
Content-Type: application/json
```

### **Authentication**

Most endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <your_access_token>
```

## 🔐 Authentication

### **Register User**

Creates a new user account and automatically creates a company.

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "company_admin",
  "company_id": 1
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### **Login User**

Authenticates user and returns JWT tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

## 👥 User Management

### **List Company Users**

Returns all users in the current user's company.

**Endpoint**: `GET /users/`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "company_admin",
    "company_id": 1
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "company_id": 1
  }
]
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/users/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Get Company Information**

Returns the current user's company details.

**Endpoint**: `GET /users/company`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Acme Engineering",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/users/company" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Invite User** (Company Admin Only)

Invites a new user to the company (stub implementation).

**Endpoint**: `POST /users/invite`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "email": "newuser@example.com",
  "role": "user"
}
```

**Response** (200 OK):

```json
{
  "message": "Invitation sent to newuser@example.com"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/users/invite" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "user"
  }'
```

## 📁 Project Management

### **Create Project**

Creates a new project in the user's company.

**Endpoint**: `POST /projects/`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "name": "Main Power Distribution",
  "description": "Primary electrical distribution system for the facility"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Main Power Distribution",
  "description": "Primary electrical distribution system for the facility",
  "company_id": 1,
  "owner_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/projects/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Power Distribution",
    "description": "Primary electrical distribution system for the facility"
  }'
```

### **List Projects**

Returns all projects in the user's company.

**Endpoint**: `GET /projects/`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "name": "Main Power Distribution",
    "description": "Primary electrical distribution system for the facility",
    "company_id": 1,
    "owner_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Motor Control Panel",
    "description": "Control system for industrial motors",
    "company_id": 1,
    "owner_id": 1,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
]
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/projects/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Get Project Details**

Returns a specific project by ID.

**Endpoint**: `GET /projects/{project_id}`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Main Power Distribution",
  "description": "Primary electrical distribution system for the facility",
  "company_id": 1,
  "owner_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/projects/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Delete Project** (Company Admin Only)

Deletes a project and all associated data.

**Endpoint**: `DELETE /projects/{project_id}`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "message": "Project deleted successfully"
}
```

**cURL Example**:

```bash
curl -X DELETE "http://localhost:8000/projects/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Add Project Member** (Company Admin Only)

Adds a user to a project with specified role.

**Endpoint**: `POST /projects/{project_id}/add_member`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "user_id": 2,
  "role": "editor"
}
```

**Response** (200 OK):

```json
{
  "message": "User added to project successfully"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/projects/1/add_member" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "role": "editor"
  }'
```

### **Remove Project Member** (Company Admin Only)

Removes a user from a project.

**Endpoint**: `POST /projects/{project_id}/remove_member`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "user_id": 2
}
```

**Response** (200 OK):

```json
{
  "message": "User removed from project successfully"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/projects/1/remove_member" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2
  }'
```

## ⚡ Circuit Operations

### **Save Circuit Version**

Saves a new version of circuit data for a project.

**Endpoint**: `POST /circuits/{project_id}/save_version`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "data": {
    "nodes": [
      {
        "id": "node1",
        "type": "voltage_source",
        "position": { "x": 100, "y": 100 },
        "data": { "voltage": 480, "frequency": 60 }
      },
      {
        "id": "node2",
        "type": "resistor",
        "position": { "x": 300, "y": 100 },
        "data": { "resistance": 10 }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "data": { "wire_type": "copper", "length": 50 }
      }
    ]
  }
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "project_id": 1,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/circuits/1/save_version" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nodes": [
        {
          "id": "source",
          "type": "voltage_source",
          "position": { "x": 100, "y": 100 },
          "data": { "voltage": 480 }
        }
      ],
      "edges": []
    }
  }'
```

### **List Circuit Versions**

Returns all versions of a project's circuit.

**Endpoint**: `GET /circuits/{project_id}/versions`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "project_id": 1,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "project_id": 1,
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/circuits/1/versions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Run Simulation**

Starts an asynchronous simulation for a project.

**Endpoint**: `POST /circuits/{project_id}/simulate`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "voltage": 480,
  "resistances": [0.1, 0.05, 0.2],
  "notify_email": "user@example.com"
}
```

**Response** (200 OK):

```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "pending",
  "message": "Simulation started"
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/circuits/1/simulate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voltage": 480,
    "resistances": [0.1, 0.05, 0.2],
    "notify_email": "user@example.com"
  }'
```

### **Get Simulation Result**

Retrieves the result of an asynchronous simulation.

**Endpoint**: `GET /circuits/simulation_result/{task_id}`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "status": "success",
  "result": {
    "fault_current": 1371.43,
    "total_resistance": 0.35,
    "voltage": 480
  }
}
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/circuits/simulation_result/abc123-def456-ghi789" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **List Project Simulations**

Returns all simulation runs for a project.

**Endpoint**: `GET /circuits/{project_id}/simulations`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "project_id": 1,
    "result": {
      "fault_current": 1371.43,
      "total_resistance": 0.35,
      "voltage": 480
    },
    "simulated_at": "2024-01-15T10:30:00Z"
  }
]
```

**cURL Example**:

```bash
curl -X GET "http://localhost:8000/circuits/1/simulations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🤖 AI Assistant

### **Ask AI Assistant**

Sends a prompt to the AI assistant with project context.

**Endpoint**: `POST /ai/assistant`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "prompt": "Explain the short-circuit calculation for a 480V system",
  "context": "Project: Main Distribution, Voltage: 480V, Components: 3-phase motor, contactor"
}
```

**Response** (200 OK):

```json
{
  "answer": "For a 480V system, the short-circuit calculation involves determining the fault current that would flow if a short circuit occurs. The calculation uses Ohm's Law: I = V/R, where I is the fault current, V is the system voltage (480V), and R is the total impedance to the fault point...",
  "tokens_used": 150,
  "cached": false
}
```

**cURL Example**:

```bash
curl -X POST "http://localhost:8000/ai/assistant" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain the short-circuit calculation for a 480V system",
    "context": "Project: Main Distribution, Voltage: 480V, Components: 3-phase motor, contactor"
  }'
```

### **AI Features**

- **Model**: GPT-3.5-turbo
- **Caching**: Redis-based response caching (1 hour TTL)
- **Context**: Project-aware responses
- **Specialization**: Electrical engineering expertise
- **Error Handling**: Graceful fallback for API issues

## ❌ Error Handling

### **Common Error Responses**

#### **401 Unauthorized**

```json
{
  "detail": "Could not validate credentials"
}
```

#### **403 Forbidden**

```json
{
  "detail": "Not enough permissions"
}
```

#### **404 Not Found**

```json
{
  "detail": "Project not found"
}
```

#### **422 Validation Error**

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### **500 Internal Server Error**

```json
{
  "detail": "Internal server error"
}
```

### **AI Error Responses**

```json
{
  "answer": "[AI Error] You exceeded your current quota, please check your plan and billing details."
}
```

## 🧪 Testing Examples

### **Complete Workflow Test**

#### **1. Register and Login**

```bash
# Register a new user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Engineer",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login to get access token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### **2. Create Project**

```bash
# Create a new project (replace YOUR_TOKEN)
curl -X POST "http://localhost:8000/projects/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Circuit",
    "description": "A test circuit for API testing"
  }'
```

#### **3. Save Circuit Version**

```bash
# Save circuit data (replace YOUR_TOKEN and PROJECT_ID)
curl -X POST "http://localhost:8000/circuits/1/save_version" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nodes": [
        {
          "id": "source",
          "type": "voltage_source",
          "position": { "x": 100, "y": 100 },
          "data": { "voltage": 480 }
        }
      ],
      "edges": []
    }
  }'
```

#### **4. Run Simulation**

```bash
# Start simulation (replace YOUR_TOKEN and PROJECT_ID)
curl -X POST "http://localhost:8000/circuits/1/simulate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voltage": 480,
    "resistances": [0.1, 0.05, 0.2]
  }'
```

#### **5. Test AI Assistant**

```bash
# Ask AI (replace YOUR_TOKEN)
curl -X POST "http://localhost:8000/ai/assistant" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the purpose of a circuit breaker in electrical systems?",
    "context": "Project: Test Circuit, Voltage: 480V"
  }'
```

### **Health Check**

```bash
# Check if API is running
curl http://localhost:8000/
# Expected: {"message": "AmpFlux Backend API is running"}
```

### **API Documentation**

```bash
# Open in browser
open http://localhost:8000/docs
```

## 📝 Notes

### **Authentication Flow**

1. Register user → Get user details
2. Login → Get access token
3. Use access token in Authorization header for all subsequent requests
4. Token expires after 30 minutes (configurable)

### **Role-Based Access**

- **company_admin**: Can manage users, projects, and company settings
- **user**: Can create/edit projects and run simulations

### **Data Validation**

- All request bodies are validated using Pydantic schemas
- Invalid data returns 422 Validation Error
- Required fields are enforced at the API level

### **Caching Strategy**

- AI responses cached in Redis for 1 hour
- Cache key based on prompt + system message hash
- Cache bypass for development/testing

### **Error Recovery**

- Database connection errors are handled gracefully
- AI API errors return informative messages
- Simulation failures are logged and reported

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
