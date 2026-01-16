"""Database connection and session management."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator

from backend.config.settings import settings
from backend.database.models import Base


# Create database directory if it doesn't exist
db_dir = os.path.dirname(settings.database_url.replace("sqlite:///", ""))
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

# Create engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=settings.log_level == "DEBUG"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database with schema."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Execute schema.sql for initial data
    schema_file = os.path.join(os.path.dirname(__file__), "schema.sql")
    if os.path.exists(schema_file):
        with open(schema_file, "r") as f:
            schema_sql = f.read()
            # Execute SQL statements
            with engine.connect() as conn:
                # Split by semicolon and execute each statement
                for statement in schema_sql.split(";"):
                    statement = statement.strip()
                    if statement and not statement.startswith("--"):
                        try:
                            conn.execute(statement)
                        except Exception as e:
                            # Ignore errors for CREATE TABLE IF NOT EXISTS
                            if "already exists" not in str(e).lower():
                                print(f"Warning: {e}")
                conn.commit()

    print("✅ Database initialized successfully")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting database session.
    Use with FastAPI Depends().
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """Context manager for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
