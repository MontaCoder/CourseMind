# Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in CourseMind to protect against common vulnerabilities including XSS, CSRF, SQL injection, brute force attacks, and unauthorized access.

## Security Features Implemented

### 1. Authentication & Authorization

#### JWT Token-Based Authentication
- **Token Generation**: Secure JWT tokens generated upon successful login/signup
- **Token Expiration**: 7-day expiration for security without excessive re-authentication
- **Token Validation**: All protected routes verify JWT tokens before granting access
- **Secure Storage**: Tokens stored in localStorage (frontend) with automatic injection via axios interceptors

#### Role-Based Access Control (RBAC)
- **User Authentication**: `authenticateToken` middleware protects user-specific routes
- **Admin Authorization**: `checkAdminAccess` middleware restricts admin-only endpoints
- **Route Protection**:
  - Public: signup, signin, social login, password reset, contact, shared courses
  - Protected: course creation/modification, notes, exams, user profile
  - Admin-only: dashboard, user management, admin management, blog management

### 2. CORS (Cross-Origin Resource Sharing) Security

#### Whitelist Configuration
```javascript
Allowed Origins:
- http://localhost:8080
- http://localhost:5173
- http://localhost:3000
- WEBSITE_URL from environment
```

#### Restrictions
- Credentials support enabled
- Methods: GET, POST, PUT, DELETE, PATCH only
- Headers: Content-Type, Authorization only

### 3. Rate Limiting

#### General API Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Purpose**: Prevent API abuse and DDoS attacks
- **Development**: Disabled in development mode

#### Authentication Rate Limit
- **Window**: 15 minutes
- **Max Attempts**: 5 per IP
- **Routes**: /api/signup, /api/signin
- **Skip**: Successful authentication attempts
- **Purpose**: Prevent brute force attacks
- **Development**: Disabled in development mode

### 4. Input Validation & Sanitization

#### MongoDB Injection Prevention
- **Library**: express-mongo-sanitize
- **Function**: Strips `$` and `.` characters from user input
- **Protection**: Prevents MongoDB operator injection attacks

#### Email Validation
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Application**: All email input fields

#### Content-Type Validation
- **Required**: application/json for POST/PUT/PATCH requests
- **Rejection**: Non-JSON content-type requests rejected

#### Request Size Limits
- **Limit**: 50MB maximum
- **Purpose**: Prevent memory exhaustion attacks

### 5. HTTP Security Headers

#### Helmet.js Implementation
```javascript
Security Headers Applied:
- Content-Security-Policy (CSP)
- X-DNS-Prefetch-Control
- X-Frame-Options (Clickjacking protection)
- Strict-Transport-Security (HSTS)
- X-Download-Options
- X-Content-Type-Options (MIME sniffing prevention)
- X-XSS-Protection
```

### 6. Password Security

#### Bcrypt Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Auto-hashing**: Pre-save hook in User model
- **Comparison**: Secure `comparePassword` method

#### Password Reset
- **Token**: Cryptographically secure random token
- **Expiration**: 1 hour
- **Storage**: Token and expiry stored in database
- **One-time use**: Token cleared after successful reset

## Environment Variables

### Required for Production
```env
JWT_SECRET=<strong-random-secret-key>
NODE_ENV=production
MONGODB_URI=<your-mongodb-uri>
WEBSITE_URL=<your-production-url>
```

### Optional Security Variables
```env
CORS_ORIGINS=<comma-separated-allowed-origins>
```

## Frontend Integration

### API Client (`src/lib/apiClient.ts`)
- **Token Management**: Automatic token storage and retrieval
- **Request Interceptor**: Auto-inject Authorization header
- **Response Interceptor**: Handle 401 errors, clear auth, redirect to login
- **Centralized API Calls**: Type-safe API methods for all endpoints

### Token Storage
- **Location**: localStorage with key 'authToken'
- **Session Data**: Backward compatibility with sessionStorage for user info
- **Auto-cleanup**: Tokens cleared on 401 response

### Usage Example
```typescript
import { api, setToken, getToken } from '@/lib/apiClient';

// Login and store token
const response = await api.auth.signin({ email, password });
setToken(response.data.token);

// Subsequent requests automatically include token
const courses = await api.courses.getAll({ userId });
```

## Protected Routes

### Authentication Required (`authenticateToken`)
- POST /api/course
- POST /api/courseshared
- POST /api/update
- POST /api/deletecourse
- POST /api/finish
- GET /api/courses
- POST /api/sendcertificate
- POST /api/getnotes
- POST /api/savenotes
- POST /api/aiexam
- POST /api/updateresult
- POST /api/sendexammail
- POST /api/getmyresult
- POST /api/profile
- POST /api/deleteuser

### Admin Authorization Required (`authenticateToken` + `checkAdminAccess`)
- POST /api/dashboard
- GET /api/getusers
- GET /api/getcourses
- GET /api/getpaid
- GET /api/getadmins
- POST /api/addadmin
- POST /api/removeadmin
- GET /api/getcontact
- POST /api/saveadmin
- POST /api/createblog
- POST /api/deleteblogs
- POST /api/updateblogs

### Public Routes (No Authentication)
- POST /api/signup
- POST /api/signin
- POST /api/social
- POST /api/forgot
- POST /api/reset-password
- POST /api/contact
- GET /api/shareable
- GET /api/policies
- GET /api/getblogs
- GET /health

## Security Best Practices

### For Developers

1. **Never commit secrets**: Use .env files and add them to .gitignore
2. **Strong JWT_SECRET**: Use at least 32 random characters in production
3. **HTTPS only**: Always use HTTPS in production
4. **Regular updates**: Keep dependencies updated for security patches
5. **Input validation**: Always validate and sanitize user input
6. **Principle of least privilege**: Grant minimum necessary permissions

### For Deployment

1. **Environment variables**:
   ```bash
   NODE_ENV=production
   JWT_SECRET=<generate-strong-random-string>
   CORS_ORIGINS=https://yourdomain.com
   ```

2. **HTTPS setup**: Configure SSL/TLS certificates
3. **Database security**: Use strong MongoDB credentials, enable auth
4. **Firewall rules**: Restrict access to necessary ports only
5. **Monitoring**: Implement logging and monitoring for security events

## Vulnerability Testing

### Recommended Tools
- **OWASP ZAP**: Web application security scanner
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Continuous security monitoring

### Regular Audits
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

## Incident Response

### If a Security Issue is Discovered

1. **Immediate**: Report to security@yourcompany.com
2. **Assessment**: Evaluate the severity and impact
3. **Containment**: Apply temporary fixes if necessary
4. **Resolution**: Implement permanent fix
5. **Notification**: Inform affected users if data was compromised

## Security Updates

Last Updated: 2025-10-23

### Version 1.0.0
- Initial security implementation
- JWT authentication
- CORS hardening
- Rate limiting
- Input sanitization
- Helmet security headers
- Bcrypt password hashing

---

**Note**: This is a living document. Update it whenever security features are added or modified.
