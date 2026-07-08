import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create engine — pool_pre_ping ensures stale connections are recycled
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
db_url = settings.DATABASE_URL

engine_args = {
    "pool_pre_ping": True,
}
if not is_sqlite:
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20
    engine_args["pool_recycle"] = 3600
    
    if "mysql" in db_url:
        # PyMySQL expects SSL options inside connect_args
        connect_args["ssl"] = {"ssl_mode": "REQUIRED"}
        # Clean up query parameters like ssl_mode/ssl-mode to avoid driver TypeError
        parsed_url = urllib.parse.urlparse(db_url)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        query_params.pop("ssl-mode", None)
        query_params.pop("ssl_mode", None)
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        db_url = urllib.parse.urlunparse(
            (parsed_url.scheme, parsed_url.netloc, parsed_url.path, parsed_url.params, new_query, parsed_url.fragment)
        )

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
