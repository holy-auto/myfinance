from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Session, select

from app.database import create_db_and_tables, get_session
from app.models import Account, Attachment, JournalEntry, JournalLine
from app.schemas import (
    AccountCreate,
    AttachmentCreate,
    JournalEntryCreate,
    JournalEntryRead,
    JournalEntryWithLinesCreate,
    JournalLineCreate,
    TrialBalanceRow,
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


@app.post("/journals/with-lines", response_model=JournalEntryRead)
def create_journal_with_lines(
    payload: JournalEntryWithLinesCreate,
    session: Session = Depends(get_session),
) -> JournalEntry:
    account_ids = {line.account_id for line in payload.lines}
    db_accounts = session.exec(select(Account).where(Account.id.in_(account_ids))).all()
    if len(db_accounts) != len(account_ids):
        raise HTTPException(status_code=400, detail="One or more account IDs are invalid")

    entry = JournalEntry(
        entry_date=payload.entry_date,
        description=payload.description,
        business_unit=payload.business_unit,
    )
    session.add(entry)
    session.flush()

    for line in payload.lines:
        session.add(JournalLine(journal_entry_id=entry.id, **line.model_dump()))

    session.commit()
    session.refresh(entry)
    return entry


@app.post("/journals/{journal_id}/post", response_model=JournalEntryRead)
def post_journal(journal_id: int, session: Session = Depends(get_session)) -> JournalEntry:
    entry = session.get(JournalEntry, journal_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    lines = session.exec(select(JournalLine).where(JournalLine.journal_entry_id == journal_id)).all()
    if len(lines) < 2:
        raise HTTPException(status_code=400, detail="At least 2 lines are required before posting")

    debit_total = round(sum(line.debit for line in lines), 2)
    credit_total = round(sum(line.credit for line in lines), 2)
    if debit_total != credit_total:
        raise HTTPException(status_code=400, detail="Journal entry is not balanced")

    entry.status = "posted"
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@app.get("/reports/trial-balance", response_model=list[TrialBalanceRow])
def trial_balance(
    from_date: date = Query(...),
    to_date: date = Query(...),
    session: Session = Depends(get_session),
) -> list[TrialBalanceRow]:
    if from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date must be before or equal to to_date")

    entries = session.exec(
        select(JournalEntry).where(JournalEntry.entry_date >= from_date, JournalEntry.entry_date <= to_date)
    ).all()
    if not entries:
        return []

    entry_ids = [entry.id for entry in entries]
    lines = session.exec(select(JournalLine).where(JournalLine.journal_entry_id.in_(entry_ids))).all()
    account_ids = {line.account_id for line in lines}
    accounts = session.exec(select(Account).where(Account.id.in_(account_ids))).all()
    account_map = {account.id: account for account in accounts}

    totals: dict[int, dict[str, float]] = {}
    for line in lines:
        row = totals.setdefault(line.account_id, {"debit": 0.0, "credit": 0.0})
        row["debit"] += line.debit
        row["credit"] += line.credit

    report: list[TrialBalanceRow] = []
    for account_id, value in totals.items():
        account = account_map.get(account_id)
        if not account:
            continue
        debit_total = round(value["debit"], 2)
        credit_total = round(value["credit"], 2)
        report.append(
            TrialBalanceRow(
                account_id=account_id,
                account_code=account.code,
                account_name=account.name,
                debit_total=debit_total,
                credit_total=credit_total,
                balance=round(debit_total - credit_total, 2),
            )
        )

    return sorted(report, key=lambda r: r.account_code)


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
