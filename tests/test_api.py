from fastapi.testclient import TestClient
from uuid import uuid4

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_create_account_and_journal() -> None:
    code = f"A{uuid4().hex[:6]}"
    account = client.post('/accounts', json={'code': code, 'name': '現金', 'category': 'asset'})
    assert account.status_code == 200

    journal = client.post('/journals', json={'entry_date': '2026-03-26', 'description': 'テスト仕訳'})
    assert journal.status_code == 200
    journal_id = journal.json()['id']

    line = client.post(f'/journals/{journal_id}/lines', json={'account_id': account.json()['id'], 'debit': 1000, 'credit': 0})
    assert line.status_code == 200


def test_create_and_post_balanced_journal() -> None:
    cash_code = f"B{uuid4().hex[:6]}"
    sales_code = f"C{uuid4().hex[:6]}"
    cash = client.post('/accounts', json={'code': cash_code, 'name': '普通預金', 'category': 'asset'}).json()
    sales = client.post('/accounts', json={'code': sales_code, 'name': '売上高', 'category': 'revenue'}).json()

    payload = {
        'entry_date': '2026-03-26',
        'description': '売上計上',
        'lines': [
            {'account_id': cash['id'], 'debit': 1200, 'credit': 0},
            {'account_id': sales['id'], 'debit': 0, 'credit': 1200},
        ],
    }
    created = client.post('/journals/with-lines', json=payload)
    assert created.status_code == 200

    post_result = client.post(f"/journals/{created.json()['id']}/post")
    assert post_result.status_code == 200
    assert post_result.json()['status'] == 'posted'


def test_trial_balance_report() -> None:
    report = client.get('/reports/trial-balance', params={'from_date': '2026-03-01', 'to_date': '2026-03-31'})
    assert report.status_code == 200
    assert isinstance(report.json(), list)
