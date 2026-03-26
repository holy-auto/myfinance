from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Account(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    name: str
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JournalEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    entry_date: date
    description: str
    business_unit: Optional[str] = None
    status: str = Field(default="draft")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JournalLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    journal_entry_id: int = Field(foreign_key="journalentry.id", index=True)
    account_id: int = Field(foreign_key="account.id")
    debit: float = 0
    credit: float = 0
    tax_category: Optional[str] = None


class Attachment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    journal_entry_id: int = Field(foreign_key="journalentry.id", index=True)
    filename: str
    content_type: str
    storage_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
