from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_create_account_and_journal() -> None:
    account = client.post('/accounts', json={'code': '1000', 'name': '現金', 'category': 'asset'})
    assert account.status_code == 200

    journal = client.post('/journals', json={'entry_date': '2026-03-26', 'description': 'テスト仕訳'})
    assert journal.status_code == 200
    journal_id = journal.json()['id']

    line = client.post(f'/journals/{journal_id}/lines', json={'account_id': account.json()['id'], 'debit': 1000, 'credit': 0})
    assert line.status_code == 200
