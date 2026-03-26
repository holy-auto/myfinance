# デプロイ手順（Vercel）と復旧チェック

「これはどうしたらいい？」への実行手順です。まずは下記を上から順に実行してください。

## 1. Vercelの環境変数を設定

Vercel Project Settings > Environment Variables で以下を設定:

- `VERCEL=1`
- （任意・推奨）`DATABASE_URL`
  - 例: `sqlite:////tmp/myfinance.db`（サンプル）
  - 本番では永続DB（Neon/Supabase/Postgres）を推奨
- （推奨）`AUTO_MIGRATE=0`
  - 本番PostgreSQLでDDL権限がない場合、起動時 `create_all` を抑止してクラッシュ回避
- （推奨）`INIT_DB_ON_STARTUP=0`
  - 起動時DB初期化を無効化し、Serverlessの起動失敗を回避（必要時のみ `1`）

## 2. 再デプロイ

1. 最新コミットを push
2. Vercelで `Redeploy` 実行
3. デプロイログで `api/index.py` がビルド対象になっているか確認

## 3. 動作確認

- `GET /health` が `{"status":"ok"}` を返す
- `POST /accounts` が 200 を返す
- `GET /reports/trial-balance` が 200 を返す

## 4. 500エラー時の確認ポイント

今回の `sqlite3.OperationalError: unable to open database file` は、\
**Serverlessの読み取り専用領域にSQLiteを書こうとした** ときに発生します。

1. **依存解決失敗**
   - `requirements.txt` が使われているか
   - Build logsに `fastapi`, `sqlmodel`, `psycopg` のインストール記録があるか
2. **SQLite書き込み先**
   - `/tmp` 以外を書いていないか
   - `DATABASE_URL=sqlite:///...` のような相対パス指定になっていないか
   - 相対SQLite URLは、アプリ側で `/tmp/myfinance.db` に自動正規化される最新版をデプロイしているか
3. **Entrypoint不一致**
   - `vercel.json` が `api/index.py` を指しているか
4. **データ永続化要件**
   - Serverlessの `/tmp` は揮発。永続化が必要ならPostgreSQLへ切替

## 5. 本番推奨（次ステップ）

- DBをPostgreSQLへ移行（`DATABASE_URL` 差し替え）
- Alembicでマイグレーション導入
- 認証（社内SSO）導入
- 監査ログの改ざん検知を実装
