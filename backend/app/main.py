from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.limiter import limiter
from app.routers import auth, leads, notes, activities


# Safe slowapi handler import
try:
    from slowapi import _rate_limit_exceeded_handler
except ImportError:
    def _rate_limit_exceeded_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."},
        )


def ensure_database_exists():
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        print("[Database] Using SQLite. File will be auto-created.")
    elif url.startswith("postgresql"):
        print("[Database] Using PostgreSQL.")
    else:
        print(f"[Database] Using {url.split('://')[0]}.")


def auto_seed():
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
            print("[Seed] Default admin created: username=admin, password=admin123")
        else:
            print("[Seed] Admin already exists, skipping.")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Warning: could not seed admin: {e}")
    finally:
        db.close()


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers = message.get("headers", [])
                headers.extend([
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"DENY"),
                    (b"x-xss-protection", b"0"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
                    (b"strict-transport-security", b"max-age=31536000; includeSubDomains"),
                ])
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_headers)


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

# Security headers (ASGI middleware — no BaseHTTPMiddleware issues)
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
