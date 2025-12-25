"""
Database connection and session management for FastAPI backend.

This module provides SQLModel engine configuration with connection pooling
optimized for Neon Serverless PostgreSQL.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, create_engine

# Load environment variables
load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/todo_db")

# Create SQLModel engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("ENVIRONMENT") == "development",  # SQL logging in dev mode
    pool_pre_ping=True,  # Verify connections before using (handles serverless resets)
    pool_size=10,  # Base connection pool size
    max_overflow=20,  # Additional connections when pool exhausted
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides database session.

    Yields:
        Session: SQLModel database session

    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.exec(select(Item)).all()
    """
    with Session(engine) as session:
        yield session
