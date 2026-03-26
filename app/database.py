import os
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine


def _running_on_serverless() -> bool:
    return bool(os.getenv("VERCEL")) or Path("/var/task").exists()


def _default_sqlite_url() -> str:
    if _running_on_serverless():
        return "sqlite:////tmp/myfinance.db"
    return "sqlite:///./myfinance.db"


def _normalize_database_url(raw_url: str | None) -> str:
    if not raw_url:
        return _default_sqlite_url()

    # If sqlite path is relative, normalize to /tmp on serverless to avoid
    # "unable to open database file" in read-only runtime directories.
    if raw_url.startswith("sqlite:///") and not raw_url.startswith("sqlite:////"):
        if _running_on_serverless():
            return "sqlite:////tmp/myfinance.db"

    return raw_url


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL"))
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def create_db_and_tables() -> None:
    """
    For non-SQLite databases, table auto-creation is opt-in because managed
    PostgreSQL users may not have DDL permissions in runtime.
    """
    auto_migrate = os.getenv("AUTO_MIGRATE", "0") == "1"
    if not DATABASE_URL.startswith("sqlite") and not auto_migrate:
        return
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
