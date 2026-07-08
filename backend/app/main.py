import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, leads, notes, activities
from app.seed import seed_database


def ensure_database_exists():
    """Ensure the target database directory exists if using SQLite."""
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        # Extract path from sqlite:///...
        db_path = url.split("sqlite:///")[-1]
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            print(f"[Database] Created SQLite database folder: {db_dir}")
        print("[Database] Using SQLite database.")
    elif url.startswith("mysql"):
        print("[Database] Using MySQL database.")
    elif url.startswith("postgresql"):
        print("[Database] Using PostgreSQL database.")
    else:
        print(f"[Database] Using database URL prefix: {url.split('://')[0]}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    
    # Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    yield
    print("[Server] Shutting down Mini CRM API server.")


app = FastAPI(
    title="Mini CRM API",
    description="Backend API service for Mini CRM client lead management.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(notes.router)
app.include_router(activities.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Mini CRM API is running"}
