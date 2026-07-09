import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, leads, notes, activities
from app.seed import seed_database


import time
from sqlalchemy.exc import OperationalError

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
    elif url.startswith("postgresql") or url.startswith("postgres"):
        print("[Database] Using PostgreSQL database.")
    else:
        print(f"[Database] Using database URL prefix: {url.split('://')[0]}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database with connection retry
    ensure_database_exists()
    
    max_retries = 5
    retry_delay = 3
    db_connected = False
    
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[Database] Connection attempt {attempt}/{max_retries}...")
            Base.metadata.create_all(bind=engine)
            db_connected = True
            print("[Database] Successfully connected and initialized tables.")
            break
        except Exception as e:
            print(f"[Database] Connection failed on attempt {attempt}: {e}")
            if attempt < max_retries:
                print(f"[Database] Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                if os.getenv("RENDER") != "true":
                    print("\n[Database] ⚠️ WARNING: Could not connect to remote database.")
                    print("[Database] Falling back to local SQLite database for development.")
                    
                    from sqlalchemy import create_engine
                    from pathlib import Path
                    
                    # Resolve backend root path
                    backend_root = Path(__file__).resolve().parent.parent
                    sqlite_url = f"sqlite:///{backend_root / 'db' / 'mini_crm.db'}"
                    
                    # Ensure directory exists
                    sqlite_dir = backend_root / 'db'
                    sqlite_dir.mkdir(parents=True, exist_ok=True)
                    
                    fallback_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
                    Base.metadata.create_all(bind=fallback_engine)
                    
                    SessionLocal.configure(bind=fallback_engine)
                    db_connected = True
                    print("[Database] Local SQLite database successfully initialized.")
                    break
                else:
                    print("[Database] Max database connection retries reached. Server startup failed.")
                    raise e
    
    if db_connected:
        # Seed database
        db = SessionLocal()
        try:
            seed_database(db)
        except Exception as e:
            print(f"[Seed] Failed to seed database: {e}")
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
allow_all = "*" in origins or not origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=False if allow_all else True,
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
