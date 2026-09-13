"""テーブル作成＋マスタ投入スクリプト。

デプロイ時の起動コマンドや、ローカルのコンテナ起動時に実行して
モデル定義からテーブルを作成し、対応紙幣マスタを冪等に投入する
（MVP。将来的には Alembic に置き換え）。
"""

from sqlalchemy import func, select

import app.models  # noqa: F401  # モデルを import して Base に登録する
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.bill_type import BillType

_DEFAULT_BILL_TYPES = ["千円札", "五千円札", "一万円札"]


def seed_bill_types() -> None:
    with SessionLocal() as session:
        count = session.scalar(select(func.count()).select_from(BillType))
        if count:
            return
        session.add_all(
            [BillType(name=name, sort_order=i + 1) for i, name in enumerate(_DEFAULT_BILL_TYPES)]
        )
        session.commit()
        print(f"Seeded bill_types: {_DEFAULT_BILL_TYPES}")


def main() -> None:
    Base.metadata.create_all(bind=engine)
    seed_bill_types()
    print("DB tables created (create_all).")


if __name__ == "__main__":
    main()
