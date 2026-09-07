"""テーブル作成スクリプト。

デプロイ時の起動コマンドや、ローカルのコンテナ起動時に実行して
モデル定義からテーブルを作成する（MVP。将来的には Alembic に置き換え）。
"""

import app.models  # noqa: F401  # モデルを import して Base に登録する
from app.db.base import Base
from app.db.session import engine


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("DB tables created (create_all).")


if __name__ == "__main__":
    main()
