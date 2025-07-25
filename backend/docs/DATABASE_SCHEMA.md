# AmpFlux Database Schema Documentation

This document provides a detailed explanation of the AmpFlux database schema, including table structures, relationships, constraints, and data flow patterns.

## Overview

The AmpFlux database is designed to support a SaaS platform for electrical short-circuit simulation with the following key features:

- Multi-tenant architecture with company-based isolation
- Role-based access control (company_admin, user)
- Project and circuit management with versioning
- AI-powered simulation and analysis
- Audit logging for compliance and debugging

## Database Tables

### 1. users

Stores user account information and authentication details.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_users_email` on `email`
- `idx_users_company_id` on `company_id`
- `idx_users_role` on `role`

### 2. companies

Represents organizations using the platform.

```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_companies_name` on `name`

### 3. licenses

Manages subscription and licensing information.

```sql
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    plan VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_licenses_company_id` on `company_id`
- `idx_licenses_status` on `status`
- `idx_licenses_end_date` on `end_date`

### 4. projects

Stores project information and metadata.

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES companies(id),
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_projects_company_id` on `company_id`
- `idx_projects_owner_id` on `owner_id`
- `idx_projects_created_at` on `created_at`

### 5. project_members

Manages user access to projects with role-based permissions.

```sql
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);
```

**Indexes:**

- `idx_project_members_project_id` on `project_id`
- `idx_project_members_user_id` on `user_id`
- `idx_project_members_role` on `role`

### 6. circuit_versions

Stores circuit data with versioning support.

```sql
CREATE TABLE circuit_versions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    data_json JSONB NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

**Indexes:**

- `idx_circuit_versions_project_id` on `project_id`
- `idx_circuit_versions_version_number` on `version_number`
- `idx_circuit_versions_created_at` on `created_at`
- `idx_circuit_versions_data_json` on `data_json` USING GIN

### 7. simulations

Stores simulation results and metadata.

```sql
CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    circuit_version_id INTEGER REFERENCES circuit_versions(id),
    result_json JSONB NOT NULL,
    simulation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    simulated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    simulated_by INTEGER REFERENCES users(id)
);
```

**Indexes:**

- `idx_simulations_project_id` on `project_id`
- `idx_simulations_circuit_version_id` on `circuit_version_id`
- `idx_simulations_status` on `status`
- `idx_simulations_simulated_at` on `simulated_at`
- `idx_simulations_result_json` on `result_json` USING GIN

### 8. audit_logs

Tracks all user actions for compliance and debugging.

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_audit_logs_user_id` on `user_id`
- `idx_audit_logs_project_id` on `project_id`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_timestamp` on `timestamp`
- `idx_audit_logs_details` on `details` USING GIN

## Relationships

### One-to-Many Relationships

- **Company → Users**: A company can have multiple users
- **Company → Projects**: A company can have multiple projects
- **Company → Licenses**: A company can have multiple licenses (historical)
- **User → Projects**: A user can own multiple projects
- **Project → Circuit Versions**: A project can have multiple circuit versions
- **Project → Simulations**: A project can have multiple simulations
- **Project → Project Members**: A project can have multiple members
- **Circuit Version → Simulations**: A circuit version can have multiple simulations

### Many-to-Many Relationships

- **Users ↔ Projects**: Through `project_members` table with roles

## Data Flow Patterns

### 1. User Registration Flow

1. User registers with email/password
2. System creates user record
3. If first user for company, creates company record
4. Assigns company_admin role to first user

### 2. Project Creation Flow

1. User creates project
2. System creates project record
3. Automatically adds creator as project member with 'owner' role
4. Creates initial circuit version

### 3. Circuit Versioning Flow

1. User saves circuit changes
2. System creates new circuit_version record
3. Increments version_number
4. Stores circuit data as JSONB

### 4. Simulation Flow

1. User requests simulation
2. System creates simulation record with 'pending' status
3. Background task processes simulation
4. Updates simulation record with results and 'completed' status

### 5. Audit Logging Flow

1. User performs action
2. System logs action in audit_logs
3. Includes user context, project context, and action details
4. Stores additional metadata (IP, user agent, timestamp)

## Performance Considerations

### Indexing Strategy

- **Primary Keys**: All tables use SERIAL primary keys
- **Foreign Keys**: Indexed for join performance
- **JSONB Fields**: GIN indexes for efficient JSON querying
- **Timestamps**: Indexed for time-based queries and sorting
- **Status Fields**: Indexed for filtering

### Partitioning Strategy

- **audit_logs**: Consider partitioning by timestamp for large deployments
- **simulations**: Consider partitioning by project_id for multi-tenant isolation

### Query Optimization

- Use JSONB operators for efficient circuit data querying
- Leverage composite indexes for common query patterns
- Implement connection pooling for high concurrency

## Backup and Recovery

### Backup Commands

```bash
# Full database backup
docker compose exec db pg_dump -U postgres ampflux > backup.sql

# Restore from backup
docker compose exec -T db psql -U postgres ampflux < backup.sql
```

### Migration Strategy

- Use Alembic for schema migrations
- Implement zero-downtime migrations where possible
- Test migrations on staging environment first

## Security Considerations

### Data Isolation

- Company-based row-level security
- User access controlled through project_members table
- Audit logging for all data access

### Encryption

- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- TLS for data in transit

### Access Control

- Role-based permissions (company_admin, user)
- Project-level access control
- API rate limiting

## Monitoring and Maintenance

### Key Metrics

- Database size and growth
- Query performance and slow queries
- Connection pool utilization
- Index usage statistics

### Maintenance Tasks

- Regular VACUUM and ANALYZE
- Index maintenance
- Log rotation and cleanup
- Performance monitoring

This schema provides a solid foundation for the AmpFlux application with proper relationships, indexing, and data flow patterns optimized for electrical engineering project management.
