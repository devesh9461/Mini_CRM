from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.limiter import limiter
from app.routers import auth, leads, notes, activities


def ensure_database_exists():
    """Ensure the database is ready."""
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        print("[Database] Using SQLite. File will be auto-created.")
    elif url.startswith("postgresql"):
        print("[Database] Using PostgreSQL. Ensure the database exists on your host.")
    else:
        print(f"[Database] Using {url.split('://')[0]}. Ensure the database exists.")


def auto_seed():
    """Create default admin if no admins exist yet."""
    from app.models import Admin
    from app.auth import hash_password
    db = SessionLocal()
    try:
        if not db.query(Admin).first():
            admin = Admin(
                username="admin",
                email="admin@minicrm.com",
                password=hash_password("admin123"),
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created: username=admin, password=admin123")
        else:
            print("[Seed] Admin already exists, skipping.")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Warning: could not seed admin: {e}")
    finally:
        db.close()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    print("[Database] Database tables created/verified.")
    auto_seed()
    yield
    print("[Database] Shutting down Mini CRM backend.")


app = FastAPI(
    title="Mini CRM API",
    description="Client Lead Management System — Manage leads from website contact forms",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(notes.router)
app.include_router(activities.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Mini CRM API is running"}
