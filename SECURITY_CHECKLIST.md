# 🔒 Security Checklist for Production Deployment

## **CRITICAL SECURITY REQUIREMENTS**

### **1. Environment Variables**

- [ ] Set `SECRET_KEY` to a strong random string (32+ characters)
- [ ] Set `OPENAI_API_KEY` to your actual API key
- [ ] Set `DATABASE_URL` with strong credentials
- [ ] Set `ALLOWED_ORIGINS` to your production domain(s)
- [ ] Set `POSTGRES_PASSWORD` to a strong password
- [ ] Set `DEFAULT_USER_PASSWORD` if needed (or remove default user creation)

### **2. Database Security**

- [ ] Change default PostgreSQL password
- [ ] Use strong database credentials
- [ ] Enable SSL connections for database
- [ ] Restrict database access to application only
- [ ] Regular database backups with encryption

### **3. API Security**

- [ ] Enable HTTPS only (no HTTP)
- [ ] Implement rate limiting
- [ ] Add request size limits
- [ ] Enable security headers (HSTS, CSP, etc.)
- [ ] Implement proper error handling (no sensitive data in errors)

### **4. Authentication & Authorization**

- [ ] JWT tokens with reasonable expiration
- [ ] Secure password requirements (minimum 8 chars)
- [ ] Implement password reset functionality
- [ ] Session management and logout
- [ ] Role-based access control working

### **5. CORS Configuration**

- [ ] Restrict to specific production domains
- [ ] Remove development localhost origins
- [ ] Limit allowed methods and headers
- [ ] Disable credentials if not needed

### **6. Code Security**

- [ ] Remove all `console.log` statements from production
- [ ] Remove hardcoded passwords/credentials
- [ ] Validate all user inputs
- [ ] Sanitize data before database operations
- [ ] Implement proper error handling

### **7. Infrastructure Security**

- [ ] Use secure Docker images
- [ ] Implement network segmentation
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] Implement logging and alerting

### **8. Data Protection**

- [ ] Encrypt sensitive data at rest
- [ ] Implement data retention policies
- [ ] Regular security audits
- [ ] GDPR compliance if applicable

## **PRODUCTION ENVIRONMENT VARIABLES**

```bash
# Required Environment Variables
SECRET_KEY=your-super-secure-32-character-secret-key
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://user:strongpassword@host:5432/ampflux
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
POSTGRES_PASSWORD=your-strong-postgres-password

# Optional but recommended
DEFAULT_USER_PASSWORD=your-default-user-password
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

## **SECURITY MONITORING**

- [ ] Set up log monitoring
- [ ] Implement intrusion detection
- [ ] Regular security scans
- [ ] Monitor for unusual activity
- [ ] Set up alerts for security events

## **EMERGENCY PROCEDURES**

- [ ] Incident response plan
- [ ] Data breach notification procedures
- [ ] Backup and recovery procedures
- [ ] Contact information for security team

---

**⚠️ IMPORTANT**: This checklist should be reviewed and updated regularly. Security is an ongoing process, not a one-time setup.
