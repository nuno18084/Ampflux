from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, users, projects, circuits, ai
import os
import time
from collections import defaultdict
import threading

app = FastAPI()

# Rate limiting storage (in production, use Redis)
rate_limit_storage = defaultdict(list)
rate_limit_lock = threading.Lock()

def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiting middleware"""
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old entries (older than 1 minute)
    with rate_limit_lock:
        rate_limit_storage[client_ip] = [
            timestamp for timestamp in rate_limit_storage[client_ip]
            if current_time - timestamp < 60
        ]
        
        # Check rate limit (max 10 requests per minute for auth endpoints)
        if request.url.path.startswith("/auth/"):
            if len(rate_limit_storage[client_ip]) >= 10:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
        
        # Add current request
        rate_limit_storage[client_ip].append(current_time)
    
    response = call_next(request)
    return response

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]  # Configure for production
)

# Add CORS middleware with restricted origins
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
print(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Restrict to specific domains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Restrict methods
    allow_headers=["Authorization", "Content-Type", "X-Refresh-Request", "Cookie"],  # Add cookies and refresh header
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add security headers (disabled some for development)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"  # Disabled for development
    # response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"  # Disabled for development
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(circuits.router, prefix="/circuits", tags=["circuits"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "AmpFlux Backend API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}
