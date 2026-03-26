from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class AccountCreate(BaseModel):
    code: str
    name: str
    category: str


class JournalEntryCreate(BaseModel):
    entry_date: date
    description: str
    business_unit: Optional[str] = None


class JournalEntryRead(BaseModel):
    id: int
    entry_date: date
    description: str
    business_unit: Optional[str]
    status: str
    created_at: datetime


class JournalLineCreate(BaseModel):
    account_id: int
    debit: float = 0
    credit: float = 0
    tax_category: Optional[str] = None


class AttachmentCreate(BaseModel):
    journal_entry_id: int
    filename: str
    content_type: str
    storage_path: str
