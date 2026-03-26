from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator


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
    debit: float = Field(default=0, ge=0)
    credit: float = Field(default=0, ge=0)
    tax_category: Optional[str] = None

    @model_validator(mode="after")
    def validate_single_side(self) -> "JournalLineCreate":
        if self.debit == 0 and self.credit == 0:
            raise ValueError("Either debit or credit must be greater than 0")
        if self.debit > 0 and self.credit > 0:
            raise ValueError("Debit and credit cannot both be greater than 0")
        return self


class JournalEntryWithLinesCreate(JournalEntryCreate):
    lines: list[JournalLineCreate]

    @model_validator(mode="after")
    def validate_balanced_lines(self) -> "JournalEntryWithLinesCreate":
        if len(self.lines) < 2:
            raise ValueError("At least 2 lines are required")

        debit_total = round(sum(line.debit for line in self.lines), 2)
        credit_total = round(sum(line.credit for line in self.lines), 2)
        if debit_total != credit_total:
            raise ValueError("Journal entry is not balanced")
        return self


class AttachmentCreate(BaseModel):
    journal_entry_id: int
    filename: str
    content_type: str
    storage_path: str


class TrialBalanceRow(BaseModel):
    account_id: int
    account_code: str
    account_name: str
    debit_total: float
    credit_total: float
    balance: float
