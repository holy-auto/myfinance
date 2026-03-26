from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, select

from app.database import create_db_and_tables, get_session
from app.models import Account, Attachment, JournalEntry, JournalLine
from app.schemas import (
    AccountCreate,
    AttachmentCreate,
    JournalEntryCreate,
    JournalEntryRead,
    JournalLineCreate,
)

app = FastAPI(title="MyFinance API", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/accounts", response_model=Account)
def create_account(payload: AccountCreate, session: Session = Depends(get_session)) -> Account:
    exists = session.exec(select(Account).where(Account.code == payload.code)).first()
    if exists:
        raise HTTPException(status_code=409, detail="Account code already exists")

    account = Account(**payload.model_dump())
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


@app.get("/accounts", response_model=list[Account])
def list_accounts(session: Session = Depends(get_session)) -> list[Account]:
    return list(session.exec(select(Account)).all())


@app.post("/journals", response_model=JournalEntryRead)
def create_journal(payload: JournalEntryCreate, session: Session = Depends(get_session)) -> JournalEntry:
    entry = JournalEntry(**payload.model_dump())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@app.get("/journals", response_model=list[JournalEntryRead])
def list_journals(session: Session = Depends(get_session)) -> list[JournalEntry]:
    return list(session.exec(select(JournalEntry)).all())


@app.post("/journals/{journal_id}/lines", response_model=JournalLine)
def add_line(journal_id: int, payload: JournalLineCreate, session: Session = Depends(get_session)) -> JournalLine:
    entry = session.get(JournalEntry, journal_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    line = JournalLine(journal_entry_id=journal_id, **payload.model_dump())
    session.add(line)
    session.commit()
    session.refresh(line)
    return line


@app.post("/attachments", response_model=Attachment)
def attach(payload: AttachmentCreate, session: Session = Depends(get_session)) -> Attachment:
    entry = session.get(JournalEntry, payload.journal_entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    attachment = Attachment(**payload.model_dump())
    session.add(attachment)
    session.commit()
    session.refresh(attachment)
    return attachment
