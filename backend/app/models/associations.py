from sqlalchemy import Column, ForeignKey, Table

from app.db.base import Base

# スポットと対応紙幣の多対多（中間テーブル）
spot_bill_types = Table(
    "spot_bill_types",
    Base.metadata,
    Column("spot_id", ForeignKey("spots.id", ondelete="CASCADE"), primary_key=True),
    Column("bill_type_id", ForeignKey("bill_types.id", ondelete="CASCADE"), primary_key=True),
)
